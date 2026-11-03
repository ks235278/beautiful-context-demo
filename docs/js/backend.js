/* Beautiful Context — Supabase の窓口（window.BCBackend）。

   読むもの（コンテクスト・作品・編集者）は、いままでどおり seed.js から読む。ここが受け持つのは「人ごとのもの」だけ：
     ログイン …… メールアドレスとパスワード（signUp・signInWithPassword。パスワードを忘れたら resetPasswordForEmail）、
                 メールに届く 6桁のコード（signInWithOtp → verifyOtp）。Google・Apple は config.js で開けたときだけ（methods()）
     表示名 …… profiles.display_name（コメントに出る名前。Google の本名は使わない）
     フォロー・共感 …… follows・reactions（本人の行だけ書ける。数はトリガーが editor_stats・context_stats に足す）
     コメント …… comments（トリガーで必ず pending＝確認待ちで入る。読めるのは公開されたものと、自分の分）
   約束：
     ・最初の一コマを待たせない。supabase-js（約 218KB）は、ページを描き終えて手が空いてから読み込む
     ・Supabase が止まっていても、読むことはすべてできる。数とコメントは、この端末の控え（bc-cache-v3）で出す
     ・送れなかった書き込みは outbox（localStorage の bc-outbox）に積み、ログイン・online・画面に戻ったときに送り直す
   守りは RLS（backend/schema.sql）。ここでの出し分け（運営者かどうか）は見た目のためだけ。
   画面の側（app.js・render.js）はこれを直接は呼ばない。BCSocial・BCStore が、今までと同じ関数の名前のまま使う。 */
(() => {
  const C = window.BC_CONFIG || {};
  const ON = C.backend === 'supabase' && !!C.supabaseUrl && !!C.supabaseAnonKey;
  const SRC = document.currentScript ? document.currentScript.src : '';
  const K = { auth: 'bc-auth', me: 'bc-me', outbox: 'bc-outbox', cache: 'bc-cache-v3' };
  const MINUTE = 60 * 1000;

  const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const write = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const take = (k) => { try { const v = sessionStorage.getItem(k); sessionStorage.removeItem(k); return v; } catch (e) { return null; } };
  const idle = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 2500 }) : setTimeout(fn, 300));
  const quiet = (p) => { if (p && p.catch) p.catch(() => {}); };

  const has = (k) => { try { return localStorage.getItem(k) != null; } catch (e) { return false; } };

  /* 「ログインしたままにする」（見本のログインの画面）。セッションはいつも localStorage（どのタブでも同じ一つ。タブごとに分けると、
     ほかのタブがセッションの無いままログイン中に見え、書き込みが消える）。外してログインしたときは、印（bc-remember = '0'）と、
     ブラウザを閉じると消えるクッキー（bc-live）を置く。次に開いて、印があるのにクッキーが無ければ（＝一度閉じた）、ready() がこの端末のセッションを捨てる */
  const REMEMBER = 'bc-remember', LIVE = 'bc-live';
  const remembered = () => { try { return localStorage.getItem(REMEMBER) !== '0'; } catch (e) { return true; } };
  const live = () => { document.cookie = `${LIVE}=1; path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`; };
  /* on：このログインで決めた値。undefined はそのまま（メールのコード・リンクで続ける手続きは、始めたときの値を使う） */
  const setRemember = (on) => {
    if (on === undefined) return;
    try { if (on === false) localStorage.setItem(REMEMBER, '0'); else localStorage.removeItem(REMEMBER); } catch (e) {}
    live();
  };
  const expired = !remembered() && !new RegExp(`(?:^|;\\s*)${LIVE}=1`).test(document.cookie);
  /* Google・メールのリンクから戻ったところか（?code=。名前がちょうど code のときだけ） */
  const hasCode = () => new URLSearchParams(location.search).has('code');
  /* 閉じたあとに開いた：supabase-js を作る前に、前のセッションをこの端末から外す（URL に ?code= があっても生かさない。
     生かすと、だれかが送ったリンク一つで前の人のセッションが戻る）。サーバーでの取り消しは ready() が revoke() で */
  let stale = null;
  if (expired) {
    try {
      stale = localStorage.getItem(K.auth);
      localStorage.removeItem(K.auth); localStorage.removeItem(K.auth + '-user');
      if (!hasCode()) localStorage.removeItem(REMEMBER);   // ?code= の続き（外したまま始めた登録の確かめなど）は、外したままにする
    } catch (e) {}
  }

  /* ---------- 知らせ ----------
     'auth'   … ログイン・ログアウト・表示名が変わった（{ event: 'login' | 'in' | 'out' | 'profile' | 'recovery', method, isNew, needsName }）
                'recovery' はパスワードを忘れた人がメールのリンクで戻ってきた（ログインはできている。画面は新しいパスワードを聞く → updatePassword）
     'data'   … サーバーから読んだ値で控えが変わった（数・コメント・自分のフォロー）
     'notice' … 利用者に一言伝えたいこと（送れなかったコメントなど） */
  const subs = { auth: new Set(), data: new Set(), notice: new Set() };
  const emit = (ev, v) => subs[ev].forEach((fn) => { try { fn(v); } catch (e) {} });
  let dataQueued = false;
  const changed = () => {
    if (dataQueued) return;
    dataQueued = true;
    setTimeout(() => { dataQueued = false; emit('data'); }, 0);
  };
  /* store.js・social.js が、ログインの前にこの端末で押したもの（フォロー・共感）を渡す口 */
  const providers = {};

  /* ---------- 控え ----------
     最後にサーバーから読んだ値。次に開いたとき、一コマ目から数とコメントを出す（ネットを待たない） */
  let cache = read(K.cache, null);
  if (!cache || typeof cache !== 'object') cache = {};
  cache.ids = cache.ids || {};             // seed の id（legacy_id）・'slug:<slug>'・uuid → Supabase の contexts.id
  cache.rev = cache.rev || {};             // contexts.id → seed の id（legacy_id が無ければ uuid のまま）
  cache.stats = cache.stats || {};         // contexts.id → { r: 共感の数, c: 公開中のコメントの数 }
  cache.followers = cache.followers || {}; // 編集者の id → フォロワー数（editor_stats）
  cache.comments = cache.comments || {};   // seed の id → { at, list }（開いたコンテクストのコメント）
  cache.mine = cache.mine || null;         // { uid, follows: [編集者の id], liked: [contexts.id] }  サーバーにある自分の分
  const save = () => {
    /* コメントの控えは、新しく読んだ 40 本分だけ持つ（端末の localStorage を食わない） */
    const keys = Object.keys(cache.comments);
    if (keys.length > 40) keys.sort((a, b) => cache.comments[b].at - cache.comments[a].at).slice(40).forEach((k) => delete cache.comments[k]);
    write(K.cache, cache);
  };

  /* いまの利用者。supabase-js のセッション（bc-auth）が端末に残っているときだけ、控え（bc-me）を信じる */
  let me = has(K.auth) && !expired ? read(K.me, null) : null;
  /* 控えだけが残っていた（ブラウザを閉じてセッションを捨てる・ほかでログアウトした）：起動の signedOut() で 'out' を出し、
     サーバーから写したフォロー・共感をこの端末から消す（次にこの端末を使う人に見せない） */
  let dropped = false;
  if (!me) { dropped = !!read(K.me, null); write(K.me, null); }

  /* ---------- outbox：送れなかった書き込み ----------
     { kind: 'follow' | 'react', key, on, uid }   同じ相手への古い操作は消し、最後のものだけ残す
     { kind: 'comment', key, slug, uid, item }    確認待ちの印のまま、本人にだけ見せておく */
  let outbox = read(K.outbox, []);
  if (!Array.isArray(outbox)) outbox = [];
  const keep = () => write(K.outbox, outbox.length ? outbox : null);
  function queue(op) {
    if (op.kind !== 'comment') outbox = outbox.filter((o) => !(o.kind === op.kind && o.key === op.key));
    outbox.push(op);
    keep();
  }
  const drop = (op) => { outbox = outbox.filter((o) => o !== op); keep(); };

  /* ---------- supabase-js を、要るときに一度だけ読み込む ---------- */
  const vendorUrl = () => {
    try {
      const u = new URL('vendor/supabase.js', SRC || location.href);
      const v = /[?&]v=([^&]+)/.exec(SRC);
      if (v) u.search = 'v=' + v[1];
      return u.href;
    } catch (e) { return 'js/vendor/supabase.js'; }
  };
  /* 電波の悪いところで画面を待たせない。timeoutMs を超えた通信は打ち切る（書き込みは outbox に残る） */
  const fetchT = (input, init) => {
    const ctl = new AbortController();
    const outer = init && init.signal;
    if (outer) { if (outer.aborted) ctl.abort(); else outer.addEventListener('abort', () => ctl.abort(), { once: true }); }
    const t = setTimeout(() => ctl.abort(), +C.timeoutMs || 6000);
    return window.fetch(input, Object.assign({}, init, { signal: ctl.signal })).finally(() => clearTimeout(t));
  };
  /* 最初の一コマを描き終えたか（load のあと、次の描画のあと、手が空いたとき）。それまで supabase-js を読み込まない。
     Google から戻ったとき（?code=）だけは待たない（すぐにログインを済ませる） */
  const URGENT = hasCode();
  /* 閉じる前のセッションを、サーバーで取り消す（その refresh token で一度だけ入り直し、そのセッションを logout）。
     端末の storage には書かない。取り消せなければ（もう切れている・ネットが無い）それまで */
  async function revoke(raw) {
    try {
      const s = JSON.parse(raw), rt = s && (s.refresh_token || (s.currentSession && s.currentSession.refresh_token));
      if (!rt) return;
      const h = { apikey: C.supabaseAnonKey, 'Content-Type': 'application/json' };
      const r = await fetchT(`${C.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, { method: 'POST', headers: h, body: JSON.stringify({ refresh_token: rt }) });
      if (!r.ok) return;
      const t = await r.json();
      if (t && t.access_token) await fetchT(`${C.supabaseUrl}/auth/v1/logout?scope=local`, { method: 'POST', headers: Object.assign({ Authorization: 'Bearer ' + t.access_token }, h) });
    } catch (e) {}
  }
  /* Google の画面で取りやめたときなどは ?error=（または #error=）が付いて戻る。# は画面の道にすぐ書き換わるので、読み込んだときに控える */
  let backErr = (() => {
    const q = new URLSearchParams(location.search), h = new URLSearchParams(location.hash.slice(1));
    return { code: q.get('error') || h.get('error') || '', detail: q.get('error_code') || h.get('error_code') || '', hash: h.has('error') };
  })();
  const painted = new Promise((resolve) => {
    const go = () => requestAnimationFrame(() => setTimeout(() => idle(resolve), 0));
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
  });
  let client = null, loading = null;
  function load() {
    if (!ON) return Promise.reject(new Error('off'));
    if (client) return Promise.resolve(client);
    if (loading) return loading;
    loading = (URGENT ? Promise.resolve() : painted).then(() => new Promise((resolve, reject) => {
      const make = () => {
        try {
          client = window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey, {
            auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: K.auth },
            global: { fetch: fetchT }
          });
        } catch (e) { reject(e); return; }
        /* コールバックの中で Supabase を待たない（supabase-js の決まり。中で await すると固まる） */
        client.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY') recovering = true;   // ready() が見る（下の setTimeout より先に立てる）
          setTimeout(() => quiet(onAuth(event, session)), 0);
        });
        resolve(client);
      };
      if (window.supabase && window.supabase.createClient) { make(); return; }
      const s = document.createElement('script');
      s.src = vendorUrl();
      s.async = true;
      s.onload = () => (window.supabase && window.supabase.createClient ? make() : reject(new Error('load')));
      s.onerror = () => reject(new Error('load'));
      document.head.appendChild(s);
    }));
    loading.catch(() => { loading = null; });
    return loading;
  }

  /* ---------- 失敗を日本語の一言に ---------- */
  /* パスワードの決まり（見本：英数字を組み合わせて8文字以上）。ダッシュボードの Password Requirements と同じにしておく。
     問題なければ ''。72 は Supabase（bcrypt）が読む上限 */
  function passwordProblem(pw) {
    const s = String(pw || '');
    if (s.length < 8) return 'パスワードは8文字以上にしてください';
    if (new Blob([s]).size > 72) return 'パスワードが長すぎます（72バイトまで）';
    if (!/[A-Za-z]/.test(s) || !/[0-9]/.test(s)) return 'パスワードは英字と数字を組み合わせてください';
    return '';
  }
  const fail = (code, extra) => Object.assign(new Error(code), { code }, extra || {});
  const isNetwork = (e) => !e || e.message === 'load' || e.name === 'AuthRetryableFetchError' || e.name === 'AbortError' ||
    (!e.code && /fetch|network|abort|load failed|timeout/i.test(String(e.message || e)));
  function message(e) {
    const code = String((e && e.code) || '');
    if (isNetwork(e)) return 'ネットにつながっていません。少し時間をおいて、もう一度どうぞ';
    if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || (e && e.status === 429))
      return '短い時間に何度も送られています。少し時間をおいてください';
    /* パスワードでのログイン（signIn が e.via = 'password' を付ける）。どちらが違うかは言わない（登録の有無を漏らさない） */
    if (code === 'invalid_credentials' && e.via === 'password') return 'メールアドレスかパスワードが違います';
    if (code === 'otp_expired' || code === 'invalid_credentials') return 'コードが違うか、期限が切れています。もう一度送ってください';
    if (code === 'email_not_confirmed') return 'メールアドレスの確認がまだです。届いたメールの6桁のコードを入れるか、リンクを開いてください';
    if (code === 'weak_password' || code === 'bc_weak_password') return e.detail || 'もっと強いパスワードにしてください（英字と数字を組み合わせて8文字以上）';
    if (code === 'same_password') return 'いまと同じパスワードです。別のものにしてください';
    if (code === 'user_already_exists' || code === 'email_exists') return 'このメールアドレスはもう登録されています。ログインしてください';
    if (code === 'bc_name') return '表示名を入れてください';
    if (code === 'bc_terms') return '利用規約・プライバシーポリシーへの同意が要ります';
    if (code === 'bc_off' || code === 'provider_disabled' || code === 'email_provider_disabled') return 'いまはこの方法でログインできません（準備中です）';
    if (code === 'reauthentication_needed' || code === 'session_not_found') return 'もう一度ログインしてから変えてください';
    if (code === 'email_address_invalid' || code === 'validation_failed') return 'メールアドレスを確かめてください';
    if (code === 'email_address_not_authorized') return 'いまはこのアドレスにメールを送れません（準備中です）';
    if (code === 'signup_disabled') return 'いまは新しいアカウントを作れません';
    /* サーバーにまだ関数・表が無い（migration を流す前） */
    if (code === 'PGRST202' || code === 'PGRST205' || code === '42P01' || code === '42883') return 'いまは使えません（準備中です）';
    /* schema.sql が日本語で理由を書いた 42501（編集者は退会できない など）は、その文のまま。PostgREST の英語の文は一言に */
    if (code === '42501') return e && /[^\x00-\x7f]/.test(e.message || '') ? e.message : '権限がありません';
    if (code === '54000' || code === '22023') return e.message;   // schema.sql の言葉のまま（送りすぎ・表示名が要る）
    if (code === '23505') return 'もう登録されています';
    return '送れませんでした' + (code ? '（' + code + '）' : '');
  }

  /* ---------- コンテクストの id（seed の id ⇄ Supabase の uuid） ----------
     見本の 130 本は contexts.legacy_id に seed の id が入っている。のちの snapshot.js では id が uuid のまま来る */
  let idsLoading = null, idsTried = 0;
  function loadIds() {
    if (idsLoading) return idsLoading;
    idsTried = Date.now();
    idsLoading = (async () => {
      const c = await load();
      const ids = {}, rev = {}, stats = {};
      for (let from = 0; ; from += 1000) {
        const { data, error } = await c.from('contexts').select('id, legacy_id, slug, context_stats(reactions, comments)')
          .order('id').range(from, from + 999);
        if (error) throw error;
        data.forEach((x) => {
          ids[x.id] = x.id; ids['slug:' + x.slug] = x.id;
          if (x.legacy_id) ids[x.legacy_id] = x.id;
          rev[x.id] = x.legacy_id || x.id;
          const s = Array.isArray(x.context_stats) ? x.context_stats[0] : x.context_stats;
          if (s) stats[x.id] = { r: s.reactions, c: s.comments };
        });
        if (data.length < 1000) break;
      }
      cache.ids = ids; cache.rev = rev; cache.stats = stats; cache.idsAt = Date.now();
      save(); changed();
    })().finally(() => { idsLoading = null; });
    return idsLoading;
  }
  const sid = (e) => (e && (cache.ids[e.id] || (e.context && cache.ids['slug:' + e.context.slug]))) || null;
  /* id を知らないコンテクストに出会ったら読み直す（一日一回、知らないものがあれば 5 分に一回まで） */
  async function idOf(e) {
    let id = sid(e);
    if (id) return id;
    if (!cache.idsAt || Date.now() - cache.idsAt > 24 * 60 * MINUTE || Date.now() - idsTried > 5 * MINUTE) { await loadIds(); id = sid(e); }
    return id;
  }

  /* ---------- 自分の分（表示名・役割・フォロー・共感） ---------- */
  async function loadMine() {
    if (!me) return;
    const c = await load();
    if (!cache.idsAt) await loadIds();
    const uid = me.uid;
    const [p, f, r] = await Promise.all([
      c.from('profiles').select('display_name, role, status, created_at').eq('id', uid).maybeSingle(),
      c.from('follows').select('editor_id').eq('user_id', uid),
      c.from('reactions').select('context_id').eq('user_id', uid)
    ]);
    const err = p.error || f.error || r.error;
    if (err) throw err;
    /* コメントを表示しない相手（migration 13）。表がまだ無い・読めないときは null（端末の控えをそのまま使い、消さない） */
    let mutes = null;
    try {
      const m = await c.from('user_mutes').select('muted_user_id').eq('user_id', uid);
      if (!m.error) mutes = m.data.map((x) => x.muted_user_id);
    } catch (e) {}
    if (!me || me.uid !== uid) return;
    if (p.data) { me.name = p.data.display_name || ''; me.role = p.data.role; me.status = p.data.status; }
    write(K.me, me);
    cache.mine = { uid, follows: f.data.map((x) => x.editor_id), liked: r.data.map((x) => x.context_id), mutes, at: Date.now() };
    save(); changed();
  }
  async function loadCounts() {
    const c = await load();
    const { data, error } = await c.from('editor_stats').select('editor_id, followers');
    if (error) throw error;
    data.forEach((x) => { cache.followers[x.editor_id] = x.followers; });
    cache.followersAt = Date.now();
    save(); changed();
  }
  async function loadStat(id) {
    const c = await load();
    const { data, error } = await c.from('context_stats').select('reactions, comments').eq('context_id', id).maybeSingle();
    if (error) throw error;
    if (data) { cache.stats[id] = { r: data.reactions, c: data.comments }; save(); changed(); }
  }
  const mineOk = () => !!(me && cache.mine && cache.mine.uid === me.uid);

  /* ---------- 送る ---------- */
  const COLS = 'id, user_id, display_name, body, status, created_at';
  const toComment = (r) => ({ id: r.id, uid: r.user_id || '', name: r.display_name, text: r.body, at: r.created_at,
    pending: r.status === 'pending', hidden: r.status === 'hidden' || r.status === 'rejected' });
  async function send(c, op) {
    if (op.kind === 'follow') {
      const q = op.on
        ? c.from('follows').upsert({ editor_id: op.key }, { onConflict: 'user_id,editor_id', ignoreDuplicates: true })
        : c.from('follows').delete().eq('user_id', op.uid).eq('editor_id', op.key);
      const { error } = await q;
      if (error && error.code !== '23505') throw error;
      if (mineOk()) {
        const s = new Set(cache.mine.follows);
        if (op.on) s.add(op.key); else s.delete(op.key);
        cache.mine.follows = [...s];
      }
      return 'follow';
    }
    if (op.kind === 'mute') {
      const q = op.on
        ? c.from('user_mutes').upsert({ muted_user_id: op.key }, { onConflict: 'user_id,muted_user_id', ignoreDuplicates: true })
        : c.from('user_mutes').delete().eq('user_id', op.uid).eq('muted_user_id', op.key);
      const { error } = await q;
      /* 相手が退会した（23503）・表がまだ無い（migration 13 の前）：この端末の中だけで隠しておく（知らせない） */
      if (error && !['23505', '23503', '42P01', 'PGRST205'].includes(error.code)) throw error;
      if (mineOk() && cache.mine.mutes) {
        const s = new Set(cache.mine.mutes);
        if (op.on) s.add(op.key); else s.delete(op.key);
        cache.mine.mutes = [...s];
      }
      return 'mute';
    }
    const e = { id: op.key, context: { slug: op.slug } };
    const id = await idOf(e);
    if (!id) return null;   // この端末で作っただけのコンテクスト（サーバーに無い）。送るものが無い
    if (op.kind === 'react') {
      const q = op.on
        ? c.from('reactions').upsert({ context_id: id }, { onConflict: 'user_id,context_id', ignoreDuplicates: true })
        : c.from('reactions').delete().eq('user_id', op.uid).eq('context_id', id);
      const { error } = await q;
      if (error && error.code !== '23505') throw error;
      if (mineOk()) {
        const s = new Set(cache.mine.liked);
        if (op.on) s.add(id); else s.delete(id);
        cache.mine.liked = [...s];
      }
      quiet(loadStat(id));
      return 'react';
    }
    if (op.kind === 'comment') {
      /* 表示名・書いた人・確認待ちは、サーバーのトリガーが入れる。送るのは本文だけ */
      const { data, error } = await c.from('comments').insert({ context_id: id, body: op.item.text }).select(COLS).single();
      if (error) throw error;
      const hit = cache.comments[op.key] || (cache.comments[op.key] = { at: Date.now(), list: [] });
      hit.list = hit.list.filter((x) => x.id !== data.id).concat(toComment(data));
      return 'comment';
    }
    return null;
  }
  let flushing = null;
  function flush() {
    if (!ON || !me || !outbox.length) return Promise.resolve();
    if (flushing) return flushing;
    flushing = (async () => {
      const c = await load();
      const { data } = await c.auth.getSession();
      if (!data.session || !me || data.session.user.id !== me.uid) return;
      let follows = false;
      for (const op of outbox.slice()) {
        if (op.uid !== me.uid) { drop(op); continue; }
        try {
          if ((await send(c, op)) === 'follow') follows = true;
          drop(op);
        } catch (err) {
          if (isNetwork(err)) break;   // ネットが無い：残して、次の機会に
          drop(op);
          emit('notice', op.kind === 'comment' ? 'コメントを送れませんでした：' + message(err) : message(err));
        }
      }
      save(); changed();
      if (follows) quiet(loadCounts());
    })().catch(() => {}).finally(() => { flushing = null; });
    return flushing;
  }

  /* ---------- ログイン ---------- */
  /* はじめてのログインか（GA の sign_up と login を分ける）。新しい人は、作られた時刻か確かめた時刻が、いまのログインと重なる */
  const isNewUser = (u) => {
    const t = (x) => (x ? Date.parse(x) : NaN), last = t(u.last_sign_in_at);
    return Math.abs(last - t(u.created_at)) < MINUTE || Math.abs(last - t(u.email_confirmed_at || u.confirmed_at)) < MINUTE;
  };
  /* ログインの手続きの最中か（そのあいだに onAuthStateChange が来ても、二重に送らない） */
  let logging = false;
  /* パスワードを忘れた人が、メールのリンクで戻ってきた（supabase-js の PASSWORD_RECOVERY） */
  let recovering = false;
  /* 確かめ待ちの登録（このページの中だけ。confirmSignup が使ったら消す） */
  let pending = null;
  /* method：'password' | 'email'（コード）| 'google' | 'apple'（この画面でログインした。GA に数える）、null（ほかのタブ・ほかの道でログインした） */
  async function afterLogin(method, user) {
    logging = true;
    const isNew = isNewUser(user);
    try {
      if (!me || me.uid !== user.id) me = { uid: user.id, name: '', role: 'reader' };
      write(K.me, me);
      outbox = outbox.filter((o) => o.uid === user.id);
      /* ログインの前にこの端末で押したフォロー・共感を、サーバーへ（ほかの端末でも同じになり、数に入る） */
      (providers.follows ? providers.follows() : []).forEach((id) => queue({ kind: 'follow', key: id, on: true, uid: user.id }));
      (providers.liked ? providers.liked() : []).forEach((e) => queue({ kind: 'react', key: e.id, slug: e.context.slug, on: true, uid: user.id }));
      (providers.mutes ? providers.mutes() : []).forEach((id) => { if (id !== user.id) queue({ kind: 'mute', key: id, on: true, uid: user.id }); });
      await flush();
      try { await loadMine(); } catch (e) {}
      quiet(loadCounts());
      cache.comments = {};   // 自分の確認待ちのコメントを読み直す
      save();
    } finally { logging = false; }
    const needsName = !me.name;
    emit('auth', method ? { event: 'login', method, isNew, needsName } : { event: 'in', needsName });
    return { isNew, needsName };
  }
  async function resume(user) {
    if (!me || me.uid !== user.id) { me = { uid: user.id, name: '', role: 'reader' }; write(K.me, me); cache.mine = null; }
    try { await flush(); await loadMine(); } catch (e) {}
    emit('auth', { event: 'in' });
  }
  function signedOut() {
    const was = !!me || dropped;
    dropped = false;
    me = null; write(K.me, null);
    cache.mine = null; cache.comments = {}; save();
    outbox = []; keep();
    if (was) emit('auth', { event: 'out' });
  }
  async function onAuth(event, session) {
    const u = session && session.user;
    if (!u) { if (event === 'SIGNED_OUT') signedOut(); return; }
    if (logging || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') return;
    /* ほかのタブでログインした・この端末のセッションが別の人になった：この端末で押したものもそろえる（GA には数えない） */
    if (!me || me.uid !== u.id) await afterLogin(null, u);
  }

  /* 起動：セッションを確かめる（Google から戻った ?code= の交換もここで終わる）→ outbox を送る → 数を読む */
  let boot = null;
  function ready() {
    if (!ON) return Promise.reject(new Error('off'));
    if (boot) return boot;
    boot = (async () => {
      const c = await load();
      const code = hasCode();
      const failed = code ? '' : backErr.code, detail = backErr.detail;
      if (code) logging = true;   // ?code= の交換で来る SIGNED_IN は、下の afterLogin が受け持つ
      const { data, error } = await c.auth.getSession().finally(() => { logging = false; });
      /* 閉じる前のセッション（読み込んだときに外した）は、サーバーでも取り消す。?code= で新しくログインできたときだけ、クッキーを置き直す */
      if (stale) { const s = stale; stale = null; quiet(revoke(s)); }
      if (expired && code && data && data.session) live();
      /* ネットが無くてセッションを確かめられないときは、控えのまま（ログアウトにしない。outbox も残す） */
      if (error && isNetwork(error)) throw error;
      const u = data.session && data.session.user;
      if (code || failed) {
        /* 戻ってきたアドレスから ?code= / ?error= を消し、出かける前の画面（# の道）に戻す */
        const back = take('bc-return'), hashErr = !code && backErr.hash;
        history.replaceState(history.state, '', location.pathname + (back != null ? back : hashErr ? '' : location.hash));
        if (back || hashErr) window.dispatchEvent(new HashChangeEvent('hashchange'));
        backErr = { code: '', detail: '', hash: false };   // 一度だけ（起動をやり直しても、いまの画面の道は消さない）
      }
      /* 'bc-oauth'（出かけた先：google・apple）は ?code= で戻ってきたときだけ使う（その画面から「戻る」で帰ったあとに残っていても、数えない） */
      const method = take('bc-oauth');
      const via = { google: 'Google', apple: 'Apple' }[method];
      if (failed && via) emit('notice', failed === 'access_denied' ? `${via} でのログインを取りやめました` : `${via} でログインできませんでした。もう一度お試しください`);
      /* メールのリンク（登録の確かめ・パスワードの再設定）が使えなかった：黙って表紙に戻さず、一言 */
      else if (failed) emit('notice', /expired|invalid/.test(detail + ' ' + failed) ? 'メールのリンクの期限が切れているか、もう使われています。もう一度送ってください' : 'メールのリンクを開けませんでした。もう一度送ってください');
      else if (code && !u) emit('notice', via ? `${via} でログインできませんでした。もう一度お試しください` : 'このリンクは、メールを頼んだときと同じブラウザで開いてください（メールの6桁のコードでも続けられます）');
      if (u && code && recovering) {
        /* パスワードを忘れた人：ログインはできた。GA には数えず、画面に新しいパスワードを聞いてもらう */
        recovering = false;
        await afterLogin(null, u);
        emit('auth', { event: 'recovery' });
      }
      else if (u && code) await afterLogin(via ? method : 'email', u);
      else if (u) await resume(u);
      else signedOut();
      lastPoll = Date.now();
      quiet(loadCounts());
    })();
    boot.catch(() => { boot = null; });
    return boot;
  }

  /* 裏で読み直す（画面に戻ったとき。5 分に一回まで）・つながったとき */
  let lastPoll = 0;
  function poll() {
    if (!client) return;
    lastPoll = Date.now();
    quiet((async () => {
      await flush();
      if (me) await loadMine();
      await loadCounts();
      Object.keys(cache.comments).forEach((k) => { cache.comments[k].at = 0; });
      changed();
    })());
  }

  /* ---------- コメント ---------- */
  const COMMENT_TTL = MINUTE;
  const inflight = new Set(), failed = new Map(), local = new Set();
  function comments(e) {
    if (!ON || !e || local.has(e.id)) return null;
    const hit = cache.comments[e.id];
    const stale = !hit || Date.now() - hit.at > COMMENT_TTL;
    if (stale && !inflight.has(e.id) && !(Date.now() - (failed.get(e.id) || 0) < COMMENT_TTL)) idle(() => quiet(loadComments(e)));
    return hit ? hit.list : null;
  }
  async function loadComments(e) {
    if (inflight.has(e.id)) return;
    inflight.add(e.id);
    try {
      await ready();
      const c = await load();
      const id = await idOf(e);
      if (!id) { local.add(e.id); return; }
      const { data, error } = await c.from('comments').select(COLS).eq('context_id', id).order('created_at');
      if (error) throw error;
      cache.comments[e.id] = { at: Date.now(), list: data.map(toComment) };
      failed.delete(e.id);
      save(); changed();
    } catch (err) {
      failed.set(e.id, Date.now());
    } finally { inflight.delete(e.id); }
  }
  const outComments = (e) => (me && e ? outbox.filter((o) => o.kind === 'comment' && o.key === e.id && o.uid === me.uid).map((o) => o.item) : []);
  function addComment(e, text) {
    if (!me || !e) return null;
    const item = { id: 'tmp-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), uid: me.uid, name: me.name || '',
      text: String(text).slice(0, 600), at: new Date().toISOString(), pending: true, hidden: false };
    queue({ kind: 'comment', key: e.id, slug: e.context.slug, uid: me.uid, item });
    quiet(flush());
    return item;
  }

  /* ---------- ログインの手続き（画面は BCSocial の同じ名前の関数から呼ぶ） ---------- */
  const mailOf = (x) => String(x || '').trim();
  const backTo = () => location.origin + location.pathname;
  /* メールのリンク・Google・Apple へ出かける前に、戻る先の # の道と、出かけた先を覚える（ready() が使う） */
  const leaving = (returnTo, oauth) => {
    try {
      sessionStorage.setItem('bc-return', returnTo != null ? String(returnTo) : location.hash);
      if (oauth) sessionStorage.setItem('bc-oauth', oauth);
    } catch (e) {}
  };
  /* メールの 6桁のコードを確かめる。type：'email'（コードでログイン）・'signup'（登録の確かめ）・'recovery'（パスワードを忘れた） */
  async function verify(mail, code, type, method) {
    const c = await load();
    logging = true;   // verifyOtp の中で来る SIGNED_IN は、ここの afterLogin が受け持つ
    let r;
    try { r = await c.auth.verifyOtp({ email: mailOf(mail), token: String(code || '').replace(/\D/g, ''), type }); }
    finally { logging = false; }
    if (r.error) throw r.error;
    return afterLogin(method, r.data.user);
  }

  /* ---------- 公開する関数 ---------- */
  window.BCBackend = {
    enabled: () => ON,
    googleEnabled: () => ON && !!C.googleEnabled,
    appleEnabled: () => ON && !!C.appleEnabled,
    /* 使えるログインの方法（画面はこれを見てボタンを出す）。password・code はいつも、google・apple は config.js で開けたときだけ */
    methods: () => ({ password: ON, code: ON, google: ON && !!C.googleEnabled, apple: ON && !!C.appleEnabled }),
    /* パスワードの決まりに合わないときの一言（合えば ''）。入れているそばから出せる */
    passwordProblem,
    /* 「ログインしたままにする」の今の値（チェックの初期値に） */
    remembered,
    load, ready, flush, message,
    on(ev, fn) { if (subs[ev]) subs[ev].add(fn); return () => subs[ev] && subs[ev].delete(fn); },
    provide(name, fn) { providers[name] = fn; },

    /* いまの利用者（同期。控えから）。{ uid, name, role }、ログインしていなければ null */
    me: () => me,
    isOperator: () => !!(me && me.role === 'operator' && me.status !== 'suspended'),

    /* メールのコード。新しいアドレスなら、ここでアカウントが作られる（handle_new_user が profiles を作る）。
       メールの雛形に {{ .Token }} が無いと、コードではなくリンクが届く。リンクでも同じ端末なら ?code= で戻ってログインできる */
    async sendCode(email) {
      const c = await load();
      const { error } = await c.auth.signInWithOtp({ email: String(email || '').trim(),
        options: { shouldCreateUser: true, emailRedirectTo: location.origin + location.pathname } });
      if (error) throw error;
    },
    verifyCode(email, code, { remember } = {}) { setRemember(remember !== false); return verify(email, code, 'email', 'email'); },

    /* アカウントを作る（見本の「アカウント作成」：表示名・メールアドレス・パスワード・規約への同意）。
       agreed：同意のチェック（チェックの無い画面では渡さない＝「ログインすることで同意」の文で足りる）。同意の時刻は user_metadata に残す。
       「Confirm email」が有効なので、ふつうはすぐにはログインしない → { needsConfirm: true }。
       画面は「メールに届いた6桁のコード」を聞いて confirmSignup(email, code) へ（リンクを開いても ?code= でログインできる）。
       同じアドレスがもうあると、Supabase は登録の有無を隠して成功のように返す（identities が空）。ここで「もう登録されています」にする */
    async signUp({ name, email, password, agreed, remember } = {}) {
      const n = String(name || '').trim().slice(0, 24), bad = passwordProblem(password);
      if (!n) throw fail('bc_name');
      if (agreed === false) throw fail('bc_terms');
      if (bad) throw fail('bc_weak_password', { detail: bad });
      const c = await load();
      setRemember(remember !== false);
      logging = true;
      let r;
      try {
        r = await c.auth.signUp({ email: mailOf(email), password: String(password), options: {
          emailRedirectTo: backTo(), data: { display_name: n, terms_agreed_at: new Date().toISOString() } } });
      } finally { logging = false; }
      if (r.error) throw r.error;
      const u = r.data.user;
      if (u && Array.isArray(u.identities) && !u.identities.length) throw fail('user_already_exists');
      if (!r.data.session) { pending = { email: mailOf(email).toLowerCase(), password: String(password), name: n }; return { needsConfirm: true }; }
      return Object.assign({ needsConfirm: false }, await afterLogin('password', u));
    },
    /* 登録の確かめ（Confirm signup の雛形に {{ .Token }} を入れておく）。届かないときは resendConfirm。
       まだ確かめていないアドレスで二度目の signUp をすると、Supabase は一度目のパスワード・表示名のままにする
       （一度目が別の人でも、そのパスワードが生きてしまう）。確かめたあとで、この画面で入れた値に直す */
    async confirmSignup(email, code, { remember } = {}) {
      setRemember(remember);
      const r = await verify(email, code, 'signup', 'password');
      const p = pending; pending = null;
      if (p && p.email === mailOf(email).toLowerCase()) {
        const c = await load();
        try { await c.auth.updateUser({ password: p.password }); } catch (e) {}   // 同じなら same_password。どちらでもよい
        if (me && me.name !== p.name) { try { await this.setName(p.name); r.needsName = false; } catch (e) {} }
      }
      return r;
    },
    async resendConfirm(email) {
      const c = await load();
      const { error } = await c.auth.resend({ type: 'signup', email: mailOf(email), options: { emailRedirectTo: backTo() } });
      if (error) throw error;
    },

    /* メールアドレスとパスワードでログイン（見本の「ログイン」）。remember：「ログインしたままにする」（既定 true）。
       まだ確かめていない登録は email_not_confirmed（→ confirmSignup か resendConfirm） */
    async signIn({ email, password, remember } = {}) {
      const c = await load();
      setRemember(remember !== false);
      logging = true;
      let r;
      try { r = await c.auth.signInWithPassword({ email: mailOf(email), password: String(password || '') }); }
      finally { logging = false; }
      if (r.error) throw Object.assign(r.error, { via: 'password' });
      return afterLogin('password', r.data.user);
    },

    /* パスワードを忘れた（見本の「パスワードをお忘れの方」）。メールに 6桁のコードとリンクが届く（Reset password の雛形に {{ .Token }}）。
       コードなら verifyRecovery(email, code)、リンクで戻ってきたら 'auth' の { event: 'recovery' }。どちらもそのあと updatePassword。
       登録の無いアドレスでも成功のように返る（登録の有無を漏らさない）。コードだけでもメールで続けられる（OTP でログインしていた人も、ここでパスワードを作れる） */
    async resetPassword(email, { returnTo } = {}) {
      const c = await load();
      leaving(returnTo);
      const { error } = await c.auth.resetPasswordForEmail(mailOf(email), { redirectTo: backTo() });
      if (error) throw error;
    },
    async verifyRecovery(email, code, { remember } = {}) {
      setRemember(remember);
      return Object.assign({ recovery: true }, await verify(email, code, 'recovery', null));
    },
    async updatePassword(password) {
      const bad = passwordProblem(password);
      if (bad) throw fail('bc_weak_password', { detail: bad });
      if (!me) throw fail('session_not_found');
      const c = await load();
      const { error } = await c.auth.updateUser({ password: String(password) });
      if (error) throw error;
    },

    /* Google・Apple（methods() で開いているものだけ）。出かける前の画面（returnTo、無ければいまの # の道）を覚えて、戻ってきたら ready() が戻す。
       はじめての人は表示名がまだ無い（'auth' の needsName）。Google・Apple の名前は使わない */
    async oauth(provider, { remember, returnTo } = {}) {
      if (!/^(google|apple)$/.test(provider) || !this.methods()[provider]) throw fail('bc_off');
      const c = await load();
      setRemember(remember !== false);
      leaving(returnTo, provider);
      const { error } = await c.auth.signInWithOAuth({ provider, options: { redirectTo: backTo() } });
      if (error) throw error;
    },
    google(opts) { return this.oauth('google', opts); },
    apple(opts) { return this.oauth('apple', opts); },
    async setName(name) {
      const n = String(name || '').trim().slice(0, 24);
      if (!n || !me) throw new Error('name');
      const c = await load();
      const { error } = await c.from('profiles').update({ display_name: n }).eq('id', me.uid);
      if (error) throw error;
      me.name = n; write(K.me, me);
      emit('auth', { event: 'profile' });
      return me;
    },
    /* この端末だけログアウト（ほかの端末はそのまま）。サーバーから読んだフォロー・共感は、共用の端末に残さない */
    async signOut() {
      signedOut();
      if (client) { try { await client.auth.signOut({ scope: 'local' }); } catch (e) {} }
      else write(K.auth, null);
    },
    /* 退会（App Store 5.1.1(v)）：サーバーの delete_my_account() が、アカウント・フォロー・共感・コメント（公開中のものも）・
       お知らせを消す（backend/migrations/12）。消えたら、この端末の控えも消してログアウトする。
       失敗（ネット・編集者は消せない など）は投げる。画面は BCBackend.message(err) で一言にする */
    async deleteAccount() {
      if (!me) { const e = new Error('ログインしていません'); e.code = '42501'; throw e; }
      const c = await load();
      const { error } = await c.rpc('delete_my_account');
      if (error) throw error;
      signedOut();
      /* サーバーのセッションはもう無い（auth.users ごと消えた）。端末のトークンだけを捨てる */
      try { await c.auth.signOut({ scope: 'local' }); } catch (e) {}
      write(K.auth, null);
    },

    /* フォロー */
    follow(id, on) { if (!me) return; queue({ kind: 'follow', key: id, on: !!on, uid: me.uid }); quiet(flush()); },
    /* サーバーにある自分のフォロー（まだ送れていない分を重ねる）。わからなければ null */
    myFollows() {
      if (!mineOk()) return null;
      const s = new Set(cache.mine.follows);
      outbox.forEach((o) => { if (o.kind === 'follow' && o.uid === me.uid) { if (o.on) s.add(o.key); else s.delete(o.key); } });
      return [...s];
    },
    followedOnServer: (id) => mineOk() && cache.mine.follows.includes(id),
    followers: (id) => (ON && cache.followers[id] != null ? +cache.followers[id] : null),

    /* 共感 */
    react(e, on) { if (!me || !e) return; queue({ kind: 'react', key: e.id, slug: e.context.slug, on: !!on, uid: me.uid }); quiet(flush()); },
    myLiked() {
      if (!mineOk()) return null;
      const s = new Set(cache.mine.liked.map((id) => cache.rev[id] || id));
      outbox.forEach((o) => { if (o.kind === 'react' && o.uid === me.uid) { if (o.on) s.add(o.key); else s.delete(o.key); } });
      return [...s];
    },
    likedOnServer(e) { const id = sid(e); return !!(id && mineOk() && cache.mine.liked.includes(id)); },
    reactions(e) { const id = ON && sid(e); return id && cache.stats[id] ? +cache.stats[id].r : null; },

    /* コメント：控えを同期で返し（null はまだ読んでいない・サーバーに無い）、古ければ裏で読み直す */
    comments, outComments, addComment,

    /* コメントを表示しない相手（App Store 1.2。migration 13 の user_mutes）。隠すのは自分の画面だけ */
    mute(uid, on) { if (!me || !uid || uid === me.uid) return; queue({ kind: 'mute', key: uid, on: !!on, uid: me.uid }); quiet(flush()); },
    myMutes() {
      if (!mineOk() || !cache.mine.mutes) return null;
      const s = new Set(cache.mine.mutes);
      outbox.forEach((o) => { if (o.kind === 'mute' && o.uid === me.uid) { if (o.on) s.add(o.key); else s.delete(o.key); } });
      return [...s];
    },
    /* 自分のコメントを消す（公開中のものも・確認待ちのものも。RLS の comments_delete：本人か運営者）。
       消えたら控えからも外し、公開中だったなら数も読み直す */
    async deleteComment(e, id) {
      if (!me || !e) { const x = new Error('ログインしていません'); x.code = '42501'; throw x; }
      const c = await load();
      const { data, error } = await c.from('comments').delete().eq('id', id).select('id');
      if (error) throw error;
      if (!data || !data.length) { const x = new Error('権限がありません'); x.code = '42501'; throw x; }
      const hit = cache.comments[e.id];
      if (hit) hit.list = hit.list.filter((x) => x.id !== id);
      save(); changed();
      const sidv = sid(e);
      if (sidv) quiet(loadStat(sidv));
    },
    /* 運営に知らせる（reports。未ログインでも送れる。送りすぎ止めはサーバーのトリガー：migration 09〜11）。
       送った人は読み返せない（RLS）ので、select を付けずに送る */
    async report(row) {
      const c = await load();
      const { error } = await c.from('reports').insert(row);
      if (error) throw error;
    },

    /* 運営者メニュー：確認待ちのコメント（RLS で、運営者にはすべて、書き手には自分のコンテクストの分だけが返る） */
    async pendingForReview() {
      await ready();
      const c = await load();
      const { data, error } = await c.from('comments')
        .select(COLS + ', context:contexts(id, legacy_id, slug, route_name)')
        .eq('status', 'pending').order('created_at', { ascending: false });
      if (error) throw error;
      return data.map((r) => Object.assign(toComment(r), { context: r.context }));
    },
    /* 通す（approved）・表示しない（hidden）。変えられるのは status と reject_reason だけ（列の権限） */
    async moderate(id, status) {
      const c = await load();
      const { data, error } = await c.from('comments').update({ status }).eq('id', id).select('id');
      if (error) throw error;
      if (!data || !data.length) { const e = new Error('権限がありません'); e.code = '42501'; throw e; }
    },
    /* 運営者メニュー「通報」：まだ片づいていない通報・削除の依頼（v_report_queue：ふつうが先、後回しは後ろ。古い順）。
       コメントへの通報には、そのコメント（本文・状態・どのつながりか）を添える */
    async reportQueue() {
      await ready();
      const c = await load();
      const { data, error } = await c.from('v_report_queue').select('*');
      if (error) throw error;
      const ids = data.filter((r) => r.target_type === 'comment' && /^[0-9a-f-]{36}$/i.test(r.target_id)).map((r) => r.target_id);
      const cm = {};
      if (ids.length) {
        const q = await c.from('comments').select(COLS + ', context:contexts(id, legacy_id, slug, route_name)').in('id', [...new Set(ids)]);
        if (!q.error) q.data.forEach((x) => { cm[x.id] = Object.assign(toComment(x), { status: x.status, context: x.context }); });
      }
      return data.map((r) => Object.assign({}, r, { comment: cm[r.target_id] || null }));
    },
    /* 通報を片づける：in_progress（確かめ中）・resolved（対応した）・rejected（対応しない）。resolution は運営の記録 */
    async setReport(id, status, resolution) {
      const c = await load();
      const { data, error } = await c.from('reports').update({ status, resolution: String(resolution || '').slice(0, 2000) }).eq('id', id).select('id');
      if (error) throw error;
      if (!data || !data.length) { const e = new Error('権限がありません'); e.code = '42501'; throw e; }
    }
  };

  if (!ON) return;
  /* 起動は、ページを描き終えて手が空いてから。Google から戻ったとき（?code=）だけはすぐ */
  const kick = () => quiet(ready());
  if (URGENT) kick(); else painted.then(kick);
  window.addEventListener('online', () => { if (client) poll(); else kick(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !client) return;
    if (Date.now() - lastPoll > 5 * MINUTE) poll(); else quiet(flush());
  });
})();

/* Beautiful Context — データストア（第2版）

   1件は、エディターが作る {a, b, context} に、運営のための情報を足したもの。

     status   : 'public'（公開） / 'private'（非公開・下書き） / 'hidden'（一時非表示）
                非公開は書き手が選ぶもの、一時非表示は運営が選ぶもの。
                どちらもストリーム・路線図・検索から消えるが、データは残る。
     reactions: 共感の数（初期値。この端末で押した分は liked に持つ）
     comments : [{ id, name, text, at, hidden }]

   ほかに、広告枠（ads）、書き手ごとの表示状態（authors）、サービスの
   見た目の設定（settings）を持つ。

   コンテクスト・作品・編集者・広告枠・設定は、この端末の localStorage に入る（見本は seed.js）。
   端末をまたいで持ち運ぶには、管理画面の書き出し／読み込みを使う。

   config.js の backend が 'supabase' のときは、人ごとのものだけを Supabase に送る（js/backend.js 経由）：
     共感 …… ログインしていれば reactions に。数は context_stats（サーバーの数に、まだ数に入っていない自分の分を足し引き）
     コメント …… ログインしていれば comments に（確認待ちで入る）。読めるのは公開されたものと、自分の確認待ち
   ログインしていない・Supabase が止まっているときは、いままでどおりこの端末の中だけで動く（読むことはすべてできる）。 */
(() => {
  const KEY = 'beautiful-context-store-v2';
  /* Supabase の窓口（無い・'local' のときは null。いままでどおりの動き） */
  const B = window.BCBackend && window.BCBackend.enabled() ? window.BCBackend : null;
  const OLD_KEY = 'beautiful-context-store-v1';
  /* 見本を足したら上げる。端末に残っているデータへ、新しい見本だけを足し込む */
  const SEED_VERSION = 8;

  const DEFAULT_SETTINGS = {
    brand: 'Beautiful Context',
    tagline: '言葉から、つながりを辿る',
    theme: 'charcoal',          /* 'charcoal' | 'white' */
    accent: '#ee8232',          /* 先生の構成図の橙 */
    adEvery: 2                  /* 何件ごとに広告枠を挟むか。0 で挟まない */
  };

  const slugify = (s) =>
    (s || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/['’"『』「」]/g, '')
      .replace(/[^a-z0-9぀-ヿ一-龯]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);

  const uid = (p) => (p || 'c') + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const clone = (v) => JSON.parse(JSON.stringify(v));

  function readRaw(key) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      if (v && Array.isArray(v.entries)) return v;
    } catch (e) {}
    return null;
  }

  function writeRaw(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  function normalise(entry) {
    const e = clone(entry);
    e.id = e.id || uid();
    e.createdAt = e.createdAt || new Date().toISOString();
    e.updatedAt = e.updatedAt || e.createdAt;
    e.a = e.a || {};
    e.b = e.b || {};
    e.context = e.context || {};
    e.context.slug = e.context.slug || slugify(e.context.routeName) || e.id;
    e.context.author = e.context.author || '編集部';
    e.context.aiUrl = e.context.aiUrl || '';
    /* 参考・出典（コンテクストの末尾に出す）。まだ無い区間には、見本の出典（sources.js）を入れる */
    if (!Array.isArray(e.context.sources) || !e.context.sources.length) {
      e.context.sources = clone(((window.BC_SOURCES || {})[e.context.slug]) || []);
    }
    e.context.line = e.context.line || {};
    e.a.slug = e.a.slug || slugify(e.a.title);
    e.b.slug = e.b.slug || slugify(e.b.title);
    if (!['public', 'private', 'hidden'].includes(e.status)) e.status = 'public';
    e.note = e.note || '';
    e.reactions = +e.reactions || 0;
    e.comments = Array.isArray(e.comments) ? e.comments : [];
    return e;
  }

  const seedEntries = () => (window.BC_SEED || []).map(normalise);
  const seedAds = () => clone(window.BC_SEED_ADS || []);

  function fresh() {
    return {
      version: 2,
      entries: seedEntries(),
      ads: seedAds(),
      settings: clone(DEFAULT_SETTINGS),
      authors: {},
      liked: {},
      seedIds: (window.BC_SEED || []).map((s) => s.id),
      seedVersion: SEED_VERSION,
      removedSeeds: []
    };
  }

  /* 見本が増えたとき。端末で作ったもの・手を入れた見本・消した見本はそのまま、
     まだ無い見本を足し、手を付けていない見本は新しい版に差し替える。 */
  function mergeSeeds(data) {
    /* 見本から外したもの（前の版にあって、いまの版にない見本）は、手を付けていなければ消す */
    const now = new Set((window.BC_SEED || []).map((s) => s.id));
    const before = new Set(data.seedIds || []);
    data.entries = data.entries.filter((e) => !(before.has(e.id) && !now.has(e.id) && e.updatedAt === e.createdAt));
    const gone = new Set(data.removedSeeds || []);
    const at = new Map(data.entries.map((e, i) => [e.id, i]));
    seedEntries().forEach((s) => {
      if (gone.has(s.id)) return;
      if (!at.has(s.id)) { data.entries.push(s); return; }
      const cur = data.entries[at.get(s.id)];
      if (cur.updatedAt === cur.createdAt) {
        s.reactions = cur.reactions;
        s.comments = cur.comments;
        data.entries[at.get(s.id)] = s;
      } else {
        /* 手を入れた見本は本文を残し、型・ハブ・四軸だけを補う */
        ['kind', 'hub', 'score'].forEach((k) => {
          if (cur.context[k] == null && s.context[k] != null) cur.context[k] = s.context[k];
        });
      }
    });
    /* 札の絵（前の版の見本）のままの作品には、見本の新しい絵と出典を入れる。
       端末で作ったコンテクストが同じ作品を使っていても、絵が切れないように */
    const latest = new Map();
    seedEntries().forEach((s) => [s.a, s.b].forEach((w) => latest.set(w.slug, w)));
    data.entries.forEach((e) => ['a', 'b'].forEach((side) => {
      const w = e[side], n = w && latest.get(w.slug);
      if (n && /^img\/cards\/|^img\/goldberg\.jpg$/.test(w.image || '') && n.image !== w.image) {
        w.image = n.image; w.credit = n.credit; w.creditUrl = n.creditUrl;
      }
      /* 先生のタイトル一覧の並び（UniverseIt! の並びと、つながりの路線の順） */
      if (n && w.order == null && n.order != null) w.order = n.order;
    }));
    data.seedIds = (window.BC_SEED || []).map((s) => s.id);
    data.seedVersion = SEED_VERSION;
  }

  /* 第1版からの引っ越し。先生や学生が端末で作ったものは残す。
     手を付けていない見本は、画像の揃った新しい見本に差し替える。 */
  function migrate(old) {
    const data = fresh();
    const seeds = new Map(data.entries.map((e) => [e.id, e]));
    const kept = [];
    old.entries.forEach((raw) => {
      const e = normalise(raw);
      const untouchedSeed = seeds.has(e.id) && e.updatedAt === e.createdAt;
      if (!untouchedSeed) kept.push(e);
    });
    const keptIds = new Set(kept.map((e) => e.id));
    data.entries = kept.concat(data.entries.filter((e) => !keptIds.has(e.id)));
    return data;
  }

  let cache = null;
  function ensure() {
    if (cache) return cache;
    let data = readRaw(KEY);
    if (!data) {
      const old = readRaw(OLD_KEY);
      data = old ? migrate(old) : fresh();
      writeRaw(data);
    }
    data.entries = data.entries.map(normalise);
    data.removedSeeds = Array.isArray(data.removedSeeds) ? data.removedSeeds : [];
    if ((data.seedVersion || 1) < SEED_VERSION) {
      /* 橙の既定値を、先生の構成図の色に合わせ直す（第4版） */
      if (data.settings && data.settings.accent === '#d9761f') data.settings.accent = '#ee8232';
      mergeSeeds(data);
      writeRaw(data);
    }
    data.ads = Array.isArray(data.ads) ? data.ads : [];
    data.settings = Object.assign(clone(DEFAULT_SETTINGS), data.settings || {});
    data.authors = data.authors || {};
    data.liked = data.liked || {};
    cache = data;
    return data;
  }
  function commit() { return writeRaw(ensure()); }

  /* 別のタブ（エディターや管理画面）で書き換えられたら読み直す */
  window.addEventListener('storage', (ev) => { if (ev.key === KEY) cache = null; });

  /* 本文の HTML から文字だけを取り出す。DOMParser の文書は画像も
     読み込まず script も走らせないので、読み込んだファイルに何が
     混ざっていても安全に数えられる。 */
  const parser = new DOMParser();
  const plain = (html) =>
    (parser.parseFromString(String(html || ''), 'text/html').body.textContent || '')
      .replace(/\s+/g, ' ').trim();

  function readingMinutes(html) {
    return Math.max(1, Math.ceil(plain(html).length / 500));
  }

  const byNewest = (x, y) => (y.createdAt || '').localeCompare(x.createdAt || '');

  const Store = {
    KEY,
    slugify,
    uid,
    readingMinutes,
    plain,
    DEFAULT_SETTINGS,

    /* ---------- コンテクスト ---------- */
    all() {
      return ensure().entries.slice().sort(byNewest);
    },

    /* 読者に見えるもの。公開中で、書き手も止められていないもの */
    visible() {
      const authors = ensure().authors;
      return this.all().filter((e) => e.status === 'public' && authors[e.context.author] !== 'hidden');
    },

    isVisible(e) {
      return !!e && e.status === 'public' && ensure().authors[e.context.author] !== 'hidden';
    },

    byContextSlug(slug) {
      const find = (s) => ensure().entries.find((e) => e.context.slug === s) || null;
      /* 組み直して名前の変わった区間は、古い名前でも新しい区間を返す */
      return find(slug) || (window.BC_MOVED && window.BC_MOVED[slug] ? find(window.BC_MOVED[slug]) : null);
    },

    byId(id) {
      return ensure().entries.find((e) => e.id === id) || null;
    },

    save(entry) {
      const data = ensure();
      const e = normalise(entry);
      e.updatedAt = new Date().toISOString();

      let slug = e.context.slug;
      const clash = data.entries.find((x) => x.context.slug === slug && x.id !== e.id);
      if (clash) slug = slug + '-' + Math.random().toString(36).slice(2, 5);
      e.context.slug = slug;

      const i = data.entries.findIndex((x) => x.id === e.id);
      if (i >= 0) {
        /* 編集画面が持っていない運営の情報は引き継ぐ */
        const prev = data.entries[i];
        e.comments = entry.comments ? e.comments : prev.comments;
        e.reactions = entry.reactions != null ? e.reactions : prev.reactions;
        e.createdAt = prev.createdAt;
        data.entries[i] = e;
      } else {
        data.entries.push(e);
      }
      return commit() ? e : null;
    },

    remove(id) {
      const data = ensure();
      data.entries = data.entries.filter((e) => e.id !== id);
      /* 消した見本は、見本が増えたときにも戻さない */
      if ((data.seedIds || []).includes(id) && !data.removedSeeds.includes(id)) data.removedSeeds.push(id);
      commit();
    },

    /* 生成AIの初稿を、編集者が確かめて通す（AGM） */
    approve(id) {
      const e = this.byId(id);
      if (!e) return null;
      e.context.review = 'approved';
      e.context.approvedAt = new Date().toISOString();
      e.updatedAt = e.context.approvedAt;
      commit();
      return e;
    },

    setStatus(id, status, note) {
      const e = this.byId(id);
      if (!e) return null;
      e.status = status;
      if (note != null) e.note = note;
      e.updatedAt = new Date().toISOString();
      commit();
      return e;
    },

    /* 同じ作品をルーツに持つ、ほかのコンテクスト */
    related(e) {
      if (!e) return [];
      const mine = new Set([e.a.slug, e.b.slug]);
      return this.visible().filter((x) => x.id !== e.id && (mine.has(x.a.slug) || mine.has(x.b.slug)));
    },

    /* ---------- 作品（駅） ---------- */
    works(list) {
      const map = new Map();
      (list || this.visible()).forEach((e) => {
        ['a', 'b'].forEach((side) => {
          const w = e[side];
          if (!w || !w.title) return;
          const key = w.slug || slugify(w.title);
          if (!map.has(key)) map.set(key, { work: w, slug: key, contexts: [] });
          const hit = map.get(key);
          if (!hit.work.image && w.image) hit.work = w;
          hit.contexts.push({ entry: e, side });
        });
      });
      return [...map.values()];
    },

    workBySlug(slug) {
      return this.works().find((w) => w.slug === slug) || null;
    },

    /* 先生のタイトル一覧（Excel）の並び。order を持たない作品は後ろへ */
    byOrder(a, b) {
      const oa = +a.work.order || 9999, ob = +b.work.order || 9999;
      return oa - ob || String(a.work.title).localeCompare(String(b.work.title), 'ja');
    },

    /* ---------- つながりの網 ----------
       作品を駅、公開中のコンテクストを区間とする網。 */
    neighbors(slug) {
      const out = [];
      this.visible().forEach((e) => {
        if (e.a.slug === slug) out.push({ slug: e.b.slug, work: e.b, entry: e });
        else if (e.b.slug === slug) out.push({ slug: e.a.slug, work: e.a, entry: e });
      });
      return out;
    },

    /* つながりの路線（フィード）。選んだ作品から、区間でつながる作品を
       枝分かれの順に辿る（深さ優先。同じ枝の中は先生の一覧の順）。
         A ─ B
         ├ C ─ D
         │ ├ E
         │ └ F
         └ G ─ H …
       路線が尽きたら、先生の一覧の順で次の、まだ通っていない作品から
       別の路線として続ける。すべての駅を一度ずつ通る。 */
    /* skipId：いま読んでいる区間。その先の路線を出すとき、来た道（同じ区間）は通らない */
    feed(startSlug, skipId) {
      const all = this.works().sort((a, b) => this.byOrder(a, b));
      const bySlug = new Map(all.map((h) => [h.slug, h]));
      const orderOf = (s) => all.findIndex((h) => h.slug === s);
      const adj = new Map(all.map((h) => [h.slug, []]));
      this.visible().forEach((e) => {
        if (e.id === skipId) return;
        if (!adj.has(e.a.slug) || !adj.has(e.b.slug) || e.a.slug === e.b.slug) return;
        adj.get(e.a.slug).push({ slug: e.b.slug, entry: e });
        adj.get(e.b.slug).push({ slug: e.a.slug, entry: e });
      });
      adj.forEach((list) => list.sort((x, y) => orderOf(x.slug) - orderOf(y.slug)));
      const seen = new Set(), out = [];
      const walk = (root, line) => {
        const stack = [{ slug: root, parent: null, entry: null, depth: 0 }];
        while (stack.length) {
          const n = stack.pop();
          if (seen.has(n.slug)) continue;
          seen.add(n.slug);
          const prev = out[out.length - 1];
          out.push({ slug: n.slug, work: bySlug.get(n.slug).work, parent: n.parent, entry: n.entry, depth: n.depth,
                     line, branch: !!(n.parent && prev && prev.slug !== n.parent) });
          const kids = adj.get(n.slug).filter((k) => !seen.has(k.slug));
          for (let i = kids.length - 1; i >= 0; i--) stack.push({ slug: kids[i].slug, parent: n.slug, entry: kids[i].entry, depth: n.depth + 1 });
        }
      };
      if (!bySlug.has(startSlug)) return out;
      let line = 0;
      walk(startSlug, line);
      const start = orderOf(startSlug);
      for (let k = 1; k <= all.length; k++) {
        const h = all[(start + k) % all.length];
        if (!seen.has(h.slug)) walk(h.slug, ++line);
      }
      return out;
    },

    /* つながりを辿る順（BC修正要望 2026.10.22）。すべての区間を一本の道に並べる。
       区間を読んだら、その先の駅（片側のページ）に立ち、その駅から延びる、まだ通っていない区間へ。
       延びる区間がなければ、通ってきた駅を新しい順に遡り、まだ延びる区間のある駅から分かれる（from）。
       どの駅からも延びなければ、先生の一覧の順で、まだ通っていない次の区間へ乗り換える（jump）。
       「一覧」もこの順に並べるので、辿って読んだものを、一覧の同じ位置で見つけられる。
       exit：区間を読んだあとに立つ駅（'a' か 'b'）。来た駅と反対の側 */
    trail() {
      const order = new Map(this.works().map((h) => [h.slug, +h.work.order || 9999]));
      const rank = (e) => [order.get(e.a.slug) || 9999, order.get(e.b.slug) || 9999].sort((x, y) => x - y);
      const list = this.visible().map((e) => ({ e, r: rank(e) }))
        .sort((x, y) => x.r[0] - y.r[0] || x.r[1] - y.r[1] || (x.e.context.slug < y.e.context.slug ? -1 : 1))
        .map((x) => x.e);
      const used = new Set(), out = [], path = [];
      const fromStation = (s) => list.find((x) => !used.has(x.id) && (x.a.slug === s || x.b.slug === s));
      while (out.length < list.length) {
        let at = path[path.length - 1], e = at ? fromStation(at) : null, from = null, jump = false;
        for (let k = path.length - 2; !e && k >= 0; k--) { e = fromStation(path[k]); if (e) { at = from = path[k]; } }
        if (!e) { e = list.find((x) => !used.has(x.id)); at = null; jump = out.length > 0; }
        used.add(e.id);
        const exit = e.b.slug === at && e.a.slug !== at ? 'a' : 'b';
        out.push({ entry: e, exit, from, jump });
        if (at !== path[path.length - 1]) path.push(at || e[exit === 'a' ? 'b' : 'a'].slug);
        path.push(e[exit].slug);
      }
      return out;
    },

    /* ---------- 共感・コメント ---------- */
    liked(id) {
      return !!ensure().liked[id];
    },

    /* サーバーの数（context_stats）があれば、そこに入っていない自分の分だけを足し引きする（二重に足さない） */
    reactionCount(e) {
      const mine = !!(e && ensure().liked[e.id]);
      const srv = B && e ? B.reactions(e) : null;
      if (srv == null) return (e ? e.reactions : 0) + (mine ? 1 : 0);
      return Math.max(0, srv + (mine ? 1 : 0) - (B.likedOnServer(e) ? 1 : 0));
    },

    react(id) {
      const data = ensure();
      if (data.liked[id]) delete data.liked[id];
      else data.liked[id] = true;
      commit();
      const e = this.byId(id);
      /* ログインしていれば裏で送る（送れなければ outbox に残る）。していなければ、ログインしたときに送る */
      if (B && B.me() && e) B.react(e, !!data.liked[id]);
      return { liked: !!data.liked[id], count: this.reactionCount(e) };
    },

    /* 読者に見えるコメント：確認を通ったもの（pending でない）で、隠されていないもの。
       Supabase では、サーバーの公開中のコメントを足す（控えを同期で返し、古ければ裏で読み直す） */
    visibleComments(e) {
      const here = (e && e.comments ? e.comments : []).filter((c) => !c.hidden && !c.pending);
      const srv = B && e ? B.comments(e) : null;
      const all = srv ? here.concat(srv.filter((c) => !c.hidden && !c.pending)) : here;
      /* 読者が「表示しない」にした人のコメントは外す（js/social.js。その人の画面だけ） */
      const So = window.BCSocial;
      return So && So.mutedCount && So.mutedCount() ? all.filter((c) => !So.isMuted(c.uid)) : all;
    },
    /* 「表示しない」にした人のコメントが、このつながりに何件あるか（コメント欄に一行で知らせ、戻せるようにする） */
    mutedComments(e) {
      const So = window.BCSocial;
      if (!So || !So.mutedCount || !So.mutedCount() || !e) return 0;
      const srv = B ? B.comments(e) || [] : [];
      return (e.comments || []).concat(srv).filter((c) => !c.hidden && !c.pending && So.isMuted(c.uid)).length;
    },

    /* 書いた本人にだけ見せる、確認待ちのコメント（まだ送れていないものも、同じ「確認中」で見せる） */
    myPendingComments(e, uid) {
      const here = uid ? (e && e.comments ? e.comments : []).filter((c) => c.pending && !c.hidden && c.uid === uid) : [];
      if (!B || !uid || !e) return here;
      const srv = (B.comments(e) || []).filter((c) => c.pending && !c.hidden && c.uid === uid);
      return here.concat(srv, B.outComments(e));
    },

    /* 確認待ちのコメント（運営者メニュー） */
    pendingComments() {
      const out = [];
      ensure().entries.forEach((e) => e.comments.forEach((c) => { if (c.pending && !c.hidden) out.push({ entry: e, comment: c }); }));
      return out.sort((x, y) => (x.comment.at < y.comment.at ? 1 : -1));
    },

    /* コメントは、編集者が確かめてから表示する（真善美を約束する場なので、先に確認する） */
    addComment(id, c) {
      const e = this.byId(id);
      const text = (c.text || '').trim();
      if (!e || !text) return null;
      /* Supabase にログインしていれば、サーバーへ（表示名と書いた人はサーバーが入れる）。この端末の entries には書かない */
      if (B && B.me()) return B.addComment(e, text);
      const item = {
        id: uid('m'),
        uid: c.uid || '',
        name: (c.name || '').trim().slice(0, 30) || '匿名',
        text: text.slice(0, 600),
        at: new Date().toISOString(),
        hidden: false,
        pending: true
      };
      e.comments.push(item);
      commit();
      return item;
    },

    approveComment(id, cid) {
      const e = this.byId(id);
      const c = e && e.comments.find((x) => x.id === cid);
      if (!c) return;
      c.pending = false;
      commit();
    },

    setCommentHidden(id, cid, hidden) {
      const e = this.byId(id);
      const c = e && e.comments.find((x) => x.id === cid);
      if (!c) return;
      c.hidden = !!hidden;
      commit();
    },

    removeComment(id, cid) {
      const e = this.byId(id);
      if (!e) return;
      e.comments = e.comments.filter((x) => x.id !== cid);
      commit();
    },

    /* ---------- 編集者 ----------
       コンテクストの書き手（context.author）を、名前とプロフィールを持つ編集者に結びつける */
    editorOf(e) {
      const name = e && e.context ? e.context.author : '';
      const known = (window.BC_EDITORS || []).find((ed) => ed.authors.includes(name));
      if (known) return known;
      let h = 0; for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) | 0;
      return { id: 'w' + Math.abs(h).toString(36), authors: [name], name: name || '編集部', role: 'EDITOR', bio: '' };
    },

    /* 公開中のコンテクストを持つ編集者。持っている本数の多い順 */
    editors() {
      const map = new Map();
      this.visible().forEach((e) => {
        const ed = this.editorOf(e);
        if (!map.has(ed.id)) map.set(ed.id, Object.assign({}, ed, { count: 0 }));
        map.get(ed.id).count++;
      });
      return [...map.values()].sort((a, b) => b.count - a.count);
    },

    editorById(id) {
      return this.editors().find((ed) => ed.id === id) || null;
    },

    /* その編集者のつながり：自分が書いたもの（書き手）と、ほかの人の区間から選んだもの（picks：区間の slug） */
    byEditor(id) {
      const ed = (window.BC_EDITORS || []).find((x) => x.id === id);
      const picks = new Set((ed && ed.picks) || []);
      return this.visible().filter((e) => this.editorOf(e).id === id || picks.has(e.context.slug));
    },

    /* 編集者の「今日の一本」。日付で決まり、同じ日はどの端末でも同じものになる */
    todayPick(id, day) {
      const list = this.byEditor(id).sort((a, b) => (a.id < b.id ? -1 : 1));
      if (!list.length) return null;
      let h = 0; for (const ch of id + '|' + day) h = (h * 31 + ch.charCodeAt(0)) | 0;
      return list[Math.abs(h) % list.length];
    },

    /* ---------- 書き手 ---------- */
    authors() {
      const data = ensure();
      const map = new Map();
      data.entries.forEach((e) => {
        const n = e.context.author;
        if (!map.has(n)) map.set(n, { name: n, count: 0, status: data.authors[n] || 'public' });
        map.get(n).count++;
      });
      return [...map.values()];
    },

    setAuthorStatus(name, status) {
      const data = ensure();
      if (status === 'public') delete data.authors[name];
      else data.authors[name] = status;
      commit();
    },

    /* ---------- 検索 ---------- */
    search(q) {
      const words = (q || '').toLowerCase().split(/[\s　#＃]+/).filter(Boolean);
      if (!words.length) return { contexts: [], works: [] };
      const hay = (e) =>
        [e.context.routeName, e.context.headline, e.context.relation, e.context.hub, e.context.kind, plain(e.context.body),
         e.a.title, e.a.type, e.a.creator, e.a.summary, e.b.title, e.b.type, e.b.creator, e.b.summary]
          .join(' ').toLowerCase();
      const contexts = this.visible().filter((e) => { const h = hay(e); return words.every((w) => h.includes(w)); });
      const works = this.works().filter(({ work: w }) => {
        const h = [w.title, w.type, w.creator, w.summary, w.year].join(' ').toLowerCase();
        return words.every((x) => h.includes(x));
      });
      return { contexts, works };
    },

    /* ---------- 広告枠 ---------- */
    ads() {
      return ensure().ads;
    },

    activeAds() {
      return ensure().ads.filter((a) => a.active);
    },

    saveAd(ad) {
      const data = ensure();
      const a = Object.assign({ id: uid('ad'), title: '', sub: '', image: '', url: '', active: true }, ad);
      const i = data.ads.findIndex((x) => x.id === a.id);
      if (i >= 0) data.ads[i] = a;
      else data.ads.push(a);
      return commit() ? a : null;
    },

    removeAd(id) {
      const data = ensure();
      data.ads = data.ads.filter((a) => a.id !== id);
      commit();
    },

    /* ---------- 設定 ---------- */
    settings() {
      return Object.assign({}, ensure().settings);
    },

    saveSettings(patch) {
      const data = ensure();
      data.settings = Object.assign(data.settings, patch);
      return commit();
    },

    /* ---------- 持ち運び ---------- */
    exportJSON() {
      return JSON.stringify(ensure(), null, 2);
    },

    importJSON(text) {
      const v = JSON.parse(text);
      if (!v || !Array.isArray(v.entries)) throw new Error('Beautiful Context の書き出しファイルではありません');
      cache = null;
      localStorage.setItem(KEY, JSON.stringify(v));
      ensure();
      return commit();
    },

    reset() {
      cache = null;
      localStorage.removeItem(KEY);
      localStorage.removeItem(OLD_KEY);
      return ensure();
    },

    usage() {
      try { return (localStorage.getItem(KEY) || '').length * 2; } catch (e) { return 0; }
    }
  };

  window.BCStore = Store;

  if (B) {
    /* ログインの前にこの端末で押した共感（ログインしたときにサーバーへ送る） */
    B.provide('liked', () => Object.keys(ensure().liked).map((id) => Store.byId(id)).filter(Boolean));
    /* ログイン：サーバーにある自分の共感に揃える。ログアウト：共用の端末に残さない */
    B.on('auth', (ev) => {
      const data = ensure();
      if (ev.event === 'out') data.liked = {};
      else {
        const l = B.myLiked();
        if (!l) return;
        data.liked = {};
        l.forEach((id) => { data.liked[id] = true; });
      }
      commit();
    });
  }
})();

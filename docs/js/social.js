/* 読者のアカウントとフォロー。

   考え方：まず中身を見せ、気に入ってから名前を作ってもらう。
   ・ログインしなくても、読む・編集者をフォローすることはできる（この端末に覚える）
   ・コメントを書くときにだけ、アカウント（メールのコード）と表示名を作ってもらう
   ・フォローしたあとで一度だけ、アカウントを作ればほかの端末でも同じ Today's Choice が届くと伝える

   保存先は config.js の backend で決まる（画面の側は BCSocial の関数だけを使い、保存先を知らない）。
     'supabase' … ログインしていれば、フォローは Supabase の follows に（js/backend.js 経由）。
                  ログインする前のフォローはこの端末にだけあり、ログインしたときにサーバーへ送る。
                  フォロワーの数は editor_stats（ログインした人の数）。Supabase が止まっていても、端末の控えで動く
     'local'    … いままでどおり、名前だけの見本のアカウントとフォローを、この端末の中だけに持つ */
(() => {
  const KEY = 'bc-social';
  const B = window.BCBackend && window.BCBackend.enabled() ? window.BCBackend : null;
  const read = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  };
  let st = read();
  st.follows = Array.isArray(st.follows) ? st.follows : [];
  st.mutes = Array.isArray(st.mutes) ? st.mutes : [];   // コメントを表示しない相手（利用者の id）
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
  const listeners = new Set();
  const notify = () => listeners.forEach((fn) => { try { fn(); } catch (e) {} });
  const changed = () => { save(); notify(); };

  window.BCSocial = {
    /* Supabase につながる版か（ログインのシートの出し分けに使う） */
    remote() { return !!B; },
    googleEnabled() { return !!(B && B.googleEnabled()); },

    /* いまの読者。ログインしていなければ null。
       Supabase では表示名をまだ決めていない人もいる（named: false。コメントの前に表示名を聞く） */
    me() {
      if (!B) return st.me || null;
      const m = B.me();
      return m ? { uid: m.uid, name: m.name || 'あなた', named: !!m.name, role: m.role || 'reader' } : null;
    },
    /* 前の見本で作った名前（表示名の欄の初期値に使う） */
    demoName() { return (st.me && st.me.name) || ''; },

    /* 見本のログイン：名前だけで、この端末にアカウントを作る（'local' のときだけ） */
    signIn(name) {
      if (B) return null;
      const n = String(name || '').trim().slice(0, 24);
      if (!n) return null;
      st.me = { uid: 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: n, at: new Date().toISOString() };
      changed();
      return st.me;
    },
    signOut() {
      if (B) { B.signOut(); return; }
      st.me = null; changed();
    },

    /* Supabase のログイン（Promise）。失敗は BCBackend.message(err) で日本語の一言に */
    sendCode(email) { return B ? B.sendCode(email) : Promise.reject(new Error('off')); },
    verifyCode(email, code) { return B ? B.verifyCode(email, code) : Promise.reject(new Error('off')); },
    signInWithGoogle() { return B ? B.google() : Promise.reject(new Error('off')); },
    setName(name) { return B ? B.setName(name) : Promise.reject(new Error('off')); },
    /* 退会（Supabase のときだけ。アカウントとコメントなどがサーバーから消え、この端末もログアウトする） */
    deleteAccount() { return B ? B.deleteAccount() : Promise.reject(new Error('off')); },
    message(err) { return B ? B.message(err) : '送れませんでした'; },

    following() { return st.follows.slice(); },
    isFollowing(id) { return st.follows.includes(id); },
    /* その場で切り替えて返す。ログインしていれば裏で Supabase に送る（送れなければ outbox に残る） */
    toggleFollow(id) {
      const i = st.follows.indexOf(id);
      if (i >= 0) st.follows.splice(i, 1); else st.follows.push(id);
      if (B && B.me()) B.follow(id, i < 0);
      changed();
      return i < 0;
    },
    /* フォロワーの数。サーバーの数（editor_stats）があればそれに、まだ数に入っていない自分の分だけを足し引きする。
       サーバーの数がまだ無ければ、いままでどおり base（見本の数）＋ この端末のフォロー */
    followerCount(id, base) {
      const on = st.follows.includes(id);
      const srv = B ? B.followers(id) : null;
      if (srv == null) return (+base || 0) + (on ? 1 : 0);
      return Math.max(0, srv + (on ? 1 : 0) - (B.followedOnServer(id) ? 1 : 0));
    },

    /* コメントを表示しない相手（App Store 1.2 のブロック）。隠すのはこの人の画面だけで、相手には知らせない。
       ログインしていれば Supabase の user_mutes にも送り（ほかの端末でも隠れる）、していなければ端末にだけ覚える */
    isMuted(uid) { return !!uid && st.mutes.includes(uid); },
    mutedCount() { return st.mutes.length; },
    mute(uid) {
      if (!uid || st.mutes.includes(uid)) return;
      const me = this.me();
      if (me && me.uid === uid) return;
      st.mutes.push(uid);
      if (B && B.me()) B.mute(uid, true);
      changed();
    },
    unmuteAll() {
      const was = st.mutes.slice();
      st.mutes = [];
      if (B && B.me()) was.forEach((uid) => B.mute(uid, false));
      changed();
      return was.length;
    },
    /* 運営に知らせる（Promise。Supabase のときだけ） */
    report(row) { return B ? B.report(row) : Promise.reject(new Error('off')); },

    /* アカウントを勧めるのは一度だけ（しつこくしない） */
    nudged() { return !!st.nudged; },
    markNudged() { st.nudged = true; save(); },

    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  };

  if (B) {
    /* ログインの前にこの端末でフォローしていた編集者（ログインしたときにサーバーへ送る） */
    B.provide('follows', () => st.follows.slice());
    B.provide('mutes', () => st.mutes.slice());
    const same = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
    B.on('auth', (ev) => {
      /* ログアウト：サーバーから読んだフォロー・表示しない相手は、共用の端末に残さない */
      if (ev.event === 'out') { st.follows = []; st.mutes = []; }
      else {
        const f = B.myFollows(); if (f) st.follows = f;
        const m = B.myMutes(); if (m) st.mutes = m;
      }
      changed();
    });
    B.on('data', () => {
      const f = B.me() && B.myFollows();
      if (f && !same(f, st.follows)) { st.follows = f; save(); }
      const m = B.me() && B.myMutes();
      if (m && !same(m, st.mutes)) { st.mutes = m; save(); }
      notify();
    });
  }

  /* ほかのタブ（運営者メニューなど）での変更も拾う */
  window.addEventListener('storage', (ev) => {
    if (ev.key !== KEY) return;
    st = read(); st.follows = Array.isArray(st.follows) ? st.follows : [];
    st.mutes = Array.isArray(st.mutes) ? st.mutes : [];
    notify();
  });
})();

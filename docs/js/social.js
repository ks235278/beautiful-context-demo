/* 読者のアカウントとフォロー（いまは見本：この端末の中だけ）。

   考え方：まず中身を見せ、気に入ってから名前を作ってもらう。
   ・ログインしなくても、読む・編集者をフォローすることはできる（この端末に覚える）
   ・コメントを書くときにだけ、名前（アカウント）を作ってもらう
   ・フォローしたあとで一度だけ、アカウントを作ればほかの端末でも同じ Today's Choice が届くと伝える

   本番では、同じ形のまま中身を Firebase（Google ログイン・Firestore）に差し替える。
   画面の側は BCSocial の関数だけを使い、保存先を知らない。 */
(() => {
  const KEY = 'bc-social';
  const read = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  };
  let st = read();
  st.follows = Array.isArray(st.follows) ? st.follows : [];
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
  const listeners = new Set();
  const changed = () => { save(); listeners.forEach((fn) => { try { fn(); } catch (e) {} }); };

  window.BCSocial = {
    /* いまの読者。ログインしていなければ null */
    me() { return st.me || null; },

    /* 見本のログイン：名前だけで、この端末にアカウントを作る */
    signIn(name) {
      const n = String(name || '').trim().slice(0, 24);
      if (!n) return null;
      st.me = { uid: 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: n, at: new Date().toISOString() };
      changed();
      return st.me;
    },
    signOut() { st.me = null; changed(); },

    following() { return st.follows.slice(); },
    isFollowing(id) { return st.follows.includes(id); },
    toggleFollow(id) {
      const i = st.follows.indexOf(id);
      if (i >= 0) st.follows.splice(i, 1); else st.follows.push(id);
      changed();
      return i < 0;
    },

    /* アカウントを勧めるのは一度だけ（しつこくしない） */
    nudged() { return !!st.nudged; },
    markNudged() { st.nudged = true; save(); },

    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  };

  /* ほかのタブ（運営者メニューなど）での変更も拾う */
  window.addEventListener('storage', (ev) => {
    if (ev.key !== KEY) return;
    st = read(); st.follows = Array.isArray(st.follows) ? st.follows : [];
    listeners.forEach((fn) => { try { fn(); } catch (e) {} });
  });
})();

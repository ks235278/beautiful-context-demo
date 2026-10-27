/* 見た目の設定を、最初の描画より前に当てる。

   代理店がクライアントに合わせて変えるのは、名前・色・地の明暗。
   管理画面で決めた値を読み、html に印を付けるだけの小さなファイル。
   store.js を待たずに head の中で同期的に走らせるので、ここだけで完結させる。 */
(() => {
  const KEY = 'beautiful-context-store-v2';
  /* 地の色：炭は墨の山の絵（紺）、白は和紙の絵の地 */
  const GROUND = { charcoal: '#071a30', white: '#f8f4eb' };
  const PAPER = '#faf7f1';   /* 読むページの紙（app.css の --paper） */
  let s = {};
  try { s = (JSON.parse(localStorage.getItem(KEY)) || {}).settings || {}; } catch (e) {}

  const theme = s.theme === 'white' ? 'white' : 'charcoal';
  /* 橙は先生の構成図の色。以前の既定値（#d9761f）のままの端末もこの色にする */
  const accent = /^#[0-9a-f]{6}$/i.test(s.accent || '') && s.accent !== '#d9761f' ? s.accent : '#ee8232';
  const root = document.documentElement;
  /* サイトの中のページから移ってきたときだけ、入るときの幕（fade.css）を使う。
     ホーム画面から開いたときは幕を掛けない（前の画面の写し → 暗い幕 → 本文、と点滅して見えるため） */
  try {
    if (!sessionStorage.getItem('bc-nav')) root.classList.add('cold');
    sessionStorage.removeItem('bc-nav');
  } catch (e) { root.classList.add('cold'); }
  root.dataset.theme = theme;
  root.style.setProperty('--accent', accent);
  /* 入るときの幕（fade.css）は、開いた画面の地の色で。紙のページ（c/・w/・e/・about/ の静的なページ、
     または #/today などの道筋）に入るときは紙の色。表紙・UniverseIt! のときは地の色（紙の上で紺が瞬かないように） */
  const onPaper = /\/(c|w|e|about)\//.test(location.pathname) || (location.hash.startsWith('#/') && location.hash !== '#/');
  root.style.setProperty('--veil', onPaper ? PAPER : GROUND[theme]);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = GROUND[theme];

  window.BCTheme = {
    GROUND,
    theme,
    accent,
    brand: (s.brand || 'Beautiful Context').slice(0, 40),
    tagline: (s.tagline || '言葉から、つながりを辿る').slice(0, 60)
  };
})();

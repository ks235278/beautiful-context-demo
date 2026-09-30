/* 見た目の設定を、最初の描画より前に当てる。

   代理店がクライアントに合わせて変えるのは、名前・色・地の明暗。
   管理画面で決めた値を読み、html に印を付けるだけの小さなファイル。
   store.js を待たずに head の中で同期的に走らせるので、ここだけで完結させる。 */
(() => {
  const KEY = 'beautiful-context-store-v2';
  const GROUND = { charcoal: '#061629', white: '#ffffff' };
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
  root.style.setProperty('--veil', GROUND[theme]);

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

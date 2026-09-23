/* 見た目の設定を、最初の描画より前に当てる。

   代理店がクライアントに合わせて変えるのは、名前・色・地の明暗。
   管理画面で決めた値を読み、html に印を付けるだけの小さなファイル。
   store.js を待たずに head の中で同期的に走らせるので、ここだけで完結させる。 */
(() => {
  const KEY = 'beautiful-context-store-v2';
  const GROUND = { charcoal: '#141c25', white: '#eef2f7' };
  let s = {};
  try { s = (JSON.parse(localStorage.getItem(KEY)) || {}).settings || {}; } catch (e) {}

  const theme = s.theme === 'white' ? 'white' : 'charcoal';
  const accent = /^#[0-9a-f]{6}$/i.test(s.accent || '') ? s.accent : '#d9761f';
  const root = document.documentElement;
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

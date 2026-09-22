/* 画面はひとつ、という約束を別ページにも広げる。
   離れる前に薄れ、着いてから濃くなる。 */
(() => {
  document.addEventListener('click', ev => {
    const a = ev.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || /^[a-z]+:/i.test(href)) return;
    if (a.target === '_blank') return;
    ev.preventDefault();
    document.documentElement.classList.add('leaving');
    setTimeout(() => { location.href = href; }, 300);
  });

  /* エディターの「公開する」など、JS から移るときにも使えるように */
  window.BCLeave = (href, wait) => {
    document.documentElement.classList.add('leaving');
    setTimeout(() => { location.href = href; }, wait || 300);
  };

  /* ---------- 左端からのスワイプで戻る ----------
     ホーム画面から開いた全画面モードにはブラウザの戻るが無い。
     指の動きに画面がついてくるので、戻れることが触れば分かる。 */
  const EDGE = 28;    /* ここから始めた指だけを戻る操作とみなす */
  const DONE = 76;    /* これだけ引いたら戻る */
  const SLOP = 64;    /* 縦にこれだけ動いたら、ただのスクロール */

  let sx = 0, sy = 0, dx = 0, live = false;

  const paint = (v, fade) => {
    document.body.style.transform = v ? 'translateX(' + v + 'px)' : '';
    document.body.style.opacity = fade == null ? '' : String(fade);
  };

  const settle = () => {
    document.body.style.transition = 'transform .18s ease, opacity .18s ease';
    paint(0, null);
    setTimeout(() => { document.body.style.transition = ''; }, 200);
  };

  function goBack(){
    /* 重ね表示を開いている画面は、そちらを閉じるほうが自然 */
    if (typeof window.BCSwipeBack === 'function' && window.BCSwipeBack()) return;
    if (history.length > 1) history.back();
    else window.BCLeave('index.html', 180);
  }

  addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    if (t.clientX > EDGE) return;
    sx = t.clientX; sy = t.clientY; dx = 0; live = true;
    document.body.style.transition = '';
  }, { passive: true });

  addEventListener('touchmove', e => {
    if (!live) return;
    const t = e.touches[0];
    dx = t.clientX - sx;
    if (Math.abs(t.clientY - sy) > SLOP){ live = false; settle(); return; }
    if (dx > 0) paint(dx * 0.32, 1 - 0.22 * Math.min(1, dx / 170));
  }, { passive: true });

  addEventListener('touchend', () => {
    if (!live) return;
    live = false;
    const ok = dx > DONE;
    settle();
    if (ok) setTimeout(goBack, 60);
  }, { passive: true });

  addEventListener('touchcancel', () => {
    if (!live) return;
    live = false; settle();
  }, { passive: true });
})();

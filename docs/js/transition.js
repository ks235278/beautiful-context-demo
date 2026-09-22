/* 画面はひとつ、という約束を別ページにも広げる。
   離れる前に薄れ、着いてから濃くなる。 */
(() => {
  /* 薄れさせる印は、必ずここだけで付ける。
     移動が起きなければこの画面に居続けるので、時間で自分から畳む。
     これを怠ると、本文が消えたまま地色だけの画面が残る。 */
  let undo = 0;
  function fadeOut(){
    document.documentElement.classList.add('leaving');
    clearTimeout(undo);
    undo = setTimeout(restore, 2500);
  }
  function restore(){
    clearTimeout(undo);
    document.documentElement.classList.remove('leaving');
    document.body.style.transition = '';
    document.body.style.transform = '';
    document.body.style.opacity = '';
  }

  document.addEventListener('click', ev => {
    const a = ev.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || /^[a-z]+:/i.test(href)) return;
    if (a.target === '_blank') return;
    ev.preventDefault();
    fadeOut();
    setTimeout(() => { location.href = href; }, 300);
  });

  /* エディターの「公開する」など、JS から移るときにも使えるように */
  window.BCLeave = (href, wait) => {
    fadeOut();
    setTimeout(() => { location.href = href; }, wait || 300);
  };

  /* 戻ってきたとき、端末はページを丸ごと保存しておいたまま見せる。
     出ていく前に付けた class が残ったままで、script も再び走らないので、
     本文が薄れたまま固まってしまう。地色だけの画面はこれだった。
     ここで畳んでおく。 */
  window.addEventListener('pageshow', e => { if (e.persisted) restore(); });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && document.documentElement.classList.contains('leaving')) restore();
  });

  /* ---------- 右へ払って戻る ----------
     端という条件は付けない。画面のどこで始めてもよい。このページは
     横スクロールしないので、他と衝突しない。

     軽く払っただけで行ってしまい、手を戻す先が無い、というのを直す。
     紙を横へ押しやるのと同じにした。指について前にも後ろにも動く。
     半分より向こうまで押してから手を離せば、送り出される。
     そこまで押していなければ、手を離すと元の位置へ返ってくる。
     途中で気が変わったら、押し戻せばよい。 */
  const HALF = () => window.innerWidth * 0.5;  /* ここを越えていれば送り出す */
  const SLOP = 60;   /* 縦にこれだけ動いたら、ただのスクロール */
  const LOCK = 16;   /* ここを超え、かつ縦より横が勝っていたら横の操作 */

  let sx = 0, sy = 0, dx = 0, live = false, locked = false;
  const dbg = new URLSearchParams(location.search).has('debug');
  let note = null;

  function say(t){
    if (!dbg) return;
    if (!note){
      note = document.createElement('div');
      note.style.cssText = 'position:fixed;z-index:99999;left:8px;bottom:8px;padding:8px 11px;'
        + 'border-radius:8px;background:rgba(0,0,0,.9);color:#7CFF9B;pointer-events:none;'
        + 'font:12px/1.5 ui-monospace,Menlo,monospace;white-space:pre';
      document.body.appendChild(note);
    }
    note.textContent = t;
  }

  const paint = (v, fade) => {
    document.body.style.transform = v ? 'translateX(' + Math.round(v) + 'px)' : '';
    document.body.style.opacity = fade == null ? '' : String(fade);
  };

  /* 押し足りなかったとき。元の位置へ返す。 */
  const settle = () => {
    document.body.style.transition = 'transform .22s ease, opacity .22s ease';
    paint(0, null);
    setTimeout(() => { document.body.style.transition = ''; }, 240);
  };

  /* 押し切ったとき。そのまま送り出す。 */
  function leave(){
    say('da day qua nua -> quay lai');

    /* この画面の中で片づくなら、本文は元の位置へ返す */
    if (typeof window.BCSwipeBack === 'function' && window.BCSwipeBack()){ settle(); return; }

    const here = (location.pathname.split('/').pop() || 'index.html');
    if (here === 'index.html' || here === ''){ settle(); return; }   /* もう家に居る */

    document.body.style.transition = 'transform .2s ease-out, opacity .2s ease-out';
    paint(window.innerWidth, 0);
    setTimeout(() => window.BCLeave('index.html', 0), 170);
  }

  const NOSWIPE = 'input,textarea,select,[contenteditable],[contenteditable] *';

  document.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    if (t.target && t.target.closest && t.target.closest(NOSWIPE)){
      say('bo qua: o nhap lieu'); live = false; return;
    }
    sx = t.clientX; sy = t.clientY; dx = 0; live = true; locked = false;
    document.body.style.transition = '';
    say('start x=' + Math.round(t.clientX));
  }, { passive: true, capture: true });

  document.addEventListener('touchmove', e => {
    if (!live) return;
    const t = e.touches[0];
    dx = Math.max(0, t.clientX - sx);            /* 左へは動かさない */
    const dy = Math.abs(t.clientY - sy);
    if (!locked && dy > SLOP){ live = false; settle(); say('huy: doc ' + Math.round(dy)); return; }
    if (!locked && dx > LOCK && dx > dy * 1.6) locked = true;
    if (!locked) return;

    if (e.cancelable) e.preventDefault();        /* giữ cho trang khỏi cuộn theo */
    paint(dx, 1 - 0.25 * Math.min(1, dx / HALF()));
    say('day ' + Math.round(dx) + ' / nua man ' + Math.round(HALF()));
  }, { passive: false, capture: true });

  /* 手を離したときに決める。押し戻してあれば、何も起きない。 */
  document.addEventListener('touchend', () => {
    if (!live) return;
    live = false;
    if (!locked) return;
    if (dx >= HALF()) leave();
    else { settle(); say('tha tay ' + Math.round(dx) + ' -> ve cho cu'); }
  }, { passive: true, capture: true });

  document.addEventListener('touchcancel', () => {
    if (!live) return;
    live = false; settle(); say('he thong lay mat cu chi');
  }, { passive: true, capture: true });
})();

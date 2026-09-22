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
     端という条件は付けない。画面のどこで始めても、右へ払えば戻る。
     このページは横スクロールしないので、他と衝突しない。

     どこまで引いたか、離したかどうか、は問わない。右へ払った、と
     分かった時点で戻る。二通りの決まり方があると、同じ動きなのに
     結果が違って感じられる。 */
  const GO   = 46;   /* これだけ横へ動けば、右へ払ったと分かる */
  const SLOP = 60;   /* 縦にこれだけ動いたら、ただのスクロール */

  let sx = 0, sy = 0, live = false;
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

  function back(){
    live = false;
    say('vuot phai -> quay lai');

    /* この画面の中で片づくなら、そちらに任せる */
    if (typeof window.BCSwipeBack === 'function' && window.BCSwipeBack()) return;

    const here = (location.pathname.split('/').pop() || 'index.html');
    if (here === 'index.html' || here === '') return;   /* もう家に居る */

    document.body.style.transition = 'transform .2s ease-out, opacity .2s ease-out';
    document.body.style.transform = 'translateX(' + Math.round(window.innerWidth * 0.5) + 'px)';
    document.body.style.opacity = '0';
    setTimeout(() => window.BCLeave('index.html', 0), 170);
  }

  const NOSWIPE = 'input,textarea,select,[contenteditable],[contenteditable] *';

  document.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    if (t.target && t.target.closest && t.target.closest(NOSWIPE)){
      say('bo qua: o nhap lieu'); live = false; return;
    }
    sx = t.clientX; sy = t.clientY; live = true;
    say('start x=' + Math.round(t.clientX));
  }, { passive: true, capture: true });

  document.addEventListener('touchmove', e => {
    if (!live) return;
    const t = e.touches[0];
    const dx = t.clientX - sx;
    const dy = Math.abs(t.clientY - sy);
    if (dy > SLOP){ live = false; say('huy: doc ' + Math.round(dy)); return; }
    if (dx > GO && dx > dy * 1.6){
      if (e.cancelable) e.preventDefault();
      back();
    }
  }, { passive: false, capture: true });

  document.addEventListener('touchend',    () => { live = false; }, { passive: true, capture: true });
  document.addEventListener('touchcancel', () => { live = false; }, { passive: true, capture: true });
})();

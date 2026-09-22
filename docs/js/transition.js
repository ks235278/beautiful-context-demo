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
     端という条件は外してある。そこは iOS 自身のジェスチャに取られていて
     指が届かない。このページは横スクロールしないので、右へ払う動きは
     どこで始めても他と衝突しない。

     指を離した瞬間に決めるのはやめた。押しやったのは自分ではなく
     機械だった、という感じになる。紙を横へ押しやるように、指の動きに
     1対1で付いてゆき、充分に押しやった時点でその場で決まる。
     途中で離せば戻ってくる。何も起きない。 */
  const NEED = () => Math.max(150, window.innerWidth * 0.45);  /* ここまで押せば決まる */
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

  const settle = () => {
    document.body.style.transition = 'transform .2s ease, opacity .2s ease';
    paint(0, null);
    setTimeout(() => { document.body.style.transition = ''; }, 220);
  };

  /* 押し切ったとき。そのまま送り出して、着いた先を出す。
     端末の「戻る」には頼らない。保存しておいた画面をそのまま見せる
     仕組みと噛み合わず、薄れたまま復帰することがある。 */
  function commit(){
    live = false; locked = false;
    say('day du xa -> quay lai');

    /* この画面の中で片づくなら、本文は元の位置へ返す */
    if (typeof window.BCSwipeBack === 'function' && window.BCSwipeBack()){ settle(); return; }

    const here = (location.pathname.split('/').pop() || 'index.html');
    if (here === 'index.html' || here === ''){ settle(); return; }   /* もう家に居る */

    document.body.style.transition = 'transform .2s ease-out, opacity .2s ease-out';
    paint(window.innerWidth * 0.55, 0);
    setTimeout(() => window.BCLeave('index.html', 0), 170);
  }

  const NOSWIPE = 'input,textarea,select,[contenteditable],[contenteditable] *';

  document.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    if (t.target && t.target.closest && t.target.closest(NOSWIPE)){
      say('bo qua: o nhap lieu'); return;
    }
    say('start x=' + Math.round(t.clientX));
    sx = t.clientX; sy = t.clientY; dx = 0; live = true; locked = false;
    document.body.style.transition = '';
  }, { passive: true, capture: true });

  document.addEventListener('touchmove', e => {
    if (!live) return;
    const t = e.touches[0];
    dx = t.clientX - sx;
    const dy = Math.abs(t.clientY - sy);
    if (!locked && dy > SLOP){ live = false; settle(); say('huy: doc ' + Math.round(dy)); return; }
    if (!locked && dx > LOCK && dx > dy * 1.6) locked = true;
    if (!locked) return;

    if (e.cancelable) e.preventDefault();   /* giữ cho trang khỏi cuộn theo */
    const need = NEED();
    const shown = Math.max(0, dx);
    paint(shown, 1 - 0.25 * Math.min(1, shown / need));
    say('day ' + Math.round(shown) + ' / can ' + Math.round(need));
    if (shown >= need) commit();
  }, { passive: false, capture: true });

  /* 離しただけでは何も起きない。押し切っていなければ、戻ってくる。 */
  document.addEventListener('touchend', () => {
    if (!live) return;
    live = false;
    say('tha tay ' + Math.round(dx) + ' -> ve cho cu');
    settle();
  }, { passive: true, capture: true });

  document.addEventListener('touchcancel', () => {
    if (!live) return;
    live = false; settle(); say('he thong lay mat cu chi');
  }, { passive: true, capture: true });
})();

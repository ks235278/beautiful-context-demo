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
    document.body.style.willChange = '';
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
     standalone Safari の履歴プレビューは fixed 背景を欠くことがある。
     画面自体は一切動かさず、横払いだけを読み、離したあと通常の暗転で戻る。
     body に transform / opacity を触らないため、三層化も後続画面への副作用もない。 */
  const NOSWIPE = 'input,textarea,select,[contenteditable],[contenteditable] *';
  let sx = 0, sy = 0, tracking = false;

  document.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    if (t.target && t.target.closest && t.target.closest(NOSWIPE)) return;
    sx = t.clientX; sy = t.clientY; tracking = true;
  }, { passive:true, capture:true });

  document.addEventListener('touchend', e => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches && e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - sx, dy = Math.abs(t.clientY - sy);
    if (dx < 88 || dx < dy * 1.6) return;

    /* index 内で片づく戻り先がある場合は、ページを離れない。 */
    if (typeof window.BCSwipeBack === 'function' && window.BCSwipeBack()) return;
    const here = location.pathname.split('/').pop() || 'index.html';
    if (here === 'index.html') return;
    window.BCLeave('index.html', 300);
  }, { passive:true, capture:true });

  document.addEventListener('touchcancel', () => { tracking = false; }, { passive:true, capture:true });
})();

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

  /* 戻るスワイプは Safari に任せる。ブラウザだけが履歴上の前画面を
     本物の二層として保持し、指の位置と完全に同期して描ける。 */
})();

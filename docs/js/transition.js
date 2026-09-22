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
})();

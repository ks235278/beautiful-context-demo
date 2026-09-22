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

  /* 戻ってきたとき、端末はページを丸ごと保存しておいたまま見せる。
     出ていく前に付けた class が残ったままで、script も再び走らないので、
     本文が薄れたまま固まってしまう。地色だけの画面はこれだった。
     ここで畳んでおく。 */
  window.addEventListener('pageshow', e => {
    document.documentElement.classList.remove('leaving');
    if (e.persisted) document.documentElement.classList.remove('entering');
    document.body.style.transition = '';
    document.body.style.transform = '';
    document.body.style.opacity = '';
  });

  /* ---------- 右へ払って戻る ----------
     ホーム画面から開いた全画面モードにはブラウザの戻るが無い。

     最初は画面の左端だけで受けていたが、そこは iOS 自身のジェスチャに
     取られていて指が届かない。範囲を広げても駄目だった。

     そこで端という条件を外した。このページは横スクロールしないので、
     右へ払う動きはどこで始めても他と衝突しない。文字を選ぶ操作だけは
     邪魔したくないので、入力欄の上から始めたときは手を引く。 */
  const DONE = 90;   /* これだけ引いたら戻る */
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
    document.body.style.transform = v ? 'translateX(' + v + 'px)' : '';
    document.body.style.opacity = fade == null ? '' : String(fade);
  };

  const settle = () => {
    document.body.style.transition = 'transform .18s ease, opacity .18s ease';
    paint(0, null);
    setTimeout(() => { document.body.style.transition = ''; }, 200);
  };

  function goBack(){
    say('goBack()');
    if (typeof window.BCSwipeBack === 'function' && window.BCSwipeBack()) return;
    if (history.length > 1) history.back();
    else window.BCLeave('index.html', 180);
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
    if (locked){
      if (e.cancelable) e.preventDefault();   /* giữ cho trang khỏi cuộn theo */
      paint(dx * 0.32, 1 - 0.22 * Math.min(1, dx / 170));
      say('keo ' + Math.round(dx) + ' / can ' + DONE);
    }
  }, { passive: false, capture: true });

  document.addEventListener('touchend', () => {
    if (!live) return;
    live = false;
    const ok = locked && dx > DONE;
    say('tha ' + Math.round(dx) + (ok ? ' -> QUAY LAI' : ' -> khong du'));
    settle();
    if (ok) setTimeout(goBack, 60);
  }, { passive: true, capture: true });

  document.addEventListener('touchcancel', () => {
    if (!live) return;
    live = false; settle(); say('he thong lay mat cu chi');
  }, { passive: true, capture: true });
})();

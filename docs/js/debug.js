/* ?debug=1 のときだけ、端末が返す実際の値を画面に出す。
   ページがステータスバーの裏まで描けるのかどうかは、
   推測ではなく safe-area-inset の実値でしか分からない。 */
(() => {
  if (!new URLSearchParams(location.search).has('debug')) return;

  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;left:-9999px;top:0;' +
    'padding-top:env(safe-area-inset-top);' +
    'padding-bottom:env(safe-area-inset-bottom)';
  document.body.appendChild(probe);
  const cs  = getComputedStyle(probe);
  const top = parseFloat(cs.paddingTop) || 0;
  const bot = parseFloat(cs.paddingBottom) || 0;
  probe.remove();

  const stick = document.querySelector('.intro-stick');
  const pcb   = stick && stick.querySelector('.pcb');
  const pr    = pcb ? pcb.getBoundingClientRect() : null;

  const lines = [
    'safe-area TOP    = ' + top + 'px',
    'safe-area BOTTOM = ' + bot + 'px',
    'innerHeight      = ' + window.innerHeight,
    'screen.height    = ' + window.screen.height,
    'visualViewport   = ' + (window.visualViewport ? Math.round(window.visualViewport.height) : '-'),
    'devicePixelRatio = ' + window.devicePixelRatio,
    'mach dien top    = ' + (pr ? Math.round(pr.top) : '-'),
    'mach dien cao    = ' + (pr ? Math.round(pr.height) : '-'),
    '',
    top > 0 ? 'TOP > 0  => VE DUOC duoi thanh'
            : 'TOP = 0  => Safari KHONG cho ve'
  ];

  const d = document.createElement('div');
  d.style.cssText =
    'position:fixed;z-index:9999;left:8px;right:8px;top:8px;padding:12px 14px;' +
    'border-radius:10px;background:rgba(0,0,0,.92);color:#7CFF9B;' +
    'font:13px/1.65 ui-monospace,Menlo,monospace;white-space:pre;pointer-events:none';
  d.textContent = lines.join('\n');
  document.body.appendChild(d);
})();

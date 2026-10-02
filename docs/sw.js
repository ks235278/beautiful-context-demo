/* 開くたびにネットを待たないための、手元の控え（Service Worker）。

   ホーム画面から開くと、端末は最初の一コマを描くまで何も見せられない。
   毎回 GitHub Pages とフォントの置き場へ取りに行くと、その間が空白になり、点滅して見えていた。
   ・ページ（index.html など）：まずネットへ。少し待っても返らなければ控えを見せ、控えは裏で新しくする
     （直したものは、ふつうはその場で、遅くとも次に開いたときに出る）
   ・絵・CSS・JS・フォント：控えをすぐ使い、裏で新しいものと入れ替える
     （CSS と JS は ?v= で版が変わるので、古いものが残ることはない） */
const CACHE = 'bc-shell-v1';
const SHELL = [
  './', './index.html', './app.css', './fade.css',
  './js/theme.js', './js/seed.js', './js/store.js', './js/render.js', './js/transition.js', './js/app.js',
  './img/pcb-charcoal.jpg', './img/pcb-white.jpg', './img/logo.png', './img/logo-mark.png',
  './icon-180.png', './icon-192.png', './manifest.webmanifest'
];
const WAIT = 500;   /* ページをネットで待つのはここまで（ミリ秒） */

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (ev) => {
  ev.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function keep(req, res){
  if (res && res.ok && (res.type === 'basic' || res.type === 'cors')){
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
  }
  return res;
}

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const mine = url.origin === self.location.origin;
  const fonts = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!mine && !fonts) return;

  if (req.mode === 'navigate'){
    ev.respondWith((async () => {
      const net = fetch(req).then((res) => keep(req, res));
      const cached = await caches.match(req, { ignoreSearch: true });
      if (!cached) return net;
      /* ネットが早ければそれを、遅ければ控えを（控えは裏で新しくなる） */
      const late = new Promise((r) => setTimeout(() => r(cached), WAIT));
      return Promise.race([net.catch(() => cached), late]);
    })());
    return;
  }

  ev.respondWith((async () => {
    const cached = await caches.match(req);
    const net = fetch(req).then((res) => keep(req, res)).catch(() => cached);
    return cached || net;
  })());
});

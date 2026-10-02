/* アプリの殻（App Shell）を手元に持ち、開くたびにネットを待たない。

   ホーム画面から開くと、端末は最初の一コマを描くまで何も見せられない。そのあいだが点滅になる。
   そこで、ページも CSS も JS も絵も、いつも手元の控えからすぐ返す（ネットは一切待たない）。
   新しい版は裏で取りに行く：
   ・index.html などが変わっていたら、その版が使う CSS・JS（?v= 付き）をすべて先に取り揃えてから
     控えを入れ替える。次に開いたときも、ネットを待たずに新しい版がそのまま描ける。
   ・入れ替えたことはページに知らせる。ページは、利用者が画面を離れたとき（裏に回ったとき）に
     見えないところで読み直し、いまの画面とスクロール位置のまま戻す（app.js）。 */
const CACHE = 'bc-shell';
const PAGES = ['./index.html', './editor.html', './manage.html'];
const STATIC = ['./img/pcb-charcoal.jpg', './img/pcb-white.jpg', './img/logo.png', './img/logo-mark.png',
  './icon-180.png', './icon-192.png', './manifest.webmanifest'];

/* ページが使う同じサイトの CSS・JS（?v= 付き）と、表紙の絵 */
function assetsOf(html, base){
  const out = new Set();
  html.replace(/(?:src|href)="([^"]+)"/g, (_, u) => {
    if (/^(https?:)?\/\//.test(u) || u.startsWith('#') || u.startsWith('data:')) return;
    if (/\.(css|js)(\?|$)/.test(u) || /img\/(pcb-|logo)/.test(u)) out.add(new URL(u, base).href);
  });
  return [...out];
}
async function take(page){
  const c = await caches.open(CACHE);
  const res = await fetch(page, { cache: 'no-store' });
  if (!res.ok) return false;
  const html = await res.clone().text();
  const before = await c.match(page);
  const changed = !before || (await before.text()) !== html;
  if (changed){
    /* 新しい版の部品をすべて揃えてから、ページを入れ替える（揃わないうちは古い版のまま） */
    const need = [];
    for (const u of assetsOf(html, res.url)) if (!(await c.match(u))) need.push(u);
    await Promise.all(need.map((u) => fetch(u, { cache: 'no-store' }).then((r) => r.ok && c.put(u, r))));
    await c.put(page, res);
  }
  return changed && !!before;
}

self.addEventListener('install', (ev) => {
  ev.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(STATIC.map((u) => fetch(u).then((r) => r.ok && c.put(u, r)).catch(() => {})));
    await Promise.all(PAGES.map((p) => take(new URL(p, self.location).href).catch(() => {})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', (ev) => {
  ev.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

/* 裏で新しい版を確かめる。変わっていたら、開いているページに知らせる */
let checking = null;
function refresh(){
  if (checking) return checking;
  checking = (async () => {
    let updated = false;
    for (const p of PAGES) updated = (await take(new URL(p, self.location).href).catch(() => false)) || updated;
    if (updated) for (const cl of await self.clients.matchAll()) cl.postMessage({ type: 'bc-updated' });
  })().finally(() => { setTimeout(() => { checking = null; }, 15000); });
  return checking;
}
self.addEventListener('message', (ev) => { if (ev.data === 'bc-check') ev.waitUntil(refresh()); });

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const mine = url.origin === self.location.origin;
  const fonts = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!mine && !fonts) return;
  if (mine && url.pathname.endsWith('/sw.js')) return;

  if (req.mode === 'navigate'){
    /* ページは控えからすぐ。新しい版は裏で */
    ev.waitUntil(refresh());
    ev.respondWith((async () => {
      const page = new URL(url.pathname.endsWith('/') ? 'index.html' : url.pathname, url).href;
      return (await caches.match(page)) || fetch(req);
    })());
    return;
  }
  const keep = (res) => {
    if (res && res.ok && (res.type === 'basic' || res.type === 'cors')){
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
    }
    return res;
  };
  /* ?v= の付いた CSS・JS は版ごとに変わらないので控えのまま。
     それ以外（作品の絵・フォントなど）は控えをすぐ返し、裏で新しいものと入れ替える */
  const versioned = /[?&]v=/.test(url.search);
  ev.respondWith((async () => {
    const hit = await caches.match(req);
    if (hit){
      if (!versioned) ev.waitUntil(fetch(req).then(keep).catch(() => {}));
      return hit;
    }
    return fetch(req).then(keep);
  })());
});

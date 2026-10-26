// 検索エンジン・生成AI のための静的なページを作る（docs/c/…/、docs/w/…/、docs/e/…/、docs/about/、sitemap.xml、robots.txt）。
//
//   node tools/prerender.mjs
//
// アプリそのもの（docs/index.html と js）をヘッドレスの Chrome で開き、ページを一つずつ描かせて、その HTML を
// index.html の形に流し込んで書き出す。中身はアプリと同じものになる（描き方を二通り持たない）。
// 開いた人には、そのページのままアプリが起き上がる（app.js が body の data-route から引き継ぐ）。
//
// サイトのアドレスは docs/CNAME から決める（なければ GitHub Pages のアドレス）。
// つながりや作品を書き換えたら、もう一度これを走らせてからコミットする。
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const DOCS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const cname = fs.existsSync(path.join(DOCS, 'CNAME')) ? fs.readFileSync(path.join(DOCS, 'CNAME'), 'utf8').trim() : '';
const SITE = (cname ? `https://${cname}` : 'https://ks235278.github.io/beautiful-context-demo').replace(/\/$/, '');
const CHROME = process.env.CHROME || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
].find((p) => fs.existsSync(p));
if (!CHROME) { console.error('Chrome が見つかりません（環境変数 CHROME で指定できます）'); process.exit(1); }

/* ---------- docs を配る小さなサーバー ---------- */
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.txt': 'text/plain', '.xml': 'application/xml' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(DOCS, p);
  if (!f.startsWith(DOCS) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

/* ---------- Chrome ---------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 9400 + Math.floor(Math.random() * 400);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'bc-prerender-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`,
  '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' });
/* 使い捨てのプロファイルは、終わったら必ず消す（うまくいっても、途中で失敗しても、Ctrl+C でも）。
   Windows では Chrome の子プロセスが閉じきるまでファイルがつかまれているので、木ごと止め、消えるまで少し待つ */
const chromeGone = new Promise((r) => chrome.once('exit', r));
const killChrome = () => {
  if (!chrome.pid || chrome.exitCode !== null || chrome.signalCode !== null) return;
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' });
  else chrome.kill();
};
const dropProf = () => { try { fs.rmSync(prof, { recursive: true, force: true }); return true; } catch (e) { return false; } };
let closing;
const closeChrome = () => closing ||= (async () => {
  killChrome();
  if (chrome.pid) await Promise.race([chromeGone, sleep(5000)]);
  for (let i = 0; i < 50 && !dropProf(); i++) await sleep(100);
})();
process.on('uncaughtException', (e) => { console.error(e); closeChrome().finally(() => process.exit(1)); });
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => closeChrome().finally(() => process.exit(130)));
process.on('exit', () => { killChrome(); dropProf(); });
let list;
for (let i = 0; i < 80; i++) {
  try { list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); if (list.length) break; } catch (e) {}
  await sleep(150);
}
const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0; const pending = new Map(); const errors = [];
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
});
const send = (method, params = {}) => new Promise((resolve) => { const id = ++seq; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });
const run = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: `(async()=>{${expr}})()`, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'JS error');
  return r.result?.result?.value;
};
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 402, height: 874, deviceScaleFactor: 1, mobile: true });
/* 動きを止める（絵を運ぶ途中の印が HTML に残らないように） */
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
/* ?static=1：config.js が backend を 'snapshot' にする（Supabase に出ない。コメントや数をページに焼き込まない） */
await send('Page.navigate', { url: `${ORIGIN}/index.html?static=1#/today` });
await sleep(2500);

/* ---------- 書き出すページの一覧（公開中のものだけ） ---------- */
const routes = await run(`
  const S = window.BCStore, R = window.BCRender;
  const out = [];
  S.visible().forEach(e => out.push({ kind: 'c', slug: e.context.slug, updated: e.updatedAt }));
  S.works().forEach(h => out.push({ kind: 'w', slug: h.slug,
    updated: h.contexts.map(c => c.entry.updatedAt).sort().pop() || '' }));
  S.editors().forEach(ed => out.push({ kind: 'e', slug: ed.id, updated: S.byEditor(ed.id).map(e => e.updatedAt).sort().pop() || '' }));
  return out;`);
console.log(`ページ ${routes.length} 枚（c ${routes.filter((r) => r.kind === 'c').length} / w ${routes.filter((r) => r.kind === 'w').length} / e ${routes.filter((r) => r.kind === 'e').length}）  サイト ${SITE}`);

const TEMPLATE = fs.readFileSync(path.join(DOCS, 'index.html'), 'utf8');
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const local = new RegExp(ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/', 'g');
const must = (s, a) => { if (!s.includes(a)) throw new Error('index.html の形が変わっています：' + a.slice(0, 60)); };

/* 一枚の置き場：rel は根からの道（c/区間/・about/）、route はアプリの道筋、og は og:type、body は body の追加クラス */
const spec = (r) => r.kind === 'about'
  ? { rel: 'about/', route: '#/about', og: 'website', body: '' }
  : { rel: `${r.kind}/${encodeURIComponent(r.slug)}/`, route: `#/${r.kind}/${encodeURIComponent(r.slug)}`,
      og: r.kind === 'c' ? 'article' : 'profile', body: r.kind === 'c' ? ' route' : '' };

function page(s, got){
  const url = `${SITE}/${s.rel}`;
  let h = TEMPLATE;
  const swap = (a, b) => { must(h, a); h = h.replace(a, () => b); };
  /* 資源（CSS・JS・絵）は、サイトの根から読む。上がる数は置き場の深さで決まる（c/区間/ は二つ、about/ は一つ） */
  const up = '../'.repeat(s.rel.split('/').length - 1);
  swap('<meta charset="utf-8">', `<meta charset="utf-8">\n<base href="${up}">`);
  h = h.replace(/<title>[^<]*<\/title>/, () => `<title>${esc(got.title)}</title>`);
  h = h.replace(/<meta name="description" content="[^"]*">/, () => `<meta name="description" content="${esc(got.desc)}">`);
  h = h.replace(/<link rel="canonical" href="[^"]*">/, () => `<link rel="canonical" href="${esc(url)}">`);
  h = h.replace(/<meta property="og:type" content="[^"]*">/, () => `<meta property="og:type" content="${s.og}">\n<meta property="og:url" content="${esc(url)}">`);
  h = h.replace(/<meta property="og:title" content="[^"]*">/, () => `<meta property="og:title" content="${esc(got.title)}">`);
  h = h.replace(/<meta property="og:description" content="[^"]*">/, () => `<meta property="og:description" content="${esc(got.desc)}">`);
  if (got.image) h = h.replace(/<meta property="og:image" content="[^"]*">/, () => `<meta property="og:image" content="${esc(got.image)}">`);
  swap('<script type="application/ld+json" id="ld"></script>', `<script type="application/ld+json" id="ld">${got.ld.replace(/</g, '\\u003c')}</script>`);
  swap('<body class="stage-intro">', `<body class="stage-uni viewing${s.body}" data-route="${s.route}">`);
  const VIEW = /<div class="view" id="view" role="dialog" aria-modal="true">\s*<div class="view-in" id="viewIn"><\/div>/;
  if (!VIEW.test(h)) throw new Error('index.html の形が変わっています：#view');
  h = h.replace(VIEW, () => `<div class="view on" id="view" role="dialog" aria-modal="true" aria-label="${esc(got.label)}">\n  <div class="view-in" id="viewIn">${got.html}</div>`);
  return h;
}

/* ---------- 一枚ずつ描かせて、書き出す ---------- */
const done = [];
for (const r of routes) {
  const got = await run(`
    const S = window.BCStore, R = window.BCRender;
    location.hash = '#/${r.kind}/' + ${JSON.stringify(encodeURIComponent(r.slug))};
    await new Promise(res => setTimeout(res, 60));
    const plain = (t) => String(t || '').replace(/\\s+/g, ' ').trim();
    const cut = (t, n) => { t = plain(t); return t.length > n ? t.slice(0, n - 1) + '…' : t; };
    const viewIn = document.getElementById('viewIn');
    let desc = '', label = document.getElementById('view').getAttribute('aria-label') || '', ld = '', image = '';
    const abs = (u) => u ? new URL(u, document.baseURI).href : '';
    if (${JSON.stringify(r.kind)} === 'c'){
      const e = S.byContextSlug(${JSON.stringify(r.slug)});
      desc = cut(e.context.headline.replace(/\\n/g, '') + '　' + e.a.title + ' と ' + e.b.title + '。' + S.plain(e.context.body), 150);
      ld = document.getElementById('ld').textContent;
      image = abs(R.safeImg(e.a.image));
    } else if (${JSON.stringify(r.kind)} === 'w'){
      const h = S.workBySlug(${JSON.stringify(r.slug)}) || S.works().find(x => x.slug === ${JSON.stringify(r.slug)});
      const w = h.work;
      desc = cut(w.title + '（' + (w.type || '作品') + (w.year ? '・' + w.year + '年' : '') + '）。' + (w.summary || '') +
        '　つながる作品：' + h.contexts.map(c => c.entry[c.side === 'a' ? 'b' : 'a'].title).join('、'), 150);
      const o = Object.assign(R.thing(w), { url: R.urlOf('w', h.slug) });
      const pic = R.safeImg(w.image); if (pic) { o.image = abs(pic); image = o.image; }
      o.subjectOf = h.contexts.map(c => ({ '@type': 'Article', headline: c.entry.context.headline.replace(/\\n/g, ''), url: R.urlOf('c', c.entry.context.slug) }));
      ld = JSON.stringify(Object.assign({ '@context': 'https://schema.org' }, o));
    } else {
      const ed = S.editorById(${JSON.stringify(r.slug)});
      desc = cut(ed.name + '（' + (ed.role || 'EDITOR') + '）。' + (ed.bio || '') + '　選んだつながり ' + S.byEditor(ed.id).length + ' 本', 150);
      ld = JSON.stringify({ '@context': 'https://schema.org', '@type': 'ProfilePage', url: R.urlOf('e', ed.id),
        mainEntity: { '@type': 'Person', name: ed.name, jobTitle: ed.role, description: ed.bio || undefined } });
    }
    return { html: viewIn.innerHTML, title: document.title, label, desc, ld, image };`);
  for (const k of ['html', 'ld', 'image']) got[k] = String(got[k] || '').replace(local, SITE + '/');
  const dir = path.join(DOCS, r.kind, r.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(spec(r), got));
  done.push(r);
}

/* 「Beautiful Context とは」（about/）。読み物も、アプリに描かせたものをそのまま書き出す
   （検索エンジンが JS を待たなくても、本文・AboutPage・Organization が HTML にある） */
{
  const got = await run(`
    const R = window.BCRender;
    location.hash = '#/about';
    await new Promise(res => setTimeout(res, 60));
    return { html: document.getElementById('viewIn').innerHTML, title: document.title,
      label: document.getElementById('view').getAttribute('aria-label') || '',
      desc: R.ABOUT_DESC, ld: document.getElementById('ld').textContent, image: '' };`);
  for (const k of ['html', 'ld']) got[k] = String(got[k] || '').replace(local, SITE + '/');
  if (!got.html.includes('Beautiful Context とは') || !got.ld.includes('AboutPage')) throw new Error('about/ の中身が描けていません');
  fs.mkdirSync(path.join(DOCS, 'about'), { recursive: true });
  fs.writeFileSync(path.join(DOCS, 'about', 'index.html'), page(spec({ kind: 'about' }), got));
}

/* 古いページ（非公開にした・消したもの）を片づける */
for (const kind of ['c', 'w', 'e']) {
  const d = path.join(DOCS, kind);
  if (!fs.existsSync(d)) continue;
  const keep = new Set(done.filter((r) => r.kind === kind).map((r) => r.slug));
  for (const name of fs.readdirSync(d)) if (!keep.has(name)) fs.rmSync(path.join(d, name), { recursive: true, force: true });
}

/* ---------- sitemap.xml と robots.txt ---------- */
const day = (iso) => (iso || new Date().toISOString()).slice(0, 10);
const urls = [{ loc: `${SITE}/`, lastmod: day(done.map((r) => r.updated).sort().pop()) },
  { loc: `${SITE}/about/`, lastmod: day() },
  ...done.map((r) => ({ loc: `${SITE}/${r.kind}/${encodeURIComponent(r.slug)}/`, lastmod: day(r.updated) }))];
fs.writeFileSync(path.join(DOCS, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `  <url><loc>${esc(u.loc)}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n') + '\n</urlset>\n');
fs.writeFileSync(path.join(DOCS, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`書き出しました：${done.length} 枚 + about/ + sitemap.xml（${urls.length} 件）`);
if (errors.length) console.log('ページのエラー：', errors.slice(0, 5));
ws.close(); server.close(); await closeChrome();

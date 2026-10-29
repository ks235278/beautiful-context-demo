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
// sitemap の lastmod は「ページの中身が実際に変わった日」。前に書き出したページと比べて決める（?v= と改行の違いは変わったうちに入れない）。
// 組み直して名前が変わった区間（BC_MOVED）の古いアドレスには、新しいページへ移る小さなページを置く（200 で返す。sitemap には入れない）。
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

/* git の autocrlf で CRLF になっていても、書き出すページは LF にそろえる（比べるときに枠の違いが出ないように） */
const TEMPLATE = fs.readFileSync(path.join(DOCS, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
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
  h = h.replace(/<meta property="og:type" content="[^"]*">/, () => `<meta property="og:type" content="${s.og}">`);
  swap('<meta property="og:url" content="https://beautifulcontext.com/">', `<meta property="og:url" content="${esc(url)}">`);
  /* サイト名とロゴの構造化データ（WebSite・Organization）はトップだけのもの。写したページでは外す */
  const SITE_LD = /<!-- サイトそのものの構造化データ[\s\S]*?<script type="application\/ld\+json" id="ld-site">[\s\S]*?<\/script>\n?/;
  if (!SITE_LD.test(h)) throw new Error('index.html の形が変わっています：#ld-site');
  h = h.replace(SITE_LD, '');
  h = h.replace(/<meta property="og:title" content="[^"]*">/, () => `<meta property="og:title" content="${esc(got.title)}">`);
  h = h.replace(/<meta property="og:description" content="[^"]*">/, () => `<meta property="og:description" content="${esc(got.desc)}">`);
  if (got.image) h = h.replace(/<meta property="og:image" content="[^"]*">/, () => `<meta property="og:image" content="${esc(got.image)}">`);
  swap('<script type="application/ld+json" id="ld"></script>', `<script type="application/ld+json" id="ld">${got.ld.replace(/</g, '\\u003c')}</script>`);
  swap('<body class="stage-intro">', `<body class="stage-uni viewing${s.body}" data-route="${s.route}">`);
  const VIEW = /<div class="view" id="view" role="dialog" aria-modal="true">\s*<div class="view-in" id="viewIn"><\/div>/;
  if (!VIEW.test(h)) throw new Error('index.html の形が変わっています：#view');
  /* 本文を印で挟む（sitemap の lastmod を決めるとき、枠ではなくこの中身で比べる） */
  h = h.replace(VIEW, () => `<div class="view on" id="view" role="dialog" aria-modal="true" aria-label="${esc(got.label)}">\n  <div class="view-in" id="viewIn"><!--bc-body-->${got.html}<!--/bc-body--></div>`);
  return h;
}

/* ---------- いつ変わったか（sitemap の lastmod） ----------
   seed の updatedAt は使えない（見本の直しを端末に届けるため、updatedAt は createdAt のまま据え置く）。
   そこで、書き出すときに前のファイルと比べ、同じなら前の sitemap.xml の日付を引き継ぎ、違えば今日（日本の日付）にする */
const day = (iso) => (iso || new Date().toISOString()).slice(0, 10);
const TODAY = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const prevMod = new Map();
if (fs.existsSync(path.join(DOCS, 'sitemap.xml'))) {
  for (const m of fs.readFileSync(path.join(DOCS, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g)) prevMod.set(m[1], m[2]);
}
/* 比べるのは、そのページだけのもの（題・説明・絵・構造化データ・本文）。枠（index.html のメニュー、CSS・JS の読み込み、?v=）が
   変わっても、変わったうちに入れない（Google は lastmod を「中身の大きな変更」の日として読む）。
   本文の印（<!--bc-body-->）のない古いページとは、コメント・script（構造化データ以外）・style・CSS/JS の link・?v=・空白を除いて比べる */
const pick = (re, h) => (h.match(re) || [])[1] || '';
function sig(h) {
  h = h.replace(/\r\n/g, '\n');
  const b = h.indexOf('<!--bc-body-->'), e = h.indexOf('<!--/bc-body-->');
  if (b < 0 || e < b) return null;
  return [pick(/<title>([^<]*)<\/title>/, h), pick(/<meta name="description" content="([^"]*)">/, h),
    pick(/<meta property="og:image" content="([^"]*)">/, h), pick(/<script type="application\/ld\+json" id="ld">([\s\S]*?)<\/script>/, h),
    h.slice(b, e)].join('\n').replace(/\?v=\d+/g, '');
}
const norm = (h) => h.replace(/\r\n/g, '\n')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<script\b(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/g, '')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '')
  .replace(/<link\b[^>]*\bhref="[^"]*\.(?:css|js|webmanifest)(?:\?v=\d+)?"[^>]*>/g, '')
  .replace(/\?v=\d+/g, '')
  .replace(/\s+/g, ' ');
const same = (a, b) => { const x = sig(a), y = sig(b); return x !== null && y !== null ? x === y : norm(a) === norm(b); };
/* ページはすぐには書かず、sitemap.xml を先に書いてから書く（途中で止まっても、次に走らせたとき「変わった」が消えないように） */
const lastmod = new Map(), writes = [];
function writePage(file, loc, html, fallback) {
  const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  lastmod.set(loc, before !== null && same(before, html) ? (prevMod.get(loc) || fallback) : TODAY);
  writes.push([file, html]);
}

/* ---------- 一枚ずつ描かせて、書き出す ---------- */
const done = [];
const meta = new Map();   // 区間の slug → 題・説明・絵（移ったアドレスのページに写す）
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
  writePage(path.join(DOCS, r.kind, r.slug, 'index.html'), `${SITE}/${spec(r).rel}`, page(spec(r), got), day(r.updated));
  if (r.kind === 'c') meta.set(r.slug, { title: got.title, desc: got.desc, image: got.image });
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
  writePage(path.join(DOCS, 'about', 'index.html'), `${SITE}/about/`, page(spec({ kind: 'about' }), got), TODAY);
}

/* 組み直して名前が変わった区間（BC_MOVED）の古いアドレス。404 のままだと、検索エンジンは古いアドレスを捨て、
   共有されたリンクのカードも「見つかりません」になる。そこで新しいページへすぐ移る小さなページを置く。
   Google は即時の meta refresh を恒久的な移転として扱い、検索結果には移った先を出す（noindex は付けない）。
   canonical と og:* は移った先のもの。bot のための meta refresh は絶対 URL、人のための location.replace は相対 */
const moved = (await run(`return window.BC_MOVED || {};`)) || {};
const live = new Set(done.filter((r) => r.kind === 'c').map((r) => r.slug));
const safeSlug = (s) => /^[a-z0-9-]+$/.test(s);
const redirects = [];
for (const old of Object.keys(moved)) {
  let to = moved[old];
  for (let i = 0; i < 10 && !live.has(to) && moved[to]; i++) to = moved[to];   // 移った先がまた移っていたら、たどる
  if (live.has(old) || !live.has(to) || !safeSlug(old) || !safeSlug(to)) {
    console.log('移ったアドレスのページを作りませんでした：', old, '→', moved[old], live.has(old) ? '（古い名前の区間がまだある）' : '（移った先が見つからない）');
    continue;
  }
  const m = meta.get(to), url = `${SITE}/c/${to}/`, rel = `../${to}/`;
  redirects.push([path.join(DOCS, 'c', old, 'index.html'), `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(m.title)}</title>
<link rel="canonical" href="${esc(url)}">
<meta name="description" content="${esc(m.desc)}">
<meta property="og:site_name" content="Beautiful Context">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(m.title)}">
<meta property="og:description" content="${esc(m.desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(m.image || `${SITE}/icon-512.png`)}">
<meta name="twitter:card" content="summary">
<meta http-equiv="refresh" content="0; url=${esc(url)}">
<script>location.replace(${JSON.stringify(rel)} + location.search + location.hash);</script>
<style>html,body{margin:0;background:#061629;color:#e9e4d8;font:14px/1.8 sans-serif}a{color:inherit}p{padding:40px 24px;text-align:center}</style>
</head>
<body>
<p>このつながりは、新しいアドレスに移りました。<br><a href="${rel}">${esc(m.title)}</a></p>
</body>
</html>
`, old]);
}

/* ---------- sitemap.xml と robots.txt（ページより先に書く） ---------- */
/* トップはどのつながりが変わっても変わるので、いちばん新しい日にする */
const urls = [{ loc: `${SITE}/` }, { loc: `${SITE}/about/` }, ...done.map((r) => ({ loc: `${SITE}/${spec(r).rel}` }))]
  .map((u) => ({ loc: u.loc, lastmod: lastmod.get(u.loc) }));
urls[0].lastmod = [...lastmod.values()].sort().pop() || TODAY;
fs.writeFileSync(path.join(DOCS, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `  <url><loc>${esc(u.loc)}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n') + '\n</urlset>\n');
fs.writeFileSync(path.join(DOCS, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

/* ページと、移ったアドレスのページを書く */
for (const [file, html] of [...writes, ...redirects]) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

/* 古いページ（非公開にした・消したもの）を片づける。移ったアドレスのページは残す */
for (const kind of ['c', 'w', 'e']) {
  const d = path.join(DOCS, kind);
  if (!fs.existsSync(d)) continue;
  const keep = new Set(done.filter((r) => r.kind === kind).map((r) => r.slug));
  if (kind === 'c') redirects.forEach((x) => keep.add(x[2]));
  for (const name of fs.readdirSync(d)) if (!keep.has(name)) fs.rmSync(path.join(d, name), { recursive: true, force: true });
}

console.log(`書き出しました：${done.length} 枚 + about/ + sitemap.xml（${urls.length} 件、今日変わった ${urls.filter((u) => u.lastmod === TODAY).length} 件）+ 移ったアドレス ${redirects.length} 件`);
if (errors.length) console.log('ページのエラー：', errors.slice(0, 5));
ws.close(); server.close(); await closeChrome();

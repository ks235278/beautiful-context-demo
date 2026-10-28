// 参考・出典を docs/js/sources.js に書き出す。
// node tools/import-sources.mjs <結果.json> [--check] [--review <報告.md>]
//   結果.json … { contexts: [{ slug, verdict, sources: [{ claim, url, title, site, primary }], problems: [...] }] }
//   --check   … 一件ずつ開いてみて、無いページ（404・410・名前が引けない）は外す。403・429 は残して報告に書く
//   --review  … 本文の直しの候補（problems）と、外した出典を Markdown にまとめる
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const argv = process.argv.slice(2);
const input = argv.find((a) => !a.startsWith('--'));
const check = argv.includes('--check');
const reviewAt = argv.includes('--review') ? argv[argv.indexOf('--review') + 1] : '';
if (!input) { console.error('使い方：node tools/import-sources.mjs <結果.json> [--check] [--review <報告.md>]'); process.exit(1); }

const data = JSON.parse(fs.readFileSync(input, 'utf8'));
const list = Array.isArray(data) ? data : (data.contexts || []);

/* 本文の区間（seed.js）にある slug だけを受け付ける */
globalThis.window = {};
await import('file://' + path.join(ROOT, 'docs/js/seed.js').replace(/\\/g, '/'));
const known = new Set(window.BC_SEED.map((e) => e.context.slug));

const okUrl = (u) => { try { const x = new URL(u); return x.protocol === 'https:' || x.protocol === 'http:'; } catch (e) { return false; } };
const one = (s) => String(s || '').replace(/\s+/g, ' ').trim();

const UA = 'Mozilla/5.0 (compatible; BeautifulContextLinkCheck/1.0; +https://beautifulcontext.com/)';
async function probe(url, ua = UA){
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctl.signal,
      headers: ua ? { 'User-Agent': ua } : {} });
    return r.status;
  } catch (e) {
    return e.name === 'AbortError' ? 'timeout' : 'error';
  } finally { clearTimeout(t); }
}

/* 開いてみるのは先にまとめて、8 件ずつ並べて */
const status = new Map();
if (check) {
  const urls = [...new Set(list.flatMap((c) => (c.sources || []).map((s) => one(s.url)).filter(okUrl)))];
  let i = 0;
  await Promise.all(Array.from({ length: 8 }, async () => {
    /* つながらなかったものは、名乗りを付けずに一度だけ開き直す（一時的な失敗や、見慣れない名乗りを断るサイトで外さないように） */
    while (i < urls.length) { const u = urls[i++]; let st = await probe(u); if (st === 'error' || st === 'timeout') st = await probe(u, ''); status.set(u, st); }
  }));
}

const out = {}, dropped = [], flagged = [], problems = [];
for (const c of list) {
  if (!known.has(c.slug)) { dropped.push({ slug: c.slug, url: '', why: '本文に無い slug' }); continue; }
  const seen = new Set();
  const keep = [];
  for (const s of c.sources || []) {
    const url = one(s.url);
    if (!okUrl(url) || seen.has(url)) continue;
    seen.add(url);
    if (check) {
      const st = status.get(url);
      if (st === 404 || st === 410 || st === 'error') { dropped.push({ slug: c.slug, url, why: String(st) }); continue; }
      if (st !== 'timeout' && (st < 200 || st >= 400)) flagged.push({ slug: c.slug, url, why: String(st) });
      if (st === 'timeout') flagged.push({ slug: c.slug, url, why: 'timeout' });
    }
    keep.push({ title: one(s.title) || url, site: one(s.site), url, primary: !!s.primary });
  }
  /* もとの出どころを先に */
  keep.sort((a, b) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0));
  if (keep.length) out[c.slug] = keep;
  if ((c.problems || []).length || c.verdict !== 'ok') problems.push({ slug: c.slug, verdict: c.verdict, problems: c.problems || [] });
}

const head = `/* 参考・出典（区間の slug ごと）。コンテクストの末尾に出す一覧と、構造化データの citation に使う。
   tools/import-sources.mjs が書き出す。手で直すときも、この形のまま：
     'slug': [{ title: 'ページの題', site: '載っている所', url: 'https://…', primary: true }]
   primary … 作者・発行元・機関など、もとの出どころ */
`;
fs.writeFileSync(path.join(ROOT, 'docs/js/sources.js'), head + 'window.BC_SOURCES = ' + JSON.stringify(out, null, 1) + ';\n');
const n = Object.values(out).reduce((a, b) => a + b.length, 0);
console.log(`書き出しました：${Object.keys(out).length} 区間・出典 ${n} 件（外した ${dropped.length} 件、要確認 ${flagged.length} 件、直しの候補がある区間 ${problems.length}）`);

if (reviewAt) {
  const md = [`# 参考・出典の取り込み報告`, '',
    `区間 ${Object.keys(out).length}・出典 ${n} 件。外した出典 ${dropped.length} 件、開けなかったが残した出典 ${flagged.length} 件。`, '',
    '## 本文の直しの候補', '',
    ...problems.flatMap((p) => [`### ${p.slug}（${p.verdict}）`, ...p.problems.map((q) => `- [${q.severity}] 「${one(q.quote)}」 — ${one(q.issue_vi)}\n  - 直し案：${one(q.fix_ja) || '（削る）'}\n  - 根拠：${one(q.evidence_url)}`), '']),
    '## 外した出典', '', ...dropped.map((d) => `- ${d.slug} ${d.url} (${d.why})`), '',
    '## 開けなかったが残した出典（403・429・時間切れなど。サイト側がロボットを断っていることが多い）', '', ...flagged.map((d) => `- ${d.slug} ${d.url} (${d.why})`), ''];
  fs.writeFileSync(reviewAt, md.join('\n'));
  console.log('報告：' + reviewAt);
}

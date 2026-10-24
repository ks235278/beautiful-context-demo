// 公開中のコンテクスト・作品・編集者・広告枠を Supabase から読み、seed.js と同じ形の docs/js/snapshot.js に書き出す。
//
//   node tools/export-published.mjs              … docs/js/snapshot.js を書く
//   node tools/export-published.mjs --check      … 書いたあと、いまの docs/js/seed.js と同じかを確かめる（違えば一覧を出し、終了コード 1）
//   node tools/export-published.mjs --out <path> … 書き出す先を変える
//
// 読むのは anon（publishable）キーだけ。RLS により、返るのは公開中のもの（下書き・審査待ち・止めた編集者のものは出ない）。
// URL とキーは docs/js/config.js から読む。service_role（secret key）は使わない・どこにも書かない。
// まだ prerender にはつないでいない（README 5 章：export-published → prerender の順にするのは、snapshot.js に切り替えるとき）。
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'docs');
const args = process.argv.slice(2);
const OUT = args.includes('--out') ? path.resolve(args[args.indexOf('--out') + 1]) : path.join(DOCS, 'js', 'snapshot.js');
const CHECK = args.includes('--check');

/* ブラウザ用のファイルを、そのまま読む（location はプリレンダーでない普通のページのふり） */
function loadScript(file) {
  const window = {};
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), { window, location: { search: '' } });
  return window;
}
const C = loadScript(path.join(DOCS, 'js', 'config.js')).BC_CONFIG;
if (!C || !C.supabaseUrl || !C.supabaseAnonKey) throw new Error('docs/js/config.js に supabaseUrl と supabaseAnonKey がありません');
if (/^sb_secret_|service_role/.test(C.supabaseAnonKey)) throw new Error('config.js に secret key が入っています。すぐに消して、鍵を作り直してください');

/* PostgREST を anon で読む。一度に 1,000 行までなので、offset で分けて読む */
async function rest(table, query) {
  const out = [];
  for (let offset = 0; ; offset += 1000) {
    const u = `${C.supabaseUrl}/rest/v1/${table}?${query}&limit=1000&offset=${offset}`;
    const res = await fetch(u, { headers: { apikey: C.supabaseAnonKey, Accept: 'application/json' } });
    if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
    const rows = await res.json();
    out.push(...rows);
    if (rows.length < 1000) return out;
  }
}

const iso = (t) => (t ? new Date(t).toISOString() : t);
/* 空の値は seed.js に書かれていない項目なので出さない */
const put = (o, k, v) => { if (v !== null && v !== undefined && v !== '') o[k] = v; };

/* 作品（駅）：README 2 章の対応表の逆。項目の並びも seed.js と同じにする */
function toWork(w) {
  const o = { title: w.title, type: w.type, year: w.year, creator: w.creator, slug: w.slug };
  if (w.sort_order != null) o.order = +w.sort_order;
  put(o, 'image', w.image);
  put(o, 'credit', w.credit);
  put(o, 'creditUrl', w.credit_url);
  o.summary = w.summary;
  return o;
}
function toEntry(r) {
  const c = { routeName: r.route_name, label: r.label };
  put(c, 'kind', r.kind);
  c.hub = r.hub;
  put(c, 'score', r.score);
  put(c, 'basis', r.basis);
  c.headline = r.headline;
  c.slug = r.slug;
  c.relation = r.relation;
  c.leftStation = r.left_station;
  c.rightStation = r.right_station;
  c.author = r.author_name;
  put(c, 'review', r.review);
  put(c, 'approvedAt', iso(r.approved_at));
  c.aiUrl = r.ai_url;
  const line = r.line || {};
  c.line = Object.assign({ shape: line.shape, color: line.color }, line);   // jsonb はキーを並べ替えるので、seed.js の並びに戻す
  c.body = r.body;
  const e = { id: r.legacy_id || r.id, createdAt: iso(r.created_at), updatedAt: iso(r.updated_at), a: toWork(r.a), b: toWork(r.b), context: c };
  const st = Array.isArray(r.stats) ? r.stats[0] : r.stats;
  if (st && st.reactions) e.reactions = st.reactions;
  return e;
}

const contexts = await rest('contexts',
  'select=*,a:works!work_a_id(*),b:works!work_b_id(*),stats:context_stats(reactions)&status=eq.public&order=created_at.desc,id.asc');
const editorsRows = await rest('editors', 'select=*&status=eq.active&order=sort_order.asc.nullslast,id.asc');
const picks = await rest('editor_picks', 'select=editor_id,position,context:contexts(slug)&order=editor_id.asc,position.asc');
const adsRows = await rest('ads', 'select=*&order=sort_order.asc.nullslast,created_at.asc');

const BC_SEED = contexts.map(toEntry);
const BC_EDITORS = editorsRows.map((r) => {
  const o = { id: r.id, authors: r.authors, name: r.name };
  put(o, 'mark', r.mark);
  o.role = r.role_label;
  put(o, 'photo', r.photo);
  put(o, 'note', r.note);
  put(o, 'bio', r.bio);
  const p = picks.filter((x) => x.editor_id === r.id && x.context).map((x) => x.context.slug);
  if (p.length) o.picks = p;
  return o;
});
const BC_SEED_ADS = adsRows.map((r) => {
  const o = { id: r.id, title: r.title, sub: r.sub, image: r.image, url: r.url, active: r.active };
  put(o, 'contextId', r.context_id);
  put(o, 'startsAt', iso(r.starts_at));
  put(o, 'endsAt', iso(r.ends_at));
  return o;
});
/* 組み直して名前の変わった区間（古いアドレス → 新しいアドレス）は、まだ表が無い。seed.js のものをそのまま運ぶ */
const seedWin = loadScript(path.join(DOCS, 'js', 'seed.js'));
const BC_MOVED = seedWin.BC_MOVED || {};
const at = new Date().toISOString();

const js = `/* Beautiful Context — 公開中のデータの書き出し（tools/export-published.mjs が作る。手で直さない）。
   形は seed.js と同じ。書き出した時刻 ${at}・コンテクスト ${BC_SEED.length} 本 */
window.BC_SEED = ${JSON.stringify(BC_SEED, null, 1)};
window.BC_MOVED = ${JSON.stringify(BC_MOVED, null, 1)};
window.BC_EDITORS = ${JSON.stringify(BC_EDITORS, null, 1)};
window.BC_SEED_ADS = ${JSON.stringify(BC_SEED_ADS, null, 1)};
window.BC_SNAPSHOT = ${JSON.stringify({ at, contexts: BC_SEED.length })};
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, js);
console.log(`書き出し：${path.relative(ROOT, OUT)}（${(Buffer.byteLength(js) / 1024).toFixed(0)}KB）コンテクスト ${BC_SEED.length}・編集者 ${BC_EDITORS.length}・広告枠 ${BC_SEED_ADS.length}`);

if (CHECK) {
  /* 突き合わせ：書き出したもの と いまの seed.js を、同じ形の値として比べる */
  const snap = loadScript(OUT);
  const diffs = [];
  const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x)
    ? Object.fromEntries(Object.keys(x).sort().map((key) => [key, x[key]])) : x));
  const walk = (a, b, where) => {
    if (canon(a) === canon(b)) return;
    if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
      new Set([...Object.keys(a), ...Object.keys(b)]).forEach((k) => walk(a[k], b[k], `${where}.${k}`));
    } else diffs.push(`${where}: seed=${String(JSON.stringify(a)).slice(0, 120)} / snapshot=${String(JSON.stringify(b)).slice(0, 120)}`);
  };
  const seed = seedWin.BC_SEED, got = snap.BC_SEED;
  const byId = new Map(got.map((e) => [e.id, e]));
  seed.forEach((e) => { if (!byId.has(e.id)) diffs.push(`BC_SEED: ${e.id} が snapshot に無い`); else walk(e, byId.get(e.id), `BC_SEED[${e.id}]`); });
  const seedIds = new Set(seed.map((e) => e.id));
  got.forEach((e) => { if (!seedIds.has(e.id)) diffs.push(`BC_SEED: ${e.id} は seed.js に無い（Supabase で足したもの）`); });
  /* 項目の並びまで同じか（JSON の文字として） */
  let keyOrder = 0;
  seed.forEach((e) => { const g = byId.get(e.id); if (g && canon(e) === canon(g) && JSON.stringify(e) !== JSON.stringify(g)) keyOrder++; });
  if (keyOrder) diffs.push(`項目の並びだけが違うもの ${keyOrder} 本（中身は同じ）`);
  /* 配列の並び（seed.js は手で並べた「新しい順」。snapshot は created_at の新しい順。Store.all() はどちらも createdAt で並べ直す） */
  const moved = seed.filter((e, i) => !got[i] || got[i].id !== e.id).length;
  if (moved) diffs.push(`BC_SEED の配列の並びが違う位置 ${moved} か所（Store.all() は createdAt で並べ直すので、画面には出ない）`);
  walk(seedWin.BC_EDITORS, snap.BC_EDITORS, 'BC_EDITORS');
  walk(seedWin.BC_SEED_ADS, snap.BC_SEED_ADS, 'BC_SEED_ADS');
  walk(seedWin.BC_MOVED, snap.BC_MOVED, 'BC_MOVED');
  if (!diffs.length) console.log('突き合わせ：seed.js と同じ（差 0）');
  else { console.log(`突き合わせ：差 ${diffs.length} 件`); diffs.forEach((d) => console.log('  - ' + d)); process.exitCode = 1; }
}

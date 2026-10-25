// まだ流していない migration を、Supabase の上で「流して・確かめて・取り消す」ための SQL を一つにして出す。
//
//   node tools/sql-test.mjs 12            … backend/migrations/12_*.sql ＋ backend/tests/12_*.test.sql を標準出力へ
//   node tools/sql-test.mjs 12 13         … 12 と 13 を順に（13 が 12 を前提にするとき）
//   node tools/sql-test.mjs --applied 12  … 流したあと：確かめだけを出す
//
// 出てきた SQL を SQL Editor（または MCP の execute_sql）に貼って一度に流す。
// 確かめの最後の行が、わざと例外（BC_TEST_OK … / BC_TEST_NG …）を投げるので、一つの transaction としてまるごと取り消される。
// migration も試しのデータ（@example.invalid）も、何も残らない。本当に流すのは apply_migration（承認のあと）で。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BACKEND = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'backend');
const args = process.argv.slice(2);
const applied = args.includes('--applied');
const nums = args.filter((a) => /^\d+$/.test(a));
if (!nums.length) { console.error('使い方：node tools/sql-test.mjs [--applied] 12 [13 …]'); process.exit(2); }
const pick = (dir, n, tail) => {
  const f = fs.readdirSync(path.join(BACKEND, dir)).find((x) => x.startsWith(n + '_') && x.endsWith(tail));
  if (!f) { console.error(`${dir}/${n}_*${tail} がありません`); process.exit(2); }
  return path.join(BACKEND, dir, f);
};
const out = [];
/* backend/schema.sql は「いま流れているもの」の写し。migrations/ の文と食い違っていたら止める（どちらかを直し忘れている） */
const lf = (s) => s.replace(/\r\n/g, '\n').trim();
const schema = lf(fs.readFileSync(path.join(BACKEND, 'schema.sql'), 'utf8'));
nums.forEach((n) => {
  if (!schema.includes(lf(fs.readFileSync(pick('migrations', n, '.sql'), 'utf8')))) {
    console.error(`backend/schema.sql に migrations/${n}_*.sql と同じ文がありません（写し忘れか、片方だけ直した）`);
    process.exit(3);
  }
});
if (!applied) nums.forEach((n) => out.push(fs.readFileSync(pick('migrations', n, '.sql'), 'utf8')));
nums.forEach((n, i) => {
  let t = fs.readFileSync(pick('tests', n, '.test.sql'), 'utf8');
  /* いくつか続けるときは、最後のもの以外は「通った」で止めずに先へ進む（OK の例外を NOTICE に替える） */
  if (i < nums.length - 1) t = t.replace(/raise exception 'BC_TEST_OK/g, "raise notice 'BC_TEST_OK");
  out.push(t);
});
process.stdout.write(out.join('\n'));

-- 13_user_mutes の確かめ。何も残さない：最後の行がわざと例外を投げ、全体を取り消す（12 の確かめと同じ流し方）。
--   node tools/sql-test.mjs 13   → SQL Editor / execute_sql
do $$
declare
  a  uuid := gen_random_uuid();   -- 隠す人
  b  uuid := gen_random_uuid();   -- 隠される人
  c  uuid := gen_random_uuid();   -- 三人目
  n  int;
  ok int := 0;
begin
  insert into auth.users (id, email, email_confirmed_at) values
    (a, 'bc-test-13-a@example.invalid', now()), (b, 'bc-test-13-b@example.invalid', now()), (c, 'bc-test-13-c@example.invalid', now());

  -- 1. a が b を隠せる（user_id は既定で自分）
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  insert into public.user_mutes (muted_user_id) values (b);
  select count(*) into n from public.user_mutes;
  if n <> 1 then raise exception 'BC_TEST_NG 1：自分の行が読めない（%）', n; end if; ok := ok + 1;
  -- 2. 同じ相手を二度は入らない（23505。画面は ignoreDuplicates で送る）
  begin insert into public.user_mutes (muted_user_id) values (b); raise exception 'BC_TEST_NG 2：二重に入った';
  exception when unique_violation then ok := ok + 1; end;
  -- 3. 自分は隠せない（23514）
  begin insert into public.user_mutes (muted_user_id) values (a); raise exception 'BC_TEST_NG 3：自分を隠せた';
  exception when check_violation then ok := ok + 1; end;
  -- 4. ほかの人の名前では入れられない（RLS）
  begin insert into public.user_mutes (user_id, muted_user_id) values (c, b); raise exception 'BC_TEST_NG 4：他人の行を作れた';
  exception when insufficient_privilege then ok := ok + 1; end;
  -- 5. 存在しない相手は入らない（外部キー）
  begin insert into public.user_mutes (muted_user_id) values (gen_random_uuid()); raise exception 'BC_TEST_NG 5：いない人を隠せた';
  exception when foreign_key_violation then ok := ok + 1; end;

  -- 6. b からは、a に隠されたことが見えない
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  select count(*) into n from public.user_mutes;
  if n <> 0 then raise exception 'BC_TEST_NG 6：他人の行が見えた'; end if; ok := ok + 1;
  -- 7. b は a の行を消せない（0 行）
  delete from public.user_mutes where user_id = a;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'BC_TEST_NG 7：他人の行を消せた'; end if; ok := ok + 1;

  -- 8. 未ログインは読めない・書けない
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '', true);
  begin perform 1 from public.user_mutes; raise exception 'BC_TEST_NG 8：anon が読めた';
  exception when insufficient_privilege then ok := ok + 1; end;
  begin insert into public.user_mutes (user_id, muted_user_id) values (a, c); raise exception 'BC_TEST_NG 8b：anon が書けた';
  exception when insufficient_privilege then ok := ok + 1; end;

  -- 9. a は自分の行を消して、また入れられる
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  delete from public.user_mutes where muted_user_id = b;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'BC_TEST_NG 9：自分の行を消せない'; end if; ok := ok + 1;
  insert into public.user_mutes (muted_user_id) values (b), (c);
  perform set_config('role', 'none', true);
  perform set_config('request.jwt.claims', '', true);

  -- 10. 隠された人が退会すると、その行も消える（cascade）
  delete from auth.users where id = b;
  select count(*) into n from public.user_mutes where muted_user_id = b;
  if n <> 0 then raise exception 'BC_TEST_NG 10：退会した相手の行が残った'; end if; ok := ok + 1;
  -- 11. 隠した人が退会すると、その人の行も消える
  delete from auth.users where id = a;
  select count(*) into n from public.user_mutes;
  if n <> 0 then raise exception 'BC_TEST_NG 11：退会した人の行が残った'; end if; ok := ok + 1;

  -- 12. RLS が有効・policy は三つ・anon には何の権限もない
  select count(*) into n from pg_class t
   where t.oid = 'public.user_mutes'::regclass and t.relrowsecurity
     and (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = 'user_mutes') = 3
     and not has_table_privilege('anon', t.oid, 'select, insert, update, delete')
     and not has_table_privilege('authenticated', t.oid, 'update');
  if n <> 1 then raise exception 'BC_TEST_NG 12：RLS・policy・権限が違う'; end if; ok := ok + 1;

  raise exception 'BC_TEST_OK 13_user_mutes：% 項目すべて通った（この例外で全体を取り消す。何も残らない）', ok;
end $$;

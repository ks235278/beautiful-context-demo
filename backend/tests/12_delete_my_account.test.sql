-- 12_delete_my_account の確かめ。何も残さない：最後の行がわざと例外を投げ、全体を取り消す。
-- 流し方（どちらでも同じ）：
--   ・まだ流していない migration を試す：node tools/sql-test.mjs 12 が「migration ＋ この確かめ」を一つにして出す → SQL Editor / execute_sql へ
--   ・流したあとの確かめ：このファイルだけを流す
-- 結果は例外の文で返る：BC_TEST_OK（全部通った）か BC_TEST_NG（どこで落ちたか）。
-- 試しのデータ（@example.invalid の利用者・作品・つながり）は、この中で作って、この中で消える。
do $$
declare
  r   uuid := gen_random_uuid();   -- 退会する読者
  o   uuid := gen_random_uuid();   -- ほかの読者（巻き込まれないこと）
  ed  uuid := gen_random_uuid();   -- 編集者
  op  uuid := gen_random_uuid();   -- 運営者
  wa  uuid; wb uuid; ctx uuid; rep uuid;
  n   int;
  ok  int := 0;
  st  text;
begin
  -- ---------- 準備（postgres のまま） ----------
  insert into auth.users (id, email, email_confirmed_at, created_at) values
    (r,  'bc-test-12-reader@example.invalid', now(), now() - interval '2 days'),
    (o,  'bc-test-12-other@example.invalid',  now(), now() - interval '2 days'),
    (ed, 'bc-test-12-editor@example.invalid', now(), now() - interval '2 days'),
    (op, 'bc-test-12-op@example.invalid',     now(), now() - interval '2 days');
  update public.profiles set display_name = 'テスト読者' where id = r;
  update public.profiles set display_name = 'ほかの読者' where id = o;
  update public.profiles set display_name = 'テスト編集者', role = 'editor' where id = ed;
  update public.profiles set display_name = 'テスト運営', role = 'operator' where id = op;
  insert into public.editors (id, name, user_id) values ('bc-test-12', 'テスト編集者', ed);
  insert into public.works (slug, title) values ('bc-test-12-a', '試しの作品 A') returning id into wa;
  insert into public.works (slug, title) values ('bc-test-12-b', '試しの作品 B') returning id into wb;
  insert into public.contexts (slug, work_a_id, work_b_id, route_name, headline, editor_id, status)
  values ('bc-test-12-a--bc-test-12-b', wa, wb, '試し', '試しの見出し', 'bc-test-12', 'public') returning id into ctx;

  -- 読者 r と o が、フォロー・共感・コメント・通報をする（本人として）
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', r, 'role', 'authenticated')::text, true);
  insert into public.follows (editor_id) values ('bc-test-12');
  insert into public.reactions (context_id) values (ctx);
  insert into public.comments (context_id, display_name, body) values (ctx, 'x', '通すコメント');
  insert into public.comments (context_id, display_name, body) values (ctx, 'x', '確認待ちのまま');
  insert into public.reports (target_type, target_id, reason, detail, reporter_name, reporter_email)
  values ('context', ctx::text, 'other', '試しの通報', '名前', 'someone@example.invalid');
  perform set_config('request.jwt.claims', json_build_object('sub', o, 'role', 'authenticated')::text, true);
  insert into public.follows (editor_id) values ('bc-test-12');
  insert into public.comments (context_id, display_name, body) values (ctx, 'x', 'ほかの人のコメント');
  perform set_config('role', 'none', true);
  perform set_config('request.jwt.claims', '', true);
  -- r の一本目を通す（お知らせが一つできる）
  update public.comments set status = 'approved' where user_id = r and body = '通すコメント';
  select id into rep from public.reports where reporter_user_id = r;

  select followers into n from public.editor_stats where editor_id = 'bc-test-12';
  if n <> 2 then raise exception 'BC_TEST_NG 準備：フォロワー % （2 のはず）', n; end if;
  select comments into n from public.context_stats where context_id = ctx;
  if n <> 1 then raise exception 'BC_TEST_NG 準備：公開中のコメント % （1 のはず）', n; end if;
  select count(*) into n from public.notifications where user_id = r;
  if n <> 1 then raise exception 'BC_TEST_NG 準備：お知らせ % （1 のはず）', n; end if;

  -- ---------- 1. 未ログイン（anon）は呼べない ----------
  begin
    perform set_config('role', 'anon', true);
    perform public.delete_my_account();
    raise exception 'BC_TEST_NG 1：anon が呼べてしまった';
  exception when insufficient_privilege then ok := ok + 1;
  end;
  perform set_config('role', 'none', true);

  -- ---------- 2. 編集者は消せない（42501）・消えていない ----------
  begin
    perform set_config('role', 'authenticated', true);
    perform set_config('request.jwt.claims', json_build_object('sub', ed, 'role', 'authenticated')::text, true);
    perform public.delete_my_account();
    raise exception 'BC_TEST_NG 2：編集者が消せてしまった';
  exception when insufficient_privilege then
    get stacked diagnostics st = message_text;
    if st not like '編集者・運営者のアカウント%' then raise exception 'BC_TEST_NG 2：思わぬ 42501：%', st; end if;
    ok := ok + 1;
  end;
  perform set_config('role', 'none', true);
  if not exists (select 1 from auth.users where id = ed) then raise exception 'BC_TEST_NG 2b：編集者が消えた'; end if;
  ok := ok + 1;

  -- ---------- 3. 運営者も消せない ----------
  begin
    perform set_config('role', 'authenticated', true);
    perform set_config('request.jwt.claims', json_build_object('sub', op, 'role', 'authenticated')::text, true);
    perform public.delete_my_account();
    raise exception 'BC_TEST_NG 3：運営者が消せてしまった';
  exception when insufficient_privilege then ok := ok + 1;
  end;
  perform set_config('role', 'none', true);

  -- ---------- 4. 読者 r が自分を消す ----------
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', r, 'role', 'authenticated')::text, true);
  perform public.delete_my_account();
  ok := ok + 1;
  -- 5. 同じトークンでもう一度呼んでも、何も起きない（もう消えている）
  perform public.delete_my_account();
  ok := ok + 1;
  perform set_config('role', 'none', true);
  perform set_config('request.jwt.claims', '', true);

  -- ---------- 6〜12. 消えたもの ----------
  if exists (select 1 from auth.users where id = r)                 then raise exception 'BC_TEST_NG 6：auth.users が残った'; end if; ok := ok + 1;
  if exists (select 1 from public.profiles where id = r)            then raise exception 'BC_TEST_NG 7：profiles が残った'; end if; ok := ok + 1;
  if exists (select 1 from public.follows where user_id = r)        then raise exception 'BC_TEST_NG 8：follows が残った'; end if; ok := ok + 1;
  if exists (select 1 from public.reactions where user_id = r)      then raise exception 'BC_TEST_NG 9：reactions が残った'; end if; ok := ok + 1;
  if exists (select 1 from public.comments where user_id = r)       then raise exception 'BC_TEST_NG 10：comments が残った'; end if; ok := ok + 1;
  if exists (select 1 from public.comments where body in ('通すコメント', '確認待ちのまま')) then raise exception 'BC_TEST_NG 10b：コメントの本文が残った'; end if; ok := ok + 1;
  if exists (select 1 from public.notifications where user_id = r)  then raise exception 'BC_TEST_NG 11：notifications が残った'; end if; ok := ok + 1;
  -- 12. 通報は残り、送り手の印・名前・メールが空
  select count(*) into n from public.reports
   where id = rep and reporter_user_id is null and reporter_name = '' and reporter_email = '';
  if n <> 1 then raise exception 'BC_TEST_NG 12：通報が残っていないか、送り手が消えていない'; end if; ok := ok + 1;

  -- ---------- 13〜14. 数がトリガーで減った ----------
  select followers into n from public.editor_stats where editor_id = 'bc-test-12';
  if n <> 1 then raise exception 'BC_TEST_NG 13：フォロワー % （1 のはず）', n; end if; ok := ok + 1;
  select reactions + comments * 10 into n from public.context_stats where context_id = ctx;
  if n <> 0 then raise exception 'BC_TEST_NG 14：共感・公開中のコメントの数が戻っていない（%）', n; end if; ok := ok + 1;

  -- ---------- 15. ほかの読者 o は巻き込まれていない ----------
  if not exists (select 1 from public.profiles where id = o and display_name = 'ほかの読者')
     or not exists (select 1 from public.follows where user_id = o)
     or not exists (select 1 from public.comments where user_id = o) then
    raise exception 'BC_TEST_NG 15：ほかの読者のデータが消えた';
  end if; ok := ok + 1;

  -- ---------- 16. 関数の守り：security definer・search_path が空・anon に実行権が無い ----------
  select count(*) into n from pg_proc p
   where p.oid = 'public.delete_my_account()'::regprocedure and p.prosecdef
     and p.proconfig @> array['search_path=""']
     and not has_function_privilege('anon', p.oid, 'execute')
     and has_function_privilege('authenticated', p.oid, 'execute');
  if n <> 1 then raise exception 'BC_TEST_NG 16：関数の属性・実行権が違う'; end if; ok := ok + 1;

  raise exception 'BC_TEST_OK 12_delete_my_account：% 項目すべて通った（この例外で全体を取り消す。何も残らない）', ok;
end $$;

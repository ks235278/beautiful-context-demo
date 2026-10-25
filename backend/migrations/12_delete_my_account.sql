-- @migration 12_delete_my_account
-- （2026-10-25 に書いた。まだ dev に流していない。流したら README 6.1 と schema.sql の「未適用」の注を外す）
--
-- 読者が、アプリの中で自分のアカウントを消す（App Store 審査 5.1.1(v)：退会はアプリの中で始められ、
-- アカウントと、その人のデータ（書いたコメントを含む）が消えること。電話・メールで頼ませるのは不可）。
--
--   select public.delete_my_account();     -- 画面からは supabase.rpc('delete_my_account')
--
-- ・消すのは呼んだ本人（auth.uid()）だけ。引数は取らない（ほかの人を消す道を作らない）。anon は呼べない。
-- ・auth.users の行を消すと、外部キーの cascade で次が一緒に消える：
--     profiles → follows・reactions・comments（公開中のものも）・notifications・user_mutes（13）
--     auth の identities・sessions・refresh_tokens（ログインの記録。もう同じセッションでは入れない）
--   数（editor_stats.followers・context_stats.reactions / comments）は、それぞれのトリガーが減らす。
-- ・通報・削除の依頼（reports）は、運営が扱った記録として残す。送った人の印（reporter_user_id）と、名前・メールを空にする。
-- ・編集者・運営者は、公開中のつながり・審査の記録・Storage の絵に結びついているので、ここでは消さない
--   （42501 と、運営に知らせてほしいという一言を返す）。どう消すか（署名を残すか・絵を消すか）は運営が決める。
--   Storage に絵を置けるのは編集者・運営者だけなので、読者には先に消すべき絵がない。
-- ・auth.users を消せるのは関数の持ち主（postgres）だけなので security definer にする。search_path は空にして、
--   名前はすべてスキーマ付きで書く（Advisors 0011）。
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_uid  uuid := auth.uid();
  v_role public.user_role;
begin
  if v_uid is null then
    raise exception 'ログインしていません' using errcode = '42501';
  end if;
  select p.role into v_role from public.profiles p where p.id = v_uid;
  if v_role in ('editor', 'operator') or exists (select 1 from public.editors e where e.user_id = v_uid) then
    raise exception '編集者・運営者のアカウントは、公開中のつながりに結びついているため、ここでは削除できません。利用規約の連絡先からお知らせください'
      using errcode = '42501';
  end if;
  update public.reports r set reporter_user_id = null, reporter_name = '', reporter_email = ''
   where r.reporter_user_id = v_uid;
  delete from auth.users u where u.id = v_uid;
end $$;
comment on function public.delete_my_account() is
  '読者が自分のアカウントを消す（5.1.1(v)）。本人だけ・引数なし。プロフィール・フォロー・共感・コメント・お知らせ・非表示の設定が消える。通報は送り手の印を外して残す。編集者・運営者は 42501';

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

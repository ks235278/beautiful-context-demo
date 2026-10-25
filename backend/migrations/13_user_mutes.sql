-- @migration 13_user_mutes
-- （2026-10-25 に書き、同じ日に dev に流した。確かめ：tools/sql-test.mjs --applied で全項目通過）
--
-- 「この人のコメントを表示しない」（App Store 審査 1.2：利用者が、ほかの利用者を遮れること）。
-- ・隠れるのは、設定した人の画面だけ。相手には知らせず、相手のコメントも消えない（運営が消すのは通報から）。
-- ・並べるときに外すのは画面の側（store.js の visibleComments）。ここは「誰を隠したか」を端末をまたいで覚えるだけ。
--   ログインしていない読者は、端末の中（localStorage）にだけ覚える。
-- ・読める・書ける・消せるのは本人の行だけ。どちらかが退会すれば、行も消える（cascade）。
create table public.user_mutes (
  user_id       uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  muted_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (user_id, muted_user_id),
  constraint user_mutes_not_self check (user_id <> muted_user_id)
);
create index user_mutes_muted_idx on public.user_mutes (muted_user_id);   -- 相手が退会したときの cascade を速く
comment on table public.user_mutes is
  'コメントを表示しない相手（1.2 のブロック）。本人の画面だけで隠す。本人の行だけ読める・書ける・消せる';

alter table public.user_mutes enable row level security;
create policy user_mutes_select on public.user_mutes for select to authenticated
  using (user_id = (select auth.uid()));
create policy user_mutes_insert on public.user_mutes for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy user_mutes_delete on public.user_mutes for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.user_mutes from anon, authenticated;
grant select, insert, delete on public.user_mutes to authenticated;
grant all on public.user_mutes to service_role;

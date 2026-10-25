-- =====================================================================
-- Beautiful Context — Supabase（Postgres）の土台　schema.sql
-- =====================================================================
-- 入れるもの
--   読者（profiles）、編集者（editors・editor_invites・editor_picks）、作品（works）、
--   コンテクスト（contexts と、その審査の記録・版の控え）、フォロー・共感・コメント、
--   通報と削除依頼（reports）、お知らせ（notifications）、広告枠（ads）、見た目の設定（site_settings）、
--   一括取り込み（import_rows → import_commit()）。
--
-- 流し方
--   `-- @migration <名前>` の行で六つに分かれている（01_types_tables 〜 06_views_initial_data）。
--   本番（beautiful-context / jajlkgybusedmvjmnqjc）には、この六つを順に migration として流した（2026-10-22）。07〜11 もあとから流してある。
--   12・13 は 2026-10-25 に dev へ適用済み。これから書く migration は、頭に「まだ dev に流していない」と書いたものが未適用（backend/migrations/ に同じ文がある。流したら注を外す）。
--   一つの migration は一つのトランザクションで流れるので、失敗した部分だけを直して流し直せる。
--   新しいプロジェクトなら、全体を SQL Editor に貼って一度に流してもよい（一つのトランザクションになる）。
--   または supabase CLI で supabase/migrations/ に分けて置き、supabase db push。
--   二度目からの変更は、このファイルの末尾の「あとから足した migration」に足していく。
--
-- 考え方
--   ・ブラウザが持つのは anon キー（新しい名前では publishable key）だけ。守りは RLS とトリガーに置く。
--   ・「誰が、どの行を」は RLS。「どの列を、どう変えてよいか」は BEFORE トリガー（*_guard）。
--   ・数（フォロワー・共感・コメント）は別の表（*_stats）に持ち、トリガーだけが書く。
--     本文の updated_at が数の増減で動かないので、静的ページの作り直しや差分の読み込みが静かになる。
--   ・権限の判定に使う関数は private スキーマに置く（API からは呼べない）。
--   ・項目名は docs/js/seed.js と docs/js/store.js に合わせた（対応は各列のコメント）。
--     JS は camelCase、DB は snake_case（routeName → route_name、creditUrl → credit_url、order → sort_order）。
-- =====================================================================

-- @migration 01_types_tables

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;


-- =====================================================================
-- 1. 型
-- =====================================================================

create type public.user_role      as enum ('reader', 'editor', 'operator');      -- 読者 / 編集者 / 運営者
create type public.account_status as enum ('active', 'suspended');               -- 利用停止は運営が付ける
create type public.editor_status  as enum ('active', 'hidden', 'suspended');     -- hidden = store.authors[name] = 'hidden'
-- コンテクストの公開の状態。store.js の 'public' / 'private' / 'hidden' に、審査の二つを足した
--   private           … 非公開・下書き（書き手が選ぶ）
--   submitted         … 審査待ち
--   changes_requested … 差し戻し（運営が付ける）
--   public            … 公開
--   hidden            … 一時非表示（運営が選ぶ）
create type public.context_status as enum ('private', 'submitted', 'changes_requested', 'public', 'hidden');
-- AGM（生成AIの初稿 → 編集者が確かめる）。null は人が書いたもの
create type public.review_state   as enum ('ai', 'approved');
create type public.comment_status as enum ('pending', 'approved', 'hidden', 'rejected');
create type public.report_kind    as enum ('report', 'removal');                 -- 通報 / 削除の依頼（権利者・本人）
create type public.report_target  as enum ('context', 'work', 'comment', 'editor', 'image', 'other');
create type public.report_reason  as enum ('copyright', 'portrait', 'privacy', 'defamation', 'inaccurate', 'spam', 'other');
create type public.report_status  as enum ('open', 'in_progress', 'resolved', 'rejected');
create type public.review_action  as enum ('submit', 'withdraw', 'request_changes', 'publish', 'unpublish', 'hide',
                                           'ai_claim', 'ai_approve', 'delete', 'restore', 'note');


-- =====================================================================
-- 2. 表
-- =====================================================================

-- ---------- 読者のアカウント（auth.users に一対一） ----------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(btrim(display_name)) between 1 and 24),
                                              -- social.js の me.name（コメントに出す名前）。Google の本名は自動で入れない
  avatar_url   text check (avatar_url is null or avatar_url ~* '^https://'),
  role         public.user_role      not null default 'reader',
  status       public.account_status not null default 'active',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
comment on table public.profiles is '読者のアカウント。auth.users に一対一。役割（reader/editor/operator）と利用停止を持つ';

-- ---------- 編集者（seed.js の window.BC_EDITORS） ----------
create table public.editors (
  id          text primary key check (id ~ '^[a-z0-9][a-z0-9-]{1,39}$'),   -- URL の e/<id>/（'chief'、'desk'）
  user_id     uuid unique references public.profiles (id) on delete set null,  -- ログインする人。見本の編集者は null
  name        text not null check (char_length(name) between 1 and 40),
  mark        text check (mark is null or char_length(mark) <= 2),          -- 丸い印の一文字（'眞'）
  role_label  text not null default 'EDITOR' check (char_length(role_label) <= 40),  -- seed の role（'EDITOR IN CHIEF'）
  photo       text check (photo is null or photo !~* '^\s*(data|javascript):'),
  note        text check (note is null or note ~ '^[A-Za-z0-9_]{1,40}$'),   -- note.com のユーザー名
  bio         text check (bio is null or char_length(bio) <= 400),
  authors     text[] not null default '{}',     -- この編集者に結びつく書き手名（context.author）。取り込みで使う
  status      public.editor_status not null default 'active',
  can_publish boolean not null default false,   -- 審査なしで公開してよい（信頼できる編集者）
  is_ai_desk  boolean not null default false,   -- 生成AIの初稿を受け持つ「BC 編集部」
  sort_order  int,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table public.editors is '編集者（BC_EDITORS）。外部の編集者は editor_invites で招き、ログインした時点で user_id が結びつく';

-- 編集者の招待。招いたメールアドレスでログイン（確認済み）すると、その編集者になる
create table public.editor_invites (
  email       text primary key check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  editor_id   text not null references public.editors (id) on delete cascade,
  invited_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  accepted_at timestamptz
);
create index editor_invites_editor_idx on public.editor_invites (editor_id);

-- 編集者の数（フォロワー）。follows のトリガーだけが書く
create table public.editor_stats (
  editor_id text primary key references public.editors (id) on delete cascade,
  followers int not null default 0 check (followers >= 0)
);

-- ---------- 作品（駅）。seed.js の a / b ----------
create table public.works (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique
              check (slug ~ '^[a-z0-9぀-ヿ一-龯-]{1,128}$' and slug !~ '^-|-$'),  -- store.slugify と同じ字の範囲。URL の w/<slug>/
  title       text not null check (char_length(title) between 1 and 120),
  type        text not null default 'その他' check (char_length(type) between 1 and 20),   -- 映画・書籍・人物 …（種類が多いので enum にしない）
  year        text not null default '' check (char_length(year) <= 20),     -- '1963'、'1901–'、'' があるので文字で持つ
  creator     text not null default '' check (char_length(creator) <= 120),
  summary     text not null default '' check (char_length(summary) <= 280),
  image       text not null default '' check (image !~* '^\s*(data|javascript):'),   -- 'img/works/…'（Pages）か Storage の URL。data: は入れない
  credit      text not null default '' check (char_length(credit) <= 300),
  credit_url  text not null default '' check (credit_url = '' or credit_url ~* '^https?://'),   -- creditUrl
  sort_order  int,                                                          -- order（先生のタイトル一覧の並び）
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index works_sort_idx on public.works (sort_order nulls last, title);
create index works_created_by_idx on public.works (created_by);
comment on table public.works is '作品（駅）。コンテクストの a / b。slug で一つに決まり、同じ作品を複数のコンテクストが共有する';

-- ---------- 一括取り込みの単位 ----------
create table public.import_batches (
  id           uuid primary key default gen_random_uuid(),
  label        text not null default '',
  dry_run      boolean not null default false,
  row_count    int not null default 0,
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ---------- コンテクスト（区間）。seed.js の context ＋ store.js の運営の情報 ----------
create table public.contexts (
  id                 uuid primary key default gen_random_uuid(),
  legacy_id          text unique,                 -- seed.js の id（'seed-highest-highlow'）。引っ越しの突き合わせ用
  slug               text not null unique
                     check (slug ~ '^[a-z0-9぀-ヿ一-龯-]{1,128}$' and slug !~ '^-|-$'),   -- URL の c/<slug>/
  work_a_id          uuid not null references public.works (id) on delete restrict,   -- a
  work_b_id          uuid not null references public.works (id) on delete restrict,   -- b
  route_name         text not null check (char_length(route_name) between 1 and 40),  -- routeName（路線名）
  label              text not null default 'CONTEXT' check (char_length(label) <= 20),
  kind               text check (kind in ('事実', 'ハブ', '似ている', '作者と作品')),    -- 先生の分類
  hub                text not null default '' check (char_length(hub) <= 60),        -- 二つをつなぐ固有名詞
  basis              text not null default '' check (char_length(basis) <= 80),      -- 下敷き（'前田先生の note（2017–2018）'）
  score              smallint[] check (score is null or (array_length(score, 1) = 4
                                       and array_position(score, null) is null
                                       and 1 <= all (score) and 5 >= all (score))),  -- [意外性, 共感度, コンテンツ性, 世界観近似性]
  headline           text not null check (char_length(headline) between 1 and 80),    -- キャッチコピー（\n で改行）
  relation           text not null default '' check (char_length(relation) <= 220),   -- 要約
  left_station       text not null default '' check (char_length(left_station) <= 60),   -- leftStation
  right_station      text not null default '' check (char_length(right_station) <= 60), -- rightStation
  body               text not null default ''
                     check (char_length(body) <= 40000
                            and body !~* '<\s*/?\s*(script|iframe|object|embed|style|link|meta|form)\y'
                            and body !~* 'javascript\s*:'),     -- 本文の HTML。表示の前に必ず BCRender.clean を通す（これは保険）
  author_name        text not null default '編集部' check (char_length(author_name) between 1 and 30),  -- context.author（表示する書き手名）
  editor_id          text not null references public.editors (id) on delete restrict,  -- 書き手名を結びつけた編集者（store.editorOf）
  ai_url             text not null default '' check (ai_url = '' or ai_url ~* '^https?://'),  -- aiUrl（生成AIの出力 URL）
  line               jsonb not null default '{}'::jsonb
                     check (jsonb_typeof(line) = 'object'
                            and (line ->> 'color' is null or line ->> 'color' ~ '^#[0-9a-fA-F]{6}$')),   -- { shape, color }
  status             public.context_status not null default 'private',
  review             public.review_state,         -- null：人が書いた / 'ai'：初稿（未確認） / 'approved'：初稿を確認済み
  assigned_editor_id text references public.editors (id) on delete set null,   -- AGM：初稿を引き受けた編集者
  approved_by_editor text references public.editors (id) on delete set null,   -- 確認した編集者
  approved_at        timestamptz,                 -- context.approvedAt
  published_at       timestamptz,                 -- はじめて公開した日（以後 slug を変えない）
  deleted_at         timestamptz,                 -- 運営が消した日（30日後に purge_deleted で本当に消す）
  import_batch_id    uuid references public.import_batches (id) on delete set null,
  created_by         uuid references public.profiles (id) on delete set null,
  created_at         timestamptz not null default now(),   -- createdAt
  updated_at         timestamptz not null default now(),   -- updatedAt（差分の読み込みと sitemap の lastmod に使う）
  constraint contexts_two_works check (work_a_id <> work_b_id)
);
create index contexts_public_idx    on public.contexts (updated_at desc) where status = 'public' and deleted_at is null;
create index contexts_updated_idx   on public.contexts (updated_at);
create index contexts_editor_idx    on public.contexts (editor_id);
create index contexts_work_a_idx    on public.contexts (work_a_id);
create index contexts_work_b_idx    on public.contexts (work_b_id);
create index contexts_queue_idx     on public.contexts (created_at) where status = 'submitted' and deleted_at is null;
create index contexts_ai_idx        on public.contexts (assigned_editor_id) where review = 'ai';
create index contexts_deleted_idx   on public.contexts (deleted_at) where deleted_at is not null;
comment on table public.contexts is 'コンテクスト（二駅間の区間）。読者に見えるのは status=public・未削除・編集者が active のものだけ';

-- コンテクストの数（共感・公開中のコメント）。トリガーだけが書く
create table public.context_stats (
  context_id uuid primary key references public.contexts (id) on delete cascade,
  reactions  int not null default 0 check (reactions >= 0),   -- store の e.reactions（見本の初期値も入れてよい）
  comments   int not null default 0 check (comments >= 0)
);

-- 本文を直す前の控え（荒らし・書き損じから戻すため）
create table public.context_revisions (
  id         bigint generated always as identity primary key,
  context_id uuid not null references public.contexts (id) on delete cascade,
  actor_id   uuid references public.profiles (id) on delete set null,
  snapshot   jsonb not null,                       -- 直す前の行（to_jsonb(old)）
  created_at timestamptz not null default now()
);
create index context_revisions_ctx_idx on public.context_revisions (context_id, created_at desc);

-- 審査の記録（提出・差し戻し・公開・初稿の確認・削除）。運営メモ（store の e.note）もここに残す
create table public.context_reviews (
  id          bigint generated always as identity primary key,
  context_id  uuid not null references public.contexts (id) on delete cascade,
  actor_id    uuid references public.profiles (id) on delete set null,
  action      public.review_action not null,
  from_status public.context_status,
  to_status   public.context_status,
  note        text not null default '' check (char_length(note) <= 1000),
  created_at  timestamptz not null default now()
);
create index context_reviews_ctx_idx on public.context_reviews (context_id, created_at desc);

-- 編集者が、ほかの人の区間から選んだつながり（BC_EDITORS の picks）
create table public.editor_picks (
  editor_id  text not null references public.editors (id) on delete cascade,
  context_id uuid not null references public.contexts (id) on delete cascade,
  position   int not null default 0,
  created_at timestamptz not null default now(),
  primary key (editor_id, context_id)
);
create index editor_picks_ctx_idx on public.editor_picks (context_id);

-- ---------- 読者の動き ----------
-- フォロー（social.js の follows）。端末をまたいで同じものが見え、数は本物になる
create table public.follows (
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  editor_id  text not null references public.editors (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, editor_id)
);
create index follows_editor_idx on public.follows (editor_id);

-- 共感（store の liked）
create table public.reactions (
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  context_id uuid not null references public.contexts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, context_id)
);
create index reactions_ctx_idx on public.reactions (context_id);

-- コメント（store の comments：{ id, uid, name, text, at, hidden, pending }）
create table public.comments (
  id            uuid primary key default gen_random_uuid(),
  context_id    uuid not null references public.contexts (id) on delete cascade,
  user_id       uuid references public.profiles (id) on delete cascade,   -- uid。null は引っ越した見本のコメントだけ
  display_name  text not null check (char_length(display_name) between 1 and 30),   -- name（書いた時点の表示名を写す）
  body          text not null check (char_length(btrim(body)) between 1 and 600),  -- text
  status        public.comment_status not null default 'pending',   -- pending → approved（hidden / rejected）
  reject_reason text not null default '' check (char_length(reject_reason) <= 200),
  moderated_by  uuid references public.profiles (id) on delete set null,
  moderated_at  timestamptz,
  created_at    timestamptz not null default now(),   -- at
  updated_at    timestamptz not null default now()
);
create index comments_ctx_idx     on public.comments (context_id, created_at) where status = 'approved';
create index comments_pending_idx on public.comments (created_at desc) where status = 'pending';
create index comments_user_idx    on public.comments (user_id, created_at desc);

-- ---------- 通報と削除の依頼 ----------
create table public.reports (
  id               uuid primary key default gen_random_uuid(),
  kind             public.report_kind   not null default 'report',
  target_type      public.report_target not null,
  target_id        text not null default '' check (char_length(target_id) <= 200),   -- slug か uuid
  target_url       text not null default '' check (target_url = '' or target_url ~* '^https?://'),
  reason           public.report_reason not null,
  detail           text not null check (char_length(btrim(detail)) between 1 and 2000),
  is_rights_holder boolean not null default false,   -- 権利者・本人からの依頼
  reporter_user_id uuid references public.profiles (id) on delete set null,   -- ログインしていなければ null
  reporter_name    text not null default '' check (char_length(reporter_name) <= 60),
  reporter_email   text not null default '' check (reporter_email = '' or reporter_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  ip_hash          text,                              -- 送りすぎを止めるための、日ごとに変わる IP のハッシュ
  status           public.report_status not null default 'open',
  resolution       text not null default '' check (char_length(resolution) <= 2000),
  handled_by       uuid references public.profiles (id) on delete set null,
  handled_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index reports_open_idx on public.reports (created_at desc) where status in ('open', 'in_progress');
create index reports_user_idx on public.reports (reporter_user_id);
create index reports_ip_idx   on public.reports (ip_hash, created_at);
comment on table public.reports is '通報と削除の依頼。ログインしていない権利者も送れる。読めるのは送った本人と運営だけ';

-- ---------- お知らせ（第3段階） ----------
create table public.notifications (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  kind       text not null check (kind in ('review', 'comment', 'report', 'system')),
  title      text not null check (char_length(title) <= 120),
  body       text not null default '' check (char_length(body) <= 1000),
  link       text not null default '' check (link = '' or link !~* '^\s*(data|javascript):'),   -- 'c/<slug>/' など
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- ---------- 広告枠（store の ads：{ id, title, sub, image, url, active }） ----------
create table public.ads (
  id         text primary key default ('ad' || substr(md5(random()::text), 1, 10)),   -- 'ad-vacant' など
  title      text not null default '' check (char_length(title) <= 60),
  sub        text not null default '' check (char_length(sub) <= 120),
  image      text not null default '' check (image !~* '^\s*(data|javascript):'),
  url        text not null default '' check (url = '' or url ~* '^(https?://|#/)'),
  active     boolean not null default true,
  context_id uuid references public.contexts (id) on delete cascade,   -- 記事単位の広告枠（事業計画書）。null はどこにでも
  starts_at  timestamptz,
  ends_at    timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- 見た目の設定（store の settings。一行だけ） ----------
create table public.site_settings (
  id         smallint primary key default 1 check (id = 1),
  brand      text not null default 'Beautiful Context' check (char_length(brand) <= 40),
  tagline    text not null default '言葉から、つながりを辿る' check (char_length(tagline) <= 80),
  theme      text not null default 'charcoal' check (theme in ('charcoal', 'white')),
  accent     text not null default '#ee8232' check (accent ~ '^#[0-9a-fA-F]{6}$'),
  ad_every   smallint not null default 2 check (ad_every between 0 and 20),   -- adEvery
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);

-- ---------- 一括取り込みの受け皿 ----------
-- CSV（Excel から UTF-8 で保存）を Supabase の Table Editor で読み込むか、
-- 引っ越しスクリプトが seed.js / 書き出し JSON をこの形に直して入れる。
-- 一行 = 一つのコンテクスト（作品 A・B を含む）。列名は CSV の見出しにそのまま使う。
create table public.import_rows (
  row_no        bigint generated always as identity primary key,
  batch         text not null default 'inbox',      -- まとまりの名前（例 '2026-11-launch'）
  -- 作品 A
  a_slug text, a_title text, a_type text, a_year text, a_creator text, a_summary text,
  a_image text, a_credit text, a_credit_url text, a_order int,
  -- 作品 B
  b_slug text, b_title text, b_type text, b_year text, b_creator text, b_summary text,
  b_image text, b_credit text, b_credit_url text, b_order int,
  -- コンテクスト
  slug text, route_name text, label text, kind text, hub text, basis text,
  score text,                                        -- '3,5,5,4'
  headline text,                                     -- 改行は \n と書く
  relation text, left_station text, right_station text, body text,
  author text, editor_id text,                       -- editor_id が空なら author を editors.authors から探す
  review text, status text, ai_url text,             -- review: '' / 'ai' / 'approved'、status: 既定 'private'
  line_shape int, line_color text,
  reactions int,                                     -- 共感の初期値（見本の引っ越し用）
  legacy_id text, created_at timestamptz,
  -- 結果（import_commit が書く）
  result text,                                       -- inserted / updated / skipped / error
  error  text
);
create index import_rows_batch_idx on public.import_rows (batch, row_no) where result is null;


-- @migration 02_private_functions_triggers

-- =====================================================================
-- 3. 判定に使う関数（private。RLS とトリガーから呼ぶ）
-- =====================================================================

-- service_role キー（Edge Function・取り込みスクリプト）か、SQL Editor・psql（postgres）からの直の操作。
-- current_user で見るので、SQL Editor で `set local role authenticated` にすれば読者として確かめられる。
-- 注意：security definer の関数の中では current_user が持ち主（postgres）になり、いつも true になる。
--       だから is_backend() を呼ぶトリガー（*_guard・comments / reports の insert）は definer にしない。
create or replace function private.is_backend()
returns boolean language sql stable set search_path = '' as $$
  select current_user not in ('anon', 'authenticated')
      or coalesce(auth.jwt() ->> 'role', '') = 'service_role';
$$;

create or replace function private.is_operator()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p
                  where p.id = auth.uid() and p.role = 'operator' and p.status = 'active');
$$;

create or replace function private.is_active_user()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'active');
$$;

-- ログインしている人が編集者なら、その編集者の id
create or replace function private.my_editor_id()
returns text language sql stable security definer set search_path = '' as $$
  select e.id from public.editors e
    join public.profiles p on p.id = e.user_id
   where e.user_id = auth.uid() and e.status <> 'suspended' and p.status = 'active'
   limit 1;
$$;

create or replace function private.can_publish()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.editors e
                  where e.user_id = auth.uid() and e.can_publish and e.status = 'active');
$$;

create or replace function private.editor_is_active(p_editor text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.editors e where e.id = p_editor and e.status = 'active');
$$;

-- 読者に見えるコンテクストか（store.isVisible と同じ条件）
create or replace function private.context_is_visible(p_context uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.contexts c
                   join public.editors e on e.id = c.editor_id
                  where c.id = p_context and c.status = 'public' and c.deleted_at is null and e.status = 'active');
$$;

-- 自分が書き手のコンテクストか
create or replace function private.owns_context(p_context uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.contexts c
                  where c.id = p_context and c.editor_id = private.my_editor_id());
$$;

-- 自分が書き手か、初稿の担当のコンテクストか
create or replace function private.works_on_context(p_context uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.contexts c
                  where c.id = p_context
                    and (c.editor_id = private.my_editor_id() or c.assigned_editor_id = private.my_editor_id()));
$$;

-- 作品が見えるか：見えるコンテクストのどれかに使われている、自分が作った、運営者
create or replace function private.can_see_work(p_work uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.is_operator()
      or exists (select 1 from public.works w where w.id = p_work and w.created_by = auth.uid())
      or exists (select 1 from public.contexts c
                   join public.editors e on e.id = c.editor_id
                  where (c.work_a_id = p_work or c.work_b_id = p_work)
                    and c.deleted_at is null
                    and ((c.status = 'public' and e.status = 'active')
                         or c.editor_id = private.my_editor_id()
                         or c.assigned_editor_id = private.my_editor_id()
                         or (c.review = 'ai' and c.assigned_editor_id is null and private.my_editor_id() is not null)));
$$;

-- 一度でも公開したコンテクストに使われている作品か（そうなったら、作品を直せるのは運営だけ）
create or replace function private.work_in_public_use(p_work uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.contexts c
                  where (c.work_a_id = p_work or c.work_b_id = p_work)
                    and c.published_at is not null and c.deleted_at is null);
$$;


-- =====================================================================
-- 4. トリガー
-- =====================================================================

-- ---------- updated_at ----------
create or replace function private.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger profiles_90_touch      before update on public.profiles      for each row execute function private.touch_updated_at();
create trigger editors_90_touch       before update on public.editors       for each row execute function private.touch_updated_at();
create trigger works_90_touch         before update on public.works         for each row execute function private.touch_updated_at();
create trigger contexts_90_touch      before update on public.contexts      for each row execute function private.touch_updated_at();
create trigger comments_90_touch      before update on public.comments      for each row execute function private.touch_updated_at();
create trigger reports_90_touch       before update on public.reports       for each row execute function private.touch_updated_at();
create trigger ads_90_touch           before update on public.ads           for each row execute function private.touch_updated_at();
create trigger site_settings_90_touch before update on public.site_settings for each row execute function private.touch_updated_at();

-- ---------- 新しいアカウント → profiles。招かれた編集者なら結びつける ----------
create or replace function private.link_editor_invite(p_user uuid, p_email text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_editor text;
begin
  if p_email is null then return; end if;
  update public.editor_invites i set accepted_at = now()
   where i.email = lower(p_email) and i.accepted_at is null
  returning i.editor_id into v_editor;
  if v_editor is null then return; end if;
  update public.editors e set user_id = p_user where e.id = v_editor and e.user_id is null;
  update public.profiles p set role = 'editor' where p.id = p_user and p.role = 'reader';
end $$;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  -- ログインの画面で入れてもらった表示名（options.data.display_name）。Google の本名（full_name）は使わない
  v_name text := nullif(btrim(left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 24)), '');
begin
  insert into public.profiles (id, display_name) values (new.id, v_name)
  on conflict (id) do nothing;
  -- 確かめられたメールアドレスのときだけ、編集者の招待に結びつける（Google はこの時点で確認済み）
  if new.email_confirmed_at is not null then
    perform private.link_editor_invite(new.id, new.email);
  end if;
  return new;
end $$;

create or replace function private.handle_user_confirmed()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform private.link_editor_invite(new.id, new.email);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- メールのコードで入った人は、確認できた時点で結びつける
create trigger on_auth_user_confirmed
  after update of email_confirmed_at on auth.users
  for each row when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function private.handle_user_confirmed();

-- ---------- 役割と状態は運営だけが変える ----------
-- pg_trigger_depth() > 1 … ほかのトリガーの中から来た変更（招待の結びつけ・updated_at の付け直し）は通す
create or replace function private.profiles_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  if pg_trigger_depth() > 1 or private.is_backend() or private.is_operator() then return new; end if;
  if row(new.id, new.role, new.status, new.created_at) is distinct from row(old.id, old.role, old.status, old.created_at) then
    raise exception '役割と利用の状態は運営者が変えます' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger profiles_10_guard before update on public.profiles for each row execute function private.profiles_guard();

create or replace function private.editors_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  if pg_trigger_depth() > 1 or private.is_backend() or private.is_operator() then return new; end if;
  if row(new.id, new.user_id, new.role_label, new.authors, new.status, new.can_publish, new.is_ai_desk, new.sort_order, new.created_at)
     is distinct from
     row(old.id, old.user_id, old.role_label, old.authors, old.status, old.can_publish, old.is_ai_desk, old.sort_order, old.created_at) then
    raise exception '編集者が自分で変えられるのは、名前・印・写真・note・紹介文だけです' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger editors_10_guard before update on public.editors for each row execute function private.editors_guard();

-- 編集者を止めたら、その人のコンテクストの updated_at を動かす（差分の読み込みと静的ページに伝わる）
create or replace function private.editors_touch_contexts()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.contexts c set updated_at = now() where c.editor_id = new.id;
  return null;
end $$;
create trigger editors_20_touch_contexts
  after update of status on public.editors
  for each row when (old.status is distinct from new.status)
  execute function private.editors_touch_contexts();

-- 編集者を作ったら、数の行も作る
create or replace function private.editors_init_stats()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.editor_stats (editor_id) values (new.id) on conflict do nothing;
  return null;
end $$;
create trigger editors_30_stats after insert on public.editors for each row execute function private.editors_init_stats();

-- ---------- 作品 ----------
create or replace function private.works_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  if pg_trigger_depth() > 1 or private.is_backend() then return new; end if;
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
    return new;
  end if;
  if private.is_operator() then return new; end if;
  if row(new.id, new.created_by, new.created_at) is distinct from row(old.id, old.created_by, old.created_at) then
    raise exception '作品の作り手は変えられません' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger works_10_guard before insert or update on public.works for each row execute function private.works_guard();

-- 作品を直したら、その作品を使うコンテクストの updated_at を動かす
create or replace function private.works_touch_contexts()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.contexts c set updated_at = now() where c.work_a_id = new.id or c.work_b_id = new.id;
  return null;
end $$;
create trigger works_20_touch_contexts
  after update on public.works
  for each row when (row(old.slug, old.title, old.type, old.year, old.creator, old.summary, old.image, old.credit, old.credit_url, old.sort_order)
                     is distinct from
                     row(new.slug, new.title, new.type, new.year, new.creator, new.summary, new.image, new.credit, new.credit_url, new.sort_order))
  execute function private.works_touch_contexts();

-- ---------- コンテクスト：誰が、どの列を、どう変えてよいか ----------
--   運営者・バックエンド … すべて
--   書き手（editor_id が自分）
--     ・新しく書く：下書き（private）か審査待ち（submitted）。can_publish なら公開も
--     ・状態：private ⇄ submitted、差し戻し → private / submitted、公開 → private（取り下げ）
--     ・公開中の本文を直せるのは can_publish の編集者だけ（ほかは取り下げてから出し直す）
--   初稿の担当（assigned_editor_id が自分、review = 'ai'）
--     ・まだ誰も引き受けていない初稿を引き受ける（assigned_editor_id を自分に）
--     ・本文を直す（公開中なら can_publish が要る）、review を 'approved' にする
--   どちらも：一時非表示・差し戻し・削除・担当の付け替えはできない。公開済みの slug は変えない
create or replace function private.contexts_guard()
returns trigger language plpgsql set search_path = '' as $$
declare
  v_me       text;
  v_publish  boolean;
  v_owner    boolean;
  v_assignee boolean;
  v_ai       boolean;
  v_content  boolean;
begin
  if pg_trigger_depth() > 1 or private.is_backend() then
    return new;
  end if;
  if private.is_operator() then
    if tg_op = 'INSERT' then new.created_by := coalesce(new.created_by, auth.uid()); end if;
    return new;
  end if;
  v_me := private.my_editor_id();
  v_publish := private.can_publish();
  if v_me is null then
    raise exception 'コンテクストを書けるのは編集者だけです' using errcode = '42501';
  end if;

  if tg_op = 'INSERT' then
    if new.editor_id is distinct from v_me then
      raise exception '自分の名前でしか書けません' using errcode = '42501';
    end if;
    if new.review is not null or new.assigned_editor_id is not null or new.approved_by_editor is not null
       or new.approved_at is not null or new.deleted_at is not null or new.published_at is not null
       or new.legacy_id is not null or new.import_batch_id is not null then
      raise exception '運営だけが入れる項目が含まれています' using errcode = '42501';
    end if;
    if not (new.status in ('private', 'submitted') or (new.status = 'public' and v_publish)) then
      raise exception '公開は審査のあとです（下書きか、審査に出すを選んでください）' using errcode = '42501';
    end if;
    new.created_by := auth.uid();
    new.created_at := now();
    new.updated_at := now();
    return new;
  end if;

  -- null が混ざると if が素通りするので、真偽は coalesce で必ず true / false にする
  v_owner    := coalesce(old.editor_id = v_me, false);
  v_assignee := coalesce(old.assigned_editor_id = v_me, false);
  v_ai       := coalesce(old.review = 'ai', false);

  if row(new.id, new.editor_id, new.legacy_id, new.import_batch_id, new.created_at, new.created_by, new.deleted_at, new.published_at)
     is distinct from
     row(old.id, old.editor_id, old.legacy_id, old.import_batch_id, old.created_at, old.created_by, old.deleted_at, old.published_at) then
    raise exception '変えられない項目です' using errcode = '42501';
  end if;

  -- AGM：まだ誰も引き受けていない初稿を、自分が引き受ける（ほかの列は同時に変えない）
  if v_ai and old.assigned_editor_id is null and coalesce(new.assigned_editor_id = v_me, false) then
    if (to_jsonb(new) - 'assigned_editor_id' - 'updated_at') <> (to_jsonb(old) - 'assigned_editor_id' - 'updated_at') then
      raise exception '引き受けるときは、ほかの項目を同時に変えられません' using errcode = '42501';
    end if;
    return new;
  end if;
  if new.assigned_editor_id is distinct from old.assigned_editor_id then
    raise exception '担当の付け替えは運営者が行います' using errcode = '42501';
  end if;

  if not (v_owner or (v_assignee and v_ai)) then
    raise exception 'このコンテクストを直す権限がありません' using errcode = '42501';
  end if;

  -- 確認の印：初稿の担当が 'ai' → 'approved' にするだけ
  if new.review is distinct from old.review then
    if not (v_assignee and v_ai and coalesce(new.review = 'approved', false)) then
      raise exception '確認の印を付けられるのは、初稿を引き受けた編集者だけです' using errcode = '42501';
    end if;
    new.approved_by_editor := v_me;
    new.approved_at := now();
  elsif row(new.approved_by_editor, new.approved_at) is distinct from row(old.approved_by_editor, old.approved_at) then
    raise exception '確認の記録は変えられません' using errcode = '42501';
  end if;

  -- 公開の状態
  if new.status is distinct from old.status then
    if old.status = 'hidden' or new.status in ('hidden', 'changes_requested') then
      raise exception '一時非表示と差し戻しは運営者が行います' using errcode = '42501';
    end if;
    if new.status = 'public' and not v_publish then
      raise exception '公開は審査のあとです（審査に出すを選んでください）' using errcode = '42501';
    end if;
    if old.status = 'public' and not v_owner then
      raise exception '公開をやめられるのは書き手だけです' using errcode = '42501';
    end if;
  end if;

  -- 公開中の本文
  v_content := row(new.slug, new.work_a_id, new.work_b_id, new.route_name, new.label, new.kind, new.hub, new.basis,
                   new.score, new.headline, new.relation, new.left_station, new.right_station, new.body,
                   new.author_name, new.ai_url, new.line)
               is distinct from
               row(old.slug, old.work_a_id, old.work_b_id, old.route_name, old.label, old.kind, old.hub, old.basis,
                   old.score, old.headline, old.relation, old.left_station, old.right_station, old.body,
                   old.author_name, old.ai_url, old.line);
  if v_content and old.status = 'public' and new.status = 'public' and not v_publish then
    raise exception '公開中のものを直すには、いったん非公開に戻してから審査に出し直してください' using errcode = '42501';
  end if;
  if new.slug is distinct from old.slug and old.published_at is not null then
    raise exception '一度公開したページの URL（slug）は変えられません' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger contexts_10_guard before insert or update on public.contexts for each row execute function private.contexts_guard();

-- 公開した日・確認した日を付ける（guard のあと）
create or replace function private.contexts_stamp()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = 'public' and new.published_at is null then new.published_at := now(); end if;
  if new.review = 'approved' and new.approved_at is null then new.approved_at := now(); end if;
  return new;
end $$;
create trigger contexts_20_stamp before insert or update on public.contexts for each row execute function private.contexts_stamp();

-- 数の行を作る
create or replace function private.contexts_init_stats()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.context_stats (context_id) values (new.id) on conflict do nothing;
  return null;
end $$;
create trigger contexts_30_stats after insert on public.contexts for each row execute function private.contexts_init_stats();

-- 本文を直したら、直す前を控えに残す
create or replace function private.contexts_revision()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if row(new.slug, new.work_a_id, new.work_b_id, new.route_name, new.label, new.kind, new.hub, new.basis,
         new.score, new.headline, new.relation, new.left_station, new.right_station, new.body,
         new.author_name, new.ai_url, new.line)
     is distinct from
     row(old.slug, old.work_a_id, old.work_b_id, old.route_name, old.label, old.kind, old.hub, old.basis,
         old.score, old.headline, old.relation, old.left_station, old.right_station, old.body,
         old.author_name, old.ai_url, old.line) then
    insert into public.context_revisions (context_id, actor_id, snapshot) values (old.id, auth.uid(), to_jsonb(old));
  end if;
  return null;
end $$;
create trigger contexts_40_revision after update on public.contexts for each row execute function private.contexts_revision();

-- 状態の変化を審査の記録に残す。メモは review_context() が bc.review_note に入れて渡す
create or replace function private.contexts_log()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_note text := left(coalesce(current_setting('bc.review_note', true), ''), 1000);
  v_act  public.review_action;
begin
  if tg_op = 'INSERT' then
    if new.status in ('submitted', 'public') then
      insert into public.context_reviews (context_id, actor_id, action, from_status, to_status, note)
      values (new.id, auth.uid(), (case new.status when 'public' then 'publish' else 'submit' end)::public.review_action,
              null, new.status, v_note);
    end if;
    return null;
  end if;

  if new.deleted_at is distinct from old.deleted_at then
    insert into public.context_reviews (context_id, actor_id, action, from_status, to_status, note)
    values (new.id, auth.uid(), (case when new.deleted_at is null then 'restore' else 'delete' end)::public.review_action,
            old.status, new.status, v_note);
  end if;
  if new.assigned_editor_id is distinct from old.assigned_editor_id and new.assigned_editor_id is not null then
    insert into public.context_reviews (context_id, actor_id, action, from_status, to_status, note)
    values (new.id, auth.uid(), 'ai_claim', old.status, new.status, v_note);
  end if;
  if new.review is distinct from old.review and new.review = 'approved' then
    insert into public.context_reviews (context_id, actor_id, action, from_status, to_status, note)
    values (new.id, auth.uid(), 'ai_approve', old.status, new.status, v_note);
  end if;
  if new.status is distinct from old.status then
    v_act := (case new.status
                when 'submitted'         then 'submit'
                when 'public'            then 'publish'
                when 'hidden'            then 'hide'
                when 'changes_requested' then 'request_changes'
                else case when old.status = 'public' then 'unpublish' else 'withdraw' end
              end)::public.review_action;
    insert into public.context_reviews (context_id, actor_id, action, from_status, to_status, note)
    values (new.id, auth.uid(), v_act, old.status, new.status, v_note);
  end if;
  return null;
end $$;
create trigger contexts_50_log after insert or update on public.contexts for each row execute function private.contexts_log();

-- ---------- 数（フォロワー・共感・コメント） ----------
-- 消すときは update だけにする（コンテクストごと消えるときに、数の行を作り直さないように）
create or replace function private.follows_count()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.editor_stats (editor_id, followers) values (new.editor_id, 1)
    on conflict (editor_id) do update set followers = public.editor_stats.followers + 1;
  else
    update public.editor_stats s set followers = greatest(s.followers - 1, 0) where s.editor_id = old.editor_id;
  end if;
  return null;
end $$;
create trigger follows_count after insert or delete on public.follows for each row execute function private.follows_count();

create or replace function private.reactions_count()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.context_stats (context_id, reactions) values (new.context_id, 1)
    on conflict (context_id) do update set reactions = public.context_stats.reactions + 1;
  else
    update public.context_stats s set reactions = greatest(s.reactions - 1, 0) where s.context_id = old.context_id;
  end if;
  return null;
end $$;
create trigger reactions_count after insert or delete on public.reactions for each row execute function private.reactions_count();

create or replace function private.comments_count()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_delta int;
begin
  if tg_op = 'INSERT' then
    if new.status = 'approved' then
      insert into public.context_stats (context_id, comments) values (new.context_id, 1)
      on conflict (context_id) do update set comments = public.context_stats.comments + 1;
    end if;
  elsif tg_op = 'DELETE' then
    if old.status = 'approved' then
      update public.context_stats s set comments = greatest(s.comments - 1, 0) where s.context_id = old.context_id;
    end if;
  else
    v_delta := (new.status = 'approved')::int - (old.status = 'approved')::int;
    if v_delta <> 0 then
      update public.context_stats s set comments = greatest(s.comments + v_delta, 0) where s.context_id = new.context_id;
    end if;
  end if;
  return null;
end $$;
create trigger comments_count after insert or update of status or delete on public.comments
  for each row execute function private.comments_count();

-- ---------- コメント：名前はプロフィールから写す・確認待ちで入る・送りすぎを止める ----------
-- definer にしない（is_backend を正しく見るため）。読むのは本人のプロフィールと本人のコメントだけなので RLS の内で足りる
create or replace function private.comments_before_insert()
returns trigger language plpgsql set search_path = '' as $$
declare
  v_name   text;
  v_recent int;
begin
  if private.is_backend() then return new; end if;   -- 見本のコメントの引っ越し
  new.user_id := auth.uid();
  select p.display_name into v_name from public.profiles p where p.id = new.user_id and p.status = 'active';
  if v_name is null then
    raise exception 'コメントには表示名が要ります' using errcode = '22023';
  end if;
  new.display_name  := v_name;
  new.status        := 'pending';
  new.reject_reason := '';
  new.moderated_by  := null;
  new.moderated_at  := null;
  new.created_at    := now();
  select count(*) into v_recent from public.comments c
   where c.user_id = new.user_id and c.created_at > now() - interval '1 hour';
  if v_recent >= 10 then
    raise exception '短い時間にたくさん送られています。しばらくしてから送ってください' using errcode = '54000';
  end if;
  return new;
end $$;
create trigger comments_10_insert before insert on public.comments for each row execute function private.comments_before_insert();

create or replace function private.comments_moderated()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    new.moderated_by := auth.uid();
    new.moderated_at := now();
  end if;
  return new;
end $$;
create trigger comments_20_moderated before update on public.comments for each row execute function private.comments_moderated();

-- ---------- 通報：送った人を付ける・送りすぎを止める・扱った人を付ける ----------
-- 送った数を数えるところだけ definer（未ログインの読者は reports を読めないため）
create or replace function private.recent_reports(p_ip_hash text, p_user uuid)
returns int language sql stable security definer set search_path = '' as $$
  select count(*)::int from public.reports r
   where r.created_at > now() - interval '1 hour'
     and ((p_ip_hash is not null and r.ip_hash = p_ip_hash)
          or (p_user is not null and r.reporter_user_id = p_user));
$$;

create or replace function private.reports_before_insert()
returns trigger language plpgsql set search_path = '' as $$
declare
  v_ip text;
begin
  if private.is_backend() then return new; end if;
  new.reporter_user_id := auth.uid();
  new.status     := 'open';
  new.resolution := '';
  new.handled_by := null;
  new.handled_at := null;
  new.created_at := now();
  -- PostgREST が渡す request.headers から、利用者の IP を取り、日付と混ぜてハッシュにする（IP そのものは残さない）
  v_ip := btrim(split_part(coalesce((nullif(current_setting('request.headers', true), '')::json) ->> 'x-forwarded-for', ''), ',', 1));
  new.ip_hash := case when v_ip = '' then null
                      else encode(sha256(convert_to(v_ip || '|' || to_char(now() at time zone 'Asia/Tokyo', 'YYYY-MM-DD'), 'UTF8')), 'hex') end;
  if private.recent_reports(new.ip_hash, new.reporter_user_id) >= 5 then
    raise exception '短い時間にたくさん送られています。しばらくしてから送ってください' using errcode = '54000';
  end if;
  return new;
end $$;
create trigger reports_10_insert before insert on public.reports for each row execute function private.reports_before_insert();

create or replace function private.reports_handled()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    new.handled_by := auth.uid();
    new.handled_at := now();
  end if;
  return new;
end $$;
create trigger reports_20_handled before update on public.reports for each row execute function private.reports_handled();

-- ---------- お知らせ（第3段階。表があれば、トリガーはいまから動いてよい） ----------
create or replace function private.notify_on_review()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_user  uuid;
  v_slug  text;
  v_route text;
  v_title text;
begin
  if new.action not in ('request_changes', 'publish', 'hide', 'delete', 'ai_approve') then return null; end if;
  select e.user_id, c.slug, c.route_name into v_user, v_slug, v_route
    from public.contexts c join public.editors e on e.id = c.editor_id
   where c.id = new.context_id;
  if v_user is null or v_user = new.actor_id then return null; end if;
  v_title := case new.action
               when 'request_changes' then format('「%s」が差し戻されました', v_route)
               when 'publish'         then format('「%s」が公開されました', v_route)
               when 'hide'            then format('「%s」が一時非表示になりました', v_route)
               when 'delete'          then format('「%s」が削除されました', v_route)
               else                        format('「%s」の初稿が確認されました', v_route)
             end;
  insert into public.notifications (user_id, kind, title, body, link)
  values (v_user, 'review', left(v_title, 120), new.note, 'c/' || v_slug || '/');
  return null;
end $$;
create trigger context_reviews_notify after insert on public.context_reviews for each row execute function private.notify_on_review();

create or replace function private.notify_on_comment()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_slug text;
begin
  if new.user_id is null or new.status <> 'approved' or old.status = 'approved' then return null; end if;
  select c.slug into v_slug from public.contexts c where c.id = new.context_id;
  insert into public.notifications (user_id, kind, title, link)
  values (new.user_id, 'comment', 'コメントが公開されました', 'c/' || v_slug || '/');
  return null;
end $$;
create trigger comments_notify after update of status on public.comments for each row execute function private.notify_on_comment();

create or replace function private.notify_on_report()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.reporter_user_id is null or new.status not in ('resolved', 'rejected') or old.status = new.status then return null; end if;
  insert into public.notifications (user_id, kind, title, body)
  values (new.reporter_user_id, 'report',
          case new.status when 'resolved' then 'お送りいただいた依頼に対応しました' else 'お送りいただいた依頼について' end,
          left(new.resolution, 1000));
  return null;
end $$;
create trigger reports_notify after update of status on public.reports for each row execute function private.notify_on_report();


-- @migration 03_rls_grants

-- =====================================================================
-- 5. RLS（行ごとの守り）
-- =====================================================================
--   anon          … ログインしていない読者
--   authenticated … ログインした読者・編集者・運営者（役割は profiles.role で分ける）
--   service_role  … RLS を通らない（Edge Function・取り込みスクリプトだけが持つ。ブラウザに出さない）
-- (select f()) と書くのは、行ごとではなく一回だけ評価させるため（Supabase の推奨）

alter table public.profiles          enable row level security;
alter table public.editors           enable row level security;
alter table public.editor_invites    enable row level security;
alter table public.editor_stats      enable row level security;
alter table public.works             enable row level security;
alter table public.import_batches    enable row level security;
alter table public.contexts          enable row level security;
alter table public.context_stats     enable row level security;
alter table public.context_revisions enable row level security;
alter table public.context_reviews   enable row level security;
alter table public.editor_picks      enable row level security;
alter table public.follows           enable row level security;
alter table public.reactions         enable row level security;
alter table public.comments          enable row level security;
alter table public.reports           enable row level security;
alter table public.notifications     enable row level security;
alter table public.ads               enable row level security;
alter table public.site_settings     enable row level security;
alter table public.import_rows       enable row level security;

-- ---------- profiles：本人と運営だけ。だれでも読める名前は comments.display_name に写してある ----------
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select private.is_operator()));
create policy profiles_update on public.profiles for update to authenticated
  using (id = (select auth.uid()) or (select private.is_operator()))
  with check (id = (select auth.uid()) or (select private.is_operator()));
-- insert は handle_new_user、delete は Edge Function（auth.admin.deleteUser）から。どちらも RLS を通らない

-- ---------- editors ----------
create policy editors_select on public.editors for select to anon, authenticated
  using (status = 'active' or user_id = (select auth.uid()) or (select private.is_operator()));
create policy editors_insert on public.editors for insert to authenticated
  with check ((select private.is_operator()));
create policy editors_update on public.editors for update to authenticated
  using (user_id = (select auth.uid()) or (select private.is_operator()))
  with check (user_id = (select auth.uid()) or (select private.is_operator()));
create policy editors_delete on public.editors for delete to authenticated
  using ((select private.is_operator()));

create policy editor_invites_operator on public.editor_invites for all to authenticated
  using ((select private.is_operator())) with check ((select private.is_operator()));

create policy editor_stats_select on public.editor_stats for select to anon, authenticated using (true);

-- ---------- works ----------
create policy works_select on public.works for select to anon, authenticated
  using (private.can_see_work(id));
create policy works_insert on public.works for insert to authenticated
  with check ((select private.is_operator()) or (select private.my_editor_id()) is not null);
create policy works_update on public.works for update to authenticated
  using ((select private.is_operator())
         or (created_by = (select auth.uid()) and not private.work_in_public_use(id)))
  with check ((select private.is_operator()) or created_by = (select auth.uid()));
create policy works_delete on public.works for delete to authenticated
  using ((select private.is_operator()));

-- ---------- contexts ----------
-- 読者：公開中・未削除・編集者が active（store.visible と同じ）
create policy contexts_select_public on public.contexts for select to anon, authenticated
  using (status = 'public' and deleted_at is null and private.editor_is_active(editor_id));
-- 編集者：自分が書いたもの、担当の初稿、まだ誰も引き受けていない初稿（引き受けるため）
create policy contexts_select_editor on public.contexts for select to authenticated
  using (deleted_at is null and (
           editor_id = (select private.my_editor_id())
        or assigned_editor_id = (select private.my_editor_id())
        or (review = 'ai' and assigned_editor_id is null and (select private.my_editor_id()) is not null)));
-- 運営者：すべて（消したものも）
create policy contexts_select_operator on public.contexts for select to authenticated
  using ((select private.is_operator()));
create policy contexts_insert on public.contexts for insert to authenticated
  with check ((select private.is_operator()) or editor_id = (select private.my_editor_id()));
-- 細かい決まり（どの列をどう変えてよいか）は contexts_guard
create policy contexts_update on public.contexts for update to authenticated
  using ((select private.is_operator())
         or (deleted_at is null and (
               editor_id = (select private.my_editor_id())
            or (review = 'ai' and (assigned_editor_id = (select private.my_editor_id())
                                   or (assigned_editor_id is null and (select private.my_editor_id()) is not null))))))
  with check ((select private.is_operator())
              or editor_id = (select private.my_editor_id())
              or assigned_editor_id = (select private.my_editor_id()));
-- 書き手が消せるのは、一度も公開していない自分の下書きだけ。公開したものは運営が消す（set_context_deleted）
create policy contexts_delete on public.contexts for delete to authenticated
  using ((select private.is_operator())
         or (editor_id = (select private.my_editor_id()) and published_at is null
             and status in ('private', 'changes_requested')));

create policy context_stats_select on public.context_stats for select to anon, authenticated using (true);

create policy context_revisions_select on public.context_revisions for select to authenticated
  using ((select private.is_operator()) or private.works_on_context(context_id));

create policy context_reviews_select on public.context_reviews for select to authenticated
  using ((select private.is_operator()) or private.works_on_context(context_id));
-- 状態を変えずにメモだけ残す（review_context の 'note'）のは運営者
create policy context_reviews_insert on public.context_reviews for insert to authenticated
  with check ((select private.is_operator()) and actor_id = (select auth.uid()) and action = 'note');

-- ---------- editor_picks ----------
create policy editor_picks_select on public.editor_picks for select to anon, authenticated using (true);
create policy editor_picks_write on public.editor_picks for all to authenticated
  using ((select private.is_operator()) or editor_id = (select private.my_editor_id()))
  with check ((select private.is_operator())
              or (editor_id = (select private.my_editor_id()) and private.context_is_visible(context_id)));

-- ---------- follows・reactions：本人の行だけ ----------
create policy follows_select on public.follows for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_operator()));
create policy follows_insert on public.follows for insert to authenticated
  with check (user_id = (select auth.uid()) and (select private.is_active_user()) and private.editor_is_active(editor_id));
create policy follows_delete on public.follows for delete to authenticated
  using (user_id = (select auth.uid()));

create policy reactions_select on public.reactions for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_operator()));
create policy reactions_insert on public.reactions for insert to authenticated
  with check (user_id = (select auth.uid()) and (select private.is_active_user()) and private.context_is_visible(context_id));
create policy reactions_delete on public.reactions for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---------- comments ----------
create policy comments_select_public on public.comments for select to anon, authenticated
  using (status = 'approved' and private.context_is_visible(context_id));
create policy comments_select_own on public.comments for select to authenticated
  using (user_id = (select auth.uid()));
-- 確かめる人：運営者と、そのコンテクストの書き手
create policy comments_select_moderator on public.comments for select to authenticated
  using ((select private.is_operator()) or private.owns_context(context_id));
create policy comments_insert on public.comments for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending' and private.context_is_visible(context_id));
create policy comments_update_moderator on public.comments for update to authenticated
  using ((select private.is_operator()) or private.owns_context(context_id))
  with check ((select private.is_operator()) or private.owns_context(context_id));
create policy comments_delete on public.comments for delete to authenticated
  using (user_id = (select auth.uid()) or (select private.is_operator()));

-- ---------- reports ----------
create policy reports_insert on public.reports for insert to anon, authenticated
  with check (status = 'open');
create policy reports_select on public.reports for select to authenticated
  using (reporter_user_id = (select auth.uid()) or (select private.is_operator()));
create policy reports_update on public.reports for update to authenticated
  using ((select private.is_operator())) with check ((select private.is_operator()));
create policy reports_delete on public.reports for delete to authenticated
  using ((select private.is_operator()));

-- ---------- notifications ----------
create policy notifications_select on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy notifications_update on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy notifications_delete on public.notifications for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---------- ads・site_settings ----------
create policy ads_select on public.ads for select to anon, authenticated
  using ((active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()))
         or (select private.is_operator()));
create policy ads_write on public.ads for all to authenticated
  using ((select private.is_operator())) with check ((select private.is_operator()));

create policy site_settings_select on public.site_settings for select to anon, authenticated using (true);
create policy site_settings_update on public.site_settings for update to authenticated
  using ((select private.is_operator())) with check ((select private.is_operator()));

-- ---------- 取り込み：運営者だけ ----------
create policy import_batches_operator on public.import_batches for all to authenticated
  using ((select private.is_operator())) with check ((select private.is_operator()));
create policy import_rows_operator on public.import_rows for all to authenticated
  using ((select private.is_operator())) with check ((select private.is_operator()));


-- =====================================================================
-- 6. 表ごと・列ごとの権限（RLS の手前の、もう一枚）
-- =====================================================================
-- Supabase の既定の権限は、プロジェクトを作った時期と Data API の設定で違う
-- （古いものは public の表を anon / authenticated に自動で与え、新しいものは与えない）。
-- どちらでも同じになるよう、いったん全部外してから、要るものだけを与える。

grant usage on schema public to anon, authenticated, service_role;
revoke all on all tables in schema public from anon, authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

-- 読む（どの行が見えるかは RLS が決める）
grant select on public.editors, public.editor_stats, public.works, public.contexts, public.context_stats,
                public.editor_picks, public.comments, public.ads, public.site_settings
  to anon, authenticated;
grant select on public.profiles, public.editor_invites, public.context_revisions, public.context_reviews,
                public.follows, public.reactions, public.reports, public.notifications,
                public.import_batches, public.import_rows
  to authenticated;

-- 書く（ログインした人だけ。誰がどの行かは RLS、どの列をどう変えるかは *_guard）
grant update on public.profiles, public.site_settings to authenticated;
grant insert, update, delete on public.editors, public.editor_invites, public.works, public.contexts,
                                public.editor_picks, public.ads, public.import_batches, public.import_rows
  to authenticated;
grant insert, delete on public.follows, public.reactions to authenticated;
grant insert on public.context_reviews to authenticated;          -- 運営者のメモだけ（policy で絞る）

-- コメント：書く・消すのは本人。確かめる人が変えてよいのは状態と理由だけ（本文は誰も書き換えない）
grant insert, delete on public.comments to authenticated;
grant update (status, reject_reason) on public.comments to authenticated;

-- 通報と削除の依頼：ログインしていなくても送れる（送るだけ。読めない）
grant insert on public.reports to anon, authenticated;
grant update, delete on public.reports to authenticated;

-- お知らせ：作るのはトリガー。読者が変えるのは「読んだ」印だけ
grant update (read_at), delete on public.notifications to authenticated;

-- 数（*_stats）と版の控え（context_revisions）は、トリガーだけが書く（上で select しか与えていない）

-- private の関数：RLS とトリガーの中から呼べるように（private は API に出ないので、直には呼べない）
revoke all on all functions in schema private from public;
grant execute on all functions in schema private to anon, authenticated, service_role;


-- @migration 04_rpc_import

-- =====================================================================
-- 7. 画面から呼ぶ関数（RPC）
-- =====================================================================

-- 差分の読み込み：ある時刻より後に変わった、公開したことのあるコンテクスト。
-- 消えたもの・止めたものも visible = false で返すので、端末の控えから外せる
create or replace function public.public_changes_since(p_since timestamptz)
returns table (id uuid, slug text, visible boolean, updated_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select c.id, c.slug,
         (c.status = 'public' and c.deleted_at is null and e.status = 'active') as visible,
         c.updated_at
    from public.contexts c
    join public.editors e on e.id = c.editor_id
   where c.updated_at > p_since and c.published_at is not null
   order by c.updated_at
   limit 2000;
$$;

-- 審査（運営者）・取り下げや提出（書き手）。メモを審査の記録に残す
--   select review_context('<id>', 'public', null, '事実と出典を確認しました');
create or replace function public.review_context(
  p_context uuid,
  p_status  public.context_status default null,
  p_review  public.review_state   default null,
  p_note    text default ''
) returns void language plpgsql set search_path = '' as $$
declare
  v_old public.contexts;
begin
  select * into v_old from public.contexts c where c.id = p_context;
  if not found then
    raise exception 'コンテクストが見つからないか、見る権限がありません' using errcode = '42501';
  end if;
  perform set_config('bc.review_note', left(coalesce(p_note, ''), 1000), true);
  if coalesce(p_status, v_old.status) is distinct from v_old.status
     or coalesce(p_review, v_old.review) is distinct from v_old.review then
    update public.contexts c
       set status = coalesce(p_status, c.status),
           review = coalesce(p_review, c.review)
     where c.id = p_context;
    if not found then
      raise exception 'このコンテクストを変える権限がありません' using errcode = '42501';
    end if;
  elsif coalesce(p_note, '') <> '' then
    insert into public.context_reviews (context_id, actor_id, action, from_status, to_status, note)
    values (p_context, auth.uid(), 'note', v_old.status, v_old.status, left(p_note, 1000));
  end if;
  perform set_config('bc.review_note', '', true);
end $$;

-- AGM：まだ誰も引き受けていない初稿を、自分が引き受ける
create or replace function public.claim_ai_draft(p_context uuid)
returns void language plpgsql set search_path = '' as $$
begin
  if private.my_editor_id() is null then
    raise exception '初稿を引き受けられるのは編集者だけです' using errcode = '42501';
  end if;
  update public.contexts c set assigned_editor_id = private.my_editor_id()
   where c.id = p_context and c.review = 'ai' and c.assigned_editor_id is null and c.deleted_at is null;
  if not found then
    raise exception 'この初稿は、すでにほかの編集者が引き受けたか、見つかりません' using errcode = 'P0002';
  end if;
end $$;

-- 運営者が消す（30日は戻せる）・戻す
create or replace function public.set_context_deleted(p_context uuid, p_deleted boolean default true, p_note text default '')
returns void language plpgsql set search_path = '' as $$
begin
  if not (private.is_backend() or private.is_operator()) then
    raise exception '消すのは運営者だけです' using errcode = '42501';
  end if;
  perform set_config('bc.review_note', left(coalesce(p_note, ''), 1000), true);
  update public.contexts c set deleted_at = case when p_deleted then now() else null end where c.id = p_context;
  if not found then
    raise exception 'コンテクストが見つかりません' using errcode = 'P0002';
  end if;
  perform set_config('bc.review_note', '', true);
end $$;

-- 消して30日たったものを本当に消す（コメント・共感・記録も一緒に消える）。使われなくなった作品も消す
--   pg_cron を有効にしたら（毎日 3:00 JST = 18:00 UTC）：
--     select cron.schedule('bc-purge', '0 18 * * *', 'select public.purge_deleted(30)');
create or replace function public.purge_deleted(p_days int default 30)
returns int language plpgsql set search_path = '' as $$
declare
  v_n int;
begin
  if not (private.is_backend() or private.is_operator()) then
    raise exception '運営者だけが使えます' using errcode = '42501';
  end if;
  delete from public.contexts c where c.deleted_at < now() - make_interval(days => p_days);
  get diagnostics v_n = row_count;
  delete from public.works w
   where w.created_at < now() - make_interval(days => p_days)
     and not exists (select 1 from public.contexts c where c.work_a_id = w.id or c.work_b_id = w.id);
  return v_n;
end $$;

-- ---------- 一括取り込み ----------
-- 作品を slug で探し、無ければ作る。あれば空いている項目だけ埋める（p_overwrite なら上書き）
create or replace function private.import_work(
  p_slug text, p_title text, p_type text, p_year text, p_creator text, p_summary text,
  p_image text, p_credit text, p_credit_url text, p_order int, p_overwrite boolean
) returns uuid language plpgsql set search_path = '' as $$
declare
  v_id uuid;
begin
  select w.id into v_id from public.works w where w.slug = p_slug;
  if v_id is null then
    if coalesce(p_title, '') = '' then
      raise exception '作品「%」がまだ無く、題名（title）も空です', p_slug;
    end if;
    insert into public.works (slug, title, type, year, creator, summary, image, credit, credit_url, sort_order)
    values (p_slug, p_title, coalesce(nullif(p_type, ''), 'その他'), coalesce(p_year, ''), coalesce(p_creator, ''),
            coalesce(p_summary, ''), coalesce(p_image, ''), coalesce(p_credit, ''), coalesce(p_credit_url, ''), p_order)
    returning id into v_id;
  elsif p_overwrite then
    update public.works w set
      title      = coalesce(nullif(p_title, ''), w.title),
      type       = coalesce(nullif(p_type, ''), w.type),
      year       = coalesce(p_year, w.year),
      creator    = coalesce(p_creator, w.creator),
      summary    = coalesce(p_summary, w.summary),
      image      = coalesce(p_image, w.image),
      credit     = coalesce(p_credit, w.credit),
      credit_url = coalesce(p_credit_url, w.credit_url),
      sort_order = coalesce(p_order, w.sort_order)
    where w.id = v_id;
  else
    update public.works w set
      year       = case when w.year = ''       then coalesce(p_year, '')       else w.year end,
      creator    = case when w.creator = ''    then coalesce(p_creator, '')    else w.creator end,
      summary    = case when w.summary = ''    then coalesce(p_summary, '')    else w.summary end,
      image      = case when w.image = ''      then coalesce(p_image, '')      else w.image end,
      credit     = case when w.credit = ''     then coalesce(p_credit, '')     else w.credit end,
      credit_url = case when w.credit_url = '' then coalesce(p_credit_url, '') else w.credit_url end,
      sort_order = coalesce(w.sort_order, p_order)
    where w.id = v_id;
  end if;
  return v_id;
end $$;
revoke all on function private.import_work(text, text, text, text, text, text, text, text, text, int, boolean) from public, anon;
grant execute on function private.import_work(text, text, text, text, text, text, text, text, text, int, boolean) to authenticated, service_role;

-- 見本の共感の初期値を入れる（context_stats は誰にも書かせないので、ここだけ definer。呼ぶのは import_commit だけ）
create or replace function private.import_set_reactions(p_context uuid, p_n int)
returns void language sql security definer set search_path = '' as $$
  update public.context_stats s set reactions = greatest(p_n, 0) where s.context_id = p_context;
$$;
revoke all on function private.import_set_reactions(uuid, int) from public, anon;
grant execute on function private.import_set_reactions(uuid, int) to authenticated, service_role;

-- import_rows の一つのまとまり（batch）を、作品とコンテクストに入れる。
--   まず試す：  select * from import_commit('2026-11-launch');                -- 何も書かず、結果だけ返す
--   本番：      select * from import_commit('2026-11-launch', false);         -- 書く。import_rows.result に結果
--   直し入れ：  select * from import_commit('2026-11-fix', false, true);      -- 同じ slug があれば上書き
-- 一行ずつ確かめ、だめな行は error に理由を書いて飛ばす（ほかの行は入る）
create or replace function public.import_commit(
  p_batch     text    default 'inbox',
  p_dry_run   boolean default true,
  p_overwrite boolean default false
) returns table (row_no bigint, slug text, result text, error text)
language plpgsql set search_path = '' as $$
#variable_conflict use_column
declare
  r        public.import_rows;
  v_batch  uuid;
  v_editor text;
  v_a      uuid;
  v_b      uuid;
  v_id     uuid;
  v_score  smallint[];
  v_res    text;
  v_out    jsonb := '[]'::jsonb;
begin
  if not (private.is_backend() or private.is_operator()) then
    raise exception '取り込みは運営者だけが行えます' using errcode = '42501';
  end if;

  begin   -- 試し（dry run）のときは、最後にこの中をまるごと取り消す（v_out の結果だけ残る）
    insert into public.import_batches (label, dry_run, created_by)
    values (p_batch, p_dry_run, auth.uid()) returning id into v_batch;

    for r in select * from public.import_rows i where i.batch = p_batch and i.result is null order by i.row_no loop
      begin
        if coalesce(r.slug, '') = '' or coalesce(r.a_slug, '') = '' or coalesce(r.b_slug, '') = '' then
          raise exception 'slug・a_slug・b_slug は必須です';
        end if;
        if coalesce(r.route_name, '') = '' or coalesce(r.headline, '') = '' then
          raise exception 'route_name（路線名）と headline（キャッチコピー）は必須です';
        end if;

        v_editor := coalesce(
          nullif(r.editor_id, ''),
          (select e.id from public.editors e where coalesce(r.author, '') = any (e.authors)
            order by e.sort_order nulls last, e.id limit 1));
        if v_editor is null then
          raise exception '書き手「%」に当たる編集者がいません（editor_id を入れるか、editors.authors に名前を足す）', coalesce(r.author, '');
        end if;

        v_score := case when coalesce(r.score, '') = '' then null
                        else string_to_array(regexp_replace(r.score, '[^0-9,]', '', 'g'), ',')::smallint[] end;

        select c.id into v_id from public.contexts c where c.slug = r.slug;
        if v_id is not null and not p_overwrite then
          v_res := 'skipped';   -- すでにある。上書きしない
        else
          v_a := private.import_work(r.a_slug, r.a_title, r.a_type, r.a_year, r.a_creator, r.a_summary,
                                     r.a_image, r.a_credit, r.a_credit_url, r.a_order, p_overwrite);
          v_b := private.import_work(r.b_slug, r.b_title, r.b_type, r.b_year, r.b_creator, r.b_summary,
                                     r.b_image, r.b_credit, r.b_credit_url, r.b_order, p_overwrite);
          if v_id is null then
            insert into public.contexts (
              legacy_id, slug, work_a_id, work_b_id, route_name, label, kind, hub, basis, score,
              headline, relation, left_station, right_station, body, author_name, editor_id, ai_url, line,
              status, review, import_batch_id, created_at, updated_at)
            values (
              nullif(r.legacy_id, ''), r.slug, v_a, v_b, r.route_name, coalesce(nullif(r.label, ''), 'CONTEXT'),
              nullif(r.kind, ''), coalesce(r.hub, ''), coalesce(r.basis, ''), v_score,
              replace(r.headline, '\n', E'\n'), coalesce(r.relation, ''), coalesce(r.left_station, ''),
              coalesce(r.right_station, ''), coalesce(r.body, ''), coalesce(nullif(r.author, ''), '編集部'), v_editor,
              coalesce(r.ai_url, ''),
              jsonb_strip_nulls(jsonb_build_object('shape', r.line_shape, 'color', nullif(r.line_color, ''))),
              coalesce(nullif(r.status, ''), 'private')::public.context_status,
              nullif(r.review, '')::public.review_state, v_batch,
              coalesce(r.created_at, now()), coalesce(r.created_at, now()))
            returning id into v_id;
            if coalesce(r.reactions, 0) > 0 then
              perform private.import_set_reactions(v_id, r.reactions);
            end if;
            v_res := 'inserted';
          else
            update public.contexts c set
              work_a_id = v_a, work_b_id = v_b, route_name = r.route_name,
              label = coalesce(nullif(r.label, ''), c.label), kind = coalesce(nullif(r.kind, ''), c.kind),
              hub = coalesce(r.hub, c.hub), basis = coalesce(r.basis, c.basis), score = coalesce(v_score, c.score),
              headline = replace(r.headline, '\n', E'\n'), relation = coalesce(r.relation, c.relation),
              left_station = coalesce(r.left_station, c.left_station), right_station = coalesce(r.right_station, c.right_station),
              body = coalesce(r.body, c.body), author_name = coalesce(nullif(r.author, ''), c.author_name),
              editor_id = v_editor, ai_url = coalesce(r.ai_url, c.ai_url),
              status = coalesce(nullif(r.status, '')::public.context_status, c.status),
              review = coalesce(nullif(r.review, '')::public.review_state, c.review)
            where c.id = v_id;
            v_res := 'updated';
          end if;
        end if;
        v_out := v_out || jsonb_build_array(jsonb_build_object('row_no', r.row_no, 'slug', r.slug, 'result', v_res, 'error', null));
      exception when others then
        v_out := v_out || jsonb_build_array(jsonb_build_object('row_no', r.row_no, 'slug', r.slug, 'result', 'error', 'error', sqlerrm));
      end;
    end loop;

    update public.import_batches b set row_count = jsonb_array_length(v_out) where b.id = v_batch;
    if p_dry_run then
      raise exception 'BC_DRY_RUN';
    end if;
  exception when raise_exception then
    if sqlerrm <> 'BC_DRY_RUN' then raise; end if;
  end;

  if not p_dry_run then
    update public.import_rows i set result = o.result, error = o.error
      from jsonb_to_recordset(v_out) as o(row_no bigint, slug text, result text, error text)
     where i.row_no = o.row_no;
  end if;

  return query
    select o.row_no, o.slug, o.result, o.error
      from jsonb_to_recordset(v_out) as o(row_no bigint, slug text, result text, error text)
     order by o.row_no;
end $$;

-- 呼べる人を絞る（Supabase は public の関数に anon への実行権を最初から与える）
revoke all on function public.review_context(uuid, public.context_status, public.review_state, text) from public, anon;
revoke all on function public.claim_ai_draft(uuid)                                                  from public, anon;
revoke all on function public.set_context_deleted(uuid, boolean, text)                              from public, anon;
revoke all on function public.purge_deleted(int)                                                    from public, anon;
revoke all on function public.import_commit(text, boolean, boolean)                                 from public, anon;
grant execute on function public.review_context(uuid, public.context_status, public.review_state, text) to authenticated, service_role;
grant execute on function public.claim_ai_draft(uuid)                                                  to authenticated, service_role;
grant execute on function public.set_context_deleted(uuid, boolean, text)                              to authenticated, service_role;
grant execute on function public.purge_deleted(int)                                                    to authenticated, service_role;
grant execute on function public.import_commit(text, boolean, boolean)                                 to authenticated, service_role;
-- public_changes_since は security definer を anon に開く。Advisors が警告（0028）を出すが、返すのは
-- 公開したことのある区間の id・slug・見えるか だけなので、そのままにする
grant execute on function public.public_changes_since(timestamptz)                                     to anon, authenticated, service_role;


-- @migration 05_storage

-- =====================================================================
-- 8. Storage（作品の絵・編集者の写真）
-- =====================================================================
-- 公開のバケット：URL を知っていればだれでも見られる（読むための policy は要らない）。
-- 置けるのは、編集者・運営者が自分のフォルダ（<auth.uid()>/…）にだけ。
-- 絵の変換（Image Transformations）は Pro からなので、ブラウザで縮めて WebP にしてから置く（editor.html が既にしている）。

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('works',   'works',   true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
       ('editors', 'editors', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy storage_bc_select on storage.objects for select to authenticated
  using (bucket_id in ('works', 'editors')
         and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_operator())));
create policy storage_bc_insert on storage.objects for insert to authenticated
  with check (bucket_id in ('works', 'editors')
              and (storage.foldername(name))[1] = (select auth.uid())::text
              and ((select private.my_editor_id()) is not null or (select private.is_operator())));
create policy storage_bc_update on storage.objects for update to authenticated
  using (bucket_id in ('works', 'editors')
         and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_operator())));
create policy storage_bc_delete on storage.objects for delete to authenticated
  using (bucket_id in ('works', 'editors')
         and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_operator())));


-- @migration 06_views_initial_data

-- =====================================================================
-- 9. 運営のための集計（security_invoker：見る人の RLS がそのまま効く＝実質、運営者だけ）
-- =====================================================================
-- ページビュー・読了・流入は GA4 に任せる（README「アクセスの分析」）。ここは GA4 に無い、サービスの中の数。

create view public.v_editor_stats with (security_invoker = true) as
select e.id, e.name, e.status, e.can_publish,
       coalesce(s.followers, 0)                                                         as followers,
       count(c.id) filter (where c.status = 'public' and c.deleted_at is null)          as published,
       count(c.id) filter (where c.status = 'submitted' and c.deleted_at is null)       as waiting,
       count(c.id) filter (where c.review = 'ai' and c.deleted_at is null)              as ai_drafts,
       max(c.published_at)                                                              as last_published_at
  from public.editors e
  left join public.editor_stats s on s.editor_id = e.id
  left join public.contexts c on c.editor_id = e.id
 group by e.id, e.name, e.status, e.can_publish, s.followers;

-- 日ごと（日本時間）の、登録・フォロー・コメント・公開・依頼の数（直近90日）
create view public.v_daily_activity with (security_invoker = true) as
with today as (select (now() at time zone 'Asia/Tokyo')::date as d),
     days  as (select t.d - g as day from today t, generate_series(0, 89) as g)
select d.day,
       (select count(*) from public.profiles p  where (p.created_at   at time zone 'Asia/Tokyo')::date = d.day) as signups,
       (select count(*) from public.follows f   where (f.created_at   at time zone 'Asia/Tokyo')::date = d.day) as follows,
       (select count(*) from public.comments m  where (m.created_at   at time zone 'Asia/Tokyo')::date = d.day) as comments,
       (select count(*) from public.contexts c  where (c.published_at at time zone 'Asia/Tokyo')::date = d.day) as published,
       (select count(*) from public.reports r   where (r.created_at   at time zone 'Asia/Tokyo')::date = d.day) as reports
  from days d
 order by d.day desc;

revoke all on public.v_editor_stats, public.v_daily_activity from anon, authenticated;
grant select on public.v_editor_stats, public.v_daily_activity to authenticated, service_role;


-- =====================================================================
-- 10. はじめのデータ（seed.js の BC_EDITORS・BC_SEED_ADS と、store.js の DEFAULT_SETTINGS）
-- =====================================================================
-- コンテクストと作品は import_rows → import_commit() で入れる（README「引っ越し」）。

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

insert into public.editors (id, name, mark, role_label, photo, note, bio, authors, is_ai_desk, can_publish, sort_order)
values
  ('chief', '眞江田國廣', '眞', 'EDITOR IN CHIEF', 'img/editors/chief.jpg', 'mdkh',
   '思いがけない二つのあいだに、確かめられる一本の線を引く。その線を一日に一本ずつ選んでいます。',
   array['編集部（見本）', '編集部'], false, true, 1),
  ('desk', 'BC 編集部', '部', 'EDITORIAL DESK', null, null,
   '生成AIが書いた初稿を、編集部が事実と出典まで確かめて公開します。確かめ終えたものには「確認済み」と記します。',
   array['生成AI（初稿）'], true, true, 2)
on conflict (id) do nothing;

insert into public.ads (id, title, sub, image, url, active)
values ('ad-vacant', 'この場所に、作品の広告を。', '映画・音楽・書籍・イベント ── 広告枠のご案内', 'img/ad-hands.jpg', '#/ad', true)
on conflict (id) do nothing;

-- @migration 07_fractional_sort_order

-- =====================================================================
-- あとから足した migration（上の 01〜06 は書き換えない。直すときは、ここに足していく）
-- =====================================================================

-- seed.js の order には 106.5 のような小数がある（一覧の 106 と 107 のあいだに差し込んだ『ザ・バンカー』）。
-- int のままだと 107 に丸められて並びが変わるので、作品の並び（works.sort_order）と、
-- 取り込みの a_order / b_order を numeric にする。
-- works_20_touch_contexts は WHEN で sort_order を見ているので（型を変えられない）、いったん外して付け直す。
drop trigger works_20_touch_contexts on public.works;
alter table public.works alter column sort_order type numeric;
alter table public.import_rows alter column a_order type numeric, alter column b_order type numeric;
create trigger works_20_touch_contexts
  after update on public.works
  for each row when (row(old.slug, old.title, old.type, old.year, old.creator, old.summary, old.image, old.credit, old.credit_url, old.sort_order)
                     is distinct from
                     row(new.slug, new.title, new.type, new.year, new.creator, new.summary, new.image, new.credit, new.credit_url, new.sort_order))
  execute function private.works_touch_contexts();

-- import_work の p_order も numeric に（引数の型が変わるので、作り直す）
drop function private.import_work(text, text, text, text, text, text, text, text, text, int, boolean);
create function private.import_work(
  p_slug text, p_title text, p_type text, p_year text, p_creator text, p_summary text,
  p_image text, p_credit text, p_credit_url text, p_order numeric, p_overwrite boolean
) returns uuid language plpgsql set search_path = '' as $$
declare
  v_id uuid;
begin
  select w.id into v_id from public.works w where w.slug = p_slug;
  if v_id is null then
    if coalesce(p_title, '') = '' then
      raise exception '作品「%」がまだ無く、題名（title）も空です', p_slug;
    end if;
    insert into public.works (slug, title, type, year, creator, summary, image, credit, credit_url, sort_order)
    values (p_slug, p_title, coalesce(nullif(p_type, ''), 'その他'), coalesce(p_year, ''), coalesce(p_creator, ''),
            coalesce(p_summary, ''), coalesce(p_image, ''), coalesce(p_credit, ''), coalesce(p_credit_url, ''), p_order)
    returning id into v_id;
  elsif p_overwrite then
    update public.works w set
      title      = coalesce(nullif(p_title, ''), w.title),
      type       = coalesce(nullif(p_type, ''), w.type),
      year       = coalesce(p_year, w.year),
      creator    = coalesce(p_creator, w.creator),
      summary    = coalesce(p_summary, w.summary),
      image      = coalesce(p_image, w.image),
      credit     = coalesce(p_credit, w.credit),
      credit_url = coalesce(p_credit_url, w.credit_url),
      sort_order = coalesce(p_order, w.sort_order)
    where w.id = v_id;
  else
    update public.works w set
      year       = case when w.year = ''       then coalesce(p_year, '')       else w.year end,
      creator    = case when w.creator = ''    then coalesce(p_creator, '')    else w.creator end,
      summary    = case when w.summary = ''    then coalesce(p_summary, '')    else w.summary end,
      image      = case when w.image = ''      then coalesce(p_image, '')      else w.image end,
      credit     = case when w.credit = ''     then coalesce(p_credit, '')     else w.credit end,
      credit_url = case when w.credit_url = '' then coalesce(p_credit_url, '') else w.credit_url end,
      sort_order = coalesce(w.sort_order, p_order)
    where w.id = v_id;
  end if;
  return v_id;
end $$;
revoke all on function private.import_work(text, text, text, text, text, text, text, text, text, numeric, boolean) from public, anon;
grant execute on function private.import_work(text, text, text, text, text, text, text, text, text, numeric, boolean) to authenticated, service_role;

-- @migration 08_security_review_fixes

-- 自動のセキュリティレビュー（commit dfad47c）の指摘二つを直す。

-- ---------- 1. 通報の送りすぎ止めを、偽れない IP で数える ----------
-- いままでは x-forwarded-for の左端を IP にしていた。左端は利用者が自由に書けるので、毎回変えれば上限をすり抜けられた。
-- 本番（2026-10-22）で request.headers を確かめた結果：
--   ・cf-connecting-ip … Cloudflare が必ず付ける。利用者が送ると Cloudflare が 403（error 1000）で止める → 偽れない
--   ・x-real-ip        … 届かない（利用者が送っても消される）。ほかの置き場所に移ったとき用に二番目に見る
--   ・x-forwarded-for  … 利用者が送った値が左に残り、本当の IP は右端に付く → 右端だけを使う
create or replace function private.client_ip()
returns text language sql stable set search_path = '' as $$
  with h as (select coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json as j),
       c as (select coalesce(
                      nullif(btrim(h.j ->> 'cf-connecting-ip'), ''),
                      nullif(btrim(h.j ->> 'x-real-ip'), ''),
                      nullif(btrim((string_to_array(h.j ->> 'x-forwarded-for', ','))[
                                     array_length(string_to_array(h.j ->> 'x-forwarded-for', ','), 1)]), '')
                    ) as ip
               from h)
  select case when c.ip ~ '^[0-9A-Fa-f:.]{2,45}$' then c.ip end from c;   -- IP の形をしていなければ「分からない」
$$;

-- ログインしていない人から、直近1時間に届いた依頼の合計（IP に関係なく数える）
create or replace function private.recent_anon_reports()
returns int language sql stable security definer set search_path = '' as $$
  select count(*)::int from public.reports r
   where r.reporter_user_id is null and r.created_at > now() - interval '1 hour';
$$;
create index reports_anon_recent_idx on public.reports (created_at) where reporter_user_id is null;

create or replace function private.reports_before_insert()
returns trigger language plpgsql set search_path = '' as $$
declare
  v_ip text;
begin
  if private.is_backend() then return new; end if;
  new.reporter_user_id := auth.uid();
  new.status     := 'open';
  new.resolution := '';
  new.handled_by := null;
  new.handled_at := null;
  new.created_at := now();
  -- 偽れない IP を、日付と混ぜてハッシュにする（IP そのものは残さない）
  v_ip := private.client_ip();
  new.ip_hash := case when v_ip is null then null
                      else encode(sha256(convert_to(v_ip || '|' || to_char(now() at time zone 'Asia/Tokyo', 'YYYY-MM-DD'), 'UTF8')), 'hex') end;
  -- 一人あたり（同じ IP か、同じユーザー）1時間に5件まで
  if private.recent_reports(new.ip_hash, new.reporter_user_id) >= 5 then
    raise exception '短い時間にたくさん送られています。しばらくしてから送ってください' using errcode = '54000';
  end if;
  -- ログインしていない人の合計は1時間に100件まで。IP が分からないときも効く（閉じる側に倒す）
  if new.reporter_user_id is null and private.recent_anon_reports() >= 100 then
    raise exception 'いまは依頼が混み合っています。しばらくしてから送るか、ログインして送ってください' using errcode = '54000';
  end if;
  return new;
end $$;

revoke all on function private.client_ip() from public;
revoke all on function private.recent_anon_reports() from public;
grant execute on function private.client_ip() to anon, authenticated, service_role;
grant execute on function private.recent_anon_reports() to anon, authenticated, service_role;

-- ---------- 2. 差分の読み込みで、見えなくなった区間の slug を出さない ----------
-- 見えなくなった（非公開・一時非表示・削除・編集者の停止）区間は、id だけを返し slug は null にする。
-- それも直近30日に変わったものだけ（端末の控えから外すのに要るのは id だけ）。
-- 30日より古い snapshot を持つ端末は、差分ではなく公開中の id の一覧で突き合わせ直す（client-plan.md S3）。
create or replace function public.public_changes_since(p_since timestamptz)
returns table (id uuid, slug text, visible boolean, updated_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select x.id,
         case when x.visible then x.slug end as slug,
         x.visible,
         x.updated_at
    from (select c.id, c.slug,
                 (c.status = 'public' and c.deleted_at is null and e.status = 'active') as visible,
                 c.updated_at
            from public.contexts c
            join public.editors e on e.id = c.editor_id
           where c.updated_at > p_since and c.published_at is not null) x
   where x.visible or x.updated_at > now() - interval '30 days'
   order by x.updated_at
   limit 2000;
$$;

-- @migration 09_reports_no_global_block

-- 二度目のレビュー（migration 08 への指摘）を直す。
--   ・未ログインの合計 100件/時で「断る」と、一人が送り続けるだけで、権利者の削除依頼まで止められてしまう
--     → 合計が多くても断らない。受け付けて throttled（後回し）の印を付け、運営者は後ろに並べて扱う
--   ・一人あたりの上限は、IP そのものではなく subnet（IPv4 は /24、IPv6 は /48）で数える。近い番地を回しても抜けられない
--   ・未ログインで送信元が分からないときは、はっきり断る（偽れる値には頼らない）
--   ・ログインした人は、人ごとの上限だけ（同じ subnet の他人の送りすぎに巻き込まれない）
-- private.client_ip()（cf-connecting-ip → x-real-ip → x-forwarded-for の右端）は 08 のまま。

alter table public.reports add column throttled boolean not null default false;
comment on column public.reports.throttled is '未ログインの依頼が直近1時間に100件以上あったときに受け付けたもの。断らずに受け付け、運営者は後回しにして扱う';
comment on column public.reports.ip_hash is '送信元の subnet（IPv4 は /24、IPv6 は /48）と日付（日本時間）を混ぜた sha256。IP そのものは残さない';

-- 運営者の列は「ふつうの依頼 → 後回し」の順。その並びで引く索引に替える
drop index public.reports_open_idx;
create index reports_queue_idx on public.reports (throttled, created_at) where status in ('open', 'in_progress');

-- 送信元の subnet（'198.51.100.0/24'、'2001:db8:1::/48'）。分からなければ null
create or replace function private.client_subnet()
returns text language plpgsql stable set search_path = '' as $$
declare
  v_ip   text := private.client_ip();
  v_addr inet;
begin
  if v_ip is null then return null; end if;
  -- IPv6 に包まれた IPv4（::ffff:192.0.2.1）は IPv4 として扱う（/48 だと IPv4 全部が一つにまとまってしまう）
  if v_ip ~* '^::ffff:[0-9]{1,3}(\.[0-9]{1,3}){3}$' then v_ip := substr(v_ip, 8); end if;
  begin
    v_addr := v_ip::inet;
  exception when others then
    return null;
  end;
  return network(set_masklen(v_addr, case when family(v_addr) = 4 then 24 else 48 end))::text;
end $$;

-- 同じ subnet から、未ログインで直近1時間に届いた依頼の数
create or replace function private.recent_anon_reports_from(p_subnet_hash text)
returns int language sql stable security definer set search_path = '' as $$
  select count(*)::int from public.reports r
   where r.reporter_user_id is null and r.ip_hash = p_subnet_hash and r.created_at > now() - interval '1 hour';
$$;

-- 同じ人が直近1時間に送った依頼の数
create or replace function private.recent_reports_by(p_user uuid)
returns int language sql stable security definer set search_path = '' as $$
  select count(*)::int from public.reports r
   where r.reporter_user_id = p_user and r.created_at > now() - interval '1 hour';
$$;

create or replace function private.reports_before_insert()
returns trigger language plpgsql set search_path = '' as $$
declare
  v_subnet text;
begin
  if private.is_backend() then return new; end if;
  new.reporter_user_id := auth.uid();
  new.status     := 'open';
  new.resolution := '';
  new.handled_by := null;
  new.handled_at := null;
  new.created_at := now();
  new.throttled  := false;
  -- 偽れない IP から subnet を出し、日付と混ぜてハッシュにする
  v_subnet := private.client_subnet();
  new.ip_hash := case when v_subnet is null then null
                      else encode(sha256(convert_to(v_subnet || '|' || to_char(now() at time zone 'Asia/Tokyo', 'YYYY-MM-DD'), 'UTF8')), 'hex') end;

  -- ログインした人：人ごとに1時間5件まで（送信元が分からなくても送れる）
  if new.reporter_user_id is not null then
    if private.recent_reports_by(new.reporter_user_id) >= 5 then
      raise exception '短い時間にたくさん送られています。しばらくしてから送ってください' using errcode = '54000';
    end if;
    return new;
  end if;

  -- 未ログイン：送信元が分からなければ断る
  if new.ip_hash is null then
    raise exception '送信元を確認できませんでした。お手数ですが、利用規約の連絡先からお知らせください。' using errcode = '22023';
  end if;
  -- 同じ subnet から1時間5件まで
  if private.recent_anon_reports_from(new.ip_hash) >= 5 then
    raise exception '短い時間にたくさん送られています。しばらくしてから送ってください' using errcode = '54000';
  end if;
  -- 未ログインの合計が1時間100件以上でも断らない。後回しの印を付けて受け付ける
  if private.recent_anon_reports() >= 100 then
    new.throttled := true;
  end if;
  return new;
end $$;

-- 08 の「IP か人か、どちらかが同じなら数える」関数は使わなくなった
drop function private.recent_reports(text, uuid);

revoke all on function private.client_subnet() from public;
revoke all on function private.recent_anon_reports_from(text) from public;
revoke all on function private.recent_reports_by(uuid) from public;
grant execute on function private.client_subnet() to anon, authenticated, service_role;
grant execute on function private.recent_anon_reports_from(text) to anon, authenticated, service_role;
grant execute on function private.recent_reports_by(uuid) to anon, authenticated, service_role;

-- 運営者の依頼の列（security_invoker：運営者にはすべて、読者には自分の分だけ）。ふつうの依頼が先、後回しは後ろ。どちらも古い順
create view public.v_report_queue with (security_invoker = true) as
select r.id, r.kind, r.target_type, r.target_id, r.target_url, r.reason, r.detail, r.is_rights_holder,
       r.reporter_user_id, r.reporter_name, r.reporter_email, r.throttled, r.status, r.created_at
  from public.reports r
 where r.status in ('open', 'in_progress')
 order by r.throttled, r.created_at;
revoke all on public.v_report_queue from anon, authenticated;
grant select on public.v_report_queue to authenticated, service_role;

-- 日ごとの数に「後回しで受け付けた依頼」を足す（列は末尾に足すだけ）
create or replace view public.v_daily_activity with (security_invoker = true) as
with today as (select (now() at time zone 'Asia/Tokyo')::date as d),
     days  as (select t.d - g as day from today t, generate_series(0, 89) as g)
select d.day,
       (select count(*) from public.profiles p  where (p.created_at   at time zone 'Asia/Tokyo')::date = d.day) as signups,
       (select count(*) from public.follows f   where (f.created_at   at time zone 'Asia/Tokyo')::date = d.day) as follows,
       (select count(*) from public.comments m  where (m.created_at   at time zone 'Asia/Tokyo')::date = d.day) as comments,
       (select count(*) from public.contexts c  where (c.published_at at time zone 'Asia/Tokyo')::date = d.day) as published,
       (select count(*) from public.reports r   where (r.created_at   at time zone 'Asia/Tokyo')::date = d.day) as reports,
       (select count(*) from public.reports r   where r.throttled and (r.created_at at time zone 'Asia/Tokyo')::date = d.day) as reports_throttled
  from days d
 order by d.day desc;

-- @migration 10_reports_soft_throttle

-- 通報・削除の依頼の送りすぎ止めを、最終の形にする（09 への二つの指摘：使い捨てアカウントでのすり抜け、
-- 同じ subnet の一人の送りすぎで周りの正当な依頼まで断られる）。
-- 考え方：「断る」のは一つの送り元からの洪水だけ。それ以外は断らずに受け付け、throttled（後回し）の印を付ける。
--   断る ……… 未ログイン：同じ IP（そのもの）から1時間20件を超えたら ／ ログイン：同じ人から1時間5件を超えたら
--              ／ 未ログインで送信元が分からないとき
--   後回し …… 同じ subnet（IPv4 /24・IPv6 /48）から1時間5件を超えたら（ログインの有無を問わず全部数える）
--              ／ 未ログインの合計が1時間100件を超えたら ／ ログインでも、できて24時間以内かメール未確認のアカウント
-- 依頼には IP のハッシュと subnet のハッシュを両方残し、それぞれの数え方に使う。
-- ハッシュの材料は「秘密の salt＋日付（日本時間）＋値」。IP そのものは残さない。
-- （IPv4 は約43億通りしかないので、salt が無いと日付と総当たりで IP に戻せてしまう）

-- ---------- 秘密の salt（API に出ない private スキーマ。誰にも select を与えない） ----------
create table private.secrets (
  name       text primary key,
  value      text not null,
  created_at timestamptz not null default now()
);
alter table private.secrets enable row level security;   -- policy なし＝持ち主（関数）以外は読めない
revoke all on private.secrets from public, anon, authenticated;
insert into private.secrets (name, value)
values ('report_hash_salt', replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''));   -- 環境ごとに違う乱数

create or replace function private.report_hash(p_value text)
returns text language sql stable security definer set search_path = '' as $$
  select case when p_value is null then null
              else encode(sha256(convert_to(
                     (select s.value from private.secrets s where s.name = 'report_hash_salt')
                     || '|' || to_char(now() at time zone 'Asia/Tokyo', 'YYYY-MM-DD') || '|' || p_value, 'UTF8')), 'hex') end;
$$;

-- ---------- 送信元の住所（inet で読み、IPv6 に包まれた IPv4 は IPv4 に戻す） ----------
create or replace function private.client_addr()
returns inet language plpgsql stable set search_path = '' as $$
declare
  v_ip   text := private.client_ip();   -- cf-connecting-ip → x-real-ip → x-forwarded-for の右端（08 のまま）
  v_addr inet;
begin
  if v_ip is null then return null; end if;
  begin
    v_addr := v_ip::inet;
  exception when others then
    return null;
  end;
  if v_addr << '::ffff:0:0/96'::inet then
    v_addr := '0.0.0.0'::inet + (v_addr - '::ffff:0:0'::inet);   -- ::ffff:192.0.2.1 → 192.0.2.1
  end if;
  return v_addr;
end $$;

create or replace function private.subnet_of(p_addr inet)
returns text language sql immutable strict set search_path = '' as $$
  select network(set_masklen(p_addr, case when family(p_addr) = 4 then 24 else 48 end))::text;
$$;

-- 09 の client_subnet を、上の二つで作り直す（テキストの正規表現ではなく inet で判定）
create or replace function private.client_subnet()
returns text language sql stable set search_path = '' as $$
  select private.subnet_of(private.client_addr());
$$;

-- ---------- 依頼に二つのハッシュを残す ----------
alter table public.reports add column subnet_hash text;
comment on column public.reports.ip_hash is '送信元の IP（そのもの）のハッシュ。秘密の salt＋日付（日本時間）＋IP の sha256。未ログインの洪水を断るのに使う';
comment on column public.reports.subnet_hash is '送信元の subnet（IPv4 /24・IPv6 /48）のハッシュ。秘密の salt＋日付＋subnet の sha256。後回しの判定に使う';
comment on column public.reports.throttled is '後回しで受け付けた依頼（同じ subnet が多い・未ログインの合計が多い・新しい／未確認のアカウント）。運営者は後ろに並べて扱い、印を外せる';
create index reports_subnet_idx on public.reports (subnet_hash, created_at);

-- ---------- 数える関数（security definer：送った本人は reports を読めないため） ----------
-- 同じ IP（そのもの）から、未ログインで直近1時間
create or replace function private.recent_anon_reports_from_ip(p_ip_hash text)
returns int language sql stable security definer set search_path = '' as $$
  select count(*)::int from public.reports r
   where r.reporter_user_id is null and r.ip_hash = p_ip_hash and r.created_at > now() - interval '1 hour';
$$;

-- 同じ subnet から直近1時間（ログインの有無を問わず全部）
create or replace function private.recent_reports_from_subnet(p_subnet_hash text)
returns int language sql stable security definer set search_path = '' as $$
  select count(*)::int from public.reports r
   where r.subnet_hash = p_subnet_hash and r.created_at > now() - interval '1 hour';
$$;

-- できて24時間以内か、メールを確認していないアカウントか（auth.users を読むので definer）
create or replace function private.reporter_is_new(p_user uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select u.created_at > now() - interval '24 hours' or u.email_confirmed_at is null
                     from auth.users u where u.id = p_user), true);
$$;

-- ---------- 依頼を受けるときの決まり ----------
create or replace function private.reports_before_insert()
returns trigger language plpgsql set search_path = '' as $$
declare
  v_addr inet;
begin
  if private.is_backend() then return new; end if;
  new.reporter_user_id := auth.uid();
  new.status     := 'open';
  new.resolution := '';
  new.handled_by := null;
  new.handled_at := null;
  new.created_at := now();
  v_addr := private.client_addr();
  new.ip_hash     := private.report_hash(host(v_addr));
  new.subnet_hash := private.report_hash(private.subnet_of(v_addr));

  -- 断る：一つの送り元からの洪水だけ
  if new.reporter_user_id is null then
    if new.ip_hash is null then
      raise exception '送信元を確認できませんでした。お手数ですが、利用規約の連絡先からお知らせください。' using errcode = '22023';
    end if;
    if private.recent_anon_reports_from_ip(new.ip_hash) >= 20 then
      raise exception '短い時間にたくさん送られています。しばらくしてから送ってください' using errcode = '54000';
    end if;
  else
    if private.recent_reports_by(new.reporter_user_id) >= 5 then
      raise exception '短い時間にたくさん送られています。しばらくしてから送ってください' using errcode = '54000';
    end if;
  end if;

  -- 後回し：断らずに受け付け、印を付ける
  new.throttled :=
       (new.subnet_hash is not null and private.recent_reports_from_subnet(new.subnet_hash) >= 5)
    or (new.reporter_user_id is null and private.recent_anon_reports() >= 100)
    or (new.reporter_user_id is not null and private.reporter_is_new(new.reporter_user_id));
  return new;
end $$;

-- 09 の「同じ subnet から5件で断る」関数は使わなくなった
drop function private.recent_anon_reports_from(text);

revoke all on function private.report_hash(text)                    from public;
revoke all on function private.client_addr()                        from public;
revoke all on function private.subnet_of(inet)                      from public;
revoke all on function private.client_subnet()                      from public;
revoke all on function private.recent_anon_reports_from_ip(text)    from public;
revoke all on function private.recent_reports_from_subnet(text)     from public;
revoke all on function private.reporter_is_new(uuid)                from public;
grant execute on function private.report_hash(text)                 to anon, authenticated, service_role;
grant execute on function private.client_addr()                     to anon, authenticated, service_role;
grant execute on function private.subnet_of(inet)                   to anon, authenticated, service_role;
grant execute on function private.client_subnet()                   to anon, authenticated, service_role;
grant execute on function private.recent_anon_reports_from_ip(text) to anon, authenticated, service_role;
grant execute on function private.recent_reports_from_subnet(text)  to anon, authenticated, service_role;
grant execute on function private.reporter_is_new(uuid)             to anon, authenticated, service_role;
-- v_report_queue（ふつう → 後回し、古い順。運営者は印を外せる）は 09 のまま

-- @migration 11_reports_ipv6_prefix_and_subnet_ceiling

-- anon キーを画面に載せる前の手当て（二つ）。10 の「断るのは一つの送り元の洪水だけ」の考え方は変えない。
--   1. 「断る」の数え方（未ログイン：一つの送り元から1時間20件）を、IPv6 では /64 で数える。
--      IPv6 は一つの契約に /64（2^64 個の番地）が配られ、中の番地は端末が勝手に変える（プライバシー拡張）ので、
--      番地そのもので数えると、番地を変えるだけで 20 件の壁をすり抜けられる。IPv4 はいままでどおり番地そのもの。
--   2. 同じ subnet（IPv4 /24・IPv6 /48）の合計に天井を置く：1時間に 200 件を超えたら、ログインの有無を問わず断る。
--      「5 件を超えたら後回し（throttled）」は 10 のまま。天井は、使い捨てのアカウントや /64 を並べた洪水が
--      表を埋め尽くすのを止めるための最後の壁で、ふつうの会社や携帯のネットワークが 1 時間に 200 件も送ることはない。
-- 確かめ（2026-10-24、begin…rollback の中で 19 項目）：IPv6 の /64・/48 のハッシュ、同じ /64 の 21 件目が 54000、
--   別の /64 は通って throttled、IPv4 は番地そのもの、::ffff: の IPv4、送信元不明は 22023、
--   同じ /24 の 200 件目は通って throttled・201 件目は 54000（ログインした人も同じ）、同じ人が静かな所からなら通る。

-- 「一つの送り元」：IPv4 は番地そのもの、IPv6 は /64
create or replace function private.source_of(p_addr inet)
returns text language sql immutable strict set search_path = '' as $$
  select case when family(p_addr) = 4 then host(p_addr)
              else network(set_masklen(p_addr, 64))::text end;
$$;

comment on column public.reports.ip_hash is '送信元（IPv4 は番地そのもの、IPv6 は /64）のハッシュ。秘密の salt＋日付（日本時間）＋値の sha256。未ログインの洪水を断るのに使う';
comment on column public.reports.subnet_hash is '送信元の subnet（IPv4 /24・IPv6 /48）のハッシュ。秘密の salt＋日付＋subnet の sha256。5件で後回し、200件で断る（天井）';

create or replace function private.reports_before_insert()
returns trigger language plpgsql set search_path = '' as $$
declare
  v_addr     inet;
  v_subnet_n int := 0;
begin
  if private.is_backend() then return new; end if;
  new.reporter_user_id := auth.uid();
  new.status     := 'open';
  new.resolution := '';
  new.handled_by := null;
  new.handled_at := null;
  new.created_at := now();
  v_addr := private.client_addr();
  new.ip_hash     := private.report_hash(private.source_of(v_addr));   -- 11：IPv6 は /64
  new.subnet_hash := private.report_hash(private.subnet_of(v_addr));

  -- 断る：一つの送り元からの洪水だけ
  if new.reporter_user_id is null then
    if new.ip_hash is null then
      raise exception '送信元を確認できませんでした。お手数ですが、利用規約の連絡先からお知らせください。' using errcode = '22023';
    end if;
    if private.recent_anon_reports_from_ip(new.ip_hash) >= 20 then
      raise exception '短い時間にたくさん送られています。しばらくしてから送ってください' using errcode = '54000';
    end if;
  else
    if private.recent_reports_by(new.reporter_user_id) >= 5 then
      raise exception '短い時間にたくさん送られています。しばらくしてから送ってください' using errcode = '54000';
    end if;
  end if;

  -- 断る：同じ subnet の合計の天井（1時間 200 件。ログインの有無を問わない）
  if new.subnet_hash is not null then
    v_subnet_n := private.recent_reports_from_subnet(new.subnet_hash);
    if v_subnet_n >= 200 then
      raise exception 'いまは依頼が混み合っています。しばらくしてから送るか、利用規約の連絡先からお知らせください' using errcode = '54000';
    end if;
  end if;

  -- 後回し：断らずに受け付け、印を付ける（10 のまま）
  new.throttled :=
       v_subnet_n >= 5
    or (new.reporter_user_id is null and private.recent_anon_reports() >= 100)
    or (new.reporter_user_id is not null and private.reporter_is_new(new.reporter_user_id));
  return new;
end $$;

revoke all on function private.source_of(inet) from public;
grant execute on function private.source_of(inet) to anon, authenticated, service_role;

-- @migration 12_delete_my_account
-- （2026-10-25 に書き、同じ日に dev に流した。確かめ：tools/sql-test.mjs --applied で全項目通過）
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

-- @end

-- =====================================================================
-- 流したあとに手で行うこと（SQL Editor）
-- =====================================================================
-- 1. 運営者を決める（先生と CTO が一度ログインしてから）
--      update public.profiles set role = 'operator'
--       where id in (select id from auth.users where email in ('…', '…'));
-- 2. 先生のアカウントを編集長（chief）に結びつける
--      update public.editors set user_id = (select id from auth.users where email = '…') where id = 'chief';
-- 3. 外部の編集者を招く（Edge Function invite-editor が auth.admin.inviteUserByEmail を送る）
--      insert into public.editors (id, name, role_label) values ('yamada', '山田 花子', 'EDITOR');
--      insert into public.editor_invites (email, editor_id) values ('hanako@example.com', 'yamada');
-- 4. Database → Advisors（Security / Performance）で警告が無いことを確かめる

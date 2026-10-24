/* Beautiful Context — バックエンド（Supabase）の設定。

   ここにあるのは公開してよい値だけ：プロジェクトの URL と publishable key（旧 anon key）。
   守りは RLS（backend/schema.sql）。この鍵を知っていても、読めるのは公開中のもの、書けるのは本人の分だけ。
   service_role（secret key）は、ここにも、ほかのどのファイルにも絶対に書かない。

   backend
     'supabase' … 本番。読むものは seed.js（のちに snapshot.js）のまま、
                  ログイン・フォロー・共感・コメントだけ Supabase に送る
     'local'    … いままでどおり、この端末の中だけ（戻すときはここを 'local' に）
     'snapshot' … プリレンダー（tools/prerender.mjs が ?static=1 で開く）。ネットに一切出ない */
window.BC_CONFIG = {
  backend: /[?&]static=1(&|$)/.test(location.search) ? 'snapshot' : 'supabase',
  supabaseUrl: 'https://jajlkgybusedmvjmnqjc.supabase.co',
  supabaseAnonKey: 'sb_publishable_VHjpIckzfwazjXOba3SSig_MEXO0-RC',
  /* Google ログイン。ダッシュボードで Google provider を有効にし（OAuth クライアントが要る）、
     iPhone のホーム画面の BC で戻ってこられることを実機で確かめてから true にする */
  googleEnabled: false,
  /* 電波の悪いところで画面を待たせない（これを超えた通信は打ち切り、outbox に積む） */
  timeoutMs: 6000
};

# store.js・social.js を Supabase に切り替える手順

> この文書は手順だけ。コードはまだ一行も変えていない。
> 前提：`backend/schema.sql` を流した Supabase があること。全体の形は `backend/README.md`。

---

## 0. 方針

1. **画面の側（app.js・render.js・manage.js・editor.html）は、今と同じ `BCStore` / `BCSocial` の関数を呼び続ける。**
   保存先が localStorage から Supabase に変わっても、画面は知らなくてよい（`social.js` の冒頭に書いてある考え方のまま）。
2. **読む関数は同期のまま。** `all()`・`visible()`・`feed()`・`trail()` などは、今と同じくその場で値を返す。
   データは三段に重ねる：
   - **snapshot** … ビルドのときに書き出した `docs/js/snapshot.js`（`seed.js` と同じ形）。同期で読める
   - **控え（キャッシュ）** … snapshot のあとに変わった分と、自分の分（フォロー・共感・確認待ちのコメント）。localStorage
   - **Supabase** … 本当の値。起動のあと裏で差分を読み、控えを直し、画面に「変わった」と知らせる
3. **書く関数は「先に画面を変え、裏で送る」（楽観的な更新）。** 読者の操作（共感・フォロー・コメント）は今と同じく同期で返す。
   運営者・編集者の操作（承認・公開・保存）は Promise を返し、画面は `await` する。
4. **切り替えは一か所。** `docs/js/config.js` の `backend: 'local' | 'supabase'`。`'local'` なら今の動き（localStorage だけ）がそのまま残る。何かあれば戻す。

---

## 1. 新しく足すファイル

| ファイル | 中身 |
|---|---|
| `docs/js/config.js` | `window.BC_CONFIG = { backend: 'supabase', url: 'https://<ref>.supabase.co', key: '<anon / publishable key>', timeoutMs: 4000 }`。`?static=1` のとき（プリレンダー）は `backend: 'snapshot'`（ネットに出ない）。anon キーは公開してよい値。**service_role は絶対に書かない** |
| `docs/js/vendor/supabase.js` | supabase-js v2 の UMD 版。**版を一つに固定して、このリポジトリに置く**（入れる日に npm で最新の 2.x を確かめる）。`sw.js` は同じサイトの `?v=` 付きの JS しか控えないので、CDN から読むとオフラインで書けず、CDN が止まると何もできない |
| `docs/js/backend.js` | `window.BCBackend`。Supabase の窓口を一つにまとめる（下の 1.1） |
| `docs/js/snapshot.js` | `tools/export-published.mjs` が書き出す。`window.BC_SEED`・`window.BC_EDITORS`・`window.BC_SEED_ADS`・`window.BC_SNAPSHOT = { at, contexts }`。`seed.js` の代わりに読む |

読み込む順（`index.html`。`manage.html`・`editor.html` も同じ並びに `backend.js` を足す）：

```html
<script src="js/config.js?v=…"></script>
<script src="js/vendor/supabase.js?v=…"></script>
<script src="js/snapshot.js?v=…"></script>   <!-- いまの seed.js の場所 -->
<script src="js/backend.js?v=…"></script>
<script src="js/store.js?v=…"></script>
<script src="js/social.js?v=…"></script>
<script src="js/render.js?v=…"></script>
<script src="js/transition.js?v=…"></script>
<script src="js/app.js?v=…"></script>
```

### 1.1 `backend.js`（`window.BCBackend`）に持たせるもの

| 名前 | 役目 |
|---|---|
| `client` | `supabase.createClient(url, key, { auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'bc-auth' }, global: { fetch: fetchWithTimeout } })`。PKCE なので戻り先は `?code=`。アプリのハッシュの道（`#/c/…`）とぶつからない |
| `enabled()` | `BC_CONFIG.backend === 'supabase'` |
| `ready` | 起動時の `auth.getSession()`（`?code=` の交換を含む）が終わる Promise。終わったら `sessionStorage['bc-return']` のハッシュに戻し、`history.replaceState` で `?code=` を消す |
| `user()` / `profile()` | いまの利用者と `profiles` の行（`role`・`display_name`）。`localStorage['bc-me']` に控え、起動の一コマ目から同期で返す |
| `editorId()` | 自分の編集者 id（`editors.user_id = 自分`）。編集者でなければ null |
| `isOperator()` | `profile().role === 'operator'`。画面の出し分けだけに使う（守りは RLS） |
| `fetchWithTimeout` | `timeoutMs` で打ち切る fetch。電波の悪いところで画面を待たせない |
| `toEntry(row)` / `fromEntry(entry)` | DB の行 ⇄ `seed.js` の形（README 2 章の対応表どおり）。`toEntry` は `context.editorId`・`reactions`・`commentsCount` も付ける |
| `outbox` | 送れなかった書き込みの列。`localStorage['bc-outbox']` に `{ op: 'follow' | 'unfollow' | 'react' | 'unreact' | 'comment', … }`。`flush()` を `online`・`visibilitychange`・ログインのときに呼ぶ |
| `message(error)` | Postgres のエラーを日本語の一言に：`42501` → 「権限がありません」、`54000` → schema のメッセージのまま、`23505` → 「同じ URL がもうあります」、通信の失敗 → 「ネットにつながっていません」 |
| `uploadImage(blob, slug)` | Storage `works/<自分の uid>/<時刻>-<slug>.webp` に置き、`getPublicUrl()` の URL を返す |
| `on(event, fn)` | `'auth'`（ログイン・ログアウト）、`'data'`（差分を読んだ）を知らせる |

---

## 2. `store.js` の変更（S1〜S12）

### S1. 控えの鍵と中身を変える

- いま：`KEY = 'beautiful-context-store-v2'` に**全部の区間**を書いている（`writeRaw(data)`）。1,250 本だと 2〜3MB になり、iPhone の localStorage（1オリジン 約5MB、文字は UTF-16）を超えかねない。
- 変える：`'local'` のときだけ今の `KEY` を使う。`'supabase'` のときは `CACHE_KEY = 'bc-cache-v3'` に、**snapshot に足りない分だけ**を持つ：

  ```
  { snapshotAt,            // どの snapshot に重ねた差分か（BC_SNAPSHOT.at が変わったら捨てる）
    since,                 // 最後に差分を読んだ時刻
    upserts: { id: entry },// snapshot のあとに公開・変更された区間
    removed: [id],         // snapshot のあとに消えた・止まった区間
    editors: { id: editor },
    ads, settings,         // 小さいので丸ごと
    followers: { editorId: n }, stats: { contextId: { reactions, comments } },
    liked: { id: true },   // 自分の共感（ログイン前はここだけ）
    comments: { contextId: { at, list } } }   // 開いたコンテクストのコメント
  ```

### S2. `fresh()`・`ensure()`

- `fresh()`：`window.BC_SEED`（snapshot）を `normalise()` する。ここは今のまま。
- `ensure()`：`'supabase'` のときは `fresh()` に、控え（`bc-cache-v3`）の `upserts` を重ね、`removed` を外す（新しい関数 `applyCache(data, cache)`）。**書き戻さない**（snapshot はファイルにあるので）。
- `mergeSeeds()`・`migrate()`・`SEED_VERSION` は `'local'` のときだけ動かす。`'supabase'` では見本の管理は DB の仕事。

### S3. 新しく `Store.refresh()`（非同期・裏で）

```
1. rpc('public_changes_since', { p_since: cache.since || BC_SNAPSHOT.at })
2. visible = true の id を、作品・編集者・数と一緒に読む
     from('contexts').select('*, a:works!work_a_id(*), b:works!work_b_id(*), stats:context_stats(reactions, comments)')
                     .in('id', ids)
   → toEntry() して cache.upserts に入れる。visible = false の id は cache.removed へ
3. editors（updated_at > since）、ads、site_settings を読む（小さいので毎回でよい）
4. ログインしていれば、自分の follows・reactions を読み直す（ほかの端末での変更を拾う）
5. cache.since を更新して保存 → cache = null（ensure をやり直させる）→ 'data' を知らせる
```

呼ぶとき：起動の一コマ目を描いたあと（`requestIdleCallback`）、画面に戻ったとき（`visibilitychange`。5分に一回まで）、`online` のとき。失敗しても何もしない（snapshot と控えで読み続ける）。

### S4. 新しく `Store.onChange(fn)`

`refresh()` やコメントの読み込みが終わったら呼ぶ。`app.js` はこれで今の画面だけを描き直す（`Social.onChange(paintSocial)` と同じ使い方）。

### S5. 読む関数（変えない、または少しだけ）

| 関数 | 変えること |
|---|---|
| `all`・`visible`・`isVisible`・`byContextSlug`・`byId`・`related`・`works`・`workBySlug`・`byOrder`・`neighbors`・`feed`・`trail`・`search` | 変えない（S2 で作った `data` を読むだけ） |
| `editorOf(e)` | `e.context.editorId` があればそれで探す。無ければ今と同じく `authors` の名前で探す |
| `editors()`・`editorById(id)` | 今のまま。編集者に `followers` を付けるところだけ、`cache.followers` の値を使う |
| `byEditor(id)`・`todayPick(id, day)` | 変えない（`picks` は snapshot の `BC_EDITORS[].picks` に入っている） |
| `authors()` | `'supabase'` では `editors` の `status` から作る（`hidden` の編集者） |
| `ads()`・`activeAds()`・`settings()` | 控えの `ads`・`settings`（snake_case → camelCase：`ad_every` → `adEvery`） |

### S6. 共感：`liked(id)`・`reactionCount(e)`・`react(id)`

- `react(id)`：今と同じく**同期で** `{ liked, count }` を返す。そのうえで
  - ログインしている：`from('reactions').insert({ context_id: id })` か `.delete().eq('context_id', id)`。送れなければ `outbox`
  - ログインしていない：`cache.liked` にだけ持つ（ログインのときに送る）
- `reactionCount(e)`：`stats.reactions`（サーバーの数）に、まだ送れていない自分の分を足し引きする。
  ※ 今は「見本の初期値 ＋ 自分が押したら 1」。切り替え後はサーバーの数に自分の分が既に入っているので、二重に足さない。

### S7. コメント

| 関数 | 切り替え後 |
|---|---|
| 新 `loadComments(id)` | `from('comments').select('id, user_id, display_name, body, status, created_at').eq('context_id', id).order('created_at')`。RLS により、公開されたもの ＋ 自分の確認待ち（確かめる人ならすべて）が返る。`cache.comments[id]` に入れ、`onChange` |
| `visibleComments(e)` | 控えから `status === 'approved'` を返す（同期）。控えが古い（5分）か無ければ `loadComments` を裏で呼ぶ |
| `myPendingComments(e, uid)` | 控えから `status === 'pending' && user_id === uid` |
| `addComment(id, c)` | 今と同じく、確認待ちの項目をその場で返す（仮の id）。裏で `from('comments').insert({ context_id: id, body: c.text }).select().single()`。返ってきたら仮の id を差し替える。表示名とユーザーはサーバーのトリガーが入れる。失敗したら項目を外し、`onChange` で知らせる（app.js がトーストを出す） |
| `pendingComments()` | 運営者メニュー用。**Promise を返す** `fetchPendingComments()` にする：`from('comments').select('*, context:contexts(id, slug, route_name)').eq('status', 'pending').order('created_at', { ascending: false })` |
| `approveComment(id, cid)` | `update({ status: 'approved' }).eq('id', cid)`（Promise） |
| `setCommentHidden(id, cid, hidden)` | `update({ status: hidden ? 'hidden' : 'approved' })`（Promise） |
| `removeComment(id, cid)` | `delete().eq('id', cid)`（Promise） |

コメントの項目の形は今と同じに直して返す：`{ id, uid: user_id, name: display_name, text: body, at: created_at, pending: status === 'pending', hidden: status === 'hidden' || status === 'rejected' }`。`render.js` は変えずに済む。

### S8. コンテクストを書く・直す（Promise にする）

| 関数 | 切り替え後 |
|---|---|
| `save(entry)` | `saveRemote(entry)`：①作品 A・B を slug で探す。無ければ `works` に insert。あっても**自分が足し、まだ公開に使われていない**ときだけ update（それ以外は今ある作品を使うだけ。RLS が update を止める）②`contexts` を insert（新しい）か update（`id` がある）。`editor_id` は `BCBackend.editorId()`、`status` は `private` か `submitted`。③ slug がぶつかったら（`23505`）今と同じく末尾に3文字足してやり直す。返すのは Promise<entry> |
| `remove(id)` | `rpc('set_context_deleted', { p_context: id, p_deleted: true, p_note })` |
| `approve(id)` | `rpc('review_context', { p_context: id, p_review: 'approved' })`。初稿の担当の編集者なら guard が `approved_by_editor` を付ける |
| `setStatus(id, status, note)` | `rpc('review_context', { p_context: id, p_status: status, p_note: note })` |
| 新 `submit(id, note)` | `setStatus(id, 'submitted', note)` |
| 新 `claim(id)` | `rpc('claim_ai_draft', { p_context: id })` |
| 新 `reviewQueue()` | `from('contexts').select(…).eq('status', 'submitted').order('created_at')`（運営者） |
| 新 `aiPool()` | `from('contexts').select(…).eq('review', 'ai').is('assigned_editor_id', null)`（編集者の初稿の棚） |
| 新 `history(id)` | `from('context_reviews').select('*').eq('context_id', id).order('created_at', { ascending: false })`。運営メモ（`e.note`）は一番新しい `note` |

書いたあとは、控えの `upserts` にも入れて `onChange`（公開なら、ビルドを待たずに一覧に出る）。

### S9. 書き手・広告枠・設定（運営者。Promise にする）

| 関数 | 切り替え後 |
|---|---|
| `setAuthorStatus(name, status)` | 名前から編集者を探し（`editors.authors`）、`editors.update({ status })`。`'public'` は `'active'` に読み替える |
| `saveAd(ad)` | `ads.upsert(ad)` |
| `removeAd(id)` | `ads.delete().eq('id', id)` |
| `saveSettings(patch)` | `site_settings.update({ brand, tagline, theme, accent, ad_every }).eq('id', 1)` |

### S10. 持ち運び

| 関数 | 切り替え後 |
|---|---|
| `exportJSON()` | 今の形のまま（`entries` に今見えているもの）。控えのバックアップとして残す |
| `importJSON(text)` | `'supabase'` では「サーバーへ取り込む」に変える：`entries` を `import_rows` の行に直して insert（運営者は RLS で書ける）→ `rpc('import_commit', { p_batch, p_dry_run: true })` の結果を見せる → 確かめたら `p_dry_run: false`。第1段階では SQL Editor でやるので、ボタンは出さなくてよい |
| `reset()` | 控え（`bc-cache-v3`）を消すだけ。サーバーは消さない |
| `usage()` | 控えの大きさ |

### S11. オフラインのとき

- 読む：snapshot と控えで今と同じく全部読める。`refresh()` が失敗しても黙っている。
- 読者の書き込み（共感・フォロー・コメント）：`outbox` に積み、画面は「送った」ように見せる。コメントは「送信待ち」の印。`online` で `flush()`。
- 運営者・編集者の書き込み：送れなければ、その場で「ネットにつながっていません」と出して止める（審査や公開を、端末に溜めない）。

### S12. 第2段階の軽量化（測ってから）

`snapshot.js` が gzip で 400KB を超えたら、`body` を `docs/js/bodies.js`（または区間ごとの JSON）に分け、`Store.body(id)` で開いたときに読む。静的ページ（`c/<slug>/`）には本文が入っているので、検索エンジンには影響しない。検索は本文が届いてから本文も含める。

---

## 3. `social.js` の変更（A1〜A8）

| 関数 | いま | 切り替え後 |
|---|---|---|
| `me()` | `st.me`（名前だけ） | `{ uid: user.id, name: profile.display_name, role, editorId }`（`BCBackend.user()`・`profile()` の控えから同期で）。未ログインは null |
| `signIn(name)` | 名前だけで端末に作る | `'local'` のときだけ残す。`'supabase'` は下の A2〜A4 |
| `signOut()` | `st.me = null` | `auth.signOut()`。サーバーから読んだフォローと共感を端末から消す（共用の端末で残さない）。ログイン前に押した分は残さない |
| `following()`・`isFollowing(id)` | `st.follows` | サーバーのフォロー（控え）＋ まだ送れていない分 |
| `toggleFollow(id)` | 端末の配列を切り替える | 今と同じく同期で `true / false` を返す。ログインしていれば `follows.insert({ editor_id: id })` / `.delete().eq('editor_id', id)`（送れなければ outbox）。していなければ `st.pending` に持つ |
| `nudged()`・`markNudged()` | 端末 | 変えない |
| `onChange(fn)` | 端末の変更・ほかのタブ | ＋ `BCBackend.on('auth')`（ログイン・ログアウト・トークンの更新） |

### A1. 新 `followerCount(editorId)`

`editor_stats.followers`（控え）に、まだ送れていない自分のフォローを足し引きした数。
`render.js` の `followers(ed, on)` と `app.js` の `paintSocial()` は、今「`ed.followers` ＋ フォロー中なら 1」としている。サーバーの数には自分が入るので、**この関数の値をそのまま出す**ように変える（画面側の変更はここだけ）。
編集者のページを開いたときに `from('editor_stats').select('editor_id, followers').in('editor_id', ids)` で新しくする。

### A2. 新 `signInWithGoogle()`

`sessionStorage['bc-return'] = location.hash` → `auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + '/' } })`。戻ってきたら `BCBackend.ready` がハッシュを戻す。
**iPhone のホーム画面から開いた BC（standalone）で、戻ってこられるかを実機で確かめてから出す。** 戻れないなら、standalone のときは A3 を先に出す。

### A3. 新 `sendEmailCode(email, name)`・`verifyEmailCode(email, code)`

- `auth.signInWithOtp({ email, options: { shouldCreateUser: true, data: { display_name: name } } })`
- `auth.verifyOtp({ email, token: code, type: 'email' })`
- メールの雛形（Supabase の Auth → Email Templates）に `{{ .Token }}` を入れ、リンクではなく 6桁のコードを送る。同じ画面で完結するので、standalone でも戻り先の問題が起きない。

### A4. 新 `setName(name)`

`profiles.update({ display_name: name.trim().slice(0, 24) }).eq('id', uid)`。コメントを送る前に表示名が無ければ、今のログインのシートの「表示名」の欄で聞く（Google の本名は自動で使わない）。

### A5. 新 `syncAfterLogin()`

ログインした直後に一度だけ：

1. ログイン前のフォロー（`st.pending` と、今の `bc-social` の `follows`）を `follows.upsert(rows, { onConflict: 'user_id,editor_id', ignoreDuplicates: true })`
2. ログイン前の共感（`cache.liked`）を `reactions` に同じように
3. `outbox` を `flush()`
4. 自分の `follows`・`reactions` を読み直して控えに入れ、`pending` を空に
5. `changed()`

今の `bc-social` の `me.name`（デモの名前）は、表示名の欄の初期値に使う。

### A6. ほかのタブ

`storage` イベント（`bc-social`）は今のまま。ログインの状態は supabase-js が `bc-auth` で同じようにタブをまたぐ。

### A7. GA4

`onAuthStateChange` の `SIGNED_IN` で、`profiles.created_at` が今なら `sign_up`（`method: 'google' | 'email'`）、そうでなければ `login`。`gtag('set', { user_id: uid })` は、プライバシーのページに書いてから。

### A8. 退会（第3段階）

新 `deleteAccount()`：`client.functions.invoke('delete-account')` → 成功したら `signOut()` と控えを消す。

---

## 4. 画面の側で要る、小さな変更（参考。store / social の外）

| 場所 | 変えること |
|---|---|
| `app.js` `openLogin()` | 名前の欄に加えて「Google で続ける」「メールで続ける（コード）」を出す。`sign_up` の `method` |
| `app.js` `paintSocial()`・`render.js` `followers()` | `Social.followerCount(id)` をそのまま出す（A1） |
| `app.js` 起動 | `Store.onChange(…)` で今の画面を描き直す。`Store.refresh()` を一コマ目のあとに |
| `app.js` コメントの送信 | `addComment` が失敗を知らせたらトースト（`BCBackend.message(err)`） |
| `manage.js` | 運営者でなければログインのシート。`setStatus`・`approve`・`remove`・`approveComment`・`setCommentHidden`・`removeComment`・`saveAd`・`removeAd`・`saveSettings`・`setAuthorStatus` を `await` してから描き直す。`pendingComments()` は `await fetchPendingComments()` |
| `editor.html` | 編集者でなければログインのシート。`const saved = await window.BCStore.save(…)`。`useImage()` は WebP にしたあと `BCBackend.uploadImage()` で URL にする（data: URL を DB に入れない。schema の check でも弾く） |
| `tools/prerender.mjs` | 開く URL を `index.html?static=1#/…` に（ネットに出ないで snapshot だけで描く） |
| `sw.js` | 変えなくてよい（Supabase への通信は別のオリジンなので素通り。`vendor/supabase.js` は `?v=` 付きで控えられる） |

---

## 5. 進める順番

1. `config.js`（`backend: 'local'`）・`backend.js`・`vendor/supabase.js` を足す。この時点で動きは何も変わらない
2. `tools/export-published.mjs` を書き、`bc-dev` から `snapshot.js` を作る。`seed.js` と差が無いことを確かめる（見本 130 本を取り込んだ状態で、`BC_SEED` の JSON を並べて比べる）
3. `snapshot.js` を読むようにして、`prerender.mjs` で今と同じページが出ることを確かめる
4. store：S1・S2・S3・S4・S5（読むだけ）。`backend: 'supabase'` で、読むことだけが Supabase の差分になる
5. social：A2〜A5（ログイン）、`toggleFollow`・A1（フォロー）
6. store：S6（共感）・S7（コメント）
7. manage.js を S8・S9 に合わせる（運営者メニュー）
8. 第2段階：editor.html を S8 の `save` と `uploadImage` に

---

## 6. 確かめること

- [ ] 二つのブラウザで同じアカウントに入る → 片方でフォローすると、もう片方でも（画面に戻ったときに）フォロー中になる。数が合う
- [ ] ログインせずにフォローと共感 → ログイン → サーバーに入っている。数が一つずつ増えている
- [ ] コメント → 自分にだけ「確認待ち」→ 運営者が通す → ほかのブラウザでも見える
- [ ] DevTools でオフライン → 全部の画面が読める。共感・フォロー・コメントは「送信待ち」→ オンラインに戻すと送られる
- [ ] 運営者が公開をやめる → ほかのブラウザで、画面に戻ったときに一覧から消える（静的ページは次のビルドで消える）
- [ ] `backend: 'local'` に戻すと、今の動きに戻る
- [ ] iPhone のホーム画面の BC で：Google ログイン、メールのコード、ログイン後に元の画面に戻る（**実機で測る**）
- [ ] localStorage の大きさ（`usage()`）が、1,250 本でも 1MB を超えない

/* 運営者メニュー。

   代理店がクライアントに納めるとき、最初に問われるのは見た目より
   「何を、誰が、どこまで変えられるか」。ここに運営の手を集める。

     コンテクスト … 公開 / 非公開 / 一時非表示、編集、削除
     広告枠       … 画像・文言・リンク・表示の有無（コンテクストページの読み終わり）
     書き手       … 書き手ごとにまとめて止める
     カスタマイズ … サービス名・キャッチ・地の明暗・アクセント色
     データ       … 書き出し / 読み込み / 見本に戻す
     機能一覧     … 構成図の番号ごとに、デモで動くものと本番で要るもの */
(() => {
  const S = window.BCStore, R = window.BCRender;
  const esc = R.esc;
  const $ = (id) => document.getElementById(id);
  const main = $('main'), tabs = $('tabs');

  function toast(msg){
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove('show'), 1900);
  }

  const STATUS = { public: '公開', private: '非公開', hidden: '一時非表示' };
  const day = (iso) => { try { return new Date(iso).toLocaleDateString('ja-JP'); } catch (e) { return ''; } };
  const thumb = (w) => {
    const s = R.safeImg(w.image);
    return s ? `<img src="${esc(s)}" alt="" loading="lazy">`
      : `<span>${esc((w.title || '?').replace(/[『』]/g, '').charAt(0))}</span>`;
  };

  /* ---------- 見出し（左の列） ---------- */
  const TABS = [
    { id: 'contexts', label: 'コンテクスト', count: () => S.all().length },
    { id: 'ads', label: '広告枠', count: () => S.ads().length },
    { id: 'authors', label: '書き手', count: () => S.authors().length },
    null,
    { id: 'custom', label: 'カスタマイズ' },
    { id: 'data', label: 'データ' },
    { id: 'features', label: '機能一覧' }
  ];
  const tabId = () => {
    const h = location.hash.slice(1);
    return TABS.some((t) => t && t.id === h) ? h : 'contexts';
  };
  function drawTabs(){
    const cur = tabId();
    tabs.innerHTML = TABS.map((t) => t ? `
      <a href="#${t.id}" class="${t.id === cur ? 'on' : ''}"${t.id === cur ? ' aria-current="page"' : ''}>
        <b>${esc(t.label)}</b>${t.count ? `<span>${t.count()}</span>` : ''}</a>` : '<i class="sep"></i>').join('');
    const on = tabs.querySelector('.on');
    if (on && tabs.scrollWidth > tabs.clientWidth) on.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }

  const head = (eyebrow, title, note, tools) => `
    <div class="head"><div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2>${note ? `<p class="note">${note}</p>` : ''}</div>${tools || ''}</div>`;

  /* ---------- コンテクスト ---------- */
  let filter = 'all', query = '';
  const isDraft = (e) => e.context.review === 'ai';
  /* 四軸 [意外性, 共感度, コンテンツ性, 世界観近似性] */
  const scoreOf = (c) => Array.isArray(c.score) && c.score.length === 4 ? c.score.map((v) => +v || 0) : null;
  const total = (c) => { const s = scoreOf(c); return s ? s.reduce((x, y) => x + y, 0) : 0; };
  function contexts(){
    const all = S.all();
    const n = (st) => all.filter((e) => e.status === st).length;
    const drafts = all.filter(isDraft).length;
    const q = query.trim().toLowerCase();
    const list = all.filter((e) => (filter === 'all' || (filter === 'ai' ? isDraft(e) : e.status === filter)) &&
      (!q || [e.a.title, e.b.title, e.context.routeName, e.context.headline, e.context.author, e.context.hub, e.context.kind].join(' ').toLowerCase().includes(q)));
    const rows = list.map((e) => {
      const c = e.context, sc = scoreOf(c);
      return `
      <div class="item${e.status !== 'public' ? ' dim' : ''}" data-id="${esc(e.id)}">
        <div class="thumbs">${thumb(e.a)}${thumb(e.b)}</div>
        <div class="info">
          <b>${esc(e.a.title)} ＋ ${esc(e.b.title)}${isDraft(e) ? ' <span class="tag part">AI初稿</span>' : c.review === 'approved' ? ' <span class="tag ok">承認済み</span>' : ''}</b>
          <span class="sub">【${esc(c.routeName)}】${esc(c.headline.replace(/\n/g, ''))}</span>
          <span class="meta">${c.kind ? `<span>型 ${esc(c.kind)}</span>` : ''}${c.hub ? `<span>ハブ ${esc(c.hub)}</span>` : ''}${sc
            ? `<span title="意外性・共感度・コンテンツ性・世界観近似性">意外${sc[0]} 共感${sc[1]} 内容${sc[2]} 世界観${sc[3]}（計${total(c)}）</span>` : ''}</span>
          <span class="meta"><span>${esc(c.author)}</span><span>更新 ${esc(day(e.updatedAt))}</span></span>
          ${e.status === 'private' && e.note ? `<span class="meta"><span>メモ：${esc(e.note)}</span></span>` : ''}
        </div>
        <div class="ops">
          ${isDraft(e) ? '<button type="button" data-approve title="生成AIの初稿を、編集者として確かめて通す">承認</button>' : ''}
          <select class="status ${e.status}" data-status aria-label="公開の状態">
            ${Object.entries(STATUS).map(([k, v]) => `<option value="${k}"${k === e.status ? ' selected' : ''}>${v}</option>`).join('')}
          </select>
          <a href="index.html#/c/${encodeURIComponent(e.context.slug)}">表示</a>
          <a href="editor.html?slug=${encodeURIComponent(e.context.slug)}">編集</a>
          <a href="editor.html?from=${encodeURIComponent(e.a.slug)}" title="同じ作品に、新しいつながりを足す">つなぐ</a>
          <button type="button" class="warn" data-remove>削除</button>
        </div>
        ${e.status === 'hidden' ? `<div class="noteline"><input data-note maxlength="120" value="${esc(e.note)}" placeholder="一時非表示の理由（運営メモ・読者には見えません）"></div>` : ''}
      </div>`;
    }).join('');
    return `<section class="panel">${head('2. コンテクスト情報編集', 'コンテクスト',
      '公開は読者が UniverseIt! から辿れる状態。非公開は書き手の下書き、一時非表示は運営の判断で止めている状態です。どちらもデータは残り、いつでも戻せます。「AI初稿」は生成AIが書いた区間で、編集者が確かめて「承認」すると、ページの表示が「確認済み」に変わります。',
      `<a class="btn primary" href="editor.html?new=1">＋ 新しいコンテクスト</a>`)}
      <div class="body">
        <div class="stats">
          <div class="stat"><small>公開</small><b>${n('public')}</b></div>
          <div class="stat"><small>非公開</small><b>${n('private')}</b></div>
          <div class="stat"><small>一時非表示</small><b>${n('hidden')}</b></div>
          <div class="stat"><small>AI初稿（確認前）</small><b>${drafts}</b></div>
        </div>
        <div class="row-tools">
          ${[['all', 'すべて', all.length], ['public', '公開', n('public')], ['private', '非公開', n('private')], ['hidden', '一時非表示', n('hidden')], ['ai', 'AI初稿', drafts]]
            .map(([k, v, c]) => `<button type="button" class="chip${filter === k ? ' on' : ''}" data-filter="${k}">${v}<b>${c}</b></button>`).join('')}
          <input class="search" type="search" data-query value="${esc(query)}" placeholder="作品名・路線名・書き手で探す" aria-label="絞り込み">
        </div>
        <div class="list">${rows || '<p class="empty">該当するコンテクストはありません。</p>'}</div>
      </div></section>`;
  }

  /* ---------- 広告枠 ---------- */
  function ads(){
    const st = S.settings();
    const every = parseInt(st.adEvery, 10) || 0;
    const rows = S.ads().map((a) => `
      <div class="ad-edit" data-ad="${esc(a.id)}">
        <label class="pic" style="${R.safeImg(a.image) ? `background-image:url('${esc(R.safeImg(a.image))}')` : ''}" title="画像を差し替える">
          ${R.safeImg(a.image) ? '' : '画像を選ぶ'}<input type="file" accept="image/png,image/jpeg,image/webp" data-ad-image hidden></label>
        <div>
          <div class="grid2">
            <div class="field"><label>見出し</label><input data-ad-field="title" value="${esc(a.title)}" maxlength="60"></div>
            <div class="field"><label>小見出し</label><input data-ad-field="sub" value="${esc(a.sub)}" maxlength="80"></div>
          </div>
          <div class="field"><label>リンク先</label><input data-ad-field="url" value="${esc(a.url)}" placeholder="https://… （空き枠の案内は #/ad）"></div>
          <div class="ops" style="justify-content:flex-start">
            <label class="toggle"><input type="checkbox" data-ad-active${a.active ? ' checked' : ''}> この枠を使う</label>
            <button type="button" class="warn" data-ad-remove style="margin-left:auto">この枠を削除</button>
          </div>
        </div>
      </div>`).join('');
    return `<section class="panel">${head('2.3 管理者ページ（広告枠編集機能）', '広告枠',
      'コンテクストページの読み終わりに、映画・音楽・書籍・イベントなど、その区間の世界観と重なる広告を一枠だけ置きます（記事単位の出稿枠）。クレジットカードでの購入と、表示割合・タグ指定による価格設定は本番で実装します。',
      `<button type="button" class="btn primary" data-ad-add>＋ 枠を追加</button>`)}
      <div class="body">
        <label class="toggle" style="margin-bottom:16px"><input type="checkbox" data-ad-every${every > 0 ? ' checked' : ''}>
          コンテクストページの読み終わりに広告枠を表示する</label>
        ${rows || '<p class="empty">広告枠はありません。</p>'}
      </div></section>`;
  }

  /* ---------- 書き手 ---------- */
  function authors(){
    const rows = S.authors().map((a) => `
      <div class="item${a.status !== 'public' ? ' dim' : ''}" data-author="${esc(a.name)}">
        <div class="thumbs"><span style="border-radius:50%;width:44px;height:44px">${esc(a.name.charAt(0))}</span></div>
        <div class="info"><b>${esc(a.name)}</b><span class="sub">コンテクスト ${a.count}件</span></div>
        <div class="ops">
          <select class="status ${a.status}" data-author-status aria-label="書き手の状態">
            <option value="public"${a.status === 'public' ? ' selected' : ''}>公開</option>
            <option value="hidden"${a.status === 'hidden' ? ' selected' : ''}>一時非表示</option>
          </select>
        </div>
      </div>`).join('');
    return `<section class="panel">${head('2.1 ユーザー一覧（表示・非表示・一時非表示）', '書き手',
      '書き手を一時非表示にすると、その人のコンテクストがまとめて読者の画面から外れます。本番ではログインと結びつけ、ユーザー単位で管理します。')}
      <div class="body"><div class="list">${rows || '<p class="empty">書き手はいません。</p>'}</div></div></section>`;
  }

  /* ---------- カスタマイズ ---------- */
  const ACCENTS = ['#d9761f', '#1f3a68', '#b23a2e', '#2f7d4f', '#7a4bb3', '#c9a227', '#111111'];
  function custom(){
    const st = S.settings();
    return `<section class="panel">${head('ホワイトラベル', 'カスタマイズ',
      'クライアントごとに、サービスの名前・ひとこと・地の明暗・アクセント色を変えられます。保存すると右のプレビューと、この端末の画面にすぐ反映されます。')}
      <div class="body custom">
        <form data-custom>
          <div class="grid2">
            <div class="field"><label for="cBrand">サービス名</label><input id="cBrand" name="brand" maxlength="40" value="${esc(st.brand)}" required>
              <small>表紙の題名とブラウザのタイトルになります</small></div>
            <div class="field"><label for="cTag">ひとこと</label><input id="cTag" name="tagline" maxlength="60" value="${esc(st.tagline)}">
              <small>路線図の見出しの下に出ます</small></div>
          </div>
          <div class="field"><label>地の明暗</label>
            <div class="themes">
              ${[['charcoal', 'チャコール（標準）'], ['white', 'ホワイト']].map(([k, v]) => `
                <label class="theme-opt${st.theme === k ? ' on' : ''}"><input type="radio" name="theme" value="${k}"${st.theme === k ? ' checked' : ''}>
                  <i class="${k}"></i><b>${v}</b></label>`).join('')}
            </div>
          </div>
          <div class="field"><label>アクセント色</label>
            <div class="swatches">
              ${ACCENTS.map((c) => `<button type="button" class="sw${c === st.accent ? ' on' : ''}" data-sw="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}
              <input type="color" name="accent" value="${esc(st.accent)}" aria-label="色を選ぶ" style="width:44px;height:36px;padding:2px;border:1px solid var(--line);border-radius:8px">
            </div>
            <small>UNIverseIt! のボタン、共感、リンクの線に使われます</small>
          </div>
          <div class="ops" style="justify-content:flex-start;margin-top:8px">
            <button type="submit" class="btn primary">保存して反映</button>
            <button type="button" class="btn" data-custom-reset>標準に戻す</button>
          </div>
        </form>
        <div class="preview">
          <div class="phone"><iframe id="pv" src="index.html" title="プレビュー" loading="lazy"></iframe></div>
          <div class="ops" style="justify-content:center">
            <button type="button" class="btn" data-pv="0">表紙</button>
            <button type="button" class="btn" data-pv="net">路線図</button>
            <button type="button" class="btn" data-pv="stream">作品ページ</button>
          </div>
          <small>この端末のブラウザに保存された内容で表示しています</small>
        </div>
      </div></section>`;
  }

  /* ---------- データ ---------- */
  function data(){
    const kb = Math.round(S.usage() / 1024);
    return `<section class="panel">${head('持ち運び', 'データ',
      'このデモにはサーバーがありません。作ったものはこの端末のブラウザにだけ保存されます。パソコンで準備した内容を携帯で見せたいときは、書き出したファイルを携帯で読み込んでください。')}
      <div class="body">
        <div class="stats">
          <div class="stat"><small>コンテクスト</small><b>${S.all().length}</b></div>
          <div class="stat"><small>使用量</small><b>${kb}<span style="font-size:12px"> KB</span></b></div>
          <div class="stat"><small>目安の上限</small><b>5<span style="font-size:12px"> MB</span></b></div>
        </div>
        <div class="ops" style="justify-content:flex-start">
          <button type="button" class="btn primary" data-export>書き出す（.json）</button>
          <label class="btn" style="cursor:pointer">読み込む<input type="file" accept="application/json,.json" data-import hidden></label>
          <button type="button" class="btn" data-csv>つながり一覧（.csv・Excel 用）</button>
        </div>
        <div class="danger">
          <h3>見本に戻す</h3>
          <p class="note" style="margin:0 0 10px;color:var(--muted);font-size:12px">この端末で作ったコンテクスト・コメント・設定をすべて消し、最初の見本に戻します。元には戻せません。</p>
          <button type="button" class="btn warn" data-reset>見本に戻す</button>
        </div>
      </div></section>`;
  }

  /* ---------- 機能一覧 ----------
     前田先生の構成図（flowchart2）の番号どおりに並べる。 */
  const OK = '<span class="tag ok">デモで動作</span>';
  const PART = '<span class="tag part">一部</span>';
  const PROD = '<span class="tag prod">本番で実装</span>';
  const FEATURES = [
    ['グループ', '読者の画面（flow0921-2）'],
    ['—', '起動画面（BEAUTIFUL CONTEXT）→ UniverseIt!', OK, 'スクロールで移る。止まっていれば数秒で、触れればすぐ送る'],
    ['—', 'UniverseIt!：流れる見出しから作品ページ・コンテクストページへ', OK, '見出しはすべて実在のページにつながる。触れた言葉の位置から絵が開く'],
    ['—', '作品ページ A ⇄ コンテクストページ A―B ⇄ 作品ページ B', OK, '下の路線図・「コンテクストを見る」・左右の払い・← → キーで移る。同じ作品の絵はページをまたいで運ばれる'],
    ['—', 'UNIverseIt! で UniverseIt! へ戻る', OK, 'どのページからでも一度で戻る'],
    ['—', 'ReMixIt! でエディターへ', OK, 'いま立っている作品を A に入れた状態で開く'],
    ['—', '美しいつながりを象徴する手書き風のライン', OK, 'コンテクストページの二作品を渡る線。4 形 × 6 色から選べる'],
    ['—', '同じ A／B をルーツに共有するコンテクストへのリンク', OK, 'コンテクストページの末尾に文字だけで表示'],
    ['—', 'ランディングページとしての広告スペース', OK, 'コンテクストページの読み終わりに一枠。購入は本番'],
    ['9.1', '検索結果', OK, '作品名・路線名・本文から'],
    ['9.2', 'Our Mission', OK, ''],
    ['9.3', '利用規約・プライバシーポリシー', PART, 'デモの取り扱いのみ掲示。正式な文面は公開時に'],
    ['9.4', '404 ページ', OK, ''],
    ['9.5', 'エラーページ', PART, '画面が描けないときも地色だけで止まらない作り。専用ページは本番'],
    ['グループ', '編集者の操作'],
    ['1.0', 'コンテクスト作成（A・B・関係・生成AIの URL）', OK, 'エディター。プレビューは公開ページと同じ形'],
    ['2.4', 'コンテクスト編集', OK, '公開後も何度でも編集できる'],
    ['2.6', '既存の A／B に B コンテンツを追加', OK, 'ReMixIt! と作品ページから'],
    ['—', '50タイトルのつながり（事実・ハブ・似ている・作者と作品）', OK, '先生の 50 タイトルのうち 49 作品を 49 区間でつないだ。44 区間は生成AIの初稿で、1 区間は根拠待ちのため非公開'],
    ['—', 'AGM：生成AIが初稿を書き、編集者が確かめて通す', OK, '運営者メニューの「承認」。ページには「確認前／確認済み」と出る'],
    ['—', '四軸評価（意外性・共感度・コンテンツ性・世界観近似性）', PART, '区間ごとに採点を表示。採点そのものの自動化は本番'],
    ['—', 'ReMixIt!：生成AIが接続の候補を示し、四軸で採点して下書きを作る', PROD, '事業計画書の中核。いまは初稿をまとめて作って載せている'],
    ['2.5', 'コメント投稿（リアクション）', PROD, '読者の参加は二年目以降（事業計画書）'],
    ['2.7–2.8', '友達招待・招待状況確認', PROD, 'メール送信とアカウントが必要'],
    ['グループ', 'アカウント'],
    ['1.1–1.4', 'サインアップ・ログイン・パスワード再設定', PROD, 'Firebase Authentication などを想定'],
    ['1.5', 'ユーザー詳細・編集者プロフィール', PART, '書き手名での管理はデモで動作。プロフィールページは二年目以降'],
    ['グループ', 'マネジメント'],
    ['2', 'コンテクスト情報編集（表示・非表示・一時非表示）', OK, 'この画面'],
    ['2.1', 'ユーザー一覧（表示・非表示・一時非表示）', OK, '書き手単位でまとめて止める'],
    ['2.3', '管理者ページ（広告枠編集機能）', OK, '画像・文言・リンク・表示の有無'],
    ['グループ', '販売のための仕組み'],
    ['—', 'カスタマイズ（サービス名・ひとこと・地の明暗・アクセント色）', OK, 'クライアントごとの見た目'],
    ['—', '構造化データ（JSON-LD）による LLMO／GEO 対策', OK, 'コンテクストページごとに Article と作品の種類を出力。本番はサーバー側で出力'],
    ['—', 'リンクを開くだけで動く（携帯・パソコン）', OK, 'ホーム画面に追加すると全画面になる'],
    ['—', '書き出し／読み込み', OK, 'サーバーの代わりの持ち運び。つながり一覧は Excel 用の CSV でも出せる'],
    ['—', '検索ボリューム・広告単価の照会、ハブを主題とするページ', PROD, '事業計画書の第一・第二・第四工程'],
    ['—', 'サーバー・データベース・画像の保存先', PROD, 'いまは端末の localStorage のみ'],
    ['—', '広告のクレジットカード決済・表示割合／タグ指定の価格設定', PROD, '']
  ];
  function features(){
    const rows = FEATURES.map((f) => f[0] === 'グループ'
      ? `<tr class="grp"><td colspan="4">${esc(f[1])}</td></tr>`
      : `<tr><td>${esc(f[0])}</td><td>${esc(f[1])}</td><td>${f[2]}</td><td>${esc(f[3])}</td></tr>`).join('');
    const ok = FEATURES.filter((f) => f[2] === OK).length;
    const all = FEATURES.filter((f) => f[0] !== 'グループ').length;
    return `<section class="panel">${head('構成図 flow0921-2 ／ flowchart2 ／ 事業計画書', '機能一覧',
      `構成図にある機能と、このデモで実際に動くものの対応です。全 ${all} 項目のうち ${ok} 項目がデモで動作します。`)}
      <div class="body">
        <div class="legend">${OK} そのまま触れる　${PART} 一部を先に実装　${PROD} サーバーやアカウントが要る</div>
        <div class="feat-wrap"><table class="feat">
          <thead><tr><th>番号</th><th>機能</th><th>このデモ</th><th>補足</th></tr></thead>
          <tbody>${rows}</tbody></table></div>
      </div></section>`;
  }

  /* ---------- 描く ---------- */
  const PANELS = { contexts, ads, authors, custom, data, features };
  function draw(keepFocus){
    const f = keepFocus && document.activeElement && document.activeElement.matches('[data-query]');
    const pos = f ? document.activeElement.selectionStart : 0;
    $('brandName').textContent = S.settings().brand;
    drawTabs();
    main.innerHTML = PANELS[tabId()]();
    if (f){ const q = main.querySelector('[data-query]'); q.focus(); q.setSelectionRange(pos, pos); }
  }
  window.addEventListener('hashchange', () => { draw(); window.scrollTo(0, 0); });
  window.addEventListener('storage', (ev) => { if (ev.key === S.KEY) draw(); });

  /* ---------- つながり一覧（Excel で開ける CSV） ----------
     先生や編集者が表計算で確かめ、書き直せるように。BOM を付けて文字化けを防ぐ。 */
  function downloadCSV(){
    const cell = (v) => {
      const s = String(v == null ? '' : v);
      return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const head = ['作品A', '作品B', '路線名', '見出し', '型', 'ハブ', '意外性', '共感度', 'コンテンツ性', '世界観近似性', '合計',
      '状態', 'AGM', '書き手', '関係', '本文', 'ページ'];
    const base = location.href.replace(/manage\.html.*$/, 'index.html');
    const rows = S.all().map((e) => {
      const c = e.context, sc = scoreOf(c) || ['', '', '', ''];
      return [e.a.title, e.b.title, c.routeName, c.headline.replace(/\n/g, ''), c.kind || '', c.hub || '',
        sc[0], sc[1], sc[2], sc[3], scoreOf(c) ? total(c) : '', STATUS[e.status] || e.status,
        c.review === 'ai' ? 'AI初稿' : c.review === 'approved' ? '承認済み' : '', c.author, c.relation || '',
        S.plain(c.body), base + '#/c/' + encodeURIComponent(c.slug)];
    });
    const text = '﻿' + [head].concat(rows).map((r) => r.map(cell).join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
    a.download = `beautiful-context-connections-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------- 画像は端末の中で縮めてから持つ ---------- */
  function readImage(file, max){
    return new Promise((resolve, reject) => {
      if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return reject(new Error('JPG・PNG・WebP を選んでください'));
      if (file.size > 8 * 1024 * 1024) return reject(new Error('画像は 8MB 以下にしてください'));
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/webp', 0.84));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('画像を読み込めませんでした')); };
      img.src = url;
    });
  }

  /* ---------- 操作 ---------- */
  main.addEventListener('change', async (ev) => {
    const t = ev.target;
    const row = t.closest('[data-id]');
    if (t.matches('[data-status]') && row){
      S.setStatus(row.dataset.id, t.value);
      toast(`「${STATUS[t.value]}」にしました`);
      draw();
    } else if (t.matches('[data-note]') && row){
      S.setStatus(row.dataset.id, 'hidden', t.value);
      toast('メモを保存しました');
    } else if (t.matches('[data-author-status]')){
      const name = t.closest('[data-author]').dataset.author;
      S.setAuthorStatus(name, t.value);
      toast(t.value === 'hidden' ? `${name} のコンテクストを一時非表示にしました` : `${name} を公開に戻しました`);
      draw();
    } else if (t.matches('[data-ad-every]')){
      S.saveSettings({ adEvery: t.checked ? 1 : 0 });
      toast(t.checked ? 'コンテクストページに広告枠を表示します' : '広告枠の表示を止めました');
    } else if (t.matches('[data-ad-field]')){
      const box = t.closest('[data-ad]');
      const ad = S.ads().find((a) => a.id === box.dataset.ad);
      if (ad){ ad[t.dataset.adField] = t.value.trim(); S.saveAd(ad); toast('広告枠を保存しました'); }
    } else if (t.matches('[data-ad-active]')){
      const ad = S.ads().find((a) => a.id === t.closest('[data-ad]').dataset.ad);
      if (ad){ ad.active = t.checked; S.saveAd(ad); toast(t.checked ? 'この枠を使います' : 'この枠を止めました'); }
    } else if (t.matches('[data-ad-image]') && t.files[0]){
      try {
        const ad = S.ads().find((a) => a.id === t.closest('[data-ad]').dataset.ad);
        ad.image = await readImage(t.files[0], 900);
        if (!S.saveAd(ad)){ toast('保存できませんでした（容量が足りません）'); return; }
        toast('画像を差し替えました'); draw();
      } catch (err){ toast(err.message); }
    } else if (t.matches('[data-import]') && t.files[0]){
      if (!confirm('読み込んだ内容で、この端末のデータをすべて置き換えます。よろしいですか？')){ t.value = ''; return; }
      try { S.importJSON(await t.files[0].text()); toast('読み込みました'); draw(); }
      catch (err){ toast(err.message || '読み込めませんでした'); }
    } else if (t.name === 'accent'){
      main.querySelectorAll('.sw').forEach((b) => b.classList.toggle('on', b.dataset.sw === t.value));
    } else if (t.name === 'theme'){
      main.querySelectorAll('.theme-opt').forEach((l) => l.classList.toggle('on', l.contains(t)));
    }
  });

  main.addEventListener('input', (ev) => {
    if (ev.target.matches('[data-query]')){ query = ev.target.value; draw(true); }
  });

  main.addEventListener('click', (ev) => {
    const t = ev.target;
    const row = t.closest('[data-id]');
    if (t.closest('[data-filter]')){ filter = t.closest('[data-filter]').dataset.filter; draw(); return; }
    if (t.matches('[data-approve]') && row){
      S.approve(row.dataset.id); toast('承認しました。ページの表示が「確認済み」になります'); draw(); return;
    }
    if (t.matches('[data-csv]')){ downloadCSV(); toast('つながり一覧を書き出しました'); return; }
    if (t.matches('[data-remove]') && row){
      const e = S.byId(row.dataset.id);
      if (e && confirm(`「${e.a.title} ＋ ${e.b.title}」を削除します。元には戻せません。よろしいですか？`)){
        S.remove(e.id); toast('削除しました'); draw();
      }
      return;
    }
    if (t.matches('[data-ad-add]')){
      S.saveAd({ title: '新しい広告枠', sub: '', image: 'img/ad-hands.jpg', url: '#/ad', active: false });
      toast('枠を追加しました（まだ表示していません）'); draw(); return;
    }
    if (t.matches('[data-ad-remove]')){
      if (confirm('この広告枠を削除します。よろしいですか？')){ S.removeAd(t.closest('[data-ad]').dataset.ad); toast('削除しました'); draw(); }
      return;
    }
    if (t.matches('[data-sw]')){
      const input = main.querySelector('input[name="accent"]');
      input.value = t.dataset.sw;
      main.querySelectorAll('.sw').forEach((b) => b.classList.toggle('on', b === t));
      return;
    }
    if (t.matches('[data-custom-reset]')){
      const d = S.DEFAULT_SETTINGS;
      S.saveSettings({ brand: d.brand, tagline: d.tagline, theme: d.theme, accent: d.accent });
      toast('標準に戻しました'); draw(); return;
    }
    if (t.matches('[data-pv]')) { previewAt(t.dataset.pv); return; }
    if (t.matches('[data-export]')){
      const blob = new Blob([S.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `beautiful-context-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      toast('書き出しました'); return;
    }
    if (t.matches('[data-reset]')){
      if (confirm('この端末のデータをすべて消して、見本に戻します。元には戻せません。よろしいですか？')){
        S.reset(); toast('見本に戻しました'); draw();
      }
    }
  });

  main.addEventListener('submit', (ev) => {
    if (!ev.target.matches('[data-custom]')) return;
    ev.preventDefault();
    const f = ev.target;
    const accent = /^#[0-9a-f]{6}$/i.test(f.elements.accent.value) ? f.elements.accent.value : '#d9761f';
    S.saveSettings({
      brand: f.elements.brand.value.trim() || 'Beautiful Context',
      tagline: f.elements.tagline.value.trim(),
      theme: f.elements.theme.value === 'white' ? 'white' : 'charcoal',
      accent
    });
    $('brandName').textContent = S.settings().brand;
    toast('保存しました。画面に反映されます');
    previewAt(previewWhere);
  });

  /* プレビューは同じ端末の index.html。読み込み直して、見たい段階まで送る */
  let previewWhere = '0';
  function previewAt(where){
    previewWhere = where;
    const pv = $('pv');
    if (!pv) return;
    const go = () => {
      const w = pv.contentWindow, d = w.document;
      const intro = d.getElementById('intro');
      if (!intro) return;
      d.documentElement.style.scrollBehavior = 'auto';
      if (where === 'net') w.scrollTo(0, intro.offsetHeight - w.innerHeight);
      else if (where === 'stream'){
        w.scrollTo(0, intro.offsetHeight - w.innerHeight);
        const b = d.getElementById('uniBtn'); if (b) b.click();
      } else w.scrollTo(0, 0);
    };
    pv.addEventListener('load', () => setTimeout(go, 250), { once: true });
    pv.src = 'index.html?pv=' + Date.now();
  }

  draw();
})();

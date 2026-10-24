/* 描画の共通部分。前田先生の構成図 flow0921-2 と demo-1 のとおり。

   作品ページ ……… 駅。黒地に絵、紙の地に作品固有の解説だけ。
   コンテクストページ … 二駅間の区間。黒地に二枚の絵と ↔、紙の地に
                     路線名・見出し・関係、そして CONTEXT STORY。
   UniverseIt! ……… 「# 言葉」を横に並べて折り返す。触れると作品ページへ。 */
(() => {
  const S = window.BCStore;

  /* 本文にも属性値にも使う。引用符まで逃がさないと、題名に " が
     入っただけで属性の外へ出られてしまう。 */
  const ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ENT[c]);
  const attr = esc;

  /* エディター本文は contenteditable 由来の HTML。許可タグだけ残す。
     DOMParser の文書は画像も読み込まず script も走らせない。 */
  const ALLOWED = new Set(['P','BR','STRONG','B','EM','I','H3','H4','UL','OL','LI','BLOCKQUOTE']);
  function clean(html){
    const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    (function walk(node){
      [...node.childNodes].forEach(ch => {
        if (ch.nodeType === 1){
          if (!ALLOWED.has(ch.tagName)){
            const frag = doc.createDocumentFragment();
            while (ch.firstChild) frag.appendChild(ch.firstChild);
            ch.replaceWith(frag);
            return walk(node);
          }
          [...ch.attributes].forEach(a => ch.removeAttribute(a.name));
          walk(ch);
        } else if (ch.nodeType !== 3){
          ch.remove();
        }
      });
    })(doc.body);
    return doc.body.innerHTML;
  }

  /* http(s) 以外は出さない。javascript: などを書き込まれても踏ませない。
     画像は style の url() にも入るので、引用符・括弧・空白・\ を含むものは
     最初から受け付けない。data: は base64 の画像だけ。 */
  const UNSAFE = /[\s"'()\\<>`]/;
  const safeUrl = (u) => {
    const s = String(u || '').trim();
    return !UNSAFE.test(s) && /^https?:\/\//i.test(s) ? s : '';
  };
  const safeImg = (u) => {
    const s = String(u || '').trim();
    return !UNSAFE.test(s) && /^(https?:\/\/|img\/|data:image\/(png|jpe?g|webp|gif);base64,)/i.test(s) ? s : '';
  };

  /* ページの道。作品・区間・編集者は、本物のアドレス（c/区間/、w/作品/、e/編集者/）を持つ。
     検索エンジンや生成AIが一つひとつのページとして読めるように。アプリの中で触れたときは、
     app.js が受け取って、読み直さずにその場で開く */
  const pathOf = (k, slug, q) => `${k}/${encodeURIComponent(slug)}/${q || ''}`;
  const urlOf = (k, slug, q) => new URL(pathOf(k, slug, q), document.baseURI).href;
  const hash = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
  const PALETTE = ['#f2cf12', '#3447c9', '#d42b2b', '#b8792c', '#2f8f5b', '#c43f9a'];
  const lineColor = (e) => (e.context.line && /^#[0-9a-f]{6}$/i.test(e.context.line.color))
    ? e.context.line.color : PALETTE[hash(e.context.slug) % PALETTE.length];

  /* ---------- 手書き風の線（エディターの見本用） ----------
     基本要素.pdf の「手書き風のラインアート」。公開ページは flow0921-2 と
     demo-1 のとおり ↔ で二枚をつなぎ、この線はエディターのプレビューにだけ残す。 */
  /* k が大きいほど角が立つ。先生の見本のような Z 字の走り書きと、
     丸みのある S 字の走り書きを両方持っておく。 */
  const SHAPES = [
    { k: 14, p: [[60,4],[94,12],[40,34],[96,42],[36,66],[90,74],[50,96]] },
    { k: 5,  p: [[70,4],[96,20],[30,30],[90,52],[26,58],[80,82],[44,98]] },
    { k: 11, p: [[48,8],[88,10],[46,26],[92,32],[42,50],[90,58],[40,74],[86,82],[56,96]] },
    { k: 6,  p: [[64,2],[98,24],[22,40],[96,60],[30,80],[70,98]] }
  ];
  function smooth(shape){
    const pts = shape.p, k = shape.k;
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++){
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / k, p1[1] + (p2[1] - p0[1]) / k];
      const c2 = [p2[0] - (p3[0] - p1[0]) / k, p2[1] - (p3[1] - p1[1]) / k];
      d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
    }
    return d;
  }
  function img(src, alt, cls){
    const s = safeImg(src);
    return s ? `<img class="${cls || ''}" src="${attr(s)}" alt="${attr(alt || '')}" loading="lazy" decoding="async">` : '';
  }
  /* 絵のない作品の札の文字。『』の中に題名があれば、その頭（「テレビ映画『ザ・バンカー』」なら「ザ」） */
  function initial(work){
    const t = String(work.title || '?'), m = /[『「]([^』」]+)[』」]/.exec(t);
    return (m ? m[1] : t.replace(/[『』「」]/g, '')).trim().charAt(0) || '?';
  }

  /* 作品の絵。画像が無ければ頭文字で立てる */
  function art(work){
    const s = safeImg(work.image);
    return `<div class="art">` + (s
      ? `<img src="${attr(s)}" alt="${attr(work.title)}" loading="lazy" decoding="async">`
      : `<span class="ph">${esc(initial(work))}<small>${esc(work.type || '作品')}</small></span>`) + `</div>`;
  }

  const ICON = {
    back:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4.5 7.5 12l7.5 7.5"/></svg>',
    plus:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    seek:  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></svg>'
  };

  /* demo-1 には戻る印が無い。ページを重ねて開くので、絵の上に小さな丸だけ置く */
  const backTop = () => `<button type="button" class="back-close" data-close aria-label="戻る">${ICON.back}</button>`;
  /* TOP へ戻るロゴ（作品・コンテクストは絵の上、ほかのページは紙の上） */
  const topLogo = (cls) => `<a class="c-logo${cls ? ' ' + cls : ''}" href="#/" data-top aria-label="BEAUTIFUL CONTEXT（TOP へ戻る）"><img src="img/logo.png" alt=""></a>`;

  /* ほかの区間への導線。demo-1 の「〜とのコンテクストを見る ›」と同じ形 */
  function tease(href, text, step){
    return step != null
      ? `<button type="button" class="tease" data-step="${step}">${esc(text)} <span aria-hidden="true">›</span></button>`
      : `<a class="tease" href="${attr(href)}">${esc(text)} <span aria-hidden="true">›</span></a>`;
  }

  /* 同じ作品をルーツに共有するコンテクスト */
  function roots(e, list){
    if (!list.length) return '';
    return list.map(x => tease(pathOf('c', x.context.slug), `${x.a.title} ＋ ${x.b.title}`)).join('');
  }

  /* 広告枠。コンテクストページの読み終わりに一枠だけ置く（記事単位の出稿枠） */
  function ad(a){
    if (!a) return '';
    const url = a.url && a.url.startsWith('#/') ? a.url : safeUrl(a.url);
    const ext = url && !url.startsWith('#');
    return `
      <aside class="c-ad" aria-label="広告">
        <a href="${attr(url || '#/ad')}"${ext ? ' target="_blank" rel="noopener sponsored"' : ''}>
          ${img(a.image, '', 'c-ad-img')}
          <span class="ad-mark">AD</span>
          <span class="ad-copy"><b>${esc(a.title)}</b>${a.sub ? `<small>${esc(a.sub)}</small>` : ''}</span>
        </a>
      </aside>`;
  }

  function relationParts(c){
    return String(c.relation || '').split('──').map(s => s.trim()).filter(Boolean)
      .map(s => `<span>${esc(s)}</span>`).join('');
  }

  /* 読む時間。demo-1 は「約45秒」。1分に満たないものは秒で出す */
  function readLabel(html){
    const sec = S.plain(html).length / 8;
    return sec < 55 ? `約${Math.max(10, Math.round(sec / 5) * 5)}秒` : `約${Math.max(1, Math.round(sec / 60))}分`;
  }

  /* 画像。data-k は作品の目印で、ページが替わるときに同じ作品の絵を
     前のページの位置から次のページの位置へ運ぶために使う。 */
  function frame(w, cls){
    const s = safeImg(w.image);
    return `<div class="${cls}">` + (s
      ? `<img src="${attr(s)}" alt="${attr(w.title)}" data-k="${attr(w.slug)}" decoding="async">`
      : `<span class="ph">${esc(initial(w))}<small>${esc(w.type || '作品')}</small></span>`) + `</div>`;
  }

  /* 画像の出典を一行で。撮影者と条件（CC BY など）を、その絵のすぐそばに置く */
  function credit(w){
    if (!w || !w.credit) return '';
    const u = safeUrl(w.creditUrl);
    return `<p class="img-credit">画像：${esc(w.credit)}${u ? `　<a href="${attr(u)}" target="_blank" rel="noopener nofollow">出典</a>` : ''}</p>`;
  }

  /* ---------- 作品ページ（駅） ----------
     demo-1 の作品ページ A／B。上に絵、下に紙の地で作品固有の解説だけ。
     他作品との関係はコンテクストページで読む。 */
  function workPage(hit, e){
    const w = hit.work;
    const side = e && e.b.slug === w.slug ? 'b' : 'a';
    const other = e ? e[side === 'a' ? 'b' : 'a'] : null;
    const others = hit.contexts.filter(x => !e || x.entry.id !== e.id);
    const more = others.map(({ entry, side: sd }) =>
      tease(pathOf('c', entry.context.slug), `${entry[sd === 'a' ? 'b' : 'a'].title}とのコンテクストを見る`)).join('');
    /* 作品ページもコンテクストページと同じ形に（BC修正要望 2026.10.22「全ての Content は Context に」）。
       左にその作品、右はまだ誰も結んでいない席：＋ でエディターを開き、この作品から新しいつながりを創る */
    return `
      <article class="page wpage">
        ${backTop()}
        <div class="duo-hero"><a class="c-logo" href="#/" data-top aria-label="BEAUTIFUL CONTEXT（TOP へ戻る）"><img src="img/logo.png" alt=""></a><div class="duo">${frame(w, 'art')}<a class="duo-add" href="editor.html?from=${attr(encodeURIComponent(w.slug))}" aria-label="${attr(w.title)}から、新しいつながりを創る"><span aria-hidden="true">＋</span><small>つながりを創る</small></a></div>${navArrows()}</div>
        <div class="content">
          <p class="meta">${esc(w.type || '作品')}${w.year ? '・' + esc(w.year) + '年' : ''}　CURRENT STATION</p>
          <h2>${esc(w.title)}</h2>
          ${w.creator ? `<p class="by">${esc(w.creator)}</p>` : ''}
          ${w.summary ? `<p>${esc(w.summary)}</p>` : ''}
          ${e ? tease(null, `${other.title}とのコンテクストを見る`, 1) : ''}
          ${more ? `<p class="meta more-label">この駅から延びるほかの区間　${others.length}本</p>${more}` : ''}
          ${credit(w)}
        </div>
      </article>`;
  }

  /* つながりの型と四軸。先生の資料（事業計画書）の採点軸をそのまま並べる。
     生成AIの初稿（review: 'ai'）は、編集者が確かめるまでそう書いておく。 */
  const AXES = ['意外性', '共感度', 'コンテンツ性', '世界観近似性'];
  function axes(c){
    const sc = Array.isArray(c.score) && c.score.length === 4 ? c.score.map(v => Math.max(0, Math.min(5, +v || 0))) : null;
    const agm = c.review === 'ai' ? '<span class="agm">生成AIの初稿・編集者の確認前</span>'
      : c.review === 'approved' ? '<span class="agm ok">生成AIの初稿・編集者が確認済み</span>' : '';
    if (!c.kind && !sc && !agm) return '';
    return `
      <section class="axes" aria-label="このつながりの型と評価">
        <p class="meta">このつながり${agm}</p>
        <p class="ax-kind">${c.kind ? `<span>型<b>${esc(c.kind)}</b></span>` : ''}${c.hub ? `<span>ハブ<b>${esc(c.hub)}</b></span>` : ''}${c.basis ? `<span>下敷き<b>${esc(c.basis)}</b></span>` : ''}</p>
        ${sc ? `<dl class="ax">${AXES.map((n, i) => `<div><dt>${n}</dt><dd aria-label="${sc[i]} / 5">${
          [1, 2, 3, 4, 5].map(k => `<i${k <= sc[i] ? ' class="on"' : ''}></i>`).join('')}</dd></div>`).join('')}</dl>` : ''}
      </section>`;
  }

  /* ---------- コンテクストページ A―B ----------
     demo-1 のとおり。黒地に二枚の絵を並べ、真ん中に ↔。
     紙の地に路線名・見出し・二作品の関係、その下に CONTEXT STORY。 */
  /* ---------- 編集者・アカウント ---------- */
  /* 名前の頭文字の丸（顔写真の代わり）。「BC 」は省いて読む */
  const avatar = (name, cls) => `<span class="ava${cls ? ' ' + cls : ''}" aria-hidden="true">${esc(String(name || '?').replace(/^BC\s*/, '').charAt(0) || '?')}</span>`;
  const followBtn = (ed, on) =>
    `<button type="button" class="follow${on ? ' on' : ''}" data-follow="${attr(ed.id)}" aria-pressed="${on ? 'true' : 'false'}">${on ? 'フォロー中' : 'フォロー'}</button>`;
  const navArrows = () =>
    `<button type="button" class="ctx-nav prev" data-ctx-go="-1" aria-label="一つ前のつながりへ">‹</button>` +
    `<button type="button" class="ctx-nav next" data-ctx-go="1" aria-label="次のつながりへ">›</button>`;
  /* フォローしている人の数。いまは見本（この端末のフォローだけを数える）。本番はサーバーの数 */
  const followers = (ed, on) =>
    `<span class="ed-followers" data-follow-count="${attr(ed.id)}"><b>${(+ed.followers || 0) + (on ? 1 : 0)}</b> フォロワー</span>`;
  function editorRow(ed, on){
    if (!ed) return '';
    return `<div class="ed-row">
      <a class="ed-link" href="${attr(pathOf('e', ed.id))}">${avatar(ed.mark || ed.name)}<span><b>${esc(ed.name)}</b><small>${esc(ed.role || 'EDITOR')}</small></span></a>
      ${followBtn(ed, on)}</div>`;
  }
  /* 右上の Login。ログインしていれば、名前の頭文字の丸 */
  const loginChip = (me) => me
    ? `<button type="button" class="login-chip me" data-account aria-label="アカウント：${attr(me.name)}">${avatar(me.name)}</button>`
    : `<button type="button" class="login-chip" data-login>Login</button>`;

  /* コメント欄。つながりの下に、読んだ人が思ったことを置く。編集者が確かめたものだけが並び、
     書いた本人には確認待ちのものも見える */
  function comments(e, list, mine, me){
    const day = (iso) => { try { return new Date(iso).toLocaleDateString('ja-JP'); } catch (x) { return ''; } };
    const li = (c, wait) => `
      <li class="cm${wait ? ' pending' : ''}">${avatar(c.name)}<div>
        <p class="cm-h"><b>${esc(c.name)}</b><time>${esc(day(c.at))}</time>${wait ? '<span class="cm-wait">確認中・あなたにだけ表示</span>' : ''}</p>
        <p class="cm-t">${esc(c.text)}</p></div></li>`;
    const items = list.map(c => li(c)).join('') + (mine || []).map(c => li(c, true)).join('');
    return `
      <section class="comments" id="comments" data-ctx="${attr(e.id)}">
        <p class="meta">COMMENTS<span class="cm-n">${list.length}</span></p>
        ${items ? `<ul class="cm-list">${items}</ul>` : '<p class="cm-empty">まだコメントはありません。このつながりについて、最初のひとことを。</p>'}
        <form class="cm-form" data-comment="${attr(e.id)}">
          <textarea name="text" rows="2" maxlength="600" placeholder="このつながりについて、思ったことを" aria-label="コメント"></textarea>
          <button type="submit">送る</button>
        </form>
        <p class="cm-note">${me ? `${esc(me.name)} として書きます。` : '送るときに、名前を一つ作ります。'}コメントは編集者が確かめてから表示されます。</p>
      </section>`;
  }

  /* o：{ editor, following, me, comments, mine, today: { i, n, day }, rail, railBatch }
     today があれば「Today's Editor's Choice」：上の帯に題名と Login、‹ › で今日のほかの Choice へ。
     戻る印は出さない（ここが最初の画面）。
     rail があれば、読み終わりの下に「この先のつながり」の路線を続ける（下へ読み進めるほど、駅が足されていく） */
  function contextPage(e, adItem, o){
    o = o || {};
    const c = e.context, td = o.today;
    const t = readLabel(c.body);
    const ai = safeUrl(c.aiUrl);
    const rel = S.related(e).slice(0, 3);
    const state = !S.isVisible(e)
      ? `<p class="back-state">${e.status === 'private' ? '非公開' : '一時非表示'}のコンテクストです。読者には表示されていません。</p>` : '';
    /* 本文の最初の太字の一文は、demo-1 の「同じ物語が、別の社会を走る。」の位置に */
    const story = clean(c.body).replace(/^\s*<p><strong>([\s\S]*?)<\/strong><\/p>/, '<h2>$1</h2>');
    /* ‹ › はどのコンテクストページにも（BC修正要望 2026.10.22）。› は NEXT と同じ、‹ は一つ前のつながりへ。
       最初の画面には戻る先がないので ‹ は出さない（body.at-root） */
    const nav = navArrows();
    const dots = td && td.n > 1
      ? `<span class="today-dots" aria-label="${td.n} 本のうち ${td.i + 1} 本目">${Array.from({ length: td.n }, (_, k) => `<i${k === td.i ? ' class="on"' : ''}></i>`).join('')}</span>` : '';
    /* 読む時間は見出しの行（route-label）から外し、ボタンの中に小さく残すだけ。「読了時間30秒」の札は要らない、
       代わりに続きを読みたくなる誘導を（開発会議 2026.10.23 §3.2）。ボタンの ↓ はゆっくり上下し、
       ボタンの下の .story-cue（金の細い線）が本文へ向かって流れる。携帯だけ。見開きでは本文が横に見えている */
    return `
      <article class="page cpage${td ? ' today' : ''}">
        ${td ? '' : backTop()}
        <div class="duo-hero">${td
          ? `<div class="today-bar"><b>TODAY'S EDITOR'S CHOICE</b><span><time>${esc(td.day)}</time>${dots}</span></div>${loginChip(o.me)}`
          : `<a class="c-logo" href="#/" data-top aria-label="BEAUTIFUL CONTEXT（TOP へ戻る）"><img src="img/logo.png" alt=""></a>`}<div class="duo"><button type="button" class="duo-go" data-step="0" aria-label="${attr(e.a.title)}の作品ページへ">${frame(e.a, 'art')}</button><button type="button" class="duo-go" data-step="2" aria-label="${attr(e.b.title)}の作品ページへ">${frame(e.b, 'art')}</button><i class="swap" aria-hidden="true">↔</i></div>${nav}</div>
        <section class="context-lead">
          ${state}
          ${editorRow(o.editor, o.following)}
          <p class="route-label">${esc(c.label || 'CONTEXT')}　［${esc(c.routeName)}］</p>
          <h2>${esc(c.headline).replace(/\n/g, '<br>')}</h2>
          ${relationParts(c) ? `<div class="pair">${relationParts(c)}</div>` : ''}
          <button type="button" class="read" data-read>このつながりを読む<small>${t}</small><span aria-hidden="true">↓</span></button>
          <i class="story-cue" aria-hidden="true"></i>
        </section>
        <article class="context-body" id="story">
          <p class="meta">CONTEXT STORY</p>
          ${story}
          ${axes(c)}
          ${ai ? `<p class="source">この解説は生成AIの出力をもとにしています<a href="${attr(ai)}" target="_blank" rel="noopener nofollow">${esc(ai)}</a></p>` : ''}
          <p class="byline">${esc(o.editor ? o.editor.name : c.author)}　·　${esc(new Date(e.updatedAt).toLocaleDateString('ja-JP'))}</p>
          ${comments(e, o.comments || S.visibleComments(e), o.mine, o.me)}
          ${rel.length ? `<p class="meta more-label">同じルーツのコンテクスト</p>${roots(e, rel)}` : ''}
          ${ad(adItem)}
          ${credit(e.a)}${credit(e.b)}
          ${o.rail && o.rail.length ? `
          <section class="ctx-rail" aria-label="この先のつながり">
            <p class="meta more-label">この先のつながり</p>
            <ol class="rail" id="rail">${feedStops(o.rail, 0, o.railBatch || 12, true)}</ol>
            <div class="rail-more" id="railMore" aria-hidden="true"></div>
          </section>` : ''}
        </article>
      </article>`;
  }

  /* ---------- 編集者のページ ----------
     名前・ひとこと・フォロー。その人が選んだコンテクストの一覧 */
  const mini = (w) => { const s = safeImg(w.image); return s ? `<img src="${attr(s)}" alt="" loading="lazy" decoding="async">` : `<span class="ph">${esc(initial(w))}</span>`; };
  function editorPage(ed, list, on){
    const items = list.map(e => `
      <a class="ed-item" href="${attr(pathOf('c', e.context.slug))}">
        <span class="ed-thumbs">${mini(e.a)}${mini(e.b)}</span>
        <span class="ed-txt"><small>［${esc(e.context.routeName)}］</small><b>${esc(e.context.headline).replace(/\n/g, '')}</b>
          <span>${esc(e.a.title)} ＋ ${esc(e.b.title)}</span></span></a>`).join('');
    /* マイページ（前田先生の MyBeautifulContext.pdf）：その人の写真を大きく、「〇〇の BEAUTIFUL CONTEXT」、
       フォローと note へのリンク、その人が選んだつながり。写真がなければ、頭文字の丸を黒地に置く */
    const pic = safeImg(ed.photo);
    const note = /^[A-Za-z0-9_]{1,40}$/.test(ed.note || '') ? ed.note : '';
    return `
      <article class="page text-page editor-page">
        ${backTop()}${topLogo('on-paper')}
        <div class="ed-cover${pic ? '' : ' empty'}">${pic
          ? `<img src="${attr(pic)}" alt="${attr(ed.name)}" decoding="async">`
          : avatar(ed.mark || ed.name, 'big')}<span class="ed-down" aria-hidden="true"></span></div>
        <div class="content">
          <div class="ed-head">
            <h2 class="ed-title"><span>${esc(ed.name)}の</span> <b>BEAUTIFUL CONTEXT</b></h2>
            <p class="meta">${esc(ed.role || 'EDITOR')}</p>
            ${ed.bio ? `<p class="ed-bio">${esc(ed.bio)}</p>` : ''}
            <div class="ed-acts">${followBtn(ed, on)}${followers(ed, on)}${note
              ? `<a class="note-link" href="https://note.com/${attr(note)}" target="_blank" rel="noopener"><b>note</b><span>note.com/${esc(note)}</span></a>` : ''}</div>
          </div>
          <h3 class="ed-chose">${esc(ed.name)}が選んだつながり<small>この編集者が選んだつながり　${list.length}</small></h3>
          <div class="ed-list">${items || '<p>まだありません。</p>'}</div>
        </div>
      </article>`;
  }

  /* ---------- 一覧（BC修正要望 2026.10.22） ----------
     ロゴから開く。すべてのつながりを「つながりを辿る」と同じ順（S.trail）に、番号を付けて並べる。
     読んだものには印、最後に読んだところに「いまここ」。前に見たものを、位置と番号で探せるように。
     黒地。下の帯は、つながりを辿るの代わりに、作品の種類で分ける札と、言葉で絞る欄 */
  const kinds = (w) => String(w.type || '').split('・').map(s => s.trim()).filter(Boolean);
  function listPage(items, o){
    const tally = new Map();
    items.forEach(({ entry: e }) => new Set([...kinds(e.a), ...kinds(e.b)]).forEach(k => tally.set(k, (tally.get(k) || 0) + 1)));
    const cats = [...tally].filter(([, n]) => n >= 3).sort((x, y) => y[1] - x[1]).map(([k]) => k);
    const read = items.filter(t => o.read.has(t.entry.id)).length;
    const rows = items.map((t, i) => {
      const e = t.entry, c = e.context, done = o.read.has(e.id), now = e.id === o.here;
      const from = t.from && (e.a.slug === t.from ? e.a : e.b);
      const hay = [c.routeName, c.headline, e.a.title, e.a.creator, e.b.title, e.b.creator].join(' ').toLowerCase();
      return `${t.jump ? '<li class="ls-sep"><span>別の路線へ</span></li>' : ''}
        <li class="ls-row${done ? ' done' : ''}${now ? ' now' : ''}" data-kinds="${attr([...kinds(e.a), ...kinds(e.b)].join('|'))}" data-hay="${attr(hay)}">
          <a class="ls-item" href="${attr(pathOf('c', c.slug))}">
            <span class="ls-no">${String(i + 1).padStart(3, '0')}</span>
            <span class="ed-thumbs">${mini(e.a)}${mini(e.b)}</span>
            <span class="ed-txt"><small>［${esc(c.routeName)}］${now ? '<i class="ls-mark now">いまここ</i>' : done ? '<i class="ls-mark">読んだ</i>' : ''}</small>
              <b>${esc(c.headline).replace(/\n/g, '')}</b>
              <span>${from ? `${esc(tagText(from))}から分岐　` : ''}${esc(e.a.title)} ＋ ${esc(e.b.title)}</span></span></a></li>`;
    }).join('');
    return `
      <article class="page list-page">
        ${backTop()}${topLogo()}
        <div class="content">
          <p class="meta">つながりを辿る順</p>
          <h2>つながりの一覧</h2>
          <p class="ls-count">${items.length} のつながり　·　読んだ ${read}</p>
          <ol class="ls" id="ls">${rows}</ol>
          <p class="ls-none" id="lsNone" hidden>見つかりませんでした。別の言葉で探してみてください。</p>
        </div>
        <div class="ls-bar">
          <div class="ls-cats" role="group" aria-label="種類で分ける">
            <button type="button" class="on" data-cat="" aria-pressed="true">すべて</button>
            <button type="button" data-cat=":read" aria-pressed="false">読んだ</button>
            ${cats.map(k => `<button type="button" data-cat="${attr(k)}" aria-pressed="false">${esc(k)}</button>`).join('')}
          </div>
          <form class="seek ls-seek" role="search" data-ls-seek>
            ${ICON.seek}<input type="search" name="q" placeholder="一覧から探す（作品・人・言葉）" enterkeyhint="search" aria-label="一覧から探す">
          </form>
        </div>
      </article>`;
  }

  /* ---------- つながりの路線（フィード） ----------
     選んだ作品から、区間でつながる作品を枝分かれの順に並べる。
     左に一本の路線を引き、作品は駅、そのあいだに区間（コンテクスト）を置く。
     前の駅から続かない区間（枝分かれ）は「〜から分岐」と書く。 */
  /* lazy：ページの下のほうに置くとき（コンテクストの読み終わりの先）は、絵をすべて後から読む */
  function feedStops(items, from, to, lazy){
    return items.slice(from, to).map((it, i) => {
      const n = from + i, w = it.work, c = it.entry && it.entry.context;
      const parent = it.parent && items.find(x => x.slug === it.parent);
      const s = safeImg(w.image);
      const href = pathOf('w', it.slug, c ? '?c=' + encodeURIComponent(c.slug) : '');
      return `
        <li class="stop${n === 0 ? ' first' : ''}${it.branch ? ' branch' : ''}${!c && n > 0 ? ' newline' : ''}">
          ${!c && n > 0 ? `<p class="transfer"><span>別の路線へ</span></p>` : ''}
          ${c ? `<a class="seg" href="${attr(pathOf('c', c.slug))}">
            ${it.branch && parent ? `<span class="seg-from">${esc(tagText(parent.work))} から分岐</span>` : ''}
            <small>［${esc(c.routeName)}］${c.kind ? `　${esc(c.kind)}` : ''}</small>
            <b><span class="seg-copy">${esc(c.headline).replace(/\n/g, '')}</span><span class="seg-go" aria-hidden="true">››</span></b></a>` : ''}
          <a class="fstop" href="${attr(href)}">
            <span class="st-img">${s ? `<img src="${attr(s)}" alt="${attr(w.title)}" data-k="${attr(w.slug)}" loading="${n < 4 && !lazy ? 'eager' : 'lazy'}" decoding="async">`
              : `<span class="ph">${esc(initial(w))}</span>`}</span>
            <span class="st-txt"><small>${esc(w.type || '作品')}${w.year ? '・' + esc(w.year) + '年' : ''}</small>
              <b>${esc(w.title)}</b>${w.summary ? `<span>${esc(w.summary)}</span>` : ''}</span>
          </a>
        </li>`;
    }).join('');
  }
  function feedPage(items, batch){
    const first = items[0];
    return `
      <article class="page text-page feed-page">
        ${backTop()}${topLogo('on-paper')}
        <div class="content">
          <p class="meta">つながりの路線</p>
          <h2>${esc(tagText(first.work))}から辿る</h2>
          <ol class="rail" id="rail">${feedStops(items, 0, batch)}</ol>
          <div class="rail-more" id="railMore" aria-hidden="true"></div>
        </div>
      </article>`;
  }

  /* ---------- 検索 ---------- */
  function search(q, res){
    const ctx = res.contexts.map(e =>
      tease(pathOf('c', e.context.slug), `${e.a.title} ＋ ${e.b.title}`)).join('');
    const works = res.works.map(({ work: w }) =>
      `<a class="chip" href="${attr(pathOf('w', w.slug))}"><span class="h">#</span>${esc(tagText(w))}</a>`).join('');
    const none = !res.contexts.length && !res.works.length;
    return `
      <article class="page text-page search-page">
        ${backTop()}${topLogo('on-paper')}
        <div class="content">
          <p class="meta">SEARCH</p>
          <form class="seek big" role="search" data-seek>
            ${ICON.seek}<input type="search" name="q" value="${attr(q)}" placeholder="言葉で辿る" enterkeyhint="search" aria-label="検索">
          </form>
          ${q ? `<p class="meta">「${esc(q)}」のつながり　${res.contexts.length}件</p>` : ''}
          ${none && q ? `<p>見つかりませんでした。別の言葉で辿ってみてください。</p>` : ''}
          ${ctx}
          ${works ? `<p class="meta more-label">作品</p><div class="chips">${works}</div>` : ''}
        </div>
      </article>`;
  }

  /* ---------- 読み物のページ ---------- */
  /* 「Beautiful Context とは」の説明文（検索結果の説明と、構造化データで同じものを使う） */
  const ABOUT_DESC = 'Beautiful Context（ビューティフル・コンテクスト）は、映画・本・音楽・人物・場所など、二つの作品のあいだにある意外なつながりを、編集者が一本の「コンテクスト」として届けるメディアです。読み方、編集の方針、運営について。';
  function page(name){
    const shell = (title, body) => `
      <article class="page text-page">
        ${backTop()}${topLogo('on-paper')}
        <div class="content"><h2>${title}</h2>${body}</div>
      </article>`;
    /* About（開発会議 2026.10.23：検索エンジンが BC を「カードのデータベース」としか読めていないため、最優先で用意） */
    if (name === 'about') return shell('Beautiful Context とは', `
      <p class="lead">Beautiful Context（ビューティフル・コンテクスト）は、映画・本・音楽・人物・場所など、二つの作品のあいだにある意外なつながりを、編集者が一本の「コンテクスト」として書き、届けるメディアです。</p>
      <p>たとえば、ピアニストのグレン・グールドが生涯の愛読書にしていたのが、夏目漱石の『草枕』だったこと。二つの作品のどちらにも属さないその関係を、独立した一本の読み物として読めるようにしています。</p>
      <p>私たちは、作品を「駅」、二つの作品のあいだにある関係を「区間」と呼んでいます。駅にあたる作品は、それぞれの作者や権利者のものです。Beautiful Context がつくるのは、駅と駅のあいだの区間のほうです。区間を一本読み終えると次の駅に着き、そこからまた別の区間へ。作品から作品へ、つながりを辿っていけます。</p>
      <h3>読み方</h3>
      <ul>
        <li>開くと、まず「Today's Editor's Choice」が表示されます。編集者がその日に選んだコンテクストです。</li>
        <li>読み終わりの「つながりを辿る」を押すと、いま読んだ区間の先にある駅（作品）へ進み、そこから次のコンテクストへ続きます。</li>
        <li>左上のロゴを押すと「つながりの一覧」が開きます。すべてのコンテクストが、辿る順に並んでいます。</li>
        <li>メニューの「つながりを流れで観る」では、一枚ずつ上へ払いながら辿れます（試作）。</li>
        <li>「UniverseIt!」では、すべての作品の言葉から辿り始められます。「言葉で辿る」で検索もできます。</li>
      </ul>
      <h3>編集者について</h3>
      <p>コンテクストを選び、書くのは、編集の経験をもつ編集者です。真・善・美──確かめられる事実に立ち、作品への敬意を保ち、読んで美しいと感じられる一本だけを公開します。</p>
      <p>下書きに生成AIを使うことがあります。生成AIの初稿は、編集者が事実と出典を確かめてから公開します。公開されたコンテクストには、選んだ編集者の名前を記しています。</p>
      <h3>つくる人へ</h3>
      <p>「ReMixIt!」では、どなたでも二つの作品のあいだにあるつながりを提案できます。長い解説は要りません。大切なのは文章の量ではなく、つながりを見つける感覚です。二つを結びつけ、その関係の面白さが短く伝われば、それで一本になります。</p>
      <p>編集者のアカウントは、いまのところ招待制です。</p>
      <h3>運営</h3>
      <!-- ★ 先生が埋める欄：会社名・連絡先（決まり次第、ここを書き換える） -->
      <p class="org">運営：（会社名）<br>代表：前田邦宏<br>連絡先：info@beautifulcontext.com（準備中）</p>
      ${tease('#/terms', '利用規約・プライバシー')}
      ${tease('#/credits', '画像の出典')}
      ${tease('#/ad', '広告枠のご案内')}`);
    if (name === 'mission') return shell('Our Mission', `
      <p class="lead">意外な関係を持つ二つの情報を、つなぎ、読める場所をつくる。</p>
      <p>たとえば、自分が見た海外の映画に原作があり、それが日本の著名な映画監督によってすでに撮られていたと気づいたとき。その発見は、二つの作品のどちらにも属さない、独立した一つの読み物になる。</p>
      <p>作品は駅、コンテクストは二駅間の区間。駅にあたる作品やブランドは他者のものであり、ここで生み出すのは区間のほうである。</p>
      <p>関係の初稿は生成AIが書き、採否と最終稿は人が担う。二つを組み合わせるだけで、音楽の DJ のように、つながりを活かした美しい空間が編み出されていく。</p>
      <ol class="steps">
        <li><b>辿る</b>UniverseIt! ── 言葉から、既にある区間を辿る</li>
        <li><b>読む</b>作品の駅から、二駅間の区間へ。区間を読んで、別の駅へ</li>
        <li><b>創る</b>ReMixIt! ── 二つの作品の間に、新しい区間をつくる</li>
      </ol>
      <p class="motto">YOUR CONTEXT WILL VISUALIZE BY US</p>`);
    if (name === 'terms') return shell('利用規約・プライバシー', `
      <p class="lead">これはデモ版です。正式な利用規約とプライバシーポリシーは、サービス公開時に用意します。</p>
      <h3>データの保存先</h3>
      <p>作成したコンテクストや設定は、すべてお使いの端末のブラウザ（localStorage）にだけ保存されます。サーバーへ送信することはありません。別の端末や別の人には見えません。</p>
      <h3>アクセス解析（外部送信）</h3>
      <p>サイトの改善と利用状況の把握のため、Google LLC の「Google アナリティクス」を使っています。ページを開くと、閲覧したページのアドレス、参照元、おおよその地域、端末やブラウザの種類などの情報が、Cookie などを通じて Google に送信されます。氏名やメールアドレスなど、個人を直接特定する情報は送りません。</p>
      <p>送信される情報の扱いは <a href="https://policies.google.com/technologies/partner-sites?hl=ja" target="_blank" rel="noopener">Google のポリシー</a> をご覧ください。送信を止めたい場合は <a href="https://tools.google.com/dlpage/gaoptout?hl=ja" target="_blank" rel="noopener">Google アナリティクス オプトアウト アドオン</a> を使えます。</p>
      <h3>画像と文章</h3>
      <p>見本の作品画像は、作品紹介を目的として引用しています。著作権は各権利者に帰属します。出典は<a href="#/credits">画像の出典</a>にまとめています。見本の解説文は、確かめられる事実に基づいて書いた見本です。</p>
      <p>このメディアの目的と読み方は<a href="#/about">Beautiful Context とは</a>をご覧ください。</p>`);
    if (name === 'credits'){
      /* 画像の出典。CC BY / BY-SA の表示義務もここで満たす */
      const rows = S.works(S.all()).filter(h => h.work.credit).map(({ work: w, slug }) => `
        <li><a href="${attr(pathOf('w', slug))}">${esc(w.title)}</a>
          <small>${esc(w.credit)}${safeUrl(w.creditUrl) ? `　<a href="${attr(safeUrl(w.creditUrl))}" target="_blank" rel="noopener nofollow">出典</a>` : ''}</small></li>`).join('');
      return shell('画像の出典', `
        <p class="lead">作品の画像は、作品紹介のための引用、または自由な利用が許された写真です。著作権は各権利者に帰属します。</p>
        <p>クリエイティブ・コモンズ（CC BY／CC BY-SA）の写真は、撮影者と条件をここに記しています。ポスター・表紙・キービジュアルは、デモでの作品紹介のために掲載しています。公開の前に権利を確かめ、必要なものは差し替えます。背景の回路の絵は、前田先生の構成図（flow0921-2）のものです。</p>
        <ul class="credits">${rows}</ul>`);
    }
    if (name === 'ad') return shell('広告枠のご案内', `
      <p class="lead">コンテクストページの読み終わりに、その区間の世界観と重なる広告を一枠だけ置きます。</p>
      <p>映画・音楽・書籍・イベントなど、読み終えた人がその作品を買える・観られる・訪ねられる入口を置く。つながりを辿った先が、そのまま体験への入口になります。</p>
      <h3>想定している仕組み</h3>
      <ul>
        <li>記事単位で販売する出稿枠。記事の主題と広告主の世界観が重なることを根拠にする</li>
        <li>クレジットカードで購入できる枠、表示の割合やタグ指定による価格設定（本番で実装）</li>
        <li>管理画面から、枠の画像・文言・リンク先・表示の有無を編集できる（デモで動作）</li>
      </ul>
      ${tease('manage.html#ads', '管理画面で広告枠を見る')}`);
    return shell('ページが見つかりません', `
      <p class="lead">お探しのページは移動したか、公開が終了した可能性があります。</p>
      <a class="tease" href="#/today" data-home>Today's Editor's Choice へ戻る <span aria-hidden="true">›</span></a>
      <p class="after">はじめての方は<a href="#/about">Beautiful Context とは</a>へ。</p>`);
  }

  /* 「Beautiful Context とは」の構造化データ：AboutPage と、運営する Organization（名前・アドレス・ロゴ） */
  function aboutLd(){
    const site = new URL('./', document.baseURI).href;
    const org = { '@type': 'Organization', '@id': site + '#organization', name: 'Beautiful Context', url: site, logo: site + 'icon-512.png' };
    return {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'AboutPage', '@id': site + 'about/', url: site + 'about/', name: 'Beautiful Context とは', inLanguage: 'ja',
          description: ABOUT_DESC, about: { '@id': org['@id'] },
          isPartOf: { '@type': 'WebSite', name: 'Beautiful Context', url: site } },
        org
      ]
    };
  }

  /* ---------- 下の路線図 ----------
     demo-1 のとおり。左右の駅と、そのあいだの区間。いま居る駅は輪を大きく、
     コンテクストページでは区間に「区間を読書中」の札を出す。
     駅や区間に触れると、その場所へ路線に沿って移る。 */
  function mapMarkup(o){
    const cur = o.current;
    return `
      <span class="line-name">［${esc(o.lineName || '')}］</span>
      <span class="line"></span>
      <button type="button" class="segment${cur === 1 ? ' on' : ''}" data-step="1" aria-label="コンテクストページへ"></button>
      ${cur === 1 ? '<span class="section-label">区間を読書中</span>' : ''}
      <button type="button" class="dot left${cur === 0 ? ' current' : ''}" data-step="0" aria-label="${attr(o.left)}"></button>
      <button type="button" class="dot right${cur === 2 ? ' current' : ''}" data-step="2" aria-label="${attr(o.right)}"></button>
      <button type="button" class="station left${cur === 0 ? ' current' : ''}" data-step="0">${esc(o.left)}</button>
      <button type="button" class="station right${cur === 2 ? ' current' : ''}" data-step="2">${esc(o.right)}</button>`;
  }

  /* ---------- 構造化データ（LLMO / GEO） ----------
     検索エンジンや生成AIが、何と何の関係を述べたページなのかを
     機械的に読み取れるようにする。 */
  const TYPE = { '映画': 'Movie', '書籍': 'Book', '音楽': 'MusicRecording', '人物': 'Person', '店': 'Restaurant', '宿': 'LodgingBusiness', '舞台': 'TheaterEvent' };
  function thing(w){
    const t = TYPE[w.type] || 'CreativeWork';
    /* 「黒澤明『天国と地獄』」のような題は、括弧の中だけを作品名にする */
    const inner = String(w.title || '').match(/『(.+?)』/);
    const o = { '@type': t, name: inner ? inner[1] : w.title };
    if (w.summary) o.description = w.summary;
    if (w.creator && t !== 'Person' && t !== 'Restaurant' && t !== 'LodgingBusiness') o.creator = { '@type': 'Person', name: w.creator };
    return o;
  }
  function jsonLd(e, url){
    const o = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: e.context.headline.replace(/\n/g, ''),
      alternativeHeadline: e.context.routeName,
      about: [thing(e.a), thing(e.b)],
      author: { '@type': 'Person', name: e.context.author },
      datePublished: e.createdAt,
      dateModified: e.updatedAt,
      inLanguage: 'ja',
      articleBody: S.plain(e.context.body).slice(0, 4000),
      url
    };
    const ai = safeUrl(e.context.aiUrl);
    if (ai) o.isBasedOn = ai;
    const pic = safeImg(e.a.image);
    if (pic && !pic.startsWith('data:')) o.image = new URL(pic, document.baseURI).href;
    return o;
  }
  function listLd(list, brand){
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: brand + ' のコンテクスト',
      itemListElement: list.map((e, i) => ({
        '@type': 'ListItem', position: i + 1,
        name: `${e.a.title} ＋ ${e.b.title}`,
        url: urlOf('c', e.context.slug)
      }))
    };
  }

  /* ---------- UniverseIt! のハッシュタグ ----------
     構成図 flow0921-2 のとおり、「# 言葉」を横に並べて折り返す。
     一つひとつが作品ページ（駅）の入口になる。
     「黒澤明『天国と地獄』」は括弧の中だけを言葉にする。 */
  function tagText(w){
    const inner = String(w.title || '').match(/『(.+?)』/);
    return inner ? inner[1] : w.title;
  }
  function buildTags(box){
    const works = S.works().sort((x, y) => S.byOrder(x, y));
    box.textContent = '';
    if (!works.length){
      const p = document.createElement('p');
      p.className = 'uv-none';
      p.textContent = 'まだ公開されたページがありません。ReMixIt! から新しいつながりを創ってください。';
      box.appendChild(p);
      return;
    }
    const frag = document.createDocumentFragment();
    works.forEach((w, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tag';
      b.dataset.work = w.slug;
      b.style.setProperty('--i', Math.min(i, 24));
      const h = document.createElement('span');
      h.className = 'h';
      h.textContent = '#';
      h.setAttribute('aria-hidden', 'true');
      const t = document.createElement('span');
      t.className = 't';
      t.textContent = tagText(w.work);
      b.append(h, t);
      frag.appendChild(b);
      frag.appendChild(document.createTextNode(' '));
    });
    box.appendChild(frag);
  }

  /* エディターのプレビューで使う線（エディターの見本の形） */
  const linePath = (n) => smooth(SHAPES[Math.abs(n | 0) % SHAPES.length]);

  window.BCRender = {
    pathOf, urlOf, thing, esc, clean, safeUrl, safeImg, art, roots, ad, workPage, contextPage, editorPage, listPage, comments, loginChip, search, page,
    mapMarkup, jsonLd, listLd, aboutLd, ABOUT_DESC, buildTags, tagText, readLabel, feedPage, feedStops, lineColor, linePath, ICON,
    PALETTE, SHAPE_COUNT: SHAPES.length
  };
})();

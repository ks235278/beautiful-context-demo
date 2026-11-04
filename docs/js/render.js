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
  /* 札や列の小さな絵は軽い控え（幅 300px。tools/make-thumbs.py が作り、prerender が有無を確かめる）。
     大きく見せる絵（frame）は元のまま。投稿された外の絵はそのまま */
  const thumb = (u) => { const m = /^img\/(?:works\/)?([^/]+\.jpg)$/.exec(u || ''); return m ? 'img/thumb/' + m[1] : u; };

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
  /* TOP へ戻るロゴ（作品・コンテクストは絵の上、ほかのページは紙の上）。紙の上では紺のロゴ */
  const topLogo = (cls) => `<a class="c-logo${cls ? ' ' + cls : ''}" href="#/" data-top aria-label="BEAUTIFUL CONTEXT（TOP へ戻る）"><img src="img/${(cls || '').split(' ').includes('on-paper') ? 'logo-navy' : 'logo'}.png" alt=""></a>`;

  /* ほかの区間への導線。demo-1 の「〜とのコンテクストを見る ›」と同じ形。
     text はふつうの文字（ここで逃がす）か、下の pairText・seeText が作ったもの（{ html, label }） */
  function tease(href, text, step){
    const t = text && text.html != null ? text.html : esc(text);
    const al = text && text.label != null ? ` aria-label="${attr(text.label)}"` : '';
    return step != null
      ? `<button type="button" class="tease" data-step="${step}"${al}>${t} <span aria-hidden="true">›</span></button>`
      : `<a class="tease" href="${attr(href)}"${al}>${t} <span aria-hidden="true">›</span></a>`;
  }
  /* 札の字の中の作品の名前は、途中で折らない（以前は「…天国と地|獄』」「…コンテクス|トを見る」と、名前や言葉の途中で折れていた）。
     行の途中から始まるかたまりを <span class="nb"> に包む（app.css の .tease .nb：一行に入るなら、ひとかたまりで次の行へ）。
     ・「A ＋ B」は B を包む。A は札の行の頭から始まるので、一行に入る長さなら包まなくても折れない
     ・「X とのコンテクストを見る」は言い回しを包む。X は行の頭から始まるので包まない
     折れるのは ＋ のまわりと、名前と言い回しのあいだだけ。札の幅より長い名前だけは、名前の中で折れる（B なら次の行の頭から）。
     包みの前後に空白が無いと、Chrome は読み上げる名前に空白を足すので、aria-label で包む前と同じ字にしておく */
  const nb = (s) => `<span class="nb">${esc(s)}</span>`;
  const pairText = (a, b) => ({ html: `${esc(a.title)} ＋ ${nb(b.title)}`, label: `${a.title} ＋ ${b.title}` });
  const seeText = (w) => ({ html: `${esc(w.title)}${nb('とのコンテクストを見る')}`, label: `${w.title}とのコンテクストを見る` });

  /* つながりの札（見本の絵入りの札）：二つの作品の小さな絵・路線の名・題・二つの作品。検索・作品（駅）・同じルーツで使う。
     step があれば data-step のボタン（作品ページから、いま来た区間へ）、なければそのつながりへのリンク */
  /* 読む時間（見本の「約20秒で読む」）。札の路線の名の行の右に小さく。本文の長さから（readLabel） */
  const rt = (c) => c && c.body ? `<i class="rt">${readLabel(c.body)}</i>` : '';
  function ctxCard(x, step, href, tag){
    const h = String(x.context.headline || '').replace(/\n/g, '');
    const pic = (w) => { const u = thumb(safeImg(w.image)); return u ? `<img src="${attr(u)}" alt="" loading="lazy" decoding="async">` : `<i>${esc(initial(w))}</i>`; };
    const inner = (tag ? `<span class="cc-tag">${esc(tag)}</span>` : '') + `<span class="cc-pics" aria-hidden="true">${pic(x.a)}${pic(x.b)}</span>` +
      `<span class="cc-t"><small><span class="rn">［${esc(x.context.routeName)}］</span>${rt(x.context)}</small><b>${esc(h)}</b><em>${esc(x.a.title)} ＋ ${nb(x.b.title)}</em></span>` +
      `<span class="cc-go" aria-hidden="true">›</span>`;
    const al = ` aria-label="${attr(h + '：' + x.a.title + ' ＋ ' + x.b.title)}"`;
    return step != null
      ? `<button type="button" class="ctx-card${tag ? ' is-next' : ''}" data-step="${step}"${al}>${inner}</button>`
      : `<a class="ctx-card${tag ? ' is-next' : ''}" href="${attr(href || pathOf('c', x.context.slug))}"${al}>${inner}</a>`;
  }

  /* 同じ作品をルーツに共有するコンテクスト */
  function roots(e, list){
    if (!list.length) return '';
    return `<div class="ctx-cards">${list.map(x => ctxCard(x)).join('')}</div>`;
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
  /* fetchpriority="low"：遅い回線では、絵より先に台本（js）を取る。触れて動くまでの間を縮める（開発会議 2026.10.23） */
  function frame(w, cls){
    const s = safeImg(w.image);
    return `<div class="${cls}">` + (s
      ? `<img src="${attr(s)}" alt="${attr(w.title)}" data-k="${attr(w.slug)}" decoding="async" fetchpriority="low">`
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
  function workPage(hit, e, o){
    o = o || {};
    const w = hit.work, nx = o.next || null, from = o.from || null, own = hit.contexts.map(x => x.entry);
    /* 札の順：次に行くつながりを先頭に（つぎへ。つながりを辿ると同じ行き先）、読んできたものは最後に。
       道の都合で次がこの作品のつながりでないとき（路線の乗り換え）は、札を見出しの上に分ける */
    const card = (x, tag) => ctxCard(x, e && x.id === e.id ? 1 : null, null, tag);
    const inOwn = !!nx && own.some(x => x.id === nx.id);
    const rest = own.filter(x => !nx || x.id !== nx.id);
    const list = rest.filter(x => !from || x.id !== from.id).concat(rest.filter(x => from && x.id === from.id));
    const lines = (nx && !inOwn ? `<div class="ctx-cards">${card(nx, 'つぎへ')}</div>` : '') +
      (own.length ? `<p class="meta more-label">この作品から延びるつながり　${own.length}本</p>
          <div class="ctx-cards">${inOwn ? card(nx, 'つぎへ') : ''}${list.map(x => card(x)).join('')}</div>` : '');
    /* 作品ページもコンテクストページと同じ形に（BC修正要望 2026.10.22「全ての Content は Context に」）。
       左にその作品、右はまだ誰も結んでいない席：＋ でエディターを開き、この作品から新しいつながりを創る */
    return `
      <article class="page wpage">
        ${backTop()}
        <div class="duo-hero">${topLogo('on-paper')}${topExtras()}<div class="duo">${frame(w, 'art')}<a class="duo-add" href="editor.html?from=${attr(encodeURIComponent(w.slug))}" aria-label="${attr(w.title)}から、新しいつながりを創る" title="この作品から、新しいつながりを創る（ReMixIt!・編集者向け）"><span aria-hidden="true">＋</span><small>つながりを創る</small></a></div>${navArrows()}</div>
        <div class="content w-lead">
          <p class="meta">${esc(w.type || '作品')}${w.year ? '・' + esc(w.year) + '年' : ''}　CURRENT STATION</p>
          <h2>${esc(w.title)}</h2>
          ${w.creator ? `<p class="by">${esc(w.creator)}</p>` : ''}
          ${w.summary ? `<p>${esc(w.summary)}</p>` : ''}
        </div>
        ${workJourney(o.journey)}
        <div class="content w-lines">
          ${lines}
          ${credit(w)}
        </div>
      </article>`;
  }
  /* 作品ページの CONTEXT JOURNEY（携帯）：パソコンの右の列と同じ並びを、見本 08 のように大きな絵で。
     ここまで＝読んできたつながり、いまここ＝この作品、つぎへ＝つながりを辿るの行き先（app.js workRows） */
  function workJourney(list){
    if (!list || list.length < 2) return '';
    const row = (x) => {
      const c = x.entry && x.entry.context, w = x.work;
      const inner = `<i class="jr-dot"></i><b>${esc(x.name)}</b><span class="jr-art">${mini(w || x.pic)}</span><span class="jr-t">` + (c
        ? `<small>［${esc(c.routeName)}］</small><strong>${esc(String(c.headline || '').replace(/\n/g, ''))}</strong><em>${esc(x.entry.a.title)} ＋ ${esc(x.entry.b.title)}</em>`
        : `<small>${esc(w.type || '作品')}${w.year ? '・' + esc(w.year) : ''}</small><strong>${esc(w.title)}</strong>${w.creator ? `<em>${esc(w.creator)}</em>` : ''}`) + `</span>`;
      return `<li${x.now ? ' class="now"' : ''}>${x.now ? `<span class="jr-row" aria-current="step">${inner}</span>`
        : `<a class="jr-row" href="${attr(x.href || pathOf('c', c.slug))}">${inner}</a>`}</li>`;
    };
    return `
        <section class="journey w-journey" aria-label="CONTEXT JOURNEY">
          <p class="meta">CONTEXT JOURNEY<a href="#/list">一覧で見る　→</a></p>
          <p class="jr-sub">この作品から、たどる道</p>
          <ol class="jr">${list.map(row).join('')}</ol>
        </section>`;
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
  /* フォローしている人の数。Supabase の数（editor_stats）があればそれ（BCSocial.followerCount）。無ければ見本の数 ＋ この端末のフォロー。
     編集者のページの数の段（見本の「記事数・フォロワー」）に出す。app.js が [data-follow-count] の中の b を書き換える */
  const followerNum = (ed, on) => window.BCSocial && BCSocial.followerCount ? BCSocial.followerCount(ed.id, ed.followers) : (+ed.followers || 0) + (on ? 1 : 0);
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
    /* 「…」：サーバーのコメント（id が uuid）にだけ。ほかの人のもの → 運営に知らせる・この人のコメントを表示しない（App Store 1.2）、
       自分のもの（確認待ちも）→ 削除する */
    const remote = !!(window.BCSocial && BCSocial.remote && BCSocial.remote());
    const more = (c) => {
      if (!remote || !c.uid || !/^[0-9a-f-]{36}$/i.test(c.id || '')) return '';
      const mine = !!(me && me.uid === c.uid);
      return `<button type="button" class="cm-more" data-cm-more aria-label="${mine ? 'このコメントを削除する' : 'このコメントについて（運営に知らせる・表示しない）'}">…</button>`;
    };
    const li = (c, wait) => `
      <li class="cm${wait ? ' pending' : ''}" data-cm-id="${attr(c.id || '')}" data-cm-uid="${attr(c.uid || '')}">${avatar(c.name)}<div>
        <p class="cm-h"><b>${esc(c.name)}</b><time>${esc(day(c.at))}</time>${wait ? '<span class="cm-wait">確認中・あなたにだけ表示</span>' : ''}${more(c)}</p>
        <p class="cm-t">${esc(c.text)}</p></div></li>`;
    const items = list.map(c => li(c)).join('') + (mine || []).map(c => li(c, true)).join('');
    const muted = S.mutedComments ? S.mutedComments(e) : 0;
    return `
      <section class="comments" id="comments" data-ctx="${attr(e.id)}">
        <p class="meta">COMMENTS<span class="cm-n">${list.length}</span></p>
        ${items ? `<ul class="cm-list">${items}</ul>` : muted ? '' : '<p class="cm-empty">まだコメントはありません。このつながりについて、最初のひとことを。</p>'}
        ${muted ? `<p class="cm-muted">表示しないことにした人のコメントが ${muted} 件あります。<button type="button" data-unmute>すべて表示する</button></p>` : ''}
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
  /* 参考・出典（先生 2026.10.26・27：コンテクストの末尾に参考URL）。本文の事実を確かめた先の一覧。
     見本の出典は sources.js（区間の slug ごと）。読み手が確かめに行けるよう、外への普通のリンクにする */
  const refsOf = (c) => (Array.isArray(c.sources) && c.sources.length ? c.sources : ((window.BC_SOURCES || {})[c.slug] || []))
    .filter(s => s && safeUrl(s.url));
  function refs(c){
    const list = refsOf(c);
    if (!list.length) return '';
    return `
          <section class="refs" aria-label="参考・出典">
            <p class="meta">参考・出典</p>
            <ol>${list.map(s => `<li><a href="${attr(safeUrl(s.url))}" target="_blank" rel="noopener">${esc(s.title || s.url)}</a>${s.site ? `<small>${esc(s.site)}</small>` : ''}</li>`).join('')}</ol>
          </section>`;
  }
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
          ? `${topLogo('on-paper today-logo')}<div class="today-bar"><b>TODAY'S EDITOR'S CHOICE</b><span><time>${esc(td.day)}</time>${dots}</span></div>${loginChip(o.me)}`
          : `${topLogo('on-paper')}<span class="only-sp">${loginChip(o.me)}</span>`}<div class="duo"><button type="button" class="duo-go" data-step="0" aria-label="${attr(e.a.title)}の作品ページへ">${frame(e.a, 'art')}</button><button type="button" class="duo-go" data-step="2" aria-label="${attr(e.b.title)}の作品ページへ">${frame(e.b, 'art')}</button><i class="swap" aria-hidden="true">↔</i></div>${nav}</div>
        <section class="context-lead">
          ${state}
          ${editorRow(o.editor, o.following)}
          <p class="route-label">${esc(c.label || 'CONTEXT')}　［${esc(c.routeName)}］</p>
          <h2>${esc(c.headline).replace(/\n/g, '<br>')}</h2>
          ${relationParts(c) ? `<div class="pair">${relationParts(c)}</div>` : ''}
          <button type="button" class="read" data-read>このつながりを読む<small>${t}</small><span aria-hidden="true">↓</span></button>
          <i class="story-cue" aria-hidden="true"></i>
        </section>
        ${sourceCards(e)}
        ${journey(o.journey)}
        <article class="context-body" id="story">
          <p class="meta">CONTEXT STORY</p>
          ${story}
          ${axes(c)}
          ${ai ? `<p class="source">この解説は生成AIの出力をもとにしています<a href="${attr(ai)}" target="_blank" rel="noopener nofollow">${esc(ai)}</a></p>` : ''}
          ${refs(c)}
          <p class="byline">${esc(o.editor ? o.editor.name : c.author)}　·　${esc(new Date(e.updatedAt).toLocaleDateString('ja-JP'))}</p>
          ${comments(e, o.comments || S.visibleComments(e), o.mine, o.me)}
          ${rel.length ? `<p class="meta more-label">同じ作品から出るつながり</p>${roots(e, rel)}` : ''}
          ${ad(adItem)}
          ${credit(e.a)}${credit(e.b)}
          ${nextCtx(o.journey)}
          ${o.rail && o.rail.length ? `
          <section class="ctx-rail" aria-label="この先のつながり">
            <p class="meta more-label">この先のつながり</p>
            <ol class="rail" id="rail">${feedStops(o.rail, 0, o.railBatch || 12, true)}</ol>
            <div class="rail-more" id="railMore" aria-hidden="true"></div>
          </section>` : ''}
          ${cfoot()}
        </article>
      </article>`;
  }
  /* 二つの作品の札（見本の SOURCE CONNECTION）。題の下に、左右の作品を絵・種類・名前・作り手・ひとことで。
     触れるとその作品（駅）のページへ（上の二枚の絵と同じ data-step）。絵には data-k を付けない（ページが替わるときに運ぶ絵は上の二枚だけ） */
  function sourceCards(e){
    const card = (w, step) => {
      const s = thumb(safeImg(w.image));
      return `<button type="button" class="src" data-step="${step}" aria-label="${attr(w.title)}の作品ページへ">` +
        (s ? `<img src="${attr(s)}" alt="" loading="lazy" decoding="async">` : `<span class="ph">${esc(initial(w))}</span>`) +
        `<span class="src-t"><small>${esc(w.type || '作品')}${w.year ? '・' + esc(w.year) : ''}</small><b>${esc(w.title)}</b>` +
        `${w.creator ? `<em>${esc(w.creator)}</em>` : ''}${w.summary ? `<span class="src-s">${esc(w.summary)}</span>` : ''}` +
        `<i aria-hidden="true">作品ページへ　→</i></span></button>`;
    };
    return `
        <section class="src-cards" aria-label="つながる二つの作品">
          <p class="meta">SOURCE CONNECTION</p>
          <div class="src-row">${card(e.a, 0)}<span class="src-link" aria-hidden="true">↔</span>${card(e.b, 2)}</div>
        </section>`;
  }
  /* 見本の CONTEXT JOURNEY（携帯）：つながりを辿る道の上の、一つ前・いま・その先。見本どおり縦に五つまで
     （以前は横に五つ並べていたが、一つが 60px ほどで題が四字ずつ折れていた）。一行に道の上の名と題の頭、二つの作品の小さな絵、›。
     触れるとその区間へ。パソコンでは右の列が同じものなので出さない（ink.css） */
  function journey(list){
    if (!list || list.length < 2) return '';
    const pic = (w) => { const u = thumb(safeImg(w.image)); return u ? `<img src="${attr(u)}" alt="" loading="lazy" decoding="async">` : `<i>${esc(initial(w))}</i>`; };
    const stop = (x) => {
      const e = x.entry;
      const inner = `<i class="jr-dot"></i><span class="jr-t"><b>${esc(x.name)}</b><small>${esc(String(e.context.headline || '').replace(/\n/g, ''))}</small></span>` +
        `<span class="jr-pics" aria-hidden="true">${pic(e.a)}${pic(e.b)}</span>`;
      return `<li${x.now ? ' class="now"' : ''}>${x.now ? `<span class="jr-row" aria-current="step">${inner}</span>`
        : `<a class="jr-row" href="${attr(x.href || pathOf('c', e.context.slug))}">${inner}</a>`}</li>`;
    };
    return `
        <section class="journey" aria-label="CONTEXT JOURNEY">
          <p class="meta">CONTEXT JOURNEY<a href="#/list">一覧で見る　→</a></p>
          <p class="jr-sub">このつながりから、たどる道</p>
          <ol class="jr">${list.map(stop).join('')}</ol>
        </section>`;
  }
  /* 見本の「次に読む CONTEXT」：読み終わりに、つながりを辿る道の次の区間（CONTEXT JOURNEY の「つぎへ」）を札で一つ。
     この先のつながり（B の駅から延びる路線）の前に置く */
  function nextCtx(list){
    const i = (list || []).findIndex(x => x.now), nx = i >= 0 && list[i + 1];
    if (!nx) return '';
    return `
          <section class="next-ctx" aria-label="次に読むつながり">
            <p class="meta">NEXT CONTEXT<small>次に読むつながり</small></p>
            ${ctxCard(nx.entry, null, nx.href)}
          </section>`;
  }
  /* コンテクストページのいちばん下：検索などから来た人が、このメディアのどこへでも行ける小さな入口 */
  const cfoot = () => `
          <nav class="c-foot" aria-label="Beautiful Context の案内"><span><a href="about/">Beautiful Context とは</a> ·</span> <span><a href="#/today" data-home>Today's Editor's Choice</a> ·</span> <span><a href="#/list">つながりの一覧</a> ·</span> <span><a href="#/search">言葉で辿る</a></span></nav>`;

  /* ---------- 編集者のページ ----------
     名前・ひとこと・フォロー。その人が選んだコンテクストの一覧 */
  const mini = (w) => { const s = thumb(safeImg(w.image)); return s ? `<img src="${attr(s)}" alt="" loading="lazy" decoding="async">` : `<span class="ph">${esc(initial(w))}</span>`; };
  function editorPage(ed, list, on){
    const items = list.map(e => `
      <a class="ed-item" href="${attr(pathOf('c', e.context.slug))}">
        <span class="ed-thumbs">${mini(e.a)}${mini(e.b)}</span>
        <span class="ed-txt"><small><span class="rn">［${esc(e.context.routeName)}］</span>${rt(e.context)}</small><b>${esc(e.context.headline).replace(/\n/g, '')}</b>
          <span>${esc(e.a.title)} ＋ ${esc(e.b.title)}</span></span></a>`).join('');
    /* マイページ（前田先生の MyBeautifulContext.pdf）：その人の写真を大きく、「〇〇の BEAUTIFUL CONTEXT」、
       フォローと note へのリンク、その人が選んだつながり。写真がなければ、頭文字の丸を黒地に置く */
    const pic = safeImg(ed.photo);
    const note = /^[A-Za-z0-9_]{1,40}$/.test(ed.note || '') ? ed.note : '';
    return `
      <article class="page text-page editor-page">
        ${backTop()}${topLogo('on-paper')}${topExtras()}
        <div class="ed-cover${pic ? '' : ' empty'}">${pic
          ? `<img src="${attr(pic)}" alt="${attr(ed.name)}" decoding="async">`
          : avatar(ed.mark || ed.name, 'big')}<span class="ed-down" aria-hidden="true"></span></div>
        <div class="content">
          <div class="ed-head">
            <h2 class="ed-title"><span>${esc(ed.name)}の</span> <b>BEAUTIFUL CONTEXT</b></h2>
            <p class="meta">${esc(ed.role || 'EDITOR')}</p>
            ${ed.bio ? `<p class="ed-bio">${esc(ed.bio)}</p>` : ''}
            <dl class="ed-stats"><div><dt>つながり</dt><dd>${list.length}</dd></div><div data-follow-count="${attr(ed.id)}"><dt>フォロワー</dt><dd><b>${followerNum(ed, on)}</b></dd></div></dl>
            <div class="ed-acts">${followBtn(ed, on)}${note
              ? `<a class="note-link" href="https://note.com/${attr(note)}" target="_blank" rel="noopener"><b>note</b><span>note.com/${esc(note)}</span></a>` : ''}</div>
          </div>
          <h3 class="ed-chose">${esc(ed.name)}が選んだつながり</h3>
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
            <span class="ls-works only-pc">${[e.a, e.b].map(w => `<span class="ls-w">${mini(w)}<span><b>${esc(w.title)}</b>${w.creator ? `<small>${esc(w.creator)}</small>` : ''}</span></span>`).join('')}</span>
            <span class="ed-txt"><small><span class="rn">［${esc(c.routeName)}］</span>${now ? '<i class="ls-mark now">いまここ</i>' : done ? '<i class="ls-mark">読んだ</i>' : ''}${rt(c)}</small>
              <b>${esc(c.headline).replace(/\n/g, '')}</b>
              <span>${from ? `${esc(tagText(from))}から分岐　` : ''}${esc(e.a.title)} ＋ ${esc(e.b.title)}</span></span></a></li>`;
    }).join('');
    return `
      <article class="page list-page">
        ${backTop()}${topLogo('on-paper')}${topExtras('ALL CONTEXTS')}
        <div class="content">
          <header class="ip-hero ls-hero"><i class="ip-art" aria-hidden="true"></i>
            <p class="meta">CONTEXT</p>
            <p class="ls-en only-pc">ALL CONTEXTS<small>BEAUTIFUL CONTEXT</small></p>
            <h2><span class="only-pc">すべての文脈</span><span class="only-sp">すべてのつながりから、<br>新しい視点を見つける。</span></h2>
            <p class="ls-lead"><span class="only-pc">映画・小説・音楽・美術・人・社会──<br>あらゆる作品と出来事が、思いがけないつながりで出会う。</span><span class="only-sp">小説・映画・音楽・アートなど、<br>ことばから広がる多様な文脈をめぐる旅。</span></p>
          </header>
          <div class="ls-bar">
            <form class="seek ls-seek" role="search" data-ls-seek>
              ${ICON.seek}<input type="search" name="q" placeholder="一覧から探す（作品・人・言葉）" enterkeyhint="search" aria-label="一覧から探す">
              <button type="submit" class="seek-go only-pc" aria-label="一覧から探す"><span>検索</span><i aria-hidden="true">→</i></button>
            </form>
            <div class="ls-cats" role="group" aria-label="種類で分ける">
              <button type="button" class="on" data-cat="" aria-pressed="true">すべて</button>
              <button type="button" data-cat=":read" aria-pressed="false">読んだ</button>
              ${cats.map(k => `<button type="button" data-cat="${attr(k)}" aria-pressed="false">${esc(k)}</button>`).join('')}
            </div>
          </div>
          <p class="ls-count">${items.length} のつながり　·　読んだ ${read}</p>
          <ol class="ls" id="ls">${rows}</ol>
          <p class="ls-none" id="lsNone" hidden>見つかりませんでした。別の言葉で探してみてください。</p>
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
      const via = c || (it.via && it.via.context);
      const href = pathOf('w', it.slug, via ? '?c=' + encodeURIComponent(via.slug) : '');
      return `
        <li class="stop${n === 0 ? ' first' : ''}${it.branch ? ' branch' : ''}${!c && n > 0 ? ' newline' : ''}">
          ${(!c && n > 0) || it.jump ? `<p class="transfer"><span>別の路線へ</span></p>` : ''}
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

  /* 見本の携帯の上の帯：ロゴの下の一言と、右上の Login（パソコンは左の列にログインがある。ink.css 第32段） */
  const topExtras = (tag) => `${tag ? `<p class="ip-tag only-sp">${esc(tag)}</p>` : ''}<span class="only-sp">${loginChip(window.BCSocial ? BCSocial.me() : null)}</span>`;
  /* ---------- 検索 ---------- */
  /* 見本の「注目のキーワード」：作品の種類（映画・書籍・人物…）を、多い順に。触れるとその言葉で辿る */
  function keywords(q){
    const n = {};
    /* 「映画・ドラマ」のような種類は、映画とドラマに分けて数える */
    S.works().forEach(({ work: w }) => String(w.type || '').split('・').filter(Boolean).forEach(t => { n[t] = (n[t] || 0) + 1; }));
    const top = Object.keys(n).sort((x, y) => n[y] - n[x]).slice(0, 8);
    if (!top.length) return '';
    return `<p class="seek-keys"><small class="only-sp">注目のキーワード</small><a class="only-pc" href="#/search"${top.includes(q) ? '' : ' aria-current="true"'}>すべて</a>${top.map(k =>
      `<a href="#/search?q=${encodeURIComponent(k)}"${k === q ? ' aria-current="true"' : ''}>${esc(k)}</a>`).join('')}</p>`;
  }
  /* 見本の DISCOVERY：辿る道のはじめのほうに出てくる作品を、絵の札で横に並べる（触れるとその作品（駅）へ）。
     言葉を入れていなければ結果の場所に、入れていれば結果の下に置く（探した結果を押し下げない） */
  function discovery(q){
    const seen = new Set(), list = [];
    S.trail().some(({ entry: e }) => { [e.a, e.b].forEach(w => { if (w && !seen.has(w.slug)) { seen.add(w.slug); list.push(w); } }); return list.length >= 10; });
    if (!list.length) return '';
    const card = (w) => { const u = thumb(safeImg(w.image));
      return `<a class="dc" href="${attr(pathOf('w', w.slug))}"><span class="dc-img">${u ? `<img src="${attr(u)}" alt="" loading="lazy" decoding="async">` : `<i>${esc(initial(w))}</i>`}</span>` +
        `<small>${esc(String(w.type || '作品').split('・')[0])}</small><b>${esc(w.title)}</b>${w.creator ? `<em>${esc(w.creator)}${w.year ? `（${esc(w.year)}）` : ''}</em>` : ''}</a>`; };
    return `
          <section class="disc${q ? ' only-sp' : ''}" aria-label="DISCOVERY">
            <p class="meta">DISCOVERY<a href="#/list">すべて見る　→</a></p>
            <h3 class="disc-t">作品から見つける</h3>
            <div class="dc-row">${list.slice(0, 10).map(card).join('')}</div>
          </section>`;
  }
  function search(q, res){
    const ctx = res.contexts.length ? `<div class="ctx-cards">${res.contexts.map(e => ctxCard(e)).join('')}</div>` : '';
    const works = res.works.map(({ work: w }) =>
      `<a class="chip" href="${attr(pathOf('w', w.slug))}"><span class="h">#</span>${esc(tagText(w))}</a>`).join('');
    const none = !res.contexts.length && !res.works.length;
    return `
      <article class="page text-page search-page">
        ${backTop()}${topLogo('on-paper')}${topExtras('言葉で、つながる。')}
        <div class="content">
          <header class="ip-hero sk-hero"><i class="ip-art" aria-hidden="true"></i>
          <p class="meta only-pc">SEARCH</p>
          <h2 class="seek-title"><span class="only-pc">知りたいことから、思いがけないつながりへ。</span><span class="only-sp">作品・作家・テーマを検索</span></h2>
          <p class="seek-sub"><span class="only-pc">映画・小説・音楽・人物・時代など、<br>さまざまなメディアと言葉を横断して、あなただけのつながりを見つけます。</span><span class="only-sp">小説から映画へ、言葉から新たなつながりを見つける。</span></p>
          <form class="seek big" role="search" data-seek>
            ${ICON.seek}<input type="search" name="q" value="${attr(q)}" placeholder="作品名・作家名・テーマなどで検索" enterkeyhint="search" aria-label="検索">
            <button type="submit" class="seek-go" aria-label="検索する"><span class="only-pc">検索する</span><i aria-hidden="true">→</i></button>
          </form>
          ${keywords(q)}
          </header>
          ${discovery(q)}
          ${q ? `<p class="meta only-sp">SEARCH RESULTS</p><h3 class="seek-res">「${esc(q)}」の検索結果<small>${res.contexts.length}件</small></h3>` : ''}
          ${none && q ? `<p>見つかりませんでした。別の言葉で辿ってみてください。</p>` : ''}
          ${ctx}
          ${works ? `<p class="meta more-label">作品</p><div class="chips">${works}</div>` : ''}
        </div>
      </article>`;
  }

  /* ---------- 読み物のページ ---------- */
  /* 「Beautiful Context とは」の説明文（検索結果の説明と、構造化データで同じものを使う） */
  const ABOUT_DESC = 'Beautiful Context（ビューティフル・コンテクスト）は、映画・本・音楽・人物・場所など、二つの作品のあいだにある意外なつながりを、編集者が一本の「コンテクスト」として届けるメディアです。読み方、生成AIの初稿の扱いを含む編集の方針、運営について。';
  function page(name){
    /* big：見本の大きな頭。左に金の札・大きな題・文、右に見本の絵（.ip-art。ink.css 第32段）。題は携帯とパソコンで別のことがある */
    /* 見本の題に替えても、ページの名前（検索エンジン・読み上げ）は見出しの中に残す（.vh は目に見えない） */
    const duo = (pc, sp) => sp ? `<span class="only-pc">${pc}</span><span class="only-sp">${sp}</span>` : pc;
    const shell = (title, body, kick, big) => `
      <article class="page text-page info-page info-${name}${big ? ' big' : ''}">
        ${backTop()}${topLogo('on-paper')}${big ? topExtras(big.tag) : ''}
        <div class="content">${big
          ? `<header class="ip-hero"><i class="ip-art" aria-hidden="true"></i>${kick ? `<p class="meta kick">${kick}</p>` : ''}<h2>${big.pc ? `<span class="vh">${title}</span>` : ''}${duo(big.pc || title, big.sp)}</h2>${big.head || ''}</header>`
          : `${kick ? `<p class="meta kick">${kick}</p>` : ''}<h2>${title}</h2>`}${body}</div>
      </article>`;
    /* 見本の紺の丸いボタン（→ 付き）と、縁だけのボタン */
    const pill = (href, text, sub, extra) => `<a class="pill${sub ? ' sub' : ''}" href="${attr(href)}"${extra || ''}>${text}<i aria-hidden="true">→</i></a>`;
    /* About（開発会議 2026.10.23：検索エンジンが BC を「カードのデータベース」としか読めていないため、最優先で用意） */
    if (name === 'about') return shell('Beautiful Context とは', `
      <p class="lead only-sp">Beautiful Context（ビューティフル・コンテクスト）は、映画・本・音楽・人物・場所など、二つの作品のあいだにある意外なつながりを、編集者が一本の「コンテクスト」として書き、届けるメディアです。</p>
      <p class="meta ab-feat-h">BEAUTIFUL CONTEXT の <em>3</em>つの特徴</p>
      <ol class="ab-feats big-feats" role="list">
        <li class="f-uni"><small>01</small><b>辿る</b><span>UniverseIt! ── 言葉から、既にある区間を辿る</span><img class="only-pc" src="img/deco/ab-f1.png" alt="" loading="lazy"></li>
        <li class="f-read"><small>02</small><b>読む</b><span>作品の駅から、二駅間の区間へ。区間を読んで、別の駅へ</span><img class="only-pc" src="img/deco/ab-f2.png" alt="" loading="lazy"></li>
        <li class="f-remix"><small>03</small><b>創る</b><span>ReMixIt! ── 二つの作品の間に、新しい区間をつくる</span><img class="only-pc" src="img/deco/ab-f3.png" alt="" loading="lazy"></li>
      </ol>
      <p>たとえば、ピアニストのグレン・グールドが生涯の愛読書にしていたのが、夏目漱石の『草枕』だったこと。二つの作品のどちらにも属さないその関係を、独立した一本の読み物として読めるようにしています。</p>
      <p>私たちは、作品を「駅」、二つの作品のあいだにある関係を「区間」と呼んでいます。駅にあたる作品は、それぞれの作者や権利者のものです。Beautiful Context がつくるのは、駅と駅のあいだの区間のほうです。区間を一本読み終えると次の駅に着き、そこからまた別の区間へ。作品から作品へ、つながりを辿っていけます。</p>
      <h3>読み方</h3>
      <ul>
        <li>開くと、まず「Today's Editor's Choice」が表示されます。編集者がその日に選んだコンテクストです。</li>
        <li>読み終わりの「つながりを辿る」を押すと、いま読んだ区間の先にある駅（作品）へ進み、そこから次のコンテクストへ続きます。</li>
        <li>左上のロゴを押すと「つながりの一覧」が開きます。すべてのコンテクストが、辿る順に並んでいます。</li>
        <li>メニューの「縦スクロールで観る」では、一枚ずつ上へ払いながら辿れます（試作）。</li>
        <li>「UniverseIt!」では、すべての作品の言葉から辿り始められます。「言葉で辿る」で検索もできます。</li>
      </ul>
      <h3>編集者について</h3>
      <p>コンテクストを選び、書くのは、編集の経験をもつ編集者です。真・善・美──確かめられる事実に立ち、作品への敬意を保ち、読んで美しいと感じられる一本だけを公開します。</p>
      <p>いま公開しているコンテクストの多くは、生成AIが書いた初稿です。各ページに「生成AIの初稿・編集者の確認前」と記し、編集者が事実と出典を確かめたものは「確認済み」に変わります。公開されたコンテクストには、選んだ編集者の名前を記しています。</p>
      <h3>つくる人へ</h3>
      <p>「ReMixIt!」では、どなたでも二つの作品のあいだにあるつながりを提案できます。長い解説は要りません。大切なのは文章の量ではなく、つながりを見つける感覚です。二つを結びつけ、その関係の面白さが短く伝われば、それで一本になります。</p>
      <p>編集者のアカウントは、いまのところ招待制です。</p>
      <h3>運営</h3>
      <!-- ★ 先生が埋める欄：会社名・連絡先（決まり次第、ここを書き換える） -->
      <p class="org">運営：（会社名）<br>代表：前田邦宏<br>連絡先：info@beautifulcontext.com（準備中）</p>
      ${tease('#/terms', '利用規約・プライバシー')}
      ${tease('#/credits', '画像の出典')}
      ${tease('#/ad', '広告枠のご案内')}`, 'BEAUTIFUL CONTEXT について', {
        tag: 'CONTEXTを、もっと深く、美しく',
        pc: '一つの作品から、<br>世界がつながっていく。',
        sp: '映画は、<br>つながりで<br>もっと面白くなる。',
        head: `<p class="lead only-pc">Beautiful Context（ビューティフル・コンテクスト）は、映画・本・音楽・人物・場所など、二つの作品のあいだにある意外なつながりを、編集者が一本の「コンテクスト」として書き、届けるメディアです。</p>
          <p class="lead only-sp">小説、歴史、人物、音楽──<br>作品をめぐる多様な文脈をたどり、<br>まだ見ぬ発見に出会える<br>メディアです。</p>
          <p class="ab-go">${pill('#/today', '今日のつながりを読む', 0, ' data-home')}</p>` });
    /* 辿る・読む・創るの三つは、About の三つの特徴と同じ線の印の札に（見本の Our Mission。2026.11.03 番号の丸から）。印の無い ol を
       Safari の読み上げが「リスト」と読まないことがあるので、role="list" を付ける（見た目は変わらない） */
    if (name === 'mission') return shell('Our Mission', `
      <p class="ms-mark"><span>OUR MANIFESTO</span></p>
      <section class="ms-mani"><i class="ms-mani-art only-pc" aria-hidden="true"></i>
      <h3 class="ms-h">あらゆる知が、<br class="only-sp">誰かの物語につながっている。</h3>
      <p>たとえば、自分が見た海外の映画に原作があり、それが日本の著名な映画監督によってすでに撮られていたと気づいたとき。その発見は、二つの作品のどちらにも属さない、独立した一つの読み物になる。</p>
      <p>作品は駅、コンテクストは二駅間の区間。駅にあたる作品やブランドは他者のものであり、ここで生み出すのは区間のほうである。</p>
      <p>関係の初稿は生成AIが書き、採否と最終稿は人が担う。二つを組み合わせるだけで、音楽の DJ のように、つながりを活かした美しい空間が編み出されていく。</p>
      </section>
      <p class="ms-mark"><span>OUR STORY</span></p>
      <ol class="ms-story" role="list">
        <li><img src="img/deco/ms-1.jpg" alt="" loading="lazy"><div><small>01</small><b>辿る</b><span>UniverseIt! ── 言葉から、既にある区間を辿る</span></div></li>
        <li><img src="img/deco/ms-2.jpg" alt="" loading="lazy"><div><small>02</small><b>読む</b><span>作品の駅から、二駅間の区間へ。区間を読んで、別の駅へ</span></div></li>
        <li><img src="img/deco/ms-3.jpg" alt="" loading="lazy"><div><small>03</small><b>創る</b><span>ReMixIt! ── 二つの作品の間に、新しい区間をつくる</span></div></li>
      </ol>
      <p class="motto">YOUR CONTEXT WILL VISUALIZE BY US</p>
      <p class="ab-go ms-go">${pill('#/today', '今日のつながりを読む', 0, ' data-home')}</p>`, 'OUR MISSION', {
        tag: "TODAY'S EDITOR'S CHOICE",
        pc: '世界を、<br>つながりで読み解く。',
        sp: '言葉で、<br>世界の見え方を<br>豊かにする。',
        head: '<p class="lead">意外な関係を持つ二つの情報を、つなぎ、読める場所をつくる。</p>' });
    if (name === 'terms') return shell('利用規約・<wbr>プライバシー', `
      <div class="tm-wrap"><nav class="tm-toc" aria-label="目次"><ol role="list"><li><button type="button" data-toc="tm-1" aria-current="true"><i>01</i>データの保存先</button></li><li><button type="button" data-toc="tm-2"><i>02</i>アクセス解析（外部送信）</button></li><li><button type="button" data-toc="tm-3"><i>03</i>ログインとコメント（外部送信）</button></li><li><button type="button" data-toc="tm-4"><i>04</i>Google・Apple でのログイン（外部送信）</button></li><li><button type="button" data-toc="tm-5"><i>05</i>コメントの通報と「表示しない」</button></li><li><button type="button" data-toc="tm-6"><i>06</i>アカウントの削除</button></li><li><button type="button" data-toc="tm-7"><i>07</i>画像と文章</button></li></ol></nav><div class="tm-body">
      <h3 id="tm-1"><small>01</small>データの保存先</h3>
      <p>作成したコンテクストや設定は、お使いの端末のブラウザ（localStorage）にだけ保存されます。サーバーへ送信することはありません。別の端末や別の人には見えません。</p>
      <p>ログインした場合のアカウント・表示名・フォロー・共感・コメントは、下の Supabase に保存されます。</p>
      <h3 id="tm-2"><small>02</small>アクセス解析（外部送信）</h3>
      <p>サイトの改善と利用状況の把握のため、Google LLC の「Google アナリティクス」を使っています。ページを開くと、閲覧したページのアドレス、参照元、おおよその地域、端末やブラウザの種類などの情報が、Cookie などを通じて Google に送信されます。氏名やメールアドレスなど、個人を直接特定する情報は送りません。</p>
      <p>送信される情報の扱いは <a href="https://policies.google.com/technologies/partner-sites?hl=ja" target="_blank" rel="noopener">Google のポリシー</a> をご覧ください。送信を止めたい場合は <a href="https://tools.google.com/dlpage/gaoptout?hl=ja" target="_blank" rel="noopener">Google アナリティクス オプトアウト アドオン</a> を使えます。</p>
      <h3 id="tm-3"><small>03</small>ログインとコメント（外部送信）</h3>
      <p>ログイン・フォロー・コメントのために、Supabase Inc. の「Supabase」を使っています。送信するのは、ログインに使うメールアドレス（確かめのコードやパスワードの再設定を届けるため）とパスワード（Supabase が復元できない形（ハッシュ）にして保存し、運営も見られません）、コメントに出す表示名、フォローした編集者、共感したコンテクスト、書いたコメントです。データは Supabase の東京リージョン（日本国内のサーバー）に保存されます。</p>
      <p>メールアドレスはログインのためだけに使い、ほかの読者には見えません。コメントは編集者が確かめてから、表示名とともに公開されます。ログインしないで読むときも、公開中のコメントやフォロワーの数を読むために Supabase へ接続します（このとき送られるのは通信に伴う IP アドレスやブラウザの種類などで、名前やメールアドレスは送りません）。扱いは <a href="https://supabase.com/privacy" target="_blank" rel="noopener">Supabase のプライバシーポリシー</a> をご覧ください。</p>
      <h3 id="tm-4"><small>04</small>Google・Apple でのログイン（外部送信）</h3>
      <p>「Google で続ける」「Apple で続ける」を選ぶと、Google LLC または Apple Inc. のログインの画面に移ります。そこから、メールアドレスと、アカウントの名前・プロフィール画像のアドレス（Apple では名前だけ。メールアドレスを隠す設定にすると、Apple の転送用のアドレス）を受け取り、上の Supabase に保存します。サイトに出すのは、ログインのあとで決めた表示名だけで、Google や Apple の名前・画像は表示しません。アカウントを削除すると、これらも消えます。どのアカウントでログインしたかは Google・Apple にも記録されます。扱いは <a href="https://policies.google.com/privacy?hl=ja" target="_blank" rel="noopener">Google のプライバシーポリシー</a>・<a href="https://www.apple.com/jp/legal/privacy/" target="_blank" rel="noopener">Apple のプライバシーポリシー</a> をご覧ください。</p>
      <h3 id="tm-5"><small>05</small>コメントの通報と「表示しない」</h3>
      <p>コメントは編集者が確かめてから表示します。表示されたコメントに問題があれば、コメントの「…」から運営に知らせてください（ログインしていなくても送れます）。運営が確かめ、この規約に反するものは表示を止めます。「…」から「表示しない」を選ぶと、その人のコメントがあなたの画面に出なくなります（相手には知らされません。コメント欄からいつでも戻せます）。自分のコメントは、同じ「…」からいつでも削除できます。</p>
      <h3 id="tm-6"><small>06</small>アカウントの削除</h3>
      <p>アカウントは、メニューの「アカウント」からいつでも削除できます。削除すると、メールアドレス・表示名・フォロー・共感と、書いたコメント（公開中のものも）がすぐに消え、元には戻せません。お送りいただいた通報・削除の依頼は、対応の記録として内容だけを残し、送った方との結びつき（アカウント・お名前・メールアドレス）を外します。</p>
      <h3 id="tm-7"><small>07</small>画像と文章</h3>
      <p>見本の作品画像は、作品紹介を目的として引用しています。著作権は各権利者に帰属します。出典は<a href="#/credits">画像の出典</a>にまとめています。見本の解説文は、確かめられる事実に基づいて書いた見本です。</p>
      <p>このメディアの目的と読み方は<a href="#/about">Beautiful Context とは</a>をご覧ください。</p></div></div>`, '<span class="only-pc tm-k"><span>BEAUTIFUL CONTEXT</span><span>TERMS &amp; PRIVACY</span></span><span class="only-sp">INFORMATION</span>', {
        tag: "TODAY'S EDITOR'S CHOICE",
        sp: '利用規約・<br>プライバシーポリシー',
        head: `<p class="tm-sub">物語と向き合うすべての方に、安心してご利用いただくために。</p><p class="lead">これはデモ版です。正式な利用規約とプライバシーポリシーは、サービス公開時に用意します。</p>` });
    if (name === 'credits'){
      /* 画像の出典。CC BY / BY-SA の表示義務もここで満たす */
      const rows = S.works(S.all()).filter(h => h.work.credit).map(({ work: w, slug }) => `
        <li><a href="${attr(pathOf('w', slug))}">${esc(w.title)}</a>
          <small>${esc(w.credit)}${safeUrl(w.creditUrl) ? `　<a href="${attr(safeUrl(w.creditUrl))}" target="_blank" rel="noopener nofollow">出典</a>` : ''}</small></li>`).join('');
      return shell('画像の出典', `
        <p class="lead">作品の画像は、作品紹介のための引用、または自由な利用が許された写真です。著作権は各権利者に帰属します。</p>
        <p>クリエイティブ・コモンズ（CC BY／CC BY-SA）の写真は、撮影者と条件をここに記しています。ポスター・表紙・キービジュアルは、デモでの作品紹介のために掲載しています。公開の前に権利を確かめ、必要なものは差し替えます。背景の墨と和紙の絵は、Beautiful Context のために制作したものです。</p>
        <ul class="credits">${rows}</ul>`, 'SOURCES', {});
    }
    if (name === 'ad') return shell('広告枠のご案内', `
      <p class="ms-mark is-left"><span>OUR VALUE</span></p>
      <h3>想定している仕組み</h3>
      <ol class="ab-feats rows" role="list">
        <li class="f-doc"><small>01</small><b>記事単位の枠</b><span>記事単位で販売する出稿枠。記事の主題と広告主の世界観が重なることを根拠にする</span></li>
        <li class="f-card"><small>02</small><b>購入と価格</b><span>クレジットカードで購入できる枠、表示の割合やタグ指定による価格設定（本番で実装）</span></li>
        <li class="f-edit"><small>03</small><b>管理画面で編集</b><span>管理画面から、枠の画像・文言・リンク先・表示の有無を編集できる（デモで動作）</span></li>
      </ol>
      ${tease('manage.html#ads', '管理画面で広告枠を見る')}`, '<span class="only-pc">FOR OUR PARTNERS</span><span class="only-sp">ADVERTISING<br>WITH CONTEXT</span>', {
        tag: 'FOR PARTNERS',
        pc: '文化のつながりが、<br>新しい価値を生み出す。',
        sp: '物語の力で、<br>ブランドを<br>もっと深く。',
        head: `<p class="lead">コンテクストページの読み終わりに、その区間の世界観と重なる広告を一枠だけ置きます。</p>
          <p class="ad-sub">映画・音楽・書籍・イベントなど、読み終えた人がその作品を買える・観られる・訪ねられる入口を置く。つながりを辿った先が、そのまま体験への入口になります。</p>` });
    /* DISCOVER MORE：辿る道のはじめの二本と、UniverseIt!・ReMixIt!（どの端末でも同じものが出る） */
    const card = (href, pic, kind, text, extra) => `<a class="nf-card" href="${attr(href)}"${extra || ''}><span class="nf-img">${pic
      ? `<img src="${attr(pic)}" alt="" loading="lazy" decoding="async">` : ''}</span><small>${kind}</small><b>${esc(text)}</b></a>`;
    const more = S.trail().slice(0, 2).map(({ entry: e }) =>
      card(pathOf('c', e.context.slug), safeImg(e.a.image) || safeImg(e.b.image), 'CONTEXT', String(e.context.headline || '').split('\n')[0])).join('');
    return shell('お探しのページは<br>見つかりませんでした。', `
      <section class="nf-more" aria-label="DISCOVER MORE">
        <p class="meta">DISCOVER MORE<small>ここからも辿れます</small></p>
        <div class="nf-cards">${more}${card('#/', 'img/deco/ink-scene.png', 'UNIVERSEIT!', 'すべての言葉から辿る', ' data-uni')}${card('editor.html?new=1', 'img/deco/ink-palms.png', 'REMIXIT!', 'つながりを創る', ' data-remix')}</div>
      </section>`, 'NOT FOUND', { tag: "TODAY'S EDITOR'S CHOICE", head: `<hr class="rule-d nf-rule">
        <p class="lead">お探しのページは移動したか、公開が終了した可能性があります。</p>
        <p class="nf-acts">${pill('#/today', '今日のつながりへ戻る', 0, ' data-home')}${pill('#/list', 'つながりの一覧へ', 1)}</p>
        <p class="after">はじめての方は<a href="#/about">Beautiful Context とは</a>へ。</p>` });
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
    const cite = refsOf(e.context).map(s => ({ '@type': 'CreativeWork', name: s.title || s.url, url: safeUrl(s.url), publisher: s.site ? { '@type': 'Organization', name: s.site } : undefined }));
    if (cite.length) o.citation = cite;
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
    pathOf, urlOf, thing, esc, clean, safeUrl, safeImg, thumb, art, roots, ad, workPage, contextPage, editorPage, listPage, comments, loginChip, search, page,
    mapMarkup, jsonLd, listLd, aboutLd, ABOUT_DESC, buildTags, tagText, readLabel, feedPage, feedStops, lineColor, linePath, ICON,
    PALETTE, SHAPE_COUNT: SHAPES.length
  };
})();

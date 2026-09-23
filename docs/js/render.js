/* 描画の共通部分。前田先生の構成図 flow0921-2 と demo-1 のとおり。

   作品ページ ……… 駅。作品固有の絵と解説だけを置く。
   コンテクストページ … 二駅間の区間。二枚の絵を並べ、手書き風の線が
                     渡って二つを結ぶ。読み終わりに出典と広告枠。 */
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

  const hash = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
  const PALETTE = ['#f2cf12', '#3447c9', '#d42b2b', '#b8792c', '#2f8f5b', '#c43f9a'];
  const lineColor = (e) => (e.context.line && /^#[0-9a-f]{6}$/i.test(e.context.line.color))
    ? e.context.line.color : PALETTE[hash(e.context.slug) % PALETTE.length];

  /* ---------- 手書き風の線 ----------
     左右に振れながら降りてくる線を、通過点から滑らかにつなぐ。
     形は四通り用意し、コンテクストごとに選ぶ。 */
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
  function squiggle(e){
    const n = e.context.line && Number.isInteger(+e.context.line.shape)
      ? Math.abs(+e.context.line.shape) % SHAPES.length : hash(e.context.slug) % SHAPES.length;
    return `<svg class="squiggle" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="${smooth(SHAPES[n])}" pathLength="1"/></svg>`;
  }

  function img(src, alt, cls){
    const s = safeImg(src);
    return s ? `<img class="${cls || ''}" src="${attr(s)}" alt="${attr(alt || '')}" loading="lazy" decoding="async">` : '';
  }
  function initial(work){ return (work.title || '?').replace(/[『』「」]/g,'').trim().charAt(0) || '?'; }

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

  const backTop = (label) => `<header class="back-top"><button type="button" class="back-close" data-close aria-label="戻る">${ICON.back}<b>${esc(label || '戻る')}</b></button></header>`;

  /* 同じ作品をルーツに共有するコンテクストへの、文字だけの導線 */
  function roots(e, list){
    if (!list.length) return '';
    return `<nav class="roots" aria-label="同じルーツを持つコンテクスト">` + list.map(x => {
      const shared = [x.a.slug, x.b.slug].includes(e.a.slug) ? e.a : e.b;
      return `<a href="#/c/${encodeURIComponent(x.context.slug)}" style="--lc:${lineColor(x)}">
        <small>${esc(shared.title)} から</small>
        <span>${esc(x.a.title)} ＋ ${esc(x.b.title)}</span><i aria-hidden="true">→</i></a>`;
    }).join('') + `</nav>`;
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

  function pageFoot(brand){
    return `
      <footer class="pfoot">
        <nav><a href="#/mission">Our Mission</a><a href="#/ad">広告枠のご案内</a>
          <a href="#/terms">利用規約・プライバシー</a><a href="manage.html">運営者メニュー</a></nav>
        <p>© ${esc(brand)}</p>
      </footer>`;
  }

  function relationParts(c){
    return String(c.relation || '').split('──').map(s => s.trim()).filter(Boolean)
      .map(s => `<span>${esc(s)}</span>`).join('');
  }

  /* 画像。data-k は作品の目印で、ページが替わるときに同じ作品の絵を
     前のページの位置から次のページの位置へ運ぶために使う。 */
  function frame(w, cls){
    const s = safeImg(w.image);
    return `<div class="${cls}">` + (s
      ? `<img src="${attr(s)}" alt="${attr(w.title)}" data-k="${attr(w.slug)}" decoding="async">`
      : `<span class="ph">${esc(initial(w))}<small>${esc(w.type || '作品')}</small></span>`) + `</div>`;
  }

  /* ---------- 作品ページ（駅） ----------
     demo-1 の作品ページ A／B。作品固有の解説だけを置き、
     他作品との関係はコンテクストページで読む。 */
  function workPage(hit, e, brand){
    const w = hit.work;
    const side = e && e.b.slug === w.slug ? 'b' : 'a';
    const other = e ? e[side === 'a' ? 'b' : 'a'] : null;
    const others = hit.contexts.filter(x => !e || x.entry.id !== e.id);
    const list = others.map(({ entry, side: sd }) => {
      const o = entry[sd === 'a' ? 'b' : 'a'];
      return `<a class="mini" href="#/c/${encodeURIComponent(entry.context.slug)}" style="--lc:${lineColor(entry)}">
        ${safeImg(o.image) ? img(o.image, '', 'mini-img') : `<span class="mini-img st-ph">${esc(initial(o))}</span>`}
        <span class="mini-txt"><small>［${esc(entry.context.routeName)}］</small>
        <b>${esc(o.title)}</b><span>${esc(entry.context.headline.replace(/\n/g, ''))}</span></span></a>`;
    }).join('');
    return `
      <article class="page wpage" data-pos="${side === 'a' ? 0 : 2}" style="--lc:${e ? lineColor(e) : 'var(--gold)'}">
        ${backTop()}
        <div class="w-hero">${frame(w, 'px')}</div>
        <div class="page-in rise">
          <p class="meta">${esc(w.type || '作品')}${w.year ? '・' + esc(w.year) + '年' : ''}　CURRENT STATION</p>
          <h1>${esc(w.title)}</h1>
          ${w.creator ? `<p class="dim">${esc(w.creator)}</p>` : ''}
          ${w.summary ? `<p class="lead-s">${esc(w.summary)}</p>` : ''}
          <p class="note-s">このページには作品固有の解説だけを載せています。他の作品との関係は、コンテクストページで読みます。</p>
          ${e ? `<button type="button" class="tease" data-step="1">${esc(other.title)} とのコンテクストを見る <span aria-hidden="true">›</span></button>` : ''}
          ${list ? `<p class="meta" style="margin-top:30px">この駅から延びるほかの区間　${others.length}本</p><div class="minis">${list}</div>` : ''}
          ${pageFoot(brand)}
        </div>
      </article>`;
  }

  /* ---------- コンテクストページ A―B ----------
     二作品の間に置かれる独立したページ。絵を二枚並べ、
     その上を手書き風の線が渡って二つを結ぶ。 */
  function contextPage(e, adItem, brand){
    const c = e.context;
    const mins = S.readingMinutes(c.body);
    const ai = safeUrl(c.aiUrl);
    const rel = S.related(e);
    const state = !S.isVisible(e)
      ? `<p class="back-state">${e.status === 'private' ? '非公開' : '一時非表示'}のコンテクストです。読者には表示されていません。</p>` : '';
    return `
      <article class="page cpage" data-pos="1" style="--lc:${lineColor(e)}">
        ${backTop()}
        <div class="duo-hero"><div class="duo">${frame(e.a, 'art')}${frame(e.b, 'art')}${squiggle(e)}</div></div>
        <div class="page-in rise">
          ${state}
          <div class="c-lead">
            <p class="route-label">${esc(c.label || 'CONTEXT')}　［${esc(c.routeName)}］　約${mins}分</p>
            <h1 class="c-head">${esc(c.headline).replace(/\n/g, '<br>')}</h1>
            ${relationParts(c) ? `<div class="pair">${relationParts(c)}</div>` : ''}
            <button type="button" class="read" data-read>このつながりを読む　約${mins}分 <span aria-hidden="true">↓</span></button>
          </div>
          <section class="c-body" id="story">
            <p class="meta">CONTEXT STORY</p>
            ${clean(c.body)}
          </section>
          ${ai ? `<p class="source">この解説は生成AIの出力をもとにしています<a href="${attr(ai)}" target="_blank" rel="noopener nofollow">${esc(ai)}</a></p>` : ''}
          ${rel.length ? `<section class="more"><h2>同じルーツのコンテクスト</h2>${roots(e, rel)}</section>` : ''}
          ${ad(adItem)}
          <p class="byline">${esc(c.author)}　·　${esc(new Date(e.updatedAt).toLocaleDateString('ja-JP'))}</p>
          ${pageFoot(brand)}
        </div>
      </article>`;
  }

  /* ---------- 検索 ---------- */
  function search(q, res){
    const ctx = res.contexts.map(e => `
      <a class="mini" href="#/c/${encodeURIComponent(e.context.slug)}" style="--lc:${lineColor(e)}">
        ${safeImg(e.a.image) ? img(e.a.image, '', 'mini-img') : `<span class="mini-img st-ph">${esc(initial(e.a))}</span>`}
        <span class="mini-txt"><small>［${esc(e.context.routeName)}］</small>
        <b>${esc(e.a.title)} ＋ ${esc(e.b.title)}</b><span>${esc(e.context.headline.replace(/\n/g, ''))}</span></span></a>`).join('');
    const works = res.works.map(({ work: w }) =>
      `<a class="chip" href="#/w/${encodeURIComponent(w.slug)}">${esc(w.title)}</a>`).join('');
    const none = !res.contexts.length && !res.works.length;
    return `
      <article class="page search-page">
        ${backTop()}
        <div class="page-in">
          <form class="seek big" role="search" data-seek>
            ${ICON.seek}<input type="search" name="q" value="${attr(q)}" placeholder="言葉で辿る" enterkeyhint="search" aria-label="検索">
          </form>
          ${q ? `<p class="meta">「${esc(q)}」のつながり　${res.contexts.length}件</p>` : ''}
          ${none && q ? `<p class="dim">見つかりませんでした。別の言葉で辿ってみてください。</p>` : ''}
          <div class="minis">${ctx}</div>
          ${works ? `<p class="meta" style="margin-top:26px">作品</p><div class="chips">${works}</div>` : ''}
        </div>
      </article>`;
  }

  /* ---------- 読み物のページ ---------- */
  function page(name, brand){
    const shell = (title, body) => `
      <article class="page text-page">
        ${backTop()}
        <div class="page-in"><h1>${title}</h1>${body}${pageFoot(brand)}</div>
      </article>`;
    if (name === 'mission') return shell('Our Mission', `
      <p class="lead">意外な関係を持つ二つの情報を、つなぎ、読める場所をつくる。</p>
      <p>たとえば、自分が見た海外の映画に原作があり、それが日本の著名な映画監督によってすでに撮られていたと気づいたとき。その発見は、二つの作品のどちらにも属さない、独立した一つの読み物になる。</p>
      <p>作品は駅、コンテクストは二駅間の区間。駅にあたる作品やブランドは他者のものであり、ここで生み出すのは区間のほうである。</p>
      <p>関係の初稿は生成AIが書き、採否と最終稿は人が担う。二つを組み合わせるだけで、音楽の DJ のように、つながりを活かした美しい空間が編み出されていく。</p>
      <ol class="steps">
        <li><b>辿る</b>UniverseIt! ── 流れる見出しから、既にある区間を辿る</li>
        <li><b>読む</b>作品の駅から、二駅間の区間へ。区間を読んで、別の駅へ</li>
        <li><b>創る</b>ReMixIt! ── 二つの作品の間に、新しい区間をつくる</li>
      </ol>
      <p class="motto">YOUR CONTEXT WILL VISUALIZE BY US</p>`);
    if (name === 'terms') return shell('利用規約・プライバシー', `
      <p class="lead">これはデモ版です。正式な利用規約とプライバシーポリシーは、サービス公開時に用意します。</p>
      <h2>データの保存先</h2>
      <p>作成したコンテクストや設定は、すべてお使いの端末のブラウザ（localStorage）にだけ保存されます。サーバーへ送信することはありません。別の端末や別の人には見えません。</p>
      <h2>計測</h2>
      <p>アクセス解析やトラッキングは行っていません。</p>
      <h2>画像と文章</h2>
      <p>見本の作品画像は、作品紹介を目的として引用しています。著作権は各権利者に帰属します。見本の解説文は、確かめられる事実に基づいて書いた見本です。</p>`);
    if (name === 'ad') return shell('広告枠のご案内', `
      <p class="lead">コンテクストページの読み終わりに、その区間の世界観と重なる広告を一枠だけ置きます。</p>
      <p>映画・音楽・書籍・イベントなど、読み終えた人がその作品を買える・観られる・訪ねられる入口を置く。つながりを辿った先が、そのまま体験への入口になります。</p>
      <h2>想定している仕組み</h2>
      <ul>
        <li>記事単位で販売する出稿枠。記事の主題と広告主の世界観が重なることを根拠にする</li>
        <li>クレジットカードで購入できる枠、表示の割合やタグ指定による価格設定（本番で実装）</li>
        <li>管理画面から、枠の画像・文言・リンク先・表示の有無を編集できる（デモで動作）</li>
      </ul>
      <p><a class="add-b" href="manage.html#ads">管理画面で広告枠を見る</a></p>`);
    return shell('ページが見つかりません', `
      <p class="lead">お探しのページは移動したか、公開が終了した可能性があります。</p>
      <p><a class="add-b" href="#/" data-home>UniverseIt! へ戻る</a></p>`);
  }

  /* ---------- 下のドックの路線図 ---------- */
  /* 路線図。左の駅が A、右の駅が B、そのあいだの区間がコンテクスト。
     駅や区間に触れると、その場所へ路線に沿って移る。 */
  function mapMarkup(o){
    const cur = o.current;
    return `
      <span class="line-name">［${esc(o.lineName || '')}］</span>
      <span class="line"></span>
      <button type="button" class="segment${cur === 1 ? ' on' : ''}" data-step="1" aria-label="コンテクストページへ"></button>
      <button type="button" class="section-label${cur === 1 ? ' on' : ''}" data-step="1">${cur === 1 ? '区間を読書中' : esc(o.label || 'CONTEXT')}</button>
      <span class="dot left${cur === 0 ? ' current' : ''}"></span>
      <span class="dot right${cur === 2 ? ' current' : ''}"></span>
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
    if (pic && !pic.startsWith('data:')) o.image = new URL(pic, location.href).href;
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
        url: location.href.split('#')[0] + '#/c/' + encodeURIComponent(e.context.slug)
      }))
    };
  }

  /* ---------- UniverseIt! の見出し ----------
     すべて実在する公開ページに対応する。 */
  function cloudPool(){
    const out = [];
    S.visible().forEach(e => {
      out.push({ text: e.context.routeName, kind: 'ctx', ctx: e.context.slug });
      const head = (e.context.headline || '').split('\n')[0].replace(/[、。]$/, '');
      if (head) out.push({ text: head, kind: 'ctx', ctx: e.context.slug });
    });
    /* 「黒澤明『天国と地獄』」は括弧の中だけを見出しにする。外すと語がつながって読めない */
    S.works().forEach(w => {
      const inner = String(w.work.title || '').match(/『(.+?)』/);
      out.push({ text: inner ? inner[1] : w.work.title, kind: 'work', work: w.slug });
    });
    return out;
  }

  const SIZES = [12, 13, 14, 16, 18, 20];
  const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(p => p[1]);

  /* 路線図。見出しはそれぞれの線を走る列車で、線どうしが交わるところが
     作品を共有している場所にあたる。駅（作品名）は縦書きで、
     ホームの駅名標のように立てる。 */
  const TRACKS = [
    { dir:'d', angle: -57, at:'20%', dur: 98,  rev:false, kind:'ctx',  o:.42 },
    { dir:'d', angle: -26, at:'41%', dur: 76,  rev:true,  kind:'ctx',  o:1   },
    { dir:'d', angle:  -7, at:'60%', dur:112,  rev:false, kind:'any',  o:.55 },
    { dir:'d', angle:  21, at:'76%', dur: 84,  rev:true,  kind:'ctx',  o:.9  },
    { dir:'d', angle:  46, at:'11%', dur:124,  rev:false, kind:'any',  o:.38 },
    { dir:'v', at:'17%', dur: 94,  rev:false, kind:'work', o:.5  },
    { dir:'v', at:'53%', dur:122,  rev:true,  kind:'work', o:.34 },
    { dir:'v', at:'84%', dur: 78,  rev:false, kind:'work', o:.62 }
  ];

  const PER_TRACK = 16;

  function makeTag(it, i){
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tag k-' + it.kind;   /* k- を付けるのは、別の class と衝突させないため */
    b.style.fontSize = SIZES[i % SIZES.length] + (it.kind === 'ctx' ? 2 : 0) + 'px';
    if (it.kind === 'work'){
      const h = document.createElement('span'); h.className = 'h'; h.textContent = '#';
      b.appendChild(h);
      b.dataset.work = it.work;
    } else {
      b.dataset.ctx = it.ctx;
    }
    b.appendChild(document.createTextNode(it.text));
    return b;
  }

  function buildCloud(cloud){
    const items = cloudPool();
    cloud.textContent = '';
    if (!items.length){
      const p = document.createElement('p');
      p.className = 'uv-none';
      p.innerHTML = 'まだ公開されたページがありません。<br>新しいつながりを創ってください。';
      cloud.appendChild(p);
      return;
    }

    const ctxItems  = items.filter(i => i.kind === 'ctx');
    const workItems = items.filter(i => i.kind === 'work');

    TRACKS.forEach((t, ti) => {
      let source = items;
      if (t.kind === 'ctx'  && ctxItems.length)  source = ctxItems;
      if (t.kind === 'work' && workItems.length) source = workItems;

      const track = document.createElement('div');
      track.className = 'track ' + t.dir;
      track.style.opacity = t.o;
      if (t.dir === 'd'){
        track.style.setProperty('--a', t.angle + 'deg');
        track.style.setProperty('--y', t.at);
      } else {
        track.style.setProperty('--x', t.at);
      }

      const run = document.createElement('div');
      run.className = 'run';
      run.style.animationDuration = t.dur + 's';
      if (t.rev) run.style.animationDirection = 'reverse';

      const half = document.createDocumentFragment();
      let bag = [];
      for (let i = 0; i < PER_TRACK; i++){
        if (!bag.length) bag = shuffle(source.slice());
        half.appendChild(makeTag(bag.pop(), i + ti));
      }
      run.appendChild(half.cloneNode(true));
      run.appendChild(half);
      track.appendChild(run);
      cloud.appendChild(track);
    });
  }

  /* エディターのプレビューでも、公開ページと同じ線を引けるように */
  const linePath = (n) => smooth(SHAPES[Math.abs(n | 0) % SHAPES.length]);

  window.BCRender = {
    esc, clean, safeUrl, safeImg, art, roots, ad, workPage, contextPage, search, page,
    mapMarkup, jsonLd, listLd, cloudPool, buildCloud, lineColor, linePath, ICON,
    PALETTE, SHAPE_COUNT: SHAPES.length
  };
})();

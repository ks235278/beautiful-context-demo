/* 描画の共通部分。

   表（カード）……… 構成図 flowchart2 のストリーム。A の絵を大きく、
                     B の絵を右下に重ね、二つを手書き風の線がつなぐ。
   裏（コンテクスト）… 基本要素.pdf。A の絵を 20% に透かし、その上を
                     生成AIの文章が流れる。最後に出力元の URL を置く。 */
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
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.8 3.9 4.5 7.3 4.5c2 0 3.5 1.1 4.7 2.7 1.2-1.6 2.7-2.7 4.7-2.7 3.4 0 5.7 3.3 4.5 6.7-1.7 4.7-9.2 9.3-9.2 9.3z"/></svg>',
    talk:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v10.5H9.5L5 20v-4H4z"/></svg>',
    plus:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5v12M7.5 8 12 3.5 16.5 8M5 12.5v7h14v-7"/></svg>',
    back:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4.5 7.5 12l7.5 7.5"/></svg>',
    edit:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 19.5h4l10-10-4-4-10 10z"/></svg>',
    seek:  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></svg>'
  };

  const count = (n, zero) => n > 0 ? String(n) : zero;

  function acts(e, opts){
    const liked = S.liked(e.id);
    const n = S.reactionCount(e);
    const talk = S.visibleComments(e).length;
    return `
      <button type="button" class="act like${liked ? ' on' : ''}" data-like="${attr(e.id)}" aria-pressed="${liked}">
        ${ICON.heart}<span class="n">${esc(count(n, '共感'))}</span></button>
      <button type="button" class="act talk" data-open="${attr(e.context.slug)}" data-to="comments">
        ${ICON.talk}<span class="n">${esc(count(talk, 'コメント'))}</span></button>
      <a class="act add" href="editor.html?from=${encodeURIComponent(e.a.slug)}" title="この作品に新しいつながりを足す">
        ${ICON.plus}<span class="n">つなぐ</span></a>
      <button type="button" class="act share" data-share="${attr(e.context.slug)}" aria-label="共有">${ICON.share}</button>
      ${opts && opts.edit ? `<a class="act edit" href="editor.html?slug=${encodeURIComponent(e.context.slug)}">${ICON.edit}<span class="n">編集</span></a>` : ''}`;
  }

  /* ---------- 表：ストリームのカード ---------- */
  function card(e){
    const c = e.context;
    const face = safeImg(e.a.image)
      ? img(e.a.image, e.a.title, 'card-a')
      : `<span class="card-ph">${esc(initial(e.a))}</span>`;
    return `
      <article class="card" id="card-${attr(c.slug)}" data-slug="${attr(c.slug)}" style="--lc:${lineColor(e)}">
        <button type="button" class="card-face" data-open="${attr(c.slug)}"
          aria-label="${attr(e.a.title)} と ${attr(e.b.title)} のコンテクストを開く">
          ${face}
          <span class="card-b">${safeImg(e.b.image) ? img(e.b.image, '', '') : `<span class="card-ph small">${esc(initial(e.b))}</span>`}
            <span class="card-b-name">${esc(e.b.title)}</span></span>
          ${squiggle(e)}
          <span class="avatar" title="${attr(c.author)}">${esc((c.author || '編').charAt(0))}</span>
          <span class="card-name">${esc(e.a.title)}</span>
        </button>
        <div class="card-acts">${acts(e)}</div>
        <p class="card-head">${esc(c.headline).replace(/\n/g, '<br>')}</p>
        <p class="card-route"><span>${esc(c.label || 'CONTEXT')}</span>【${esc(c.routeName)}】<span class="by">${esc(c.author)}</span></p>
      </article>`;
  }

  /* 同じ作品をルーツに共有するコンテクストへの、文字だけの導線 */
  function roots(e, list){
    if (!list.length) return '';
    return `<nav class="roots" aria-label="同じルーツを持つコンテクスト">` + list.map(x => {
      const shared = [x.a.slug, x.b.slug].includes(e.a.slug) ? e.a : e.b;
      return `<a href="#/c/${encodeURIComponent(x.context.slug)}" data-go="${attr(x.context.slug)}" style="--lc:${lineColor(x)}">
        <small>${esc(shared.title)} から</small>
        <span>${esc(x.a.title)} ＋ ${esc(x.b.title)}</span><i aria-hidden="true">→</i></a>`;
    }).join('') + `</nav>`;
  }

  function ad(a){
    const url = a.url && a.url.startsWith('#/') ? a.url : safeUrl(a.url);
    const ext = url && !url.startsWith('#');
    return `
      <aside class="card ad-card" aria-label="広告">
        <a class="card-face" href="${attr(url || '#/ad')}"${ext ? ' target="_blank" rel="noopener sponsored"' : ''}>
          ${img(a.image, '', 'card-a') || '<span class="card-ph">AD</span>'}
          <span class="ad-mark">AD</span>
          <span class="ad-copy"><b>${esc(a.title)}</b>${a.sub ? `<small>${esc(a.sub)}</small>` : ''}</span>
        </a>
      </aside>`;
  }

  function foot(brand){
    return `
      <footer class="foot">
        <p class="foot-call">ここから先は、あなたのつながり。</p>
        <a class="foot-remix" href="editor.html?new=1">ReMixIt!<small>つながりを創る</small></a>
        <nav class="foot-links">
          <a href="#/mission">Our Mission</a><a href="#/ad">広告枠のご案内</a>
          <a href="#/terms">利用規約・プライバシー</a><a href="manage.html">運営者メニュー</a>
        </nav>
        <p class="foot-mark">© ${esc(brand)}</p>
      </footer>`;
  }

  /* ---------- 裏：コンテクスト ---------- */
  function relationParts(c){
    return String(c.relation || '').split('──').map(s => s.trim()).filter(Boolean)
      .map(s => `<span>${esc(s)}</span>`).join('');
  }

  function station(w, side){
    return `<button type="button" class="st" data-work="${attr(w.slug)}">
      ${safeImg(w.image) ? img(w.image, '', 'st-img') : `<span class="st-img st-ph">${esc(initial(w))}</span>`}
      <span class="st-txt"><small>${side} · ${esc(w.type || '作品')}${w.year ? ' · ' + esc(w.year) : ''}</small>
      <b>${esc(w.title)}</b></span><i aria-hidden="true">›</i></button>`;
  }

  function comments(e){
    const list = S.visibleComments(e);
    const when = (iso) => { try { return new Date(iso).toLocaleDateString('ja-JP'); } catch (x) { return ''; } };
    return `
      <section class="talk-box" id="comments" aria-label="コメント">
        <h2>コメント <span>${list.length}</span></h2>
        ${list.length ? `<ol class="talk-list">${list.map(m => `
          <li><b>${esc(m.name)}</b><time>${esc(when(m.at))}</time><p>${esc(m.text)}</p></li>`).join('')}</ol>`
          : `<p class="talk-none">まだコメントはありません。最初のひとことを。</p>`}
        <form class="talk-form" data-comment="${attr(e.id)}">
          <input name="name" maxlength="30" placeholder="名前（なくても可）" autocomplete="nickname">
          <textarea name="text" maxlength="600" rows="3" required placeholder="このつながりについて"></textarea>
          <button type="submit">コメントする</button>
        </form>
      </section>`;
  }

  function back(e, opts){
    const c = e.context;
    const mins = S.readingMinutes(c.body);
    const ai = safeUrl(c.aiUrl);
    const rel = S.related(e);
    const bg = safeImg(e.a.image);
    const state = e.status !== 'public' || !S.isVisible(e)
      ? `<p class="back-state">${e.status === 'private' ? '非公開' : '一時非表示'}のコンテクストです。読者には表示されていません。</p>` : '';
    return `
      <article class="back" style="--lc:${lineColor(e)}">
        <div class="back-bg"${bg ? ` style="--bgimg:url('${attr(bg)}')"` : ''}></div>
        <header class="back-top">
          <button type="button" class="back-close" data-close aria-label="表へ戻る">${ICON.back}<b>${esc(e.a.title)}</b></button>
        </header>
        <div class="back-in">
          ${state}
          <p class="back-pair">${esc(e.a.title)} <em>＋</em> ${esc(e.b.title)}</p>
          <p class="route-label">${esc(c.label || 'CONTEXT')}　【${esc(c.routeName)}】　約${mins}分</p>
          <h1 class="back-head">${esc(c.headline).replace(/\n/g, '<br>')}</h1>
          ${relationParts(c) ? `<div class="pair">${relationParts(c)}</div>` : ''}
          <div class="back-body">${clean(c.body)}</div>
          ${ai ? `<p class="source">この解説は生成AIの出力をもとにしています<a href="${attr(ai)}" target="_blank" rel="noopener nofollow">${esc(ai)}</a></p>` : ''}
          <div class="stations">${station(e.a, 'A')}${station(e.b, 'B')}</div>
          <div class="back-acts">${acts(e, { edit: true })}</div>
          ${rel.length ? `<section class="more"><h2>同じルーツのコンテクスト</h2>${roots(e, rel)}</section>` : ''}
          ${comments(e)}
          <p class="byline">${esc(c.author)}　·　${esc(new Date(e.updatedAt).toLocaleDateString('ja-JP'))}</p>
        </div>
      </article>`;
  }

  /* ---------- 駅（作品） ---------- */
  function work(hit){
    const w = hit.work;
    const items = hit.contexts.map(({ entry, side }) => {
      const other = entry[side === 'a' ? 'b' : 'a'];
      return `<button type="button" class="mini" data-open="${attr(entry.context.slug)}" style="--lc:${lineColor(entry)}">
        ${safeImg(other.image) ? img(other.image, '', 'mini-img') : `<span class="mini-img st-ph">${esc(initial(other))}</span>`}
        <span class="mini-txt"><small>【${esc(entry.context.routeName)}】</small>
        <b>${esc(other.title)}</b><span>${esc(entry.context.headline.replace(/\n/g, ''))}</span></span></button>`;
    }).join('');
    return `
      <article class="page station-page">
        <header class="back-top"><button type="button" class="back-close" data-close aria-label="戻る">${ICON.back}<b>戻る</b></button></header>
        <div class="st-hero">${art(w)}</div>
        <div class="page-in">
          <p class="meta">${esc(w.type || '作品')}${w.year ? '・' + esc(w.year) + '年' : ''}　STATION</p>
          <h1>${esc(w.title)}</h1>
          ${w.creator ? `<p class="dim">${esc(w.creator)}</p>` : ''}
          ${w.summary ? `<p>${esc(w.summary)}</p>` : ''}
          <p class="meta" style="margin-top:28px">この駅から延びる区間　${hit.contexts.length}本</p>
          <div class="minis">${items}</div>
          <a class="add-b" href="editor.html?from=${encodeURIComponent(w.slug)}">${ICON.plus}この作品に、新しいつながりを足す</a>
        </div>
      </article>`;
  }

  /* ---------- 検索 ---------- */
  function search(q, res){
    const ctx = res.contexts.map(e => `
      <button type="button" class="mini" data-open="${attr(e.context.slug)}" style="--lc:${lineColor(e)}">
        ${safeImg(e.a.image) ? img(e.a.image, '', 'mini-img') : `<span class="mini-img st-ph">${esc(initial(e.a))}</span>`}
        <span class="mini-txt"><small>【${esc(e.context.routeName)}】</small>
        <b>${esc(e.a.title)} ＋ ${esc(e.b.title)}</b><span>${esc(e.context.headline.replace(/\n/g, ''))}</span></span></button>`).join('');
    const works = res.works.map(({ work: w }) =>
      `<button type="button" class="chip" data-work="${attr(w.slug)}">${esc(w.title)}</button>`).join('');
    const none = !res.contexts.length && !res.works.length;
    return `
      <article class="page search-page">
        <header class="back-top"><button type="button" class="back-close" data-close aria-label="戻る">${ICON.back}<b>戻る</b></button></header>
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
        <header class="back-top"><button type="button" class="back-close" data-close aria-label="戻る">${ICON.back}<b>戻る</b></button></header>
        <div class="page-in"><h1>${title}</h1>${body}</div>
      </article>`;
    if (name === 'mission') return shell('Our Mission', `
      <p class="lead">意外な関係を持つ二つの情報を、誰もが簡単な操作でつなぎ、縦にスクロールするストリームで読める場所をつくる。</p>
      <p>たとえば、自分が見た海外の映画に原作があり、それが日本の著名な映画監督によってすでに撮られていたと気づいたとき。その発見を誰かと分かち合い、共感を得たい。</p>
      <p>二つのコンテンツの名前と画像を選び、その関係の解説は生成AIに任せる。それだけで「素敵なコンテクスト」ができあがり、ストリームに現れる。</p>
      <p>二つを組み合わせて投稿するだけで、音楽の DJ のように、つながりを活かした美しい空間が編み出されていく。</p>
      <ol class="steps">
        <li><b>選ぶ</b>二つのコンテンツ（作品・人物・場所・本）と、その画像</li>
        <li><b>つなぐ</b>二つの関係を、生成AIの出力や自分の言葉で</li>
        <li><b>現れる</b>表にカード、裏にコンテクスト。ストリームに並ぶ</li>
      </ol>
      <p class="motto">YOUR CONTEXT WILL VISUALIZE BY US</p>
      <p class="dim">ReMixIt! ── つながりを創る　／　UNIverseIt! ── つながりを辿る</p>`);
    if (name === 'terms') return shell('利用規約・プライバシー', `
      <p class="lead">これはデモ版です。正式な利用規約とプライバシーポリシーは、サービス公開時に用意します。</p>
      <h2>データの保存先</h2>
      <p>投稿・コメント・共感・設定は、すべてお使いの端末のブラウザ（localStorage）にだけ保存されます。サーバーへ送信することはありません。別の端末や別の人には見えません。</p>
      <h2>計測</h2>
      <p>アクセス解析やトラッキングは行っていません。</p>
      <h2>画像と文章</h2>
      <p>見本の作品画像は、作品紹介を目的として引用しています。著作権は各権利者に帰属します。見本の解説文は、確かめられる事実に基づいて書いた見本です。</p>`);
    if (name === 'ad') return shell('広告枠のご案内', `
      <p class="lead">ストリームの空いている場所は、映画・音楽・書籍・イベントなど、コンテンツを購入できる広告のための枠です。</p>
      <p>コンテクストを読み終えた人の目の前に、その作品を買える・観られる・訪ねられる入口を置く。つながりを辿った先が、そのまま体験への入口になります。</p>
      <h2>想定している仕組み</h2>
      <ul>
        <li>クレジットカードで購入できる広告枠</li>
        <li>表示の割合や、タグの指定によって価格が変わる</li>
        <li>管理画面から、枠の画像・文言・リンク先・表示の有無を編集できる（デモで動作）</li>
      </ul>
      <p><a class="add-b" href="manage.html#ads">管理画面で広告枠を見る</a></p>`);
    return shell('ページが見つかりません', `
      <p class="lead">お探しのページは移動したか、公開が終了した可能性があります。</p>
      <p><a class="add-b" href="#/" data-close>ストリームへ戻る</a></p>`);
  }

  /* ---------- 下のドックの路線図 ---------- */
  function mapMarkup(o){
    return `
      <span class="line-name">${esc(o.lineName || '')}</span>
      <span class="line"></span>
      ${o.label !== null ? '<span class="segment"></span>' : ''}
      ${o.label ? `<span class="section-label">${esc(o.label)}</span>` : ''}
      <span class="dot left ${o.current === 'left' ? 'current' : ''}"></span>
      <span class="dot right ${o.current === 'right' ? 'current' : ''}"></span>
      <button class="station left ${o.current === 'left' ? 'current' : ''}" data-work="${attr(o.aSlug || '')}">${esc(o.left)}</button>
      <button class="station right ${o.current === 'right' ? 'current' : ''}" data-work="${attr(o.bSlug || '')}">${esc(o.right)}</button>`;
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
      name: brand + ' のストリーム',
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
    S.works().forEach(w => {
      out.push({ text: w.work.title.replace(/[『』]/g, ''), kind: 'work', work: w.slug });
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

  /* エディターのプレビューでも、ストリームと同じ線を引けるように */
  const linePath = (n) => smooth(SHAPES[Math.abs(n | 0) % SHAPES.length]);

  window.BCRender = {
    esc, clean, safeUrl, safeImg, art, card, roots, ad, foot, back, work, search, page,
    mapMarkup, jsonLd, listLd, cloudPool, buildCloud, lineColor, linePath, ICON,
    PALETTE, SHAPE_COUNT: SHAPES.length
  };
})();

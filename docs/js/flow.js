/* Beautiful Context — つながりを流れで観る（試作）

   上へ払うだけで、見て・読んで・次へ。押すところは無い（CTO 2026.11.02「スクロールするだけで、何も押さずにコンテクストが読めるように。
   どこを押せばいいか考えさせない」）。
   一つのつながりは「一画面の表紙（二枚の絵・題）」と、そのすぐ下に続く本文（CONTEXT STORY）。本文を読み終えると、そのまま次のつながりの表紙へ。
   順は BCStore.trail()（一覧と同じ）。最後に見た区間（localStorage 'bc-last'）から始める。先生の設計（index.html）には触れない。

   動きはブラウザのもの（スクロール。表紙の頭にだけ、近くで止めたときに寄せる scroll-snap proximity）。ここで書くのは、
     ・いまどのつながりにいるか（スクロールの位置）→ 位置・右の列・解析・bc-last
     ・絵は、いまのつながりの前後だけ持つ（iPhone は絵を持ちすぎると層を捨てる）
     ・本文が見えたら「読んだ」、終わりまで来たら読み終わり（解析）。本文を読んでいるあいだは右の列と上の帯を退ける
     ・パソコン：ホイールと ↑↓ はふつうのスクロール。J / K で前後のつながりの頭へ */
(() => {
  const S = window.BCStore, R = window.BCRender, Social = window.BCSocial;
  const $ = (id) => document.getElementById(id);
  const stage = $('stage'), flow = $('flow'), rail = $('rail'), hint = $('hint');
  const toastEl = $('toast');
  const esc = R.esc;
  const kept = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch (e) { return fb; } };
  const keep = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  /* 読者の動き。名前・打った文字は送らない */
  const track = (name, params) => { if (window.gtag) gtag('event', name, params || {}); };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const T = S.trail();
  const N = T.length;
  if (!N) {
    flow.innerHTML = '<article class="card empty"><p>まだ公開されたつながりがありません。</p></article>';
    return;
  }

  /* ---------- 札を組む ---------- */
  const initial = (w) => {
    const t = String(w.title || '?'), m = /[『「]([^』」]+)[』」]/.exec(t);
    return (m ? m[1] : t.replace(/[『』「」]/g, '')).trim().charAt(0) || '?';
  };
  /* 絵は src を付けずに置く（data-src）。いまのつながりの前後にだけ src を入れる */
  const art = (w) => {
    const s = R.safeImg(w.image);
    return `<figure class="art">${s
      ? `<img data-src="${esc(s)}" alt="${esc(w.title)}" decoding="async">`
      : `<span class="ph">${esc(initial(w))}<small>${esc(w.type || '作品')}</small></span>`}</figure>`;
  };
  const creditLine = (w) => (w && w.credit) ? `<span>画像：${esc(w.credit)}</span>` : '';
  const relation = (c) => String(c.relation || '').split('──').map((s) => s.trim()).filter(Boolean)
    .map((s) => `<span>${esc(s)}</span>`).join('<i aria-hidden="true">─</i>');
  /* 見出しの一番長い行の字数（英数字は半分）。長い行は、その幅に収まるまで文字を小さくする（途中で折らない） */
  const widest = (headline) => Math.max(1, ...String(headline).split('\n').map((line) =>
    [...line].reduce((n, ch) => n + (/[\x20-\x7e]/.test(ch) ? .55 : 1), 0)));
  /* 本文（以前は「読む」で下から上がる紙の幕にあったもの）。最初の太字の一文は見出しに（コンテクストページと同じ） */
  function story(e){
    const c = e.context, ed = S.editorOf(e);
    const credit = (w) => {
      if (!w || !w.credit) return '';
      const u = R.safeUrl(w.creditUrl);
      return `<p class="credit">画像：${esc(w.credit)}${u ? `　<a href="${esc(u)}" target="_blank" rel="noopener nofollow">出典</a>` : ''}</p>`;
    };
    let day = '';
    try { day = new Date(e.updatedAt).toLocaleDateString('ja-JP'); } catch (x) {}
    return `
      <p class="meta">CONTEXT STORY　［${esc(c.routeName)}］</p>
      ${R.clean(c.body).replace(/^\s*<p><strong>([\s\S]*?)<\/strong><\/p>/, '<h2>$1</h2>')}
      <p class="byline">${esc(ed.name)}　·　${esc(day)}</p>
      ${credit(e.a)}${credit(e.b)}
      <a class="more" href="c/${encodeURIComponent(c.slug)}/">このつながりのページで、コメントを読む・書く <span aria-hidden="true">›</span></a>
      <i class="end" aria-hidden="true"></i>`;
  }
  function card(t, i){
    const e = t.entry, c = e.context, ed = S.editorOf(e);
    const credits = creditLine(e.a) + creditLine(e.b);
    const rel = relation(c);
    return `<article class="card" data-i="${i}" aria-label="${esc(c.headline.replace(/\n/g, ''))}">
      <div class="screen">
        <div class="hero">
          <div class="duo">${art(e.a)}${art(e.b)}<i class="swap" aria-hidden="true">↔</i></div>
          ${credits ? `<p class="credits">${credits}</p>` : ''}
        </div>
        <div class="lead">
          <p class="route">${esc(c.label || 'CONTEXT')}　［${esc(c.routeName)}］</p>
          <h2 class="hl" style="--n:${widest(c.headline).toFixed(2)}">${esc(c.headline).replace(/\n/g, '<br>')}</h2>
          ${rel ? `<p class="rel">${rel}</p>` : ''}
          <div class="row">
            <a class="ed" href="index.html#/e/${encodeURIComponent(ed.id)}"><b>${esc(ed.name)}</b><small>${esc(ed.role || 'EDITOR')}</small></a>
            <span class="down" aria-hidden="true">下へ、そのまま読める<small>${esc(R.readLabel(c.body))}</small><i></i></span>
          </div>
        </div>
      </div>
      <section class="story" aria-label="コンテクスト・ストーリー">${story(e)}</section>
    </article>`;
  }
  flow.innerHTML = T.map(card).join('');
  const cards = [...flow.children];
  /* ---------- 絵は前後 2 枚ずつ（5 枚）だけ持つ ---------- */
  const KEEP = 2;
  function mount(i){
    cards.forEach((el, k) => {
      const near = Math.abs(k - i) <= KEEP;
      el.querySelectorAll('img[data-src]').forEach((img) => {
        if (near && !img.getAttribute('src')) {
          img.src = img.dataset.src;
          if (img.complete && img.naturalWidth) img.classList.add('in');
          else img.addEventListener('load', () => img.classList.add('in'), { once: true });
        } else if (!near && img.getAttribute('src')) {
          img.removeAttribute('src');
          img.classList.remove('in');
        }
      });
    });
  }


  /* ---------- 表紙の高さ ----------
     一画面の表紙は、流れの枠の高さから、下の 64px を引いたもの。下には本文の頭（CONTEXT STORY）がのぞき、
     「このまま下へ読める」とひと目でわかる。枠の高さは iOS の帯の出入りで変わるので、そのたびに測り直す */
  const h = () => flow.clientHeight;
  const fit = () => flow.style.setProperty('--fh', h() + 'px');
  fit();
  let tops = [];
  const measure = () => { tops = cards.map((el) => el.offsetTop); };

  /* ---------- 始める位置 ----------
     アドレスの #区間 があればそこから。なければ最後に見た区間（bc-last）。なければ道の始め */
  const hashSlug = (() => { try { return decodeURIComponent(location.hash.replace(/^#\/?(c\/)?/, '').replace(/\/$/, '')); } catch (x) { return ''; } })();
  let start = hashSlug ? T.findIndex((t) => t.entry.context.slug === hashSlug) : -1;
  if (start < 0) { const last = kept('bc-last', null); if (typeof last === 'string') start = T.findIndex((t) => t.entry.id === last); }
  if (start < 0) start = 0;
  mount(start);
  measure();
  flow.scrollTop = tops[start];

  /* ---------- いまのつながり ----------
     画面の上から 4 割の所にある札が「いま」。本文を読み進めているあいだも、同じつながりのまま */
  let cur = -1, first = true, viewTimer = 0;
  const at = (y) => { let lo = 0, hi = tops.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (tops[m] <= y) lo = m; else hi = m - 1; } return lo; };
  function setCurrent(i){
    if (i === cur) return;
    cur = i;
    cards.forEach((el, k) => el.classList.toggle('on', k === i));
    mount(i);
    const t = T[i], e = t.entry, c = e.context;
    keep('bc-last', e.id);
    try { history.replaceState(null, '', '#' + encodeURIComponent(c.slug)); } catch (x) {}
    renderRail(t);
    /* 解析：札が落ち着いてから一度。速く払い抜けた札は数えない */
    clearTimeout(viewTimer);
    viewTimer = setTimeout(() => {
      if (!window.gtag) return;
      gtag('event', 'page_view', {
        page_location: location.origin + '/flow/' + encodeURIComponent(c.slug) + '/',
        page_title: c.headline.replace(/\n/g, '') + '｜Beautiful Context',
        nav_via: first ? 'flow_open' : 'flow_swipe'
      });
      first = false;
    }, 350);
  }
  /* 本文を読んでいるあいだ（表紙が画面の半分より上へ抜けたあと）は、右の列と上の帯を退ける */
  let ticking = false;
  function onScroll(){
    ticking = false;
    const y = flow.scrollTop, i = at(y + h() * .4);
    setCurrent(i);
    const screen = cards[i].firstElementChild;
    stage.classList.toggle('reading', y > tops[i] + screen.offsetHeight * .5);
  }
  flow.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  requestAnimationFrame(onScroll);   /* 最初の一度は、下の右の列（renderRail）を組んだあとに */

  /* 画面の高さが変わったら（向き・iOS の帯）、表紙の高さを測り直し、いまのつながりの同じ所に合わせ直す */
  let rt = 0;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const i = Math.max(cur, 0), off = flow.scrollTop - tops[i];
      fit(); measure();
      flow.scrollTo({ top: tops[i] + Math.max(0, off), behavior: 'instant' });
    }, 120);
  });
  /* フォント・絵が入って本文の長さが変わったら、位置の表を作り直す */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  addEventListener('load', measure);

  /* ---------- 右の列：フォロー・共感・共有・一覧 ---------- */
  const ICON = {
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3 4.6 13a4.4 4.4 0 0 1 6.2-6.2L12 8l1.2-1.2a4.4 4.4 0 0 1 6.2 6.2Z"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4M5 11v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8"/></svg>',
    list:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"/></svg>'
  };
  function renderRail(t){
    const e = t.entry, ed = S.editorOf(e), on = Social.isFollowing(ed.id), liked = S.liked(e.id), n = S.reactionCount(e);
    const pic = R.safeImg(ed.photo);
    rail.innerHTML = `
      <button type="button" class="rb follow${on ? ' on' : ''}" data-act="follow" aria-pressed="${on ? 'true' : 'false'}" aria-label="${esc(ed.name)}を${on ? 'フォロー中' : 'フォローする'}">
        <span class="ava">${pic ? `<img src="${esc(pic)}" alt="">` : esc(String(ed.mark || ed.name || '?').replace(/^BC\s*/, '').charAt(0))}</span><i class="badge" aria-hidden="true">${on ? '✓' : '＋'}</i>
      </button>
      <button type="button" class="rb like${liked ? ' on' : ''}" data-act="like" aria-pressed="${liked ? 'true' : 'false'}" aria-label="共感">${ICON.heart}<small>${n}</small></button>
      <button type="button" class="rb" data-act="share" aria-label="共有">${ICON.share}<small>共有</small></button>
      <a class="rb" href="index.html#/list" aria-label="つながりの一覧">${ICON.list}<small>一覧</small></a>`;
  }
  rail.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-act]');
    if (!b || cur < 0) return;
    const e = T[cur].entry, c = e.context;
    if (b.dataset.act === 'like') {
      const r = S.react(e.id);
      b.classList.toggle('on', r.liked);
      b.setAttribute('aria-pressed', r.liked ? 'true' : 'false');
      b.querySelector('small').textContent = r.count;
      b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
      if (r.liked) track('react', { context: c.slug });
    } else if (b.dataset.act === 'follow') {
      const ed = S.editorOf(e);
      const on = Social.toggleFollow(ed.id);
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.querySelector('.badge').textContent = on ? '✓' : '＋';
      track(on ? 'follow' : 'unfollow', { editor_id: ed.id, from_page: 'flow' });
      toast(on ? `${ed.name} をフォローしました` : `${ed.name} のフォローをやめました`);
    } else if (b.dataset.act === 'share') {
      share(e);
    }
  });
  /* ほかのタブでフォローが変わったら、列を描き直す */
  Social.onChange(() => { if (cur >= 0) renderRail(T[cur]); });

  async function share(e){
    const c = e.context;
    const url = 'https://beautifulcontext.com/c/' + encodeURIComponent(c.slug) + '/';
    const title = c.headline.replace(/\n/g, '') + '｜Beautiful Context';
    const text = `${e.a.title} ＋ ${e.b.title}`;
    try {
      if (navigator.share) { await navigator.share({ title, text, url }); track('share', { context: c.slug, method: 'native' }); return; }
      await navigator.clipboard.writeText(url);
      toast('リンクをコピーしました');
      track('share', { context: c.slug, method: 'copy' });
    } catch (err) { /* 取りやめ */ }
  }

  let toastT = 0;
  function toast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  /* ---------- 最初の一度だけの印 ---------- */
  if (!kept('bc-flow-hint', false)) hint.classList.add('show');
  const y0 = flow.scrollTop;
  flow.addEventListener('scroll', () => {
    if (hint.classList.contains('show') && Math.abs(flow.scrollTop - y0) > 60) { hint.classList.remove('show'); keep('bc-flow-hint', true); }
  }, { passive: true });

  /* ---------- 読んだ印と、読み始め・読み終わり ----------
     本文の頭が画面に入ったら「読んだ」（一覧の印と同じ場所）と読み始め。本文の終わりまで来たら読み終わり */
  const started = new Set(), done = new Set();
  const t0 = new Map();
  const readIO = new IntersectionObserver((es) => {
    es.forEach((x) => {
      if (!x.isIntersecting) return;
      const i = +x.target.closest('.card').dataset.i, e = T[i].entry, slug = e.context.slug;
      if (x.target.classList.contains('story') && !started.has(i)) {
        started.add(i); t0.set(i, Date.now());
        const read = new Set([].concat(kept('bc-read', [])).filter((v) => typeof v === 'string'));
        read.add(e.id); keep('bc-read', [...read].slice(-2000));
        track('read_start', { context: slug, sec: 0 });
      } else if (x.target.classList.contains('end') && started.has(i) && !done.has(i)) {
        done.add(i);
        track('read_complete', { context: slug, sec: Math.round((Date.now() - (t0.get(i) || Date.now())) / 1000) });
      }
    });
  }, { root: flow, threshold: 0 });
  cards.forEach((el) => { readIO.observe(el.querySelector('.story')); readIO.observe(el.querySelector('.end')); });

  /* ---------- パソコン：ホイールと ↑↓ はふつうのスクロール。J / K（と Shift+↑↓）で前後のつながりの頭へ ---------- */
  const go = (d) => {
    const i = Math.max(0, Math.min(N - 1, (cur < 0 ? start : cur) + d));
    flow.scrollTo({ top: tops[i], behavior: reduced ? 'instant' : 'smooth' });
  };
  addEventListener('keydown', (ev) => {
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    if (ev.key === 'j' || (ev.shiftKey && ev.key === 'ArrowDown')) { ev.preventDefault(); go(1); }
    else if (ev.key === 'k' || (ev.shiftKey && ev.key === 'ArrowUp')) { ev.preventDefault(); go(-1); }
  });
})();

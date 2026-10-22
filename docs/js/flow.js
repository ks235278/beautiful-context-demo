/* Beautiful Context — つながりを流れで観る（試作）

   一画面に一つのつながり。上へ払うと、次のつながり（BCStore.trail() の順。一覧と同じ順）。
   最後に見た区間（localStorage 'bc-last'）から始める。先生の設計（index.html）には触れない。

   動きはブラウザのもの（scroll-snap）。ここで書くのは、
     ・いまどの札が見えているか（IntersectionObserver）→ 位置・右の列・解析・bc-last
     ・絵は、いま見ている札の前後だけ持つ（iPhone は絵を持ちすぎると層を捨てる）
     ・「読む」：本文の紙の幕（指で下へ引くと閉じる）
     ・パソコン：↑↓ キーとホイールで一枚ずつ */
(() => {
  const S = window.BCStore, R = window.BCRender, Social = window.BCSocial;
  const $ = (id) => document.getElementById(id);
  const stage = $('stage'), flow = $('flow'), rail = $('rail'), pos = $('pos'), hint = $('hint');
  const sheet = $('sheet'), panel = $('panel'), body = $('sheetBody'), toastEl = $('toast');
  const esc = R.esc;
  const kept = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch (e) { return fb; } };
  const keep = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  /* 読者の動き。名前・打った文字は送らない */
  const track = (name, params) => { if (window.gtag) gtag('event', name, params || {}); };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

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
  /* 絵は src を付けずに置く（data-src）。見える札の前後にだけ src を入れる */
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
  function card(t, i){
    const e = t.entry, c = e.context, ed = S.editorOf(e);
    const credits = creditLine(e.a) + creditLine(e.b);
    const rel = relation(c);
    return `<article class="card" data-i="${i}" aria-label="${esc(c.headline.replace(/\n/g, ''))}">
      <div class="hero">
        <div class="duo">${art(e.a)}${art(e.b)}<i class="swap" aria-hidden="true">↔</i></div>
        ${credits ? `<p class="credits">${credits}</p>` : ''}
      </div>
      <div class="lead">
        <p class="route">${esc(c.label || 'CONTEXT')}　［${esc(c.routeName)}］</p>
        <h2 class="hl" style="--n:${widest(c.headline).toFixed(2)}">${esc(c.headline).replace(/\n/g, '<br>')}</h2>
        ${rel ? `<p class="rel">${rel}</p>` : ''}
        <div class="row">
          <button type="button" class="read" data-read>読む<small>${esc(R.readLabel(c.body))}</small></button>
          <a class="ed" href="index.html#/e/${encodeURIComponent(ed.id)}"><b>${esc(ed.name)}</b><small>${esc(ed.role || 'EDITOR')}</small></a>
        </div>
      </div>
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

  /* ---------- 始める位置 ----------
     アドレスの #区間 があればそこから。なければ最後に見た区間（bc-last）。なければ道の始め */
  const h = () => flow.clientHeight;
  const hashSlug = (() => { try { return decodeURIComponent(location.hash.replace(/^#\/?(c\/)?/, '').replace(/\/$/, '')); } catch (x) { return ''; } })();
  let start = hashSlug ? T.findIndex((t) => t.entry.context.slug === hashSlug) : -1;
  if (start < 0) { const last = kept('bc-last', null); if (typeof last === 'string') start = T.findIndex((t) => t.entry.id === last); }
  if (start < 0) start = 0;
  mount(start);
  flow.scrollTop = start * h();

  /* ---------- いま見えている札 ---------- */
  let cur = -1, first = true, viewTimer = 0;
  function setCurrent(i){
    if (i === cur) return;
    cur = i;
    cards.forEach((el, k) => el.classList.toggle('on', k === i));
    mount(i);
    const t = T[i], e = t.entry, c = e.context;
    pos.textContent = `${String(i + 1).padStart(3, '0')} / ${N}`;
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
  const io = new IntersectionObserver((es) => {
    es.forEach((x) => { if (x.isIntersecting) setCurrent(+x.target.dataset.i); });
  }, { root: flow, threshold: 0.55 });
  cards.forEach((el) => io.observe(el));

  /* 画面の高さが変わったら（向き・iOS の帯）、いまの札に合わせ直す */
  let rt = 0;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (cur >= 0) flow.scrollTo({ top: cur * h(), behavior: 'instant' }); }, 120);
  });

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
  const y0 = start * h();
  flow.addEventListener('scroll', () => {
    if (hint.classList.contains('show') && Math.abs(flow.scrollTop - y0) > 60) { hint.classList.remove('show'); keep('bc-flow-hint', true); }
  }, { passive: true });

  /* ---------- 読む：紙の幕 ---------- */
  let sheetOpen = false, readIO = null, readT0 = 0;
  function openSheet(){
    if (cur < 0 || sheetOpen) return;
    const e = T[cur].entry, c = e.context, ed = S.editorOf(e);
    /* 本文の最初の太字の一文は見出しに（コンテクストページと同じ） */
    const story = R.clean(c.body).replace(/^\s*<p><strong>([\s\S]*?)<\/strong><\/p>/, '<h2>$1</h2>');
    const credit = (w) => {
      if (!w || !w.credit) return '';
      const u = R.safeUrl(w.creditUrl);
      return `<p class="credit">画像：${esc(w.credit)}${u ? `　<a href="${esc(u)}" target="_blank" rel="noopener nofollow">出典</a>` : ''}</p>`;
    };
    let day = '';
    try { day = new Date(e.updatedAt).toLocaleDateString('ja-JP'); } catch (x) {}
    body.innerHTML = `
      <p class="meta">CONTEXT STORY　［${esc(c.routeName)}］</p>
      ${story}
      <p class="byline">${esc(ed.name)}　·　${esc(day)}</p>
      ${credit(e.a)}${credit(e.b)}
      <a class="more" href="c/${encodeURIComponent(c.slug)}/">このつながりのページで、コメントを読む・書く <span aria-hidden="true">›</span></a>
      <div class="end" id="sheetEnd"></div>`;
    body.scrollTop = 0;
    panel.style.transition = ''; panel.style.transform = '';
    sheetOpen = true;
    stage.classList.add('reading');
    sheet.classList.add('open');
    /* 読んだ印（一覧の「読んだ」と同じ場所）と、読み始め・読み終わり */
    const read = new Set([].concat(kept('bc-read', [])).filter((x) => typeof x === 'string'));
    read.add(e.id); keep('bc-read', [...read].slice(-2000));
    readT0 = Date.now();
    track('read_start', { context: c.slug, sec: 0 });
    if (readIO) readIO.disconnect();
    readIO = new IntersectionObserver((es) => {
      if (!es.some((x) => x.isIntersecting)) return;
      track('read_complete', { context: c.slug, sec: Math.round((Date.now() - readT0) / 1000) });
      readIO.disconnect(); readIO = null;
    }, { root: body });
    readIO.observe(body.querySelector('#sheetEnd'));
  }
  function closeSheet(){
    if (!sheetOpen) return;
    sheetOpen = false;
    stage.classList.remove('reading');
    sheet.classList.remove('open');
    panel.style.transition = ''; panel.style.transform = '';
    if (readIO) { readIO.disconnect(); readIO = null; }
  }
  sheet.addEventListener('click', (ev) => { if (ev.target.closest('[data-close]')) closeSheet(); });

  /* 幕は指で下へ引くと閉じる（本文の頭にいるときだけ。途中ならそのままスクロール） */
  let sy = 0, sdy = 0, dragging = false;
  panel.addEventListener('touchstart', (ev) => { sy = ev.touches[0].clientY; sdy = 0; dragging = body.scrollTop <= 0; }, { passive: true });
  panel.addEventListener('touchmove', (ev) => {
    if (!dragging) return;
    sdy = ev.touches[0].clientY - sy;
    if (sdy <= 0) { if (body.scrollTop > 0) dragging = false; panel.style.transform = ''; return; }
    ev.preventDefault();
    panel.style.transition = 'none';
    panel.style.transform = `translateY(${sdy}px)`;
  }, { passive: false });
  panel.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    panel.style.transition = '';
    if (sdy > 90) closeSheet(); else panel.style.transform = '';
  });

  /* 札に触れると読む（編集者の名前だけは、その人のページへ） */
  flow.addEventListener('click', (ev) => {
    if (ev.target.closest('a')) return;
    if (ev.target.closest('.card')) openSheet();
  });
  /* 左へ払っても読む（札の中へ入る） */
  let tx = 0, ty = 0, tt = 0;
  flow.addEventListener('touchstart', (ev) => { const p = ev.touches[0]; tx = p.clientX; ty = p.clientY; tt = Date.now(); }, { passive: true });
  flow.addEventListener('touchend', (ev) => {
    const p = ev.changedTouches[0], dx = p.clientX - tx, dy = p.clientY - ty;
    if (Date.now() - tt < 600 && dx < -60 && Math.abs(dx) > Math.abs(dy) * 1.6) openSheet();
  }, { passive: true });

  /* ---------- パソコン：キーとホイールで一枚ずつ ---------- */
  const go = (d) => {
    const i = Math.max(0, Math.min(N - 1, (cur < 0 ? start : cur) + d));
    flow.scrollTo({ top: i * h(), behavior: reduced ? 'instant' : 'smooth' });
  };
  addEventListener('keydown', (ev) => {
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    if (sheetOpen) { if (ev.key === 'Escape') { ev.preventDefault(); closeSheet(); } return; }
    if (ev.key === 'ArrowDown' || ev.key === 'PageDown' || ev.key === ' ' || ev.key === 'j') { ev.preventDefault(); go(1); }
    else if (ev.key === 'ArrowUp' || ev.key === 'PageUp' || ev.key === 'k') { ev.preventDefault(); go(-1); }
    else if (ev.key === 'Enter') { ev.preventDefault(); openSheet(); }
  });
  /* マウスのホイールは一刻みが小さく、snap だけでは同じ札に戻ってしまう。
     ひと振りで一枚：振りが続いているあいだ（慣性）は二枚目へ行かない */
  if (fine) {
    let acc = 0, lastT = 0, lockUntil = 0, armed = true;
    flow.addEventListener('wheel', (ev) => {
      ev.preventDefault();
      const now = performance.now();
      if (now - lastT > 180) { acc = 0; armed = true; }
      lastT = now;
      if (!armed || now < lockUntil) return;
      acc += ev.deltaY;
      if (Math.abs(acc) >= 40) { go(acc > 0 ? 1 : -1); acc = 0; armed = false; lockUntil = now + 650; }
    }, { passive: false });
  }
})();

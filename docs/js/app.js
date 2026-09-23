/* index.html の動き。

   縦スクロール一本：表紙 → 路線図（流れる見出し）→ UNIverseIt! で
   ストリームが開く。カードを押すと、その場で裏返って裏面（コンテクスト）
   になる。駅・検索・読み物も同じ一枚の画面の上に重ねて開く。

   重ねて開いたものは、URL の # に道筋を残す（#/c/…, #/w/…）。
   携帯では左から払えば、パソコンではブラウザの戻るか Esc で戻れる。 */
(() => {
  const S = window.BCStore, R = window.BCRender;
  const $ = (id) => document.getElementById(id);

  const stream = $('stream'), streamIn = $('streamIn');
  const dock = $('dock'), actions = dock.querySelector('.actions'), map = $('map');
  const intro = $('intro'), stick = intro.querySelector('.intro-stick');
  const bg = $('bg'), cloud = $('cloud'), netLabel = $('netLabel');
  const view = $('view'), viewIn = $('viewIn'), ld = $('ld');

  const settings = S.settings();
  const brand = settings.brand || 'Beautiful Context';
  $('wordmark').textContent = brand;
  $('tagline').textContent = settings.tagline || '';
  const baseTitle = brand;
  document.title = baseTitle;

  const reduced = matchMedia('(prefers-reduced-motion:reduce)');

  function toast(msg){
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove('show'), 1800);
  }

  /* ---------- ストリーム ---------- */
  let listLd = '';
  function build(){
    const list = S.visible();
    const ads = S.activeAds();
    const every = Math.max(0, parseInt(settings.adEvery, 10) || 0);
    let html = '', adi = 0;
    if (!list.length){
      html = `<div class="empty"><b>まだつながりがありません</b>ReMixIt! から最初のコンテクストを作成してください。</div>`;
    }
    list.forEach((e, i) => {
      html += R.card(e);
      html += R.roots(e, S.related(e));
      if (every && ads.length && (i + 1) % every === 0 && i < list.length - 1){
        html += R.ad(ads[adi++ % ads.length]);
      }
    });
    html += R.foot(brand);
    streamIn.innerHTML = html;
    if (!reduced.matches) streamIn.querySelectorAll('.card[data-slug]').forEach(c => c.classList.add('draw'));
    observe();
    listLd = JSON.stringify(R.listLd(list, brand));
    if (!view.classList.contains('on')) ld.textContent = listLd;
  }

  /* ---------- ドック ---------- */
  let current = null;
  let mapSwap = 0;
  const remix = $('remix');
  function setDock(e){
    if (!e){
      mapSwap++;
      map.innerHTML = '';
      remix.href = 'editor.html?new=1';
      current = null;
      return;
    }
    const c = e.context;
    const markup = R.mapMarkup({
      lineName: c.routeName,
      left: c.leftStation || e.a.title,
      right: c.rightStation || e.b.title,
      label: c.label || 'CONTEXT',
      aSlug: e.a.slug, bSlug: e.b.slug
    });
    /* ReMixIt! は、いま見ている作品に新しいつながりを足す入口になる */
    remix.href = 'editor.html?from=' + encodeURIComponent(e.a.slug);

    /* 古い路線を消してから差し替えるのではなく、二枚を短く重ねて渡す。 */
    const oldLayers = [...map.querySelectorAll('.map-layer')];
    const old = oldLayers.pop() || null;
    oldLayers.forEach(layer => layer.remove());
    if (!old || reduced.matches){
      map.innerHTML = `<div class="map-layer">${markup}</div>`;
      return;
    }
    const next = document.createElement('div');
    next.className = 'map-layer entering';
    next.innerHTML = markup;
    map.appendChild(next);
    const swap = ++mapSwap;
    requestAnimationFrame(() => {
      old.classList.add('leaving');
      next.classList.remove('entering');
    });
    setTimeout(() => {
      if (swap !== mapSwap) return;
      [...map.querySelectorAll('.map-layer')].forEach(layer => { if (layer !== next) layer.remove(); });
    }, 340);
  }

  let io, drawIO;
  function observe(){
    if (io) io.disconnect();
    if (drawIO) drawIO.disconnect();
    io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const slug = en.target.dataset.slug;
        if (slug === current) return;
        current = slug;
        setDock(S.byContextSlug(slug));
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    /* 線は、カードが画面に入ったときに一度だけ描かれる */
    drawIO = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('drawn');
        drawIO.unobserve(en.target);
      });
    }, { threshold: 0.35 });
    streamIn.querySelectorAll('.card[data-slug]').forEach(el => { io.observe(el); drawIO.observe(el); });
  }

  /* ---------- 導入部のスクロール連動 ----------
     表紙が薄れるにつれて路線図が現れ、線はそのまま流れ続ける。 */
  const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const ease  = v => { const t = clamp(v); return t * t * (3 - 2 * t); };

  let introEnd = 0, ticking = false, inIntro = true;
  function measure(){ introEnd = Math.max(1, intro.offsetHeight - window.innerHeight); }

  function paint(){
    ticking = false;
    const raw = window.scrollY / introEnd;   /* clamp する前の生の値 */
    const p = clamp(raw);
    /* 上へ流れる距離と薄れる時間を同じ進行にする。
       上端近くへ着くころには、止まることなく完全に消えている。 */
    const wordmarkFlow = ease((p - 0.02) / 0.42);
    const wy = -window.innerHeight * 0.42 * wordmarkFlow;
    const wm = 1 - wordmarkFlow;
    /* 見出しは導入部で立ち上がり、そのあともページの後ろで流れ続ける。
       ただし本文の下敷きになるので、読める濃さまで落ち着かせる。 */
    const after = Math.max(0, (window.scrollY - introEnd) / 420);
    const cl = raw <= 1 ? ease((p - 0.25) / 0.36)
                        : 1 - 0.66 * Math.min(1, after);
    stick.style.setProperty('--wm', wm.toFixed(3));
    stick.style.setProperty('--wy', wy.toFixed(1) + 'px');
    bg.style.setProperty('--cl', cl.toFixed(3));
    /* 路線図の見出し（UniverseIt!）は #bg の外にあるので、こちらにも渡す */
    stick.style.setProperty('--cl', cl.toFixed(3));
    cloud.style.pointerEvents = cl > 0.55 ? 'auto' : 'none';
    netLabel.classList.toggle('live', cl > 0.55 && raw <= 1.05);

    /* 第2段階では流れる見出しだけを見せる。第3段階に入ってから
       ReMixIt! / UNIverseIt! を現し、十分に見えるまで触れない。 */
    const dk = ease((p - 0.68) / 0.20);
    dock.style.setProperty('--dk', dk.toFixed(3));
    const firstCard = streamIn.querySelector('.card');
    const reading = !!(opened && firstCard &&
      firstCard.getBoundingClientRect().top <= window.innerHeight * 0.72);
    dock.classList.toggle('reading', reading);
    if (actions) actions.style.pointerEvents = !reading && dk > 0.5 ? 'auto' : 'none';

    const nowIn = window.scrollY + window.innerHeight * 0.5 < intro.offsetHeight;
    if (nowIn !== inIntro){
      inIntro = nowIn;
      if (nowIn) setDock(null);
    }
  }
  function onScroll(){ if (!ticking){ ticking = true; requestAnimationFrame(paint); } }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); paint(); });
  /* 裏に回っている間は rAF が止まるので、戻ってきたら測り直して描き直す */
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden){ measure(); paint(); }
  });

  /* ---------- 送る ----------
     scroll-behavior:smooth が効いていると scrollTo が打ち切られるため、
     跳ぶ瞬間だけ auto に落とす。 */
  function scrollToY(y){
    const de = document.documentElement;
    const keep = de.style.scrollBehavior;
    de.style.scrollBehavior = 'auto';
    window.scrollTo(0, y);
    requestAnimationFrame(() => { de.style.scrollBehavior = keep; });
  }

  /* 継ぎ目を見せないための移動。ブラウザの smooth は当てにならないので
     自前で送る。指で触ったら即座に譲る。 */
  let gliding = 0;
  function glideTo(y, ms){
    const de = document.documentElement;
    const keep = de.style.scrollBehavior;
    de.style.scrollBehavior = 'auto';
    const from = window.scrollY, dist = y - from, t0 = performance.now();
    const id = ++gliding;
    const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    (function step(now){
      if (id !== gliding) return;
      const t = Math.min(1, (now - t0) / ms);
      window.scrollTo(0, from + dist * easeInOut(t));
      paint();
      if (t < 1) requestAnimationFrame(step);
      else de.style.scrollBehavior = keep;
    })(t0);
    const yield_ = () => { gliding++; de.style.scrollBehavior = keep; };
    window.addEventListener('touchstart', yield_, { once: true, passive: true });
    window.addEventListener('wheel', yield_, { once: true, passive: true });
  }
  const cardTop = (slug) => {
    const el = document.getElementById('card-' + slug);
    return el ? el.getBoundingClientRect().top + window.scrollY - 18 : null;
  };
  function glideToCard(slug, ms){
    open();
    const y = cardTop(slug);
    if (y == null) return;
    glideTo(y, ms || 900);
    const e = S.byContextSlug(slug);
    if (e){ current = slug; setDock(e); }
  }

  /* ---------- 続きを開く ---------- */
  let opened = false;
  function open(){
    if (opened) return false;
    opened = true;
    stream.hidden = false;
    $('app').classList.remove('locked');
    measure();
    return true;
  }

  $('uniBtn').addEventListener('click', () => {
    if (open()){
      const first = streamIn.querySelector('.card');
      if (first) glideTo(first.getBoundingClientRect().top + window.scrollY - 18, 900);
    } else {
      glideTo(introEnd, 700);
    }
  });

  /* 表紙の題名に触れたら、路線図まで送る */
  $('wordmark').addEventListener('click', () => glideTo(introEnd * 0.7, 900));

  cloud.addEventListener('click', ev => {
    const t = ev.target.closest('.tag');
    if (!t) return;
    if (t.dataset.work){ go('#/w/' + encodeURIComponent(t.dataset.work)); return; }
    glideToCard(t.dataset.ctx);
  });
  const hold = on => cloud.querySelectorAll('.run').forEach(r => r.classList.toggle('paused', on));
  cloud.addEventListener('pointerenter', ev => { if (ev.pointerType === 'mouse') hold(true); });
  cloud.addEventListener('pointerleave', () => hold(false));

  /* ---------- 重ねて開く画面 ----------
     道筋は # に残す。戻るときは、自分で積んだ分だけ履歴を戻る。 */
  const depth = () => (history.state && history.state.bcDepth) || 0;
  function go(hash, replace){
    if (replace) history.replaceState({ bcDepth: depth() }, '', hash);
    else history.pushState({ bcDepth: depth() + 1 }, '', hash);
    route();
  }
  function closeView(){
    if (!view.classList.contains('on')) return;
    if (depth() > 0) history.back();
    else { history.replaceState(null, '', location.pathname + location.search); route(); }
  }
  window.addEventListener('popstate', route);
  window.addEventListener('hashchange', route);

  let shownKey = null, shownEntry = null, flipFrom = null, scrollTo_ = null;

  function route(){
    let h = location.hash.slice(1);
    try { h = decodeURIComponent(h); } catch (e) {}
    if (!h || h === '/'){ hideView(); return; }
    /* 以前の形（#区間名）で開かれたら、ストリームのそのカードへ送る */
    if (!h.startsWith('/')){
      history.replaceState(null, '', location.pathname + location.search);
      hideView();
      if (S.byContextSlug(h)) requestAnimationFrame(() => { measure(); glideToCard(h, 10); });
      return;
    }
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean);
    const name = parts[0], arg = parts.slice(1).join('/');

    if (name === 'c' && arg){
      const e = S.byContextSlug(arg);
      if (e) return show('c:' + e.id, R.back(e), { entry: e, title: `${e.a.title} ＋ ${e.b.title}` });
    } else if (name === 'w' && arg){
      const hit = S.workBySlug(arg);
      if (hit) return show('w:' + arg, R.work(hit), { title: hit.work.title });
    } else if (name === 'search'){
      const q = new URLSearchParams(qs || '').get('q') || '';
      return show('s:' + q, R.search(q, S.search(q)), { title: q ? `「${q}」を辿る` : '言葉で辿る', focus: !q ? 'input' : null });
    } else if (['mission', 'terms', 'ad'].includes(name)){
      return show('p:' + name, R.page(name, brand), { title: { mission: 'Our Mission', terms: '利用規約・プライバシー', ad: '広告枠のご案内' }[name] });
    }
    show('404', R.page('404', brand), { title: 'ページが見つかりません' });
  }

  function show(key, html, opts){
    opts = opts || {};
    if (shownKey === key && view.classList.contains('on')) return;
    const fromCard = flipFrom; flipFrom = null;
    shownKey = key;
    shownEntry = opts.entry || null;
    viewIn.innerHTML = html;
    view.setAttribute('aria-label', opts.title || '');
    document.title = (opts.title ? opts.title + '｜' : '') + baseTitle;
    ld.textContent = shownEntry ? JSON.stringify(R.jsonLd(shownEntry, location.href)) : listLd;
    view.scrollTop = 0;
    document.body.classList.add('viewing');

    const land = () => {
      if (scrollTo_){
        const target = viewIn.querySelector(scrollTo_);
        scrollTo_ = null;
        if (target) view.scrollTop = target.getBoundingClientRect().top + view.scrollTop - 70;
      }
      const f = opts.focus === 'input' ? viewIn.querySelector('input') : viewIn.querySelector('.back-close');
      if (f) f.focus({ preventScroll: true });
    };

    if (fromCard && shownEntry && !reduced.matches && !view.classList.contains('on')){
      flipOpen(fromCard, shownEntry, land);
      return;
    }
    /* カードを押さずに裏面へ来たとき（リンク・検索・関連から）は、
       後ろのストリームをそのカードの位置へ合わせておく。閉じたときに、
       そのカードの前へ戻れるように。 */
    if (shownEntry && S.isVisible(shownEntry)){
      open();
      measure();
      const y = cardTop(shownEntry.context.slug);
      if (y != null) scrollToY(y);
    }
    view.classList.remove('settle');
    view.classList.add('on');
    land();
  }

  function hideView(){
    if (!view.classList.contains('on')){ shownKey = null; return; }
    const e = shownEntry;
    shownKey = null; shownEntry = null;
    document.title = baseTitle;
    ld.textContent = listLd;
    const cardEl = e && opened ? document.getElementById('card-' + e.context.slug) : null;
    document.body.classList.remove('viewing');
    if (cardEl && !reduced.matches && flipClose(cardEl, e)) return;
    view.classList.remove('on', 'settle');
  }

  /* ---------- 表から裏へ ----------
     カードのあった場所から、裏面の大きさまで回りながら広がる。
     着いたところで本物の裏面と入れ替え、文字だけが静かに浮かぶ。 */
  function columnRect(){
    const vw = window.innerWidth, vh = window.innerHeight;
    const max = parseFloat(getComputedStyle(viewIn).maxWidth);
    const w = Math.min(vw, isNaN(max) ? vw : max);
    return { left: (vw - w) / 2, top: 0, width: w, height: vh };
  }
  function flipLayer(cardEl, e){
    const face = cardEl.querySelector('.card-face');
    const layer = document.createElement('div');
    layer.className = 'flip';
    const pic = R.safeImg(e.a.image);
    layer.innerHTML = `<div class="flip-card" style="--lc:${R.lineColor(e)}">
      <div class="flip-face flip-front">${face.innerHTML}</div>
      <div class="flip-face flip-back">${pic ? `<i style="--bgimg:url('${R.esc(pic)}')"></i>` : ''}</div></div>`;
    layer.querySelectorAll('.squiggle path').forEach(p => { p.style.transition = 'none'; });
    return layer;
  }
  const place = (el, r, turned) => Object.assign(el.style, {
    left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px',
    transform: turned ? 'rotateY(180deg)' : 'rotateY(0deg)'
  });
  function afterFlip(el, fn){
    let done = false;
    const end = () => { if (done) return; done = true; fn(); };
    el.addEventListener('transitionend', ev => { if (ev.propertyName === 'transform') end(); });
    setTimeout(end, 950);
  }

  function flipOpen(cardEl, e, land){
    const r0 = cardEl.querySelector('.card-face').getBoundingClientRect();
    const layer = flipLayer(cardEl, e);
    const fc = layer.firstElementChild;
    fc.style.transition = 'none';
    place(fc, r0, false);
    document.body.appendChild(layer);
    cardEl.classList.add('away');
    view.classList.add('instant');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fc.style.transition = '';
      place(fc, columnRect(), true);
    }));
    afterFlip(fc, () => {
      view.classList.add('on', 'settle');
      requestAnimationFrame(() => {
        layer.remove();
        view.classList.remove('instant');
        cardEl.classList.remove('away');
        land();
      });
    });
  }

  function flipClose(cardEl, e){
    const r1 = cardEl.querySelector('.card-face').getBoundingClientRect();
    if (r1.bottom < 0 || r1.top > window.innerHeight) return false;
    const layer = flipLayer(cardEl, e);
    const fc = layer.firstElementChild;
    fc.style.transition = 'none';
    place(fc, columnRect(), true);
    document.body.appendChild(layer);
    cardEl.classList.add('away');
    view.classList.add('instant');
    view.classList.remove('on', 'settle');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fc.style.transition = '';
      place(fc, r1, false);
    }));
    afterFlip(fc, () => {
      cardEl.classList.remove('away');
      layer.remove();
      view.classList.remove('instant');
    });
    return true;
  }

  /* ---------- 押されたもの ---------- */
  function refreshCounts(id){
    const e = S.byId(id);
    if (!e) return;
    const liked = S.liked(id), n = S.reactionCount(e), talk = S.visibleComments(e).length;
    document.querySelectorAll(`[data-like="${CSS.escape(id)}"]`).forEach(b => {
      b.classList.toggle('on', liked);
      b.setAttribute('aria-pressed', String(liked));
      b.querySelector('.n').textContent = n > 0 ? String(n) : '共感';
    });
    document.querySelectorAll(`.act.talk[data-open="${CSS.escape(e.context.slug)}"] .n`).forEach(s => {
      s.textContent = talk > 0 ? String(talk) : 'コメント';
    });
  }

  async function share(slug){
    const e = S.byContextSlug(slug);
    const url = location.href.split('#')[0] + '#/c/' + encodeURIComponent(slug);
    const title = e ? `${e.a.title} ＋ ${e.b.title}｜${brand}` : brand;
    if (navigator.share){
      try { await navigator.share({ title, url }); return; } catch (err) { if (err && err.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(url); toast('リンクをコピーしました'); }
    catch (err) { toast(url); }
  }

  document.addEventListener('click', ev => {
    const t = ev.target;

    const like = t.closest('[data-like]');
    if (like){
      const r = S.react(like.dataset.like);
      refreshCounts(like.dataset.like);
      if (r.liked){ like.classList.remove('pop'); void like.offsetWidth; like.classList.add('pop'); }
      return;
    }
    const sh = t.closest('[data-share]');
    if (sh){ share(sh.dataset.share); return; }

    if (t.closest('[data-close]')){ ev.preventDefault(); closeView(); return; }

    const opener = t.closest('[data-open]');
    if (opener){
      const slug = opener.dataset.open;
      if (opener.dataset.to === 'comments') scrollTo_ = '#comments';
      const card = opener.closest('.card[data-slug]');
      if (card && !opener.closest('.view')) flipFrom = card;
      go('#/c/' + encodeURIComponent(slug));
      return;
    }

    const goer = t.closest('[data-go]');
    if (goer){
      ev.preventDefault();
      if (goer.closest('.view')) go('#/c/' + encodeURIComponent(goer.dataset.go));
      else glideToCard(goer.dataset.go, 800);
      return;
    }

    const w = t.closest('[data-work]');
    if (w && w.dataset.work){ go('#/w/' + encodeURIComponent(w.dataset.work)); return; }

    /* ページの中の # 道筋は、履歴に積んでから開く */
    const a = t.closest('a[href^="#/"]');
    if (a){ ev.preventDefault(); go(a.getAttribute('href')); }
  });

  document.addEventListener('submit', ev => {
    const f = ev.target;
    if (f.matches('[data-seek]')){
      ev.preventDefault();
      const q = (f.elements.q.value || '').trim();
      const inView = !!f.closest('.view');
      go('#/search?q=' + encodeURIComponent(q), inView);
      if (!inView) f.elements.q.blur();
      return;
    }
    if (f.matches('[data-comment]')){
      ev.preventDefault();
      const id = f.dataset.comment;
      const c = S.addComment(id, { name: f.elements.name.value, text: f.elements.text.value });
      if (!c){ toast('コメントを入力してください'); return; }
      const e = S.byId(id);
      const box = viewIn.querySelector('#comments');
      if (box && e){
        const tmp = document.createElement('div');
        tmp.innerHTML = R.back(e);
        const fresh = tmp.querySelector('#comments');
        if (fresh) box.replaceWith(fresh);
      }
      refreshCounts(id);
      toast('コメントしました');
    }
  });

  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && view.classList.contains('on')){ ev.preventDefault(); closeView(); }
  });

  /* 左から払って戻るとき、この画面の中で戻れるならそうする。 */
  window.BCSwipeBack = () => {
    if (view.classList.contains('on')){ closeView(); return true; }
    if (window.scrollY > introEnd + 8){ glideTo(introEnd, 520); return true; }
    return false;
  };

  /* エディターや管理画面で書き換えられたら、組み直す */
  const rebuild = () => { build(); R.buildCloud(cloud); paint(); };
  window.addEventListener('storage', ev => { if (ev.key === S.KEY) rebuild(); });
  window.addEventListener('pageshow', ev => { if (ev.persisted) rebuild(); });

  /* ---------- 起動 ---------- */
  build();
  R.buildCloud(cloud);
  measure();
  setDock(null);
  paint();

  /* 裏面を名指しで開かれたとき（公開直後・共有されたリンク）は、
     ストリームもそのカードの位置まで開いておく。閉じたときに、
     そのカードの前へ戻れるように。 */
  const initial = location.hash.slice(1);
  if (initial){
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const m = initial.match(/^\/c\/(.+)$/);
    let slug = null;
    try { slug = m ? decodeURIComponent(m[1]) : null; } catch (e) {}
    if (slug && S.byContextSlug(slug)){
      open();
      const settle = () => { measure(); const y = cardTop(slug); if (y != null) scrollToY(y); paint(); };
      requestAnimationFrame(settle);
      window.addEventListener('load', () => setTimeout(settle, 60), { once: true });
    }
    route();
  } else {
    window.addEventListener('load', () => { measure(); paint(); }, { once: true });
  }
})();

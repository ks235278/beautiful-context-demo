/* index.html の動き。前田先生の構成図 flow0921-2 のとおり。

     表紙 → UniverseIt!（流れる見出し）
        見出しに触れる → 作品ページ／コンテクストページ
     作品ページ A ⇄ コンテクストページ A―B ⇄ 作品ページ B   … 路線に沿って移る
        UNIverseIt! → UniverseIt! へ戻る　／　ReMixIt! → エディター

   ページが替わるときは、絵が動いてつなぐ。同じ作品の絵は前の位置から
   次の位置へそのまま運ばれ、新しく現れる絵は路線の向きから入ってくる。
   見出しから開くときは、触れた言葉の位置から絵が開く。

   重ねて開いたページは # に道筋を残す（#/w/…, #/c/…）。
   携帯では右へ払うと戻り、左へ払うと路線の先へ進む。
   パソコンではブラウザの戻る・Esc、← → で路線を移る。 */
(() => {
  const S = window.BCStore, R = window.BCRender;
  const $ = (id) => document.getElementById(id);

  const dock = $('dock'), actions = dock.querySelector('.actions'), map = $('map');
  const intro = $('intro'), stick = intro.querySelector('.intro-stick');
  const bg = $('bg'), cloud = $('cloud'), netLabel = $('netLabel');
  const view = $('view'), viewIn = $('viewIn'), ld = $('ld');
  const uniBtn = $('uniBtn'), remix = $('remix');

  const settings = S.settings();
  const brand = settings.brand || 'Beautiful Context';
  $('wordmark').textContent = brand;
  $('tagline').textContent = settings.tagline || '';
  document.title = brand;

  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const motionOK = () => !reduced.matches;

  function toast(msg){
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove('show'), 1800);
  }

  const listLd = () => JSON.stringify(R.listLd(S.visible(), brand));
  ld.textContent = listLd();

  /* ---------- 導入部のスクロール連動 ----------
     表紙が薄れるにつれて路線図が現れ、線はそのまま流れ続ける。 */
  const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const ease  = v => { const t = clamp(v); return t * t * (3 - 2 * t); };

  let introEnd = 0, ticking = false;
  function measure(){ introEnd = Math.max(1, intro.offsetHeight - window.innerHeight); }

  function paint(){
    ticking = false;
    const p = clamp(window.scrollY / introEnd);
    /* 上へ流れる距離と薄れる時間を同じ進行にする */
    const wordmarkFlow = ease((p - 0.02) / 0.42);
    stick.style.setProperty('--wm', (1 - wordmarkFlow).toFixed(3));
    stick.style.setProperty('--wy', (-window.innerHeight * 0.42 * wordmarkFlow).toFixed(1) + 'px');
    const cl = ease((p - 0.25) / 0.36);
    bg.style.setProperty('--cl', cl.toFixed(3));
    stick.style.setProperty('--cl', cl.toFixed(3));
    cloud.style.pointerEvents = cl > 0.55 ? 'auto' : 'none';
    netLabel.classList.toggle('live', cl > 0.55);
    /* 流れる見出しに少し遅れて、手で触れる二つが現れる */
    const dk = ease((p - 0.68) / 0.20);
    dock.style.setProperty('--dk', dk.toFixed(3));
    if (actions) actions.style.pointerEvents = document.body.classList.contains('route') || dk > 0.5 ? 'auto' : 'none';
  }
  function onScroll(){ if (!ticking){ ticking = true; requestAnimationFrame(paint); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); paint(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden){ measure(); paint(); } });

  /* scroll-behavior:smooth が効いていると scrollTo が打ち切られるため、
     跳ぶ瞬間だけ auto に落とす。 */
  function scrollToY(y){
    const de = document.documentElement;
    const keep = de.style.scrollBehavior;
    de.style.scrollBehavior = 'auto';
    window.scrollTo(0, y);
    requestAnimationFrame(() => { de.style.scrollBehavior = keep; });
  }
  /* 自前で送る。指で触ったら即座に譲る。 */
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

  /* 表紙で止まったままの人のために、しばらく待って路線図まで送る。
     構成図の「一定時間もしくはクリックで次へ」。触れれば待たずに送る。 */
  let idle = 0, touched = false;
  const armIdle = () => {
    clearTimeout(idle);
    if (touched) return;
    idle = setTimeout(() => {
      if (touched || view.classList.contains('on') || window.scrollY >= 30) return;
      /* 裏に回っている間は送らない。表に出てきたら、もう一度待ち直す */
      if (document.hidden) return;
      glideTo(introEnd, motionOK() ? 2600 : 10);
    }, 3800);
  };
  const stopIdle = () => { touched = true; clearTimeout(idle); };
  ['touchstart', 'wheel', 'keydown'].forEach(ev => window.addEventListener(ev, stopIdle, { once: true, passive: true }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden && window.scrollY < 30) armIdle(); });

  /* ---------- 路線 ---------- */
  let here = null;   /* いま開いているページ { key, kind, entry, step } */

  function stepHash(entry, step){
    const c = encodeURIComponent(entry.context.slug);
    if (step === 1) return '#/c/' + c;
    const w = step === 0 ? entry.a : entry.b;
    return '#/w/' + encodeURIComponent(w.slug) + '?c=' + c;
  }

  /* ---------- 道筋（履歴） ---------- */
  /* 戻るときは、ブラウザの履歴が動くのを待たずに先に絵を動かす。
     端末によっては履歴の巻き戻しに数百ミリ秒かかり、触れてから
     何も起きない間ができてしまうため。自分で積んだ道筋を覚えておく。 */
  const stack = [];
  const depth = () => (history.state && history.state.bcDepth) || 0;
  const base = () => location.pathname + location.search;
  function go(hash, motion, replace){
    if (replace){ history.replaceState({ bcDepth: depth() }, '', hash); stack[Math.max(0, stack.length - 1)] = hash; }
    else { history.pushState({ bcDepth: depth() + 1 }, '', hash); stack.push(hash); }
    routeTo(hash, motion);
  }
  function goStep(step, from){
    if (!here || !here.entry || step < 0 || step > 2 || step === here.step) return;
    go(stepHash(here.entry, step), { dir: Math.sign(step - here.step), origin: from || null });
  }
  function closeView(){
    if (!view.classList.contains('on')) return;
    const d = depth();
    if (d > 0){
      stack.pop();
      if (d === 1) hideView({ toCenter: true });
      else if (stack.length) routeTo(stack[stack.length - 1], null);
      history.back();
    } else {
      stack.length = 0;
      history.replaceState(null, '', base());
      hideView({ toCenter: true });
    }
  }
  /* UNIverseIt!：どこまで進んでいても、流れる見出しへ一度で戻る */
  function toNetwork(){
    const d = depth();
    stack.length = 0;
    hideView({ toCenter: true });
    if (d > 0) history.go(-d);
    else history.replaceState(null, '', base());
  }
  /* ブラウザの戻る・進むで動いたときは、覚えている道筋を合わせてから開く */
  function onHistory(){
    const h = location.hash;
    if (!h || h === '#' || h === '#/') stack.length = 0;
    else if (stack[stack.length - 1] !== h){
      if (stack[stack.length - 2] === h) stack.pop();
      else { stack.length = 0; stack.push(h); }
    }
    routeTo(h, null);
  }
  window.addEventListener('popstate', onHistory);
  window.addEventListener('hashchange', onHistory);

  function routeTo(hash, motion){
    let h = String(hash || '').replace(/^#/, '');
    try { h = decodeURIComponent(h); } catch (e) {}
    if (!h || h === '/'){ hideView(motion || { toCenter: true }); return; }
    /* 以前の形（#区間名）で開かれたら、コンテクストページへ */
    if (!h.startsWith('/')){
      if (S.byContextSlug(h)){ const to = '#/c/' + encodeURIComponent(h); history.replaceState(null, '', to); routeTo(to, motion); }
      else hideView(motion);
      return;
    }
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean);
    const name = parts[0], arg = parts.slice(1).join('/');
    const q = new URLSearchParams(qs || '');

    if (name === 'c' && arg){
      const e = S.byContextSlug(arg);
      if (e) return show({ key: 'c:' + e.id, kind: 'route', entry: e, step: 1 },
        R.contextPage(e, pickAd(e), brand), motion, `${e.a.title} ＋ ${e.b.title}`);
    } else if (name === 'w' && arg){
      const hit = S.workBySlug(arg) || S.works(S.all()).find(w => w.slug === arg);
      if (hit){
        const want = q.get('c') && S.byContextSlug(q.get('c'));
        const e = want && (want.a.slug === arg || want.b.slug === arg) ? want
          : (hit.contexts[0] && hit.contexts[0].entry) || null;
        const step = e && e.b.slug === arg ? 2 : 0;
        return show({ key: 'w:' + arg + ':' + (e ? e.id : ''), kind: e ? 'route' : 'page', entry: e, step },
          R.workPage(hit, e, brand), motion, hit.work.title);
      }
    } else if (name === 'search'){
      const s = q.get('q') || '';
      return show({ key: 's:' + s, kind: 'page' }, R.search(s, S.search(s)), motion, s ? `「${s}」を辿る` : '言葉で辿る');
    } else if (['mission', 'terms', 'ad', 'credits'].includes(name)){
      return show({ key: 'p:' + name, kind: 'page' }, R.page(name, brand), motion,
        { mission: 'Our Mission', terms: '利用規約・プライバシー', ad: '広告枠のご案内', credits: '画像の出典' }[name]);
    }
    show({ key: '404', kind: 'page' }, R.page('404', brand), motion, 'ページが見つかりません');
  }

  /* 記事単位の広告枠。区間ごとに決まった枠が出る */
  function pickAd(e){
    const ads = S.activeAds();
    if (!ads.length || !(parseInt(settings.adEvery, 10) > 0)) return null;
    let h = 0; for (const ch of e.context.slug) h = (h * 31 + ch.charCodeAt(0)) | 0;
    return ads[Math.abs(h) % ads.length];
  }

  /* ---------- 絵でつなぐ ----------
     替わる前の絵の位置を控えておき、新しいページを置いてから、
     それぞれの絵を前の位置から新しい位置へ運ぶ。
     運んでいるあいだ本物は隠しておき、着いたら入れ替える。 */
  const DUR = 640;
  const EASE = 'cubic-bezier(.22,.8,.22,1)';
  let inflight = [];
  function settleAll(){
    inflight.forEach(fn => fn());
    inflight = [];
  }

  function capture(){
    if (!view.classList.contains('on')) return [];
    return [...viewIn.querySelectorAll('img[data-k]')].map(im => {
      const r = im.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight || r.width < 4 || !im.complete) return null;
      return { k: im.dataset.k, src: im.currentSrc || im.src, r, pos: getComputedStyle(im).objectPosition };
    }).filter(Boolean);
  }

  function ghostOf(dir){
    const g = document.createElement('div');
    g.className = 'ghost';
    const inner = viewIn.cloneNode(true);
    inner.removeAttribute('id');
    inner.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
    inner.querySelectorAll('img[data-k]').forEach(n => { n.style.visibility = 'hidden'; });
    inner.style.transform = `translateY(${-view.scrollTop}px)`;
    g.appendChild(inner);
    document.body.appendChild(g);
    const a = g.animate([
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: `translateX(${-(dir || 0) * 48}px)` }
    ], { duration: 300, easing: 'ease-out', fill: 'forwards' });
    const done = () => g.remove();
    a.onfinish = done;
    inflight.push(done);
  }

  function flyer(src, r, pos){
    const im = document.createElement('img');
    im.className = 'flyer';
    im.alt = '';
    im.src = src;
    Object.assign(im.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', objectPosition: pos || 'center 40%' });
    document.body.appendChild(im);
    return im;
  }
  const box = (r) => ({ left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
  const shift = (r, dx) => ({ left: r.left + dx, top: r.top, width: r.width, height: r.height });
  const around = (pt, w, h) => ({ left: pt.x - w / 2, top: pt.y - h / 2, width: w, height: h });
  const centerOf = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

  function fly(before, motion){
    const dir = motion.dir || 0;
    const W = window.innerWidth;
    const pool = before.slice();
    const targets = [...viewIn.querySelectorAll('img[data-k]')];
    targets.forEach((el, i) => {
      const frame = el.parentElement.getBoundingClientRect();
      if (frame.top > window.innerHeight || frame.bottom < 0) return;
      const j = pool.findIndex(b => b.k === el.dataset.k);
      const match = j >= 0 ? pool.splice(j, 1)[0] : null;
      let from, o0 = 1;
      if (match) from = match.r;
      else if (motion.origin){
        const w = 46; from = around(motion.origin, w, w * frame.height / frame.width); o0 = 0.15;
      } else if (dir) { from = shift(frame, dir * W * 0.9); }
      else { from = { left: frame.left + frame.width * 0.04, top: frame.top + frame.height * 0.04, width: frame.width * 0.92, height: frame.height * 0.92 }; o0 = 0; }
      const f = flyer(match ? match.src : (el.currentSrc || el.src), from, getComputedStyle(el).objectPosition);
      el.style.visibility = 'hidden';
      const opened = !match && motion.origin;
      const a = f.animate([{ ...box(from), opacity: o0 }, { ...box(frame), opacity: 1 }],
        { duration: opened ? DUR + 260 : DUR + (match ? 0 : 80),
          delay: match ? 0 : i * (opened ? 110 : 70),
          easing: opened ? 'cubic-bezier(.34,.62,.2,1)' : EASE, fill: 'both' });
      const done = () => { el.style.visibility = ''; f.remove(); };
      a.onfinish = done;
      inflight.push(done);
    });
    /* 前のページにしかない絵は、路線の反対側へ抜けていくか、中央へ溶ける */
    pool.forEach(b => {
      const f = flyer(b.src, b.r, b.pos);
      const c = { x: W / 2, y: window.innerHeight * 0.5 };
      const to = motion.toCenter ? around(c, 30, 30 * b.r.height / b.r.width)
        : dir ? shift(b.r, -dir * W * 0.55)
        : { left: b.r.left + b.r.width * 0.1, top: b.r.top + b.r.height * 0.1, width: b.r.width * 0.8, height: b.r.height * 0.8 };
      /* 見出しへ戻るときは、ゆっくり縮みながら、最後に溶ける */
      const a = f.animate(motion.toCenter
        ? [{ ...box(b.r), opacity: 1 }, { opacity: 0.85, offset: 0.55 }, { ...box(to), opacity: 0 }]
        : [{ ...box(b.r), opacity: 1 }, { ...box(to), opacity: 0 }],
        { duration: motion.toCenter ? DUR + 300 : DUR - 120,
          easing: motion.toCenter ? 'cubic-bezier(.5,.05,.3,1)' : EASE, fill: 'forwards' });
      const done = () => f.remove();
      a.onfinish = done;
      inflight.push(done);
    });
  }

  /* ---------- ページを置く ---------- */
  function show(page, html, motion, title){
    if (here && here.key === page.key && view.classList.contains('on')) return;
    settleAll();
    motion = motion || {};
    if (!motion.dir && here && here.entry && page.entry && here.entry.id === page.entry.id){
      motion.dir = Math.sign(page.step - here.step);
    }
    const moving = motionOK();
    const was = view.classList.contains('on');
    const before = moving ? capture() : [];
    if (moving && was) ghostOf(motion.dir);

    here = page;
    viewIn.innerHTML = html;
    view.scrollTop = 0;
    view.setAttribute('aria-label', title || '');
    document.title = (title ? title + '｜' : '') + brand;
    ld.textContent = page.kind === 'route' && page.entry && page.step === 1
      ? JSON.stringify(R.jsonLd(page.entry, location.href)) : listLd();

    document.body.classList.add('viewing');
    document.body.classList.toggle('route', page.kind === 'route');
    if (page.kind === 'route') setDock(page.entry, page.step);
    else setDock(null);
    paint();

    const duo = viewIn.querySelector('.duo');
    if (!moving){
      view.classList.remove('enter');
      view.classList.add('on');
      focusPage();
      return;
    }
    if (duo) duo.classList.add('draw');
    view.classList.add('on', 'instant');
    view.classList.remove('enter'); void view.offsetWidth; view.classList.add('enter');
    fly(before, motion);
    view.style.pointerEvents = 'none';
    setTimeout(() => {
      view.style.pointerEvents = '';
      view.classList.remove('instant');
      if (duo) duo.classList.add('drawn');
      focusPage();
    }, DUR + 60);
  }

  function focusPage(){
    const f = viewIn.querySelector('.search-page input') || viewIn.querySelector('.back-close');
    if (f) f.focus({ preventScroll: true });
  }

  function hideView(motion){
    if (!view.classList.contains('on')){ here = null; return; }
    settleAll();
    const moving = motionOK();
    const before = moving ? capture() : [];
    if (moving) ghostOf(0);
    /* 前のページはここで片づける。残しておくと、運ぶ先の絵として
       自分自身と組になり、絵がその場から動かない */
    viewIn.innerHTML = '';
    here = null;
    document.title = brand;
    ld.textContent = listLd();
    view.classList.add('instant');
    view.classList.remove('on', 'enter');
    document.body.classList.remove('viewing', 'route');
    setDock(null);
    /* 戻る先は流れる見出し。直接ページを開いて来た人も、ここへ着く */
    measure();
    if (window.scrollY < introEnd * 0.9) scrollToY(introEnd);
    paint();
    if (moving && before.length) fly(before, motion || { toCenter: true });
    setTimeout(() => { view.classList.remove('instant'); }, DUR + 140);
  }

  /* ページを送ると、大きな絵は文字より遅れてついてくる */
  let pxTick = false;
  view.addEventListener('scroll', () => {
    if (pxTick || !motionOK()) return;
    pxTick = true;
    requestAnimationFrame(() => {
      pxTick = false;
      const y = view.scrollTop;
      const px = viewIn.querySelector('.w-hero .px');
      if (px) px.style.transform = `translate3d(0,${(y * 0.38).toFixed(1)}px,0) scale(${(1 + Math.min(y, 400) / 4000).toFixed(4)})`;
      const duo = viewIn.querySelector('.duo');
      if (duo) duo.style.transform = `translate3d(0,${(y * 0.2).toFixed(1)}px,0)`;
    });
  }, { passive: true });

  /* ---------- ドック ---------- */
  let mapSwap = 0;
  function setDock(e, step){
    if (!e){
      mapSwap++;
      map.innerHTML = '';
      remix.href = 'editor.html?new=1';
      return;
    }
    const c = e.context;
    const markup = R.mapMarkup({
      lineName: c.routeName,
      left: c.leftStation || e.a.title,
      right: c.rightStation || e.b.title,
      label: c.label || 'CONTEXT',
      current: step
    });
    /* ReMixIt! は、いま立っている作品に新しいつながりを足す入口 */
    remix.href = 'editor.html?from=' + encodeURIComponent(step === 2 ? e.b.slug : e.a.slug);
    const oldLayers = [...map.querySelectorAll('.map-layer')];
    const old = oldLayers.pop() || null;
    oldLayers.forEach(layer => layer.remove());
    if (!old || !motionOK()){
      map.innerHTML = `<div class="map-layer">${markup}</div>`;
      return;
    }
    const next = document.createElement('div');
    next.className = 'map-layer entering';
    next.innerHTML = markup;
    map.appendChild(next);
    const swap = ++mapSwap;
    requestAnimationFrame(() => { old.classList.add('leaving'); next.classList.remove('entering'); });
    setTimeout(() => {
      if (swap !== mapSwap) return;
      [...map.querySelectorAll('.map-layer')].forEach(layer => { if (layer !== next) layer.remove(); });
    }, 340);
  }

  /* ---------- 触れたもの ---------- */
  const rectOf = (el) => centerOf(el.getBoundingClientRect());

  uniBtn.addEventListener('click', () => {
    if (document.body.classList.contains('route') || view.classList.contains('on')){ toNetwork(); return; }
    /* 流れる見出しの画面では、いちばん新しい区間の最初の駅から辿り始める */
    const first = S.visible()[0];
    if (!first){ toast('まだ公開されたコンテクストがありません'); return; }
    go(stepHash(first, 0), { origin: rectOf(uniBtn) });
  });

  $('wordmark').addEventListener('click', () => glideTo(introEnd, 1600));

  cloud.addEventListener('click', ev => {
    const t = ev.target.closest('.tag');
    if (!t) return;
    const origin = rectOf(t);
    if (t.dataset.work) go('#/w/' + encodeURIComponent(t.dataset.work), { origin });
    else if (t.dataset.ctx) go('#/c/' + encodeURIComponent(t.dataset.ctx), { origin });
  });
  const hold = on => cloud.querySelectorAll('.run').forEach(r => r.classList.toggle('paused', on));
  cloud.addEventListener('pointerenter', ev => { if (ev.pointerType === 'mouse') hold(true); });
  cloud.addEventListener('pointerleave', () => hold(false));

  document.addEventListener('click', ev => {
    const t = ev.target;
    if (t.closest('[data-close]')){ ev.preventDefault(); closeView(); return; }
    const home = t.closest('[data-home]');
    if (home){ ev.preventDefault(); toNetwork(); return; }

    const step = t.closest('[data-step]');
    if (step && here && here.entry){ goStep(+step.dataset.step, rectOf(step)); return; }

    if (t.closest('[data-read]')){
      const story = viewIn.querySelector('#story');
      if (story) view.scrollTo({ top: story.getBoundingClientRect().top + view.scrollTop - 24, behavior: motionOK() ? 'smooth' : 'auto' });
      return;
    }

    /* ページの中の # 道筋は、履歴に積んでから開く */
    const a = t.closest('a[href^="#/"]');
    if (a){ ev.preventDefault(); go(a.getAttribute('href'), { origin: a.closest('.view') ? null : rectOf(a) }); return; }

    /* 表紙のどこに触れても、路線図まで送る */
    if (!view.classList.contains('on') && window.scrollY < introEnd * 0.3 &&
        !t.closest('a,button,input,form,.tag')){
      stopIdle();
      glideTo(introEnd, motionOK() ? 1800 : 10);
    }
  });

  document.addEventListener('submit', ev => {
    const f = ev.target;
    if (!f.matches('[data-seek]')) return;
    ev.preventDefault();
    const q = (f.elements.q.value || '').trim();
    const inView = !!f.closest('.view');
    go('#/search?q=' + encodeURIComponent(q), null, inView);
    if (!inView) f.elements.q.blur();
  });

  document.addEventListener('keydown', ev => {
    const tgt = ev.target;
    if (!view.classList.contains('on') || (tgt && tgt.closest && tgt.closest('input,textarea'))) return;
    if (ev.key === 'Escape'){ ev.preventDefault(); closeView(); }
    else if (ev.key === 'ArrowRight' && here && here.entry){ ev.preventDefault(); goStep(here.step + 1); }
    else if (ev.key === 'ArrowLeft' && here && here.entry){ ev.preventDefault(); goStep(here.step - 1); }
  });

  /* 右へ払えば戻る（transition.js）。左へ払えば路線の先へ進む */
  let sx = 0, sy = 0, swiping = false;
  document.addEventListener('touchstart', e => {
    if (e.touches.length !== 1 || !document.body.classList.contains('route')) { swiping = false; return; }
    const t = e.touches[0];
    if (t.target.closest && t.target.closest('input,textarea,select')) { swiping = false; return; }
    sx = t.clientX; sy = t.clientY; swiping = true;
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (!swiping) return;
    swiping = false;
    const t = e.changedTouches && e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - sx, dy = Math.abs(t.clientY - sy);
    if (dx <= -88 && -dx > dy * 1.6 && here && here.entry && here.step < 2) goStep(here.step + 1);
  }, { passive: true });

  window.BCSwipeBack = () => {
    if (view.classList.contains('on')){ closeView(); return true; }
    return false;
  };

  /* エディターや管理画面で書き換えられたら、組み直す */
  const rebuild = () => { R.buildCloud(cloud); paint(); };
  window.addEventListener('storage', ev => { if (ev.key === S.KEY) rebuild(); });
  window.addEventListener('pageshow', ev => { if (ev.persisted) rebuild(); });

  /* 絵を先に読んでおく。運ぶ途中で白くならないように。
     50 近い駅があるので、一度に投げずに二本の列で順に読む */
  const preload = () => {
    const q = [...new Set(S.visible().flatMap(e => [e.a.image, e.b.image]).map(R.safeImg).filter(Boolean))];
    const next = () => {
      const s = q.shift(); if (!s) return;
      const i = new Image(); i.decoding = 'async'; i.fetchPriority = 'low';
      i.onload = i.onerror = next; i.src = s;
    };
    next(); next();
  };

  /* ---------- 起動 ---------- */
  R.buildCloud(cloud);
  measure();
  setDock(null);
  paint();
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  if (location.hash.length > 2){
    /* ページを名指しで開かれたときは、後ろを路線図にしておく。
       閉じたときに、流れる見出しの前へ出られるように。 */
    scrollToY(introEnd);
    stack.push(location.hash);
    routeTo(location.hash, null);
    window.addEventListener('load', () => { measure(); if (!view.classList.contains('on')) scrollToY(introEnd); paint(); }, { once: true });
  } else {
    armIdle();
    window.addEventListener('load', () => { measure(); paint(); }, { once: true });
  }
  (window.requestIdleCallback || ((f) => setTimeout(f, 800)))(preload);
})();

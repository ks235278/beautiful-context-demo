/* index.html の動き。前田先生の構成図 flow0921-2 と demo-1 のとおり。

     表紙（BEAUTIFUL CONTEXT）── 一定時間、もしくは触れると ──→ UniverseIt!
     UniverseIt! の「# 言葉」に触れる → 作品ページ
     作品ページ A ⇄ コンテクストページ A―B ⇄ 作品ページ B   … 下の路線図・「コンテクストを見る」
     つながりを辿る（UniverseIt!）→ UniverseIt! へ戻る　／　つながりを創る（ReMixIt!）→ エディター

   先生の指示は「適当にスマホらしい切り替えを」。ページが替わるときは絵が動いてつなぎ、
   同じ作品の絵は前の位置から次の位置へそのまま運ばれる。
   スクロールは普通のスクロールのまま。画面を勝手に動かさない。

   重ねて開いたページは # に道筋を残す（#/w/…, #/c/…）。
   携帯では右へ払うと戻り、左へ払うと路線の先へ進む。
   パソコンではブラウザの戻る・Esc、← → で路線を移る。 */
(() => {
  const S = window.BCStore, R = window.BCRender;
  const $ = (id) => document.getElementById(id);
  const body = document.body;

  const dock = $('dock'), map = $('map');
  const intro = $('intro'), tags = $('tags');
  const view = $('view'), viewIn = $('viewIn'), ld = $('ld');
  const uniBtn = $('uniBtn'), remix = $('remix');
  const menu = $('menu'), menuBtn = $('menuBtn');

  const settings = S.settings();
  const brand = settings.brand || 'Beautiful Context';
  /* 表紙のロゴ：名前を二つに分け、あいだに丸いマークを置く（BEAUTIFUL ◉ CONTEXT） */
  {
    const wm = $('wordmark'), parts = brand.trim().split(/\s+/);
    const head = parts.length > 1 ? parts.slice(0, Math.ceil(parts.length / 2)).join(' ') : brand;
    const tail = parts.length > 1 ? parts.slice(Math.ceil(parts.length / 2)).join(' ') : '';
    /* 名前が既定のままなら、先生の構成図のロゴそのもの（画像）。フォントの読み込みを待たず、形も変わらない */
    if (!/^beautiful context$/i.test(brand.trim())){
      wm.setAttribute('aria-label', brand);
      wm.innerHTML = `<span>${R.esc(head)}</span><img class="mark" src="img/logo-mark.png" alt="">` + (tail ? `<span>${R.esc(tail)}</span>` : '');
    }
  }
  $('dockBrand').textContent = brand;
  if (settings.tagline) $('tagline').textContent = settings.tagline;
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

  /* 下の帯と上の見出しの高さを、UniverseIt! の一覧とページの余白に渡す */
  const uniHead = $('uniHead');
  function measureDock(){
    const root = document.documentElement.style;
    root.setProperty('--dockh', Math.ceil(dock.getBoundingClientRect().height) + 'px');
    /* 見出しは上に留めてあり、言葉の一覧はその下から始まる */
    root.setProperty('--headh', Math.ceil(uniHead.offsetHeight + 4) + 'px');
  }
  window.addEventListener('resize', measureDock);

  /* ---------- 表紙 → UniverseIt! ----------
     構成図 flowchart2 の「一定時間もしくはクリックで次へ」。 */
  let stage = 'intro', idle = 0;
  function toUni(animate){
    if (stage === 'uni') return;
    stage = 'uni';
    clearTimeout(idle);
    body.classList.remove('stage-intro');
    body.classList.add('stage-uni');
    if (animate && motionOK()){
      body.classList.add('uni-enter');
      setTimeout(() => body.classList.remove('uni-enter'), 2600);
    }
    measureDock();
  }
  function armIdle(){
    clearTimeout(idle);
    idle = setTimeout(() => {
      if (stage !== 'intro') return;
      /* 裏に回っている間は送らない。表に出てきたら、もう一度待ち直す */
      if (document.hidden) return;
      toUni(true);
    }, 2800);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && stage === 'intro') armIdle(); });
  intro.addEventListener('click', () => toUni(true));
  window.addEventListener('keydown', (ev) => {
    if (stage === 'intro' && (ev.key === 'Enter' || ev.key === ' ')){ ev.preventDefault(); toUni(true); }
  });

  /* ---------- メニュー（≡） ---------- */
  function openMenu(on){
    if (on){
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('open'));
      menuBtn.setAttribute('aria-expanded', 'true');
      if (stage === 'intro') toUni(false);
    } else {
      menu.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      setTimeout(() => { if (!menu.classList.contains('open')) menu.hidden = true; }, 400);
    }
  }
  menuBtn.addEventListener('click', (ev) => { ev.stopPropagation(); openMenu(menu.hidden || !menu.classList.contains('open')); });

  /* A / WHITE（ReMixIt!）と B / CHARCOAL（UniverseIt!）。左右に並ぶ二つの画面 */
  function setTheme(theme){
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'white' ? '#ffffff' : '#061629';
    document.documentElement.style.setProperty('--veil', theme === 'white' ? '#ffffff' : '#061629');
    markTheme();
    if (typeof paintSelection === 'function') paintSelection();
  }
  function markTheme(){
    const cur = document.documentElement.dataset.theme || 'charcoal';
    menu.querySelectorAll('[data-theme-set]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeSet === cur)));
  }
  menu.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-theme-set]');
    if (!b) return;
    const theme = b.dataset.themeSet === 'white' ? 'white' : 'charcoal';
    S.saveSettings({ theme });
    setTheme(theme);
  });
  markTheme();

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
  function closeView(motion){
    if (!view.classList.contains('on')) return;
    const d = depth();
    backNav = true;
    if (d > 0){
      stack.pop();
      if (d === 1) hideView(motion || { toCenter: true });
      else if (stack.length) routeTo(stack[stack.length - 1], motion || null);
      history.back();
    } else {
      stack.length = 0;
      history.replaceState(null, '', base());
      hideView(motion || { toCenter: true });
    }
  }
  /* つながりを辿る（UniverseIt!）：どこまで進んでいても、一度で戻る */
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
      if (stack[stack.length - 2] === h){ stack.pop(); backNav = true; }
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
        R.contextPage(e, pickAd(e)), motion, `${e.a.title} ＋ ${e.b.title}`);
    } else if (name === 'w' && arg){
      const hit = S.workBySlug(arg) || S.works(S.all()).find(w => w.slug === arg);
      if (hit){
        const want = q.get('c') && S.byContextSlug(q.get('c'));
        const e = want && (want.a.slug === arg || want.b.slug === arg) ? want
          : (hit.contexts[0] && hit.contexts[0].entry) || null;
        const step = e && e.b.slug === arg ? 2 : 0;
        return show({ key: 'w:' + arg + ':' + (e ? e.id : ''), kind: e ? 'route' : 'page', entry: e, step, work: true, slug: arg },
          R.workPage(hit, e), motion, hit.work.title);
      }
    } else if (name === 'f' && arg){
      const items = S.feed(arg);
      if (items.length) return show({ key: 'f:' + arg, kind: 'page', feed: items },
        R.feedPage(items, FEED_BATCH), motion, `${R.tagText(items[0].work)}から辿る`);
    } else if (name === 'search'){
      const s = q.get('q') || '';
      return show({ key: 's:' + s, kind: 'page' }, R.search(s, S.search(s)), motion, s ? `「${s}」を辿る` : '言葉で辿る');
    } else if (['mission', 'terms', 'ad', 'credits'].includes(name)){
      return show({ key: 'p:' + name, kind: 'page' }, R.page(name), motion,
        { mission: 'Our Mission', terms: '利用規約・プライバシー', ad: '広告枠のご案内', credits: '画像の出典' }[name]);
    }
    show({ key: '404', kind: 'page' }, R.page('404'), motion, 'ページが見つかりません');
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
    const list = [...viewIn.querySelectorAll('img[data-k]')].map(im => {
      if (lifted && im.dataset.k === lifted.k) return null;
      const r = im.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight || r.width < 4 || !im.complete) return null;
      return { k: im.dataset.k, src: im.currentSrc || im.src, r, pos: getComputedStyle(im).objectPosition };
    }).filter(Boolean);
    if (lifted) list.unshift({ k: lifted.k, src: lifted.src, r: lifted.r, pos: lifted.pos });
    return list;
  }

  function ghostOf(dir, from){
    const g = document.createElement('div');
    g.className = 'ghost';
    const inner = viewIn.cloneNode(true);
    inner.removeAttribute('id');
    inner.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
    inner.querySelectorAll('img[data-k]').forEach(n => { n.style.visibility = 'hidden'; });
    /* 写しは見えている一画面ぶんだけ描く（路線の遠い駅まで描くと重い） */
    const H = window.innerHeight, copies = inner.querySelectorAll('.stop');
    viewIn.querySelectorAll('.stop').forEach((s, i) => {
      const r = s.getBoundingClientRect();
      if ((r.bottom < -40 || r.top > H + 40) && copies[i]) copies[i].style.visibility = 'hidden';
    });
    inner.style.transform = `translateY(${-window.scrollY}px)`;
    g.appendChild(inner);
    document.body.appendChild(g);
    const a = g.animate([
      { opacity: from == null ? 1 : from, transform: 'translateX(0)' },
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
    Object.assign(im.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', objectPosition: pos || 'center 45%' });
    document.body.appendChild(im);
    return im;
  }
  const box = (r) => ({ left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
  const shift = (r, dx) => ({ left: r.left + dx, top: r.top, width: r.width, height: r.height });
  const around = (pt, w, h) => ({ left: pt.x - w / 2, top: pt.y - h / 2, width: w, height: h });
  const centerOf = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

  /* ---------- 絵の動きは物理のとおりに ----------
     1. 瞬間移動しない：両方のページにある作品の絵は、前の位置から新しい位置まで連続して動く。
        遠いほど長くかかる（距離の平方根に比例）。
     2. 絵はページに載っている：片方のページにしかない絵は、自分のページと同じ向き・同じ速さで
        入ってくる／出ていく。ページとちがう向きに勝手に飛ばない。
     3. 触れたところから出て、元の場所へ帰る：言葉から開いた作品の絵はその言葉から現れ、
        UniverseIt! へ戻るときは、見えている自分の言葉へ吸い込まれる。
     飛ぶ層は下の帯（ボタン）より下。帯の裏にかかる絵も、帯の下を通って動く。 */
  const SIDE = 48;   /* 前のページの写しが横へ抜ける量（ghostOf と同じ） */
  /* 祖先の移動（浮かび上がり・横すべり）を差し引いた、落ち着いたあとの位置 */
  function settled(el){
    const r = el.getBoundingClientRect();
    let dx = 0, dy = 0;
    for (let n = el.parentElement; n && n !== viewIn; n = n.parentElement){
      const t = getComputedStyle(n).transform;
      if (t && t !== 'none'){ const m = new DOMMatrixReadOnly(t); dx += m.m41; dy += m.m42; }
    }
    return { left: r.left - dx, top: r.top - dy, width: r.width, height: r.height, bottom: r.bottom - dy };
  }
  const travel = (a, b) => {
    const d = Math.hypot(a.left + a.width / 2 - b.left - b.width / 2, a.top + a.height / 2 - b.top - b.height / 2);
    return Math.round(Math.min(860, Math.max(460, 360 + Math.sqrt(d) * 15)));
  };
  function fly(before, motion){
    const dir = motion.dir || 0;
    const H = window.innerHeight;
    const pool = before.slice();
    const targets = [...viewIn.querySelectorAll('img[data-k]')];
    let emerged = false;
    targets.forEach((el) => {
      const holder = el.parentElement;
      const frame = settled(holder);
      if (frame.top > H || frame.bottom < 0) return;
      const j = pool.findIndex(b => b.k === el.dataset.k);
      const match = j >= 0 ? pool.splice(j, 1)[0] : null;
      /* 触れた言葉から出てくるのは、最初の一枚（選んだ作品）だけ */
      const emerge = !match && motion.origin && !emerged;
      if (!match && !emerge) return;            /* ページに載ったまま入ってくる */
      if (emerge) emerged = true;
      const from = match ? match.r : around(motion.origin, 46, 46 * frame.height / frame.width);
      const f = flyer(match ? match.src : (el.currentSrc || el.src), from, getComputedStyle(el).objectPosition);
      el.style.visibility = 'hidden';
      holder.classList.add('landing');
      const a = f.animate([{ ...box(from), opacity: match ? 1 : 0.2 }, { ...box(frame), opacity: 1 }],
        { duration: travel(from, frame) + (emerge ? 180 : 0),
          easing: emerge ? 'cubic-bezier(.34,.62,.2,1)' : EASE, fill: 'both' });
      const done = () => { el.style.visibility = ''; holder.classList.remove('landing'); f.remove(); };
      a.onfinish = done;
      inflight.push(done);
    });
    /* 前のページにしかない絵 */
    pool.forEach(b => {
      const f = flyer(b.src, b.r, b.pos);
      let to, frames, opt;
      const tag = motion.toCenter && tags.querySelector(`.tag[data-work="${CSS.escape(b.k)}"]`);
      const tr = tag && tag.getBoundingClientRect();
      if (motion.toCenter){
        /* 自分の言葉が見えていればそこへ、見えなければ画面の中心（宇宙）へ帰る */
        const home = tr && tr.bottom > 0 && tr.top < H ? centerOf(tr) : { x: window.innerWidth / 2, y: H * 0.5 };
        to = around(home, 24, 24 * b.r.height / b.r.width);
        frames = [{ ...box(b.r), opacity: 1 }, { opacity: 0.9, offset: 0.6 }, { ...box(to), opacity: 0 }];
        opt = { duration: travel(b.r, to) + 160, easing: 'cubic-bezier(.5,.05,.3,1)' };
      } else {
        /* 前のページの文字と同じ向きに、同じだけ動いて、同じ速さで消える */
        to = dir ? shift(b.r, -dir * SIDE) : b.r;
        frames = [{ ...box(b.r), opacity: 1 }, { ...box(to), opacity: 0 }];
        opt = { duration: 300, easing: 'ease-out' };
      }
      const a = f.animate(frames, { ...opt, fill: 'forwards' });
      const done = () => f.remove();
      a.onfinish = done;
      inflight.push(done);
    });
  }

  /* ---------- ページを置く ---------- */
  let uniScroll = 0;   /* ページを開く前の UniverseIt! のスクロール位置 */
  let lifted = null;   /* 持ち上げて離した絵：その位置から運ぶ（下の「絵を指でつかむ」） */
  let armStrips = () => {};   /* ページを置いたとき、絵に指の仕掛けを付ける（下で定める） */
  const readCtx = new Set();  /* このセッションで読んだコンテクスト */
  const memo = new Map();   /* ページごとのスクロール位置 */
  let backNav = false;      /* 戻る向きの移動か */
  let dry = null;           /* 描かずに組み立てるときの受け皿 */
  /* 来た画面の写しを、持ち上げた絵の後ろに置く（離したときの位置のまま） */
  /* held：いま指で持っている作品。その作品の絵は、来た画面の中でも空けておく（同じ絵は一枚しかない） */
  function underlay(held){
    if (stack.length < 2) return false;
    dry = {};
    try { routeTo(stack[stack.length - 2], null); } finally { var got = dry; dry = null; }
    if (!got || !got.html) return false;
    const m = memo.get(got.page.key) || { y: 0, n: 0 };
    const u = document.createElement('div');
    u.className = 'underlay';
    const inner = document.createElement('div');
    inner.className = 'view-in';
    inner.innerHTML = got.html;
    if (got.page.feed && m.n > FEED_BATCH){
      const rail = inner.querySelector('#rail');
      if (rail) rail.insertAdjacentHTML('beforeend', R.feedStops(got.page.feed, FEED_BATCH, m.n));
    }
    inner.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
    inner.querySelectorAll('img[data-k]').forEach(im => {
      if (im.dataset.k !== held) return;
      im.style.visibility = 'hidden';
      im.parentElement.classList.add('landing');   /* 黒い枠も見せず、絵が帰る場所として空けておく */
    });
    inner.style.transform = `translateY(${-m.y}px)`;
    u.appendChild(inner);
    document.body.appendChild(u);
    return true;
  }
  function dropUnderlay(){ document.querySelectorAll('.underlay').forEach(n => n.remove()); }
  function show(page, html, motion, title){
    if (dry){ dry.page = page; dry.html = html; return; }
    if (here && here.key === page.key && view.classList.contains('on')) return;
    settleAll();
    toUni(false);
    openMenu(false);
    motion = motion || {};
    if (!motion.dir && here && here.entry && page.entry && here.entry.id === page.entry.id){
      motion.dir = Math.sign(page.step - here.step);
    }
    const moving = motionOK();
    const was = view.classList.contains('on');
    /* 離れるページのスクロール位置（路線なら読み足した駅の数も）を覚えておく */
    if (was && here) memo.set(here.key, { y: window.scrollY, n: viewIn.querySelectorAll('.stop').length });
    const before = moving ? capture() : [];
    if (moving && was) ghostOf(motion.dismiss ? 0 : motion.dir, lifted ? lifted.o : 1);

    if (!was) uniScroll = window.scrollY;
    here = page;
    viewIn.innerHTML = html;
    view.setAttribute('aria-label', title || '');
    document.title = (title ? title + '｜' : '') + brand;
    ld.textContent = page.kind === 'route' && page.entry && page.step === 1
      ? JSON.stringify(R.jsonLd(page.entry, location.href)) : listLd();

    if (page.feed) mountFeed(page.feed);
    else if (feedIO){ feedIO.disconnect(); feedIO = null; }
    body.classList.add('viewing');
    view.classList.add('on');
    view.style.opacity = '';
    /* 戻ってきたページは、離れたときの位置へ。進んだページは頭から */
    const m = backNav ? memo.get(page.key) : null;
    backNav = false;
    if (m && page.feed) extendFeed(m.n);
    window.scrollTo({ top: m ? m.y : 0, behavior: 'instant' });
    dropUnderlay();
    body.classList.toggle('route', page.kind === 'route');
    body.classList.toggle('on-work', !!page.work);
    if (page.kind === 'route' && page.step === 1 && page.entry) readCtx.add(page.entry.id);
    /* ページの上では、つながりを辿るの行き先を示す（コンテクストへ／次の区間へ／次の路線へ） */
    $('uniLabel').textContent = nextPlan().label;
    armStrips();
    if (page.kind === 'route') setDock(page.entry, page.step);
    else setDock(null);

    if (!moving){
      view.classList.remove('enter');
      if (!was){
        view.classList.add('fade-in');
        view.addEventListener('animationend', () => view.classList.remove('fade-in'), { once: true });
      }
      focusPage();
      return;
    }
    view.classList.add('on', 'instant');
    /* 新しいページは、進む向きから入ってくる（前のページは反対へ抜ける）。向きがなければ下から浮かぶ */
    view.classList.remove('enter', 'from-uni'); void view.offsetWidth;
    /* ページからページへは、前のページの写しが抜けていくだけで、新しいページは動かさない。
       UniverseIt! から開くときだけ、最初の一画面ぶんを浮かべる */
    if (!was && !motion.dismiss) view.classList.add('enter', 'from-uni');
    fly(before, motion);
    lifted = null;
    view.style.pointerEvents = 'none';
    setTimeout(() => {
      view.style.pointerEvents = '';
      view.classList.remove('instant');
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
    if (moving) ghostOf(0, lifted ? lifted.o : 1);
    /* 前のページはここで片づける。残しておくと、運ぶ先の絵として
       自分自身と組になり、絵がその場から動かない */
    viewIn.innerHTML = '';
    if (feedIO){ feedIO.disconnect(); feedIO = null; }
    here = null;
    document.title = brand;
    ld.textContent = listLd();
    view.classList.add('instant');
    view.classList.remove('on', 'enter', 'fade-in');
    body.classList.remove('viewing', 'route', 'on-work');
    peek(false);
    dropUnderlay();
    backNav = false;
    view.style.opacity = '';
    lifted = null;
    window.scrollTo({ top: uniScroll, behavior: 'instant' });
    setDock(null);
    paintSelection();
    if (moving && before.length) fly(before, motion || { toCenter: true });
    setTimeout(() => { view.classList.remove('instant'); }, DUR + 140);
  }

  /* ---------- つながりの路線（フィード） ----------
     100 近い駅を一度に描かず、終わりに近づいたら続きを足す */
  const FEED_BATCH = 12;
  let feedIO = null;
  let feedAt = null;   /* いまの路線：{ items, shown, rail } */
  function mountFeed(items){
    if (feedIO) feedIO.disconnect();
    const more = viewIn.querySelector('#railMore'), rail = viewIn.querySelector('#rail');
    feedAt = { items, shown: FEED_BATCH, rail };
    if (!more || !rail || feedAt.shown >= items.length) return;
    feedIO = new IntersectionObserver((ents) => {
      if (!ents.some(e => e.isIntersecting)) return;
      extendFeed(feedAt.shown + FEED_BATCH);
    }, { rootMargin: '0px 0px 900px 0px' });
    feedIO.observe(more);
  }
  /* n 駅目まで読み足す */
  function extendFeed(n){
    const f = feedAt;
    if (!f || !f.rail || f.shown >= n) return;
    const to = Math.min(n, f.items.length);
    f.rail.insertAdjacentHTML('beforeend', R.feedStops(f.items, f.shown, to));
    f.shown = to;
    if (f.shown >= f.items.length && feedIO){ feedIO.disconnect(); feedIO = null; }
  }

  /* ---------- 下の帯 ---------- */
  let mapSwap = 0;
  function setDock(e, step){
    if (!e){
      mapSwap++;
      map.innerHTML = '';
      remix.href = 'editor.html?new=1';
      measureDock();
      return;
    }
    remix.querySelector('small').textContent = 'ReMixIt!';
    const c = e.context;
    const markup = R.mapMarkup({
      lineName: c.routeName,
      left: c.leftStation || e.a.title,
      right: c.rightStation || e.b.title,
      current: step
    });
    /* ReMixIt! は、いま立っている作品に新しいつながりを足す入口 */
    remix.href = 'editor.html?from=' + encodeURIComponent(step === 2 ? e.b.slug : e.a.slug);
    const oldLayers = [...map.querySelectorAll('.map-layer')];
    const old = oldLayers.pop() || null;
    oldLayers.forEach(layer => layer.remove());
    if (!old || !motionOK()){
      map.innerHTML = `<div class="map-layer">${markup}</div>`;
      measureDock();
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
    measureDock();
  }

  /* ---------- 触れたもの ---------- */
  const rectOf = (el) => centerOf(el.getBoundingClientRect());

  /* 路線（フィード）の上で「つながりを辿る」：偶然の別の作品から、次の路線へ。
     履歴は置き換えるので、‹ で一度に UniverseIt! へ戻れる。最近の出発点は避ける */
  const recentStarts = [];
  /* いま画面に見えている作品（下の帯の裏は除く） */
  function visibleWorks(){
    const bottom = document.getElementById('dock').getBoundingClientRect().top;
    const seen = new Set();
    viewIn.querySelectorAll('img[data-k]').forEach(im => {
      const r = im.getBoundingClientRect();
      if (r.bottom > 0 && r.top < bottom && r.width > 4) seen.add(im.dataset.k);
    });
    if (here && here.entry && !seen.size){ seen.add(here.entry.a.slug); seen.add(here.entry.b.slug); }
    return seen;
  }
  /* つながりを辿るの飛び先（前田先生のルール）：
     画面に見えている作品とも、それと区間でつながっている作品とも、つながっていない作品から
     次の路線を始める。最近の出発点も避ける。該当がなければ条件をゆるめる */
  /* ---------- つながりを辿るの行き先（前田先生のルール） ----------
     コンテクスト詳細 ＞ 他の区間 ＞ ランダム。スクロールして探して押す手間を、ボタン一つにする。
     ・作品ページ：その作品を含む、まだ読んでいないコンテクストへ
     ・コンテクストページ：B から（なければ A から）延びる、まだ読んでいない他の区間へ
     ・路線：画面に見えている区間のうち、まだ読んでいないものへ
     ・近くに読んでいないものがなければ、一駅先の作品の区間へ。それもなければ
       見えている作品とつながっていない作品から、偶然に次の路線へ（ランダムに迷い込まない） */
  const byOrderOf = (a, b) => (+a.work.order || 9999) - (+b.work.order || 9999);
  const unreadFrom = (slug) => S.neighbors(slug).sort(byOrderOf).map(n => n.entry).find(e => !readCtx.has(e.id));
  function nextOver(slugs){
    for (const s of slugs){
      for (const n of S.neighbors(s).sort(byOrderOf)){
        const e = unreadFrom(n.slug);
        if (e) return e;
      }
    }
    return null;
  }
  function nextPlan(){
    const toCtx = (e, label) => ({ label, run: () => {
      if (here && here.entry && here.entry.id === e.id) goStep(1, null);   /* 同じ区間なら、帯の上を進む */
      else go('#/c/' + encodeURIComponent(e.context.slug), { dir: 1 });
    }});
    if (here && here.work && here.slug){
      const e = unreadFrom(here.slug);
      if (e) return toCtx(e, 'コンテクストへ');
      const e2 = nextOver([here.slug]);
      if (e2) return toCtx(e2, '次の区間へ');
    } else if (here && here.entry && here.step === 1){
      const e = unreadFrom(here.entry.b.slug) || unreadFrom(here.entry.a.slug);
      if (e) return toCtx(e, '次の区間へ');
      const e2 = nextOver([here.entry.b.slug, here.entry.a.slug]);
      if (e2) return toCtx(e2, '次の区間へ');
    } else if (here && here.feed){
      const bottom = document.getElementById('dock').getBoundingClientRect().top;
      for (const a of viewIn.querySelectorAll('.seg')){
        const r = a.getBoundingClientRect();
        if (r.bottom < 0 || r.top > bottom) continue;
        const e = S.byContextSlug(decodeURIComponent((a.getAttribute('href') || '').replace('#/c/', '')));
        if (e && !readCtx.has(e.id)) return toCtx(e, 'コンテクストへ');
      }
    }
    return { label: '次の路線へ', run: nextFeed };
  }
  /* 路線をスクロールすると見えている区間が変わるので、行き先の表示も合わせる */
  let labelTick = 0;
  window.addEventListener('scroll', () => {
    if (!here || !here.feed || labelTick) return;
    labelTick = requestAnimationFrame(() => { labelTick = 0; if (here && here.feed) $('uniLabel').textContent = nextPlan().label; });
  }, { passive: true });

  function nextFeed(){
    const all = S.works();
    if (!all.length) return;
    const near = new Set();
    visibleWorks().forEach(k => { near.add(k); S.neighbors(k).forEach(n => near.add(n.slug)); });
    while (recentStarts.length > Math.min(20, all.length - 1)) recentStarts.shift();
    const choose = (list) => list[Math.floor(Math.random() * list.length)];
    const far = all.filter(w => !near.has(w.slug));
    const fresh = far.filter(w => !recentStarts.includes(w.slug));
    const pick = choose(fresh.length ? fresh : far.length ? far : all);
    recentStarts.push(pick.slug);
    go('#/f/' + encodeURIComponent(pick.slug), { dir: 1 }, true);
  }

  uniBtn.addEventListener('click', () => {
    if (view.classList.contains('on')){ nextPlan().run(); return; }   /* UniverseIt! へは ‹ で戻る */
    if (stage === 'intro'){ toUni(true); return; }
    /* 言葉を選んでいればその作品から、選んでいなければ一覧の中から偶然の一つを選び、
       つながりの路線（フィード）として開く */
    let start = isRemix() ? pick[0] : sel;
    if (!start){
      const all = S.works();
      if (!all.length){ toast('まだ公開されたコンテクストがありません'); return; }
      start = all[Math.floor(Math.random() * all.length)].slug;
    }
    const from = (sel && tags.querySelector(`.tag[data-work="${CSS.escape(sel)}"]`)) || uniBtn;
    go('#/f/' + encodeURIComponent(start), { origin: rectOf(from) });
  });

  /* 言葉に触れても、すぐには開かない。その言葉と、区間でつながる言葉を光らせる。
     光っている言葉の中から選び直すこともできる。開くのは「つながりを辿る」。
     選んでいる言葉にもう一度触れると、選ぶのをやめる。 */
  let sel = null, lit = new Set();
  function paintSelection(){
    if (isRemix()){ paintPick(); return; }
    body.classList.remove('has-pick');
    remix.querySelector('small').textContent = 'ReMixIt!';
    tags.querySelectorAll('.pick-a,.pick-b').forEach(el => el.classList.remove('pick-a', 'pick-b'));
    body.classList.toggle('has-sel', !!sel);
    tags.querySelectorAll('.tag').forEach(el => {
      const k = el.dataset.work;
      el.classList.toggle('lit', lit.has(k));
      el.classList.toggle('sel', k === sel);
      el.setAttribute('aria-pressed', String(k === sel));
    });
    const hint = $('selHint'), label = $('uniLabel');
    if (!sel){ hint.textContent = ''; label.textContent = 'UniverseIt!'; return; }
    const w = S.works().find(h => h.slug === sel);
    const name = w ? R.tagText(w.work) : '';
    label.textContent = name + ' へ';
    hint.innerHTML = `${R.esc(name)}とつながる ${lit.size - 1} 作品が光っています<button type="button" class="sel-clear" data-clear-sel>すべての言葉に戻る</button>`;
  }
  /* ---------- ReMixIt!（左の白い画面）：つなぐ二つの言葉を選び、つながりを創る ---------- */
  const isRemix = () => document.documentElement.dataset.theme === 'white';
  let pick = [];
  const nameOf = (k) => { const w = S.works().find(h => h.slug === k); return w ? R.tagText(w.work) : ''; };
  function paintPick(){
    body.classList.remove('has-sel');
    body.classList.toggle('has-pick', pick.length > 0);
    tags.querySelectorAll('.tag').forEach(el => {
      const k = el.dataset.work;
      el.classList.remove('lit', 'sel');
      el.classList.toggle('pick-a', pick[0] === k);
      el.classList.toggle('pick-b', pick[1] === k);
      el.setAttribute('aria-pressed', String(pick.includes(k)));
    });
    const hint = $('selHint'), small = remix.querySelector('small');
    $('uniLabel').textContent = 'UniverseIt!';
    if (body.classList.contains('viewing')) return;
    remix.href = pick.length ? 'editor.html?from=' + encodeURIComponent(pick[0]) + (pick[1] ? '&to=' + encodeURIComponent(pick[1]) : '') : 'editor.html?new=1';
    if (!pick.length){ hint.textContent = 'つなぎたい二つの言葉を選んでください'; small.textContent = 'ReMixIt!'; return; }
    const a = nameOf(pick[0]), b = pick[1] ? nameOf(pick[1]) : '';
    small.textContent = b ? `${a} × ${b}` : `${a} から`;
    hint.innerHTML = (b ? `A：${R.esc(a)}　B：${R.esc(b)}　をつなぐ` : `A：${R.esc(a)}　もう一つ選ぶと B になります`) +
      '<button type="button" class="sel-clear" data-clear-sel>選び直す</button>';
  }
  function togglePick(k){
    const i = pick.indexOf(k);
    if (i >= 0) pick.splice(i, 1);
    else if (pick.length >= 2) pick[1] = k;
    else pick.push(k);
    paintPick();
  }

  function select(slug, keepGroup){
    if (!slug || (slug === sel && !keepGroup)){ sel = null; lit = new Set(); paintSelection(); return; }
    sel = slug;
    if (!keepGroup) lit = new Set([slug, ...S.neighbors(slug).map(n => n.slug)]);
    paintSelection();
  }
  /* すべての言葉（起動直後の画面）へ戻る：ヒントのボタン、または UniverseIt! の見出し */
  function showAll(){
    if (isRemix()){ pick = []; paintPick(); }
    select(null);
    window.scrollTo({ top: 0, behavior: motionOK() ? 'smooth' : 'auto' });
  }
  $('selHint').addEventListener('click', ev => { if (ev.target.closest('[data-clear-sel]')) showAll(); });

  /* TOP へ：コンテクスト詳細のロゴから。開いているページを閉じ、UniverseIt! のすべての言葉を一番上から */
  function goTop(){
    uniScroll = 0;
    sel = null; lit = new Set(); pick = [];
    toNetwork();
  }

  /* ---------- UniverseIt! ⇄ ReMixIt!：左右にスライドして画面を入れ替える（flow1002） ----------
     二つの画面は左右に並んでいる（左 ReMixIt! の白、右 UniverseIt! の回路）。指で横に引くと、
     背景の二枚が指に付いて動き、見出しとボタンの濃さが引いた分だけ入れ替わる。
     離して半分を越えていれば（または勢いよく払えば）その画面へ、足りなければ元へ戻る。
     縦の動きはページのスクロールに任せる（touch-action: pan-y。スクロールを待たせない） */
  let swiped = false;
  (() => {
    const uniEl = $('uni');
    const layers = () => [...document.querySelectorAll('#bg .pcb-c, #bg .pcb-w, .uni-frame .fr-c, .uni-frame .fr-w')];
    const titles = () => [...document.querySelectorAll('.uni-head .tt-u, .uni-head .tt-r')];
    let s = null;
    const W = () => window.innerWidth;
    function paint(mix){
      const w = W();
      layers().forEach(el => {
        const white = el.classList.contains('pcb-w') || el.classList.contains('fr-w');
        el.style.transform = `translate3d(${(white ? mix - 1 : mix) * w}px,0,0)`;
      });
      titles().forEach(el => { el.style.opacity = el.classList.contains('tt-r') ? mix : 1 - mix; });
      const m = Math.max(0, Math.min(1, mix));
      remix.style.opacity = .5 + .5 * m;
      uniBtn.style.opacity = 1 - .5 * m;
      /* 半分を越えたら、地の明暗（言葉の色）も入れ替える */
      const want = mix > .5 ? 'white' : 'charcoal';
      if (document.documentElement.dataset.theme !== want) setTheme(want);
    }
    function clear(){
      [...layers(), ...titles(), remix, uniBtn].forEach(el => { el.style.transform = ''; el.style.opacity = ''; el.style.transition = ''; });
    }
    uniEl.addEventListener('pointerdown', e => {
      if (stage !== 'uni' || body.classList.contains('viewing') || e.button > 0 || !e.isPrimary) return;
      s = { id: e.pointerId, x0: e.clientX, y0: e.clientY, base: isRemix() ? 1 : 0, on: false, pts: [[e.timeStamp, e.clientX]] };
    });
    uniEl.addEventListener('pointermove', e => {
      if (!s || e.pointerId !== s.id) return;
      const dx = e.clientX - s.x0, dy = e.clientY - s.y0;
      if (!s.on){
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        if (Math.abs(dx) < Math.abs(dy) * 1.3){ s = null; return; }   /* 縦はスクロール */
        s.on = true; swiped = true; body.classList.add('swiping');
        try { uniEl.setPointerCapture(e.pointerId); } catch (err) {}
      }
      s.pts.push([e.timeStamp, e.clientX]); if (s.pts.length > 5) s.pts.shift();
      let mix = s.base + dx / W();
      if (mix < 0) mix *= 0.25; else if (mix > 1) mix = 1 + (mix - 1) * 0.25;   /* 端の先は抵抗 */
      s.mix = mix;
      paint(mix);
    });
    const end = (e, cancelled) => {
      if (!s || e.pointerId !== s.id) return;
      const S0 = s; s = null;
      if (!S0.on) return;
      body.classList.remove('swiping');
      setTimeout(() => { swiped = false; }, 0);
      const a = S0.pts[0], b = S0.pts[S0.pts.length - 1];
      const v = b[0] > a[0] ? (b[1] - a[1]) / (b[0] - a[0]) : 0;
      let target = cancelled ? S0.base : Math.abs(v) > 0.4 ? (v > 0 ? 1 : 0) : (S0.mix > .5 ? 1 : 0);
      const ease = 'cubic-bezier(.22,.8,.22,1)';
      [...layers(), ...titles(), remix, uniBtn].forEach(el => { el.style.transition = `transform .38s ${ease}, opacity .38s ${ease}`; });
      paint(target);
      setTimeout(() => { setTheme(target ? 'white' : 'charcoal'); clear(); }, 400);
    };
    uniEl.addEventListener('pointerup', e => end(e, false));
    uniEl.addEventListener('pointercancel', e => end(e, true));
  })();
  document.querySelector('.uni-title').addEventListener('click', showAll);
  tags.addEventListener('click', ev => {
    if (swiped) return;
    const t = ev.target.closest('.tag');
    if (isRemix()){ if (t) togglePick(t.dataset.work); else if (pick.length){ pick = []; paintPick(); } return; }
    if (!t){ if (sel) select(null); return; }
    const k = t.dataset.work;
    if (k === sel) select(null);
    else select(k, lit.has(k));
  });

  document.addEventListener('click', ev => {
    const t = ev.target;
    if (!menu.hidden && menu.classList.contains('open') && !t.closest('#menu,#menuBtn')){ openMenu(false); return; }
    /* 路線の ‹ は、何本辿ってきても一度で UniverseIt! へ */
    if (t.closest('[data-close]')){ ev.preventDefault(); if (here && here.feed) toNetwork(); else closeView(); return; }
    const home = t.closest('[data-home]');
    if (home){ ev.preventDefault(); toNetwork(); return; }
    /* ロゴは TOP へ：UniverseIt! のすべての言葉を、一番上から */
    if (t.closest('[data-top]')){ ev.preventDefault(); goTop(); return; }

    const step = t.closest('[data-step]');
    if (step && here && here.entry){ goStep(+step.dataset.step, rectOf(step)); return; }

    if (t.closest('[data-read]')){
      const story = viewIn.querySelector('#story');
      if (story) window.scrollTo({ top: story.getBoundingClientRect().top + window.scrollY - 10, behavior: motionOK() ? 'smooth' : 'auto' });
      return;
    }

    /* ページの中の # 道筋は、履歴に積んでから開く */
    const a = t.closest('a[href^="#/"]');
    if (a){ ev.preventDefault(); go(a.getAttribute('href'), { origin: a.closest('.view') ? null : rectOf(a) }); }
  });

  document.addEventListener('submit', ev => {
    const f = ev.target;
    if (!f.matches('[data-seek]')) return;
    ev.preventDefault();
    const q = (f.elements.q.value || '').trim();
    const inView = !!f.closest('.view');
    go('#/search?q=' + encodeURIComponent(q), null, inView);
    if (!inView){ f.elements.q.blur(); f.elements.q.value = ''; }
  });

  document.addEventListener('keydown', ev => {
    const tgt = ev.target;
    if (ev.key === 'Escape' && !menu.hidden){ openMenu(false); return; }
    if (ev.key === 'Escape' && sel && !view.classList.contains('on')){ select(null); return; }
    if (!view.classList.contains('on') || (tgt && tgt.closest && tgt.closest('input,textarea'))) return;
    if (ev.key === 'Escape'){ ev.preventDefault(); closeView(); }
    else if (ev.key === 'ArrowRight' && here && here.entry){ ev.preventDefault(); goStep(here.step + 1); }
    else if (ev.key === 'ArrowLeft' && here && here.entry){ ev.preventDefault(); goStep(here.step - 1); }
  });

  /* ---------- 絵を指でつかむ（写真アプリのように） ----------
     作品ページ・コンテクストページの絵に触れて動かすと、絵は指に付いてくる。
     横：帯として左右へ（コンテクストは A|B の帯、作品ページは一枚の絵）。1:1 で付いてきて、
         行き先のない側や半分を越えたところでは抵抗がかかる。離して十分なら隣の区間・作品へ。
     下：ページの一番上から下へ引くと、絵が持ち上がって指に付いてくる。つかんだ点を中心に、
         引くほど小さくなり、ページは薄れて後ろに UniverseIt! が透ける。
         離して十分なら、絵は自分の言葉へ帰って UniverseIt! に戻る。足りなければばねで元へ。
     上へ、またはページの途中からの縦の動きは、ふつうのスクロール。 */
  let held = false, heldTimer = 0, dragged = false;
  function peek(on){
    body.classList.toggle('peek', on);
    $('uni').style.top = on ? (-uniScroll) + 'px' : '';
  }
  (() => {
    let g = null;
    const vw = () => window.innerWidth, vh = () => window.innerHeight;
    const HOLD = 220;   /* これだけ指を止めてから動かすと、どの向きにも自由につかめる */
    const setX = (el, x) => { el.style.transform = x ? `translate3d(${x}px,0,0)` : ''; };
    const vel = (s, i) => {
      if (s.length < 2) return 0;
      const a = s[0], b = s[s.length - 1];
      return b[0] > a[0] ? (b[i] - a[i]) / (b[0] - a[0]) : 0;   /* px/ms */
    };
    const hasStep = (d) => !!(here && here.entry && here.step + d >= 0 && here.step + d <= 2);
    /* 行き先があれば半分までは素直に、その先と行き先のない側は抵抗 */
    const resist = (x, open) => {
      const a = Math.abs(x), lim = open ? vw() * 0.5 : 0;
      return a <= lim ? x : Math.sign(x) * (lim + (a - lim) * 0.3);
    };

    /* 指の動きは、絵に触れたときだけ、その絵の上で読む。ページ全体に張ると、
       スクロールのたびに端末が script を待つことになり、スクロールが重くなる */
    /* 指の仕掛けは、ページを置いたときに絵そのものへ付ける。触れてから付けると、
       iPhone はすでにスクロールと決めていて、下へ持ち上げられないことがある */
    armStrips = () => {
      viewIn.querySelectorAll('.cpage .duo, .wpage .hero .art').forEach(el => {
        el.addEventListener('touchstart', onStart, { passive: true });
        el.addEventListener('touchmove', onMove, { passive: false });
        el.addEventListener('touchend', onEnd, { passive: true });
        el.addEventListener('touchcancel', onCancel, { passive: true });
      });
    };
    function onStart(e){
      if (g) finish(true);
      if (e.touches.length !== 1 || !here) return;
      const t = e.touches[0];
      const strip = e.currentTarget;
      clearTimeout(heldTimer); held = true; dragged = false;
      /* ばねで戻る途中をつかみ直したら、その位置から続ける */
      const cur = new DOMMatrixReadOnly(getComputedStyle(strip).transform).m41;
      strip.getAnimations().forEach(a => a.cancel());
      setX(strip, cur);
      const art = t.target.closest('.art');
      g = { mode: null, strip, img: art && art.querySelector('img[data-k]'), x0: t.clientX - cur, y0: t.clientY, x: cur,
            t0: e.timeStamp, top: window.scrollY <= 4, s: [[e.timeStamp, t.clientX, t.clientY]] };
    }

    function onMove(e){
      if (!g || g.strip !== e.currentTarget) return;
      const t = e.touches[0];
      const dx = t.clientX - g.x0, dy = t.clientY - g.y0;
      g.s.push([e.timeStamp, t.clientX, t.clientY]); if (g.s.length > 5) g.s.shift();
      if (!g.mode){
        const mx = Math.abs(dx - g.x), my = Math.abs(dy);
        const long = e.timeStamp - g.t0 >= HOLD && g.img && motionOK();
        /* 決まる前から、スクロールになりえない動きは端末に渡さない（あとで止められなくなるため） */
        const couldScroll = dy < 0 || !g.top;
        if (mx < 6 && my < 6){ if (!couldScroll || long) e.preventDefault(); return; }
        if (long){ g.mode = 'lift'; startLift(t); }
        else if (mx > my * 1.4) g.mode = 'strip';
        else if (dy > 0 && g.top && g.img && motionOK()){ g.mode = 'lift'; startLift(t); }
        else { finish(true, true); return; }            /* スクロールに任せる */
        dragged = true;
      }
      e.preventDefault();
      if (g.mode === 'strip'){
        g.x = resist(dx, hasStep(dx < 0 ? 1 : -1));
        setX(g.strip, g.x);
      } else moveLift(t.clientX - g.lx0, t.clientY - g.ly0);
    }

    function startLift(t){
      setX(g.strip, 0);
      const r = g.img.getBoundingClientRect();
      g.lx0 = t.clientX; g.ly0 = t.clientY;
      g.f = flyer(g.img.currentSrc || g.img.src, r, getComputedStyle(g.img).objectPosition);
      g.f.style.transformOrigin = `${t.clientX - r.left}px ${t.clientY - r.top}px`;   /* つかんだ点を中心に */
      g.img.style.visibility = 'hidden';
      g.img.parentElement.classList.add('landing');   /* 元の場所は空になる */
      g.o = 1;
      /* 後ろには、来た画面（なければ UniverseIt!）を置く */
      g.back = underlay(g.img.dataset.k);
      if (!g.back) peek(true);
    }
    function moveLift(dx, dy){
      const H = vh(), W = vw();
      const s = Math.max(0.42, 1 - Math.max(0, dy) / (H * 1.05) - Math.abs(dx) / (W * 8));
      g.f.style.transform = `translate3d(${dx}px,${dy}px,0) scale(${s})`;
      g.o = Math.max(0, Math.min(1, 1 - Math.max(0, dy) / (H * 0.38)));
      view.style.opacity = g.o;
      g.ly = dy;
    }

    const onEnd = () => finish(false);
    const onCancel = () => finish(true);
    function finish(cancelled, toScroll){
      if (!g) return;
      const G = g; g = null;
      heldTimer = setTimeout(() => { held = false; dragged = false; }, toScroll ? 0 : 450);
      if (!G.mode) return;                      /* 触れて離しただけ：絵のボタンがそのまま働く */
      if (G.mode === 'strip'){
        const v = vel(G.s, 1);
        const fling = Math.abs(v) > 0.45 ? -Math.sign(v) : 0;
        const dir = cancelled ? 0 : fling || (Math.abs(G.x) > vw() * 0.24 ? -Math.sign(G.x) : 0);
        if (dir && hasStep(dir)){ goStep(here.step + dir); return; }   /* 絵は今の位置から運ばれる */
        setX(G.strip, 0);
        G.strip.animate([{ transform: `translate3d(${G.x}px,0,0)` }, { transform: 'translate3d(0,0,0)' }],
          { duration: 460, easing: 'cubic-bezier(.18,1.3,.35,1)' });
        return;
      }
      const vy = vel(G.s, 2);
      const home = !cancelled && vy > -0.2 && ((G.ly || 0) > vh() * 0.14 || vy > 0.5);
      if (home){
        lifted = { k: G.img.dataset.k, r: G.f.getBoundingClientRect(), src: G.f.src,
                   pos: getComputedStyle(G.img).objectPosition, o: G.o };
        G.f.remove();
        G.img.style.visibility = '';
        G.img.parentElement.classList.remove('landing');
        closeView({ dismiss: true, toCenter: true });   /* 来た画面へ。絵は離した位置から自分の場所へ */
        return;
      }
      const a = G.f.animate([{ transform: G.f.style.transform }, { transform: 'translate3d(0,0,0) scale(1)' }],
        { duration: 420, easing: 'cubic-bezier(.2,1.12,.3,1)', fill: 'forwards' });
      view.style.opacity = '';
      view.animate([{ opacity: G.o }, { opacity: 1 }], { duration: 320, easing: 'ease-out' });
      a.onfinish = () => { G.img.style.visibility = ''; G.img.parentElement.classList.remove('landing'); G.f.remove(); peek(false); dropUnderlay(); };
    }
    /* 引いたあとの「クリック」は、絵のボタンに届かせない */
    view.addEventListener('click', e => { if (dragged && e.target.closest('.duo, .hero')){ e.stopPropagation(); e.preventDefault(); } }, true);
    view.addEventListener('dragstart', e => { if (e.target.closest('.duo, .hero')) e.preventDefault(); });
  })();

  /* 右へ払えば戻る（transition.js）。左へ払えば路線の先へ進む */
  let sx = 0, sy = 0, swiping = false;
  document.addEventListener('touchstart', e => {
    if (e.touches.length !== 1 || !body.classList.contains('route')) { swiping = false; return; }
    const t = e.touches[0];
    if (t.target.closest && t.target.closest('input,textarea,select')) { swiping = false; return; }
    sx = t.clientX; sy = t.clientY; swiping = true;
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (!swiping) return;
    swiping = false;
    if (held) return;   /* 絵をつかんでいた指は、そちらで扱う */
    const t = e.changedTouches && e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - sx, dy = Math.abs(t.clientY - sy);
    if (dx <= -88 && -dx > dy * 1.6 && here && here.entry && here.step < 2) goStep(here.step + 1);
  }, { passive: true });

  window.BCSwipeBack = () => {
    if (held) return true;
    if (!menu.hidden){ openMenu(false); return true; }
    if (view.classList.contains('on')){ closeView(); return true; }
    return false;
  };

  /* エディターや管理画面で書き換えられたら、組み直す */
  const rebuild = () => { R.buildTags(tags); paintSelection(); };
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

  /* 運営者メニューのプレビューから段階を指定できるように */
  window.BCApp = {
    toUni: () => toUni(false),
    openFirst: () => { toUni(false); const t = tags.querySelector('.tag'); if (t) go('#/w/' + encodeURIComponent(t.dataset.work), null); }
  };

  /* ---------- 起動 ---------- */
  R.buildTags(tags);
  setDock(null);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  /* 次に開くとき、ネットを待たずに表紙を描けるよう、手元に控えを置く（sw.js） */
  if ('serviceWorker' in navigator && location.protocol === 'https:'){
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }

  if (location.hash.length > 2){
    /* ページを名指しで開かれたときは、表紙を飛ばして UniverseIt! を後ろに置く */
    toUni(false);
    stack.push(location.hash);
    routeTo(location.hash, null);
  } else {
    armIdle();
  }
  window.addEventListener('load', measureDock, { once: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureDock);
  (window.requestIdleCallback || ((f) => setTimeout(f, 800)))(preload);
})();

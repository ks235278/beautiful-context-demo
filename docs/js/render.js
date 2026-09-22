/* 描画の共通部分。index.html（ストリーム）と page.html（駅）で使う。 */
(() => {
  const S = window.BCStore;

  const esc = (s) => { const d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; };

  /* エディター本文は contenteditable 由来の HTML。許可タグだけ残す。 */
  const ALLOWED = new Set(['P','BR','STRONG','B','EM','I','H3','H4','UL','OL','LI','BLOCKQUOTE']);
  function clean(html){
    const box = document.createElement('div');
    box.innerHTML = html || '';
    (function walk(node){
      [...node.childNodes].forEach(ch => {
        if (ch.nodeType === 1){
          if (!ALLOWED.has(ch.tagName)){
            const frag = document.createDocumentFragment();
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
    })(box);
    return box.innerHTML;
  }

  function art(work){
    const initial = (work.title || '?').replace(/[『』「」]/g,'').trim().charAt(0) || '?';
    return `<div class="art">` + (work.image
      ? `<img src="${esc(work.image)}" alt="${esc(work.title)}" loading="lazy">`
      : `<span class="ph">${esc(initial)}<small>${esc(work.type || '作品')}</small></span>`) + `</div>`;
  }

  function contextSection(e){
    const c = e.context;
    const mins = S.readingMinutes(c.body);
    const rel = String(c.relation || '').split('──')
      .map(s => s.trim()).filter(Boolean)
      .map(s => `<span>${esc(s)}</span>`).join('');
    return `
      <div class="duo-hero"><div class="duo">${art(e.a)}${art(e.b)}</div></div>
      <div class="context-lead">
        <p class="route-label">${esc(c.label || 'CONTEXT')}　【${esc(c.routeName)}】　約${mins}分</p>
        <h2>${esc(c.headline).replace(/\n/g,'<br>')}</h2>
        ${rel ? `<div class="pair">${rel}</div>` : ''}
      </div>
      <div class="context-body">
        <h2>${esc(c.routeName)}</h2>
        ${clean(c.body)}
      </div>`;
  }

  function mapMarkup(o){
    return `
      <span class="line-name">${esc(o.lineName || '')}</span>
      <span class="line"></span>
      ${o.label !== null ? '<span class="segment"></span>' : ''}
      ${o.label ? `<span class="section-label">${esc(o.label)}</span>` : ''}
      <span class="dot left ${o.current === 'left' ? 'current' : ''}"></span>
      <span class="dot right ${o.current === 'right' ? 'current' : ''}"></span>
      <button class="station left ${o.current === 'left' ? 'current' : ''}" data-work="${esc(o.aSlug || '')}">${esc(o.left)}</button>
      <button class="station right ${o.current === 'right' ? 'current' : ''}" data-work="${esc(o.bSlug || '')}">${esc(o.right)}</button>`;
  }

  /* UniverseIt! の見出し。すべて実在する公開ページに対応する。 */
  function cloudPool(){
    const out = [];
    S.all().forEach(e => {
      out.push({ text: e.context.routeName, kind:'ctx', ctx: e.context.slug });
      const head = (e.context.headline || '').split('\n')[0].replace(/[、。]$/,'');
      if (head) out.push({ text: head, kind:'ctx', ctx: e.context.slug });
    });
    S.works().forEach(w => {
      out.push({ text: w.work.title.replace(/[『』]/g,''), kind:'work', work: w.slug });
    });
    return out;
  }

  const SIZES = [12,13,14,16,18,20];
  const shuffle = a => a.map(v => [Math.random(), v]).sort((x,y) => x[0]-y[0]).map(p => p[1]);

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
    b.className = 'tag k-' + it.kind;   /* k- を付けるのは、区間の節 .ctx と衝突させないため */
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

  function buildCloud(cloud, countEl){
    const items = cloudPool();
    cloud.textContent = '';
    if (countEl) countEl.textContent = items.length
      ? `公開中 ${S.all().length} 件 ／ 見出し ${items.length} 点` : '0 件';
    if (!items.length){
      cloud.innerHTML = '<p class="uv-none">まだ公開されたページがありません。<br>新しいつながりを創ってください。</p>';
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

  window.BCRender = { esc, clean, art, contextSection, mapMarkup, cloudPool, buildCloud };
})();

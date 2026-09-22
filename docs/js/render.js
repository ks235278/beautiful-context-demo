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

  function buildCloud(cloud, countEl, rows){
    const items = cloudPool();
    cloud.textContent = '';
    if (countEl) countEl.textContent = items.length
      ? `公開中 ${S.all().length} 件 ／ 見出し ${items.length} 点` : '0 件';
    if (!items.length){
      cloud.innerHTML = '<p class="uv-none">まだ公開されたページがありません。<br>新しいつながりを創ってください。</p>';
      return;
    }
    const ROWS = rows || 9;
    const perRow = Math.max(8, Math.ceil(26 / items.length) * items.length);
    for (let r = 0; r < ROWS; r++){
      const row = document.createElement('div');
      row.className = 'row';
      row.style.animation = `${r % 2 === 0 ? 'driftL' : 'driftR'} ${72 + (r % 5) * 16}s linear infinite`;
      const half = document.createDocumentFragment();
      let bag = [];
      for (let i = 0; i < perRow; i++){
        if (!bag.length) bag = shuffle(items.slice());
        const it = bag.pop();
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'tag ' + it.kind;
        b.style.fontSize = SIZES[(i + r) % SIZES.length] + (it.kind === 'ctx' ? 2 : 0) + 'px';
        if (it.kind === 'work'){
          const h = document.createElement('span'); h.className = 'h'; h.textContent = '#';
          b.appendChild(h);
          b.dataset.work = it.work;
        } else {
          b.dataset.ctx = it.ctx;
        }
        b.appendChild(document.createTextNode(it.text));
        half.appendChild(b);
      }
      row.appendChild(half.cloneNode(true));
      row.appendChild(half);
      cloud.appendChild(row);
    }
  }

  window.BCRender = { esc, clean, art, contextSection, mapMarkup, cloudPool, buildCloud };
})();

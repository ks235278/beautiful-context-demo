/* Beautiful Context — 共有データストア
   エディターが作る {a, b, context} をそのまま1件として保持する。 */
(() => {
  const KEY = 'beautiful-context-store-v1';

  const slugify = (s) =>
    (s || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/['’"『』「」]/g, '')
      .replace(/[^a-z0-9぀-ヿ一-龯]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);

  const uid = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  function readRaw() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY));
      if (v && Array.isArray(v.entries)) return v;
    } catch (e) {}
    return null;
  }

  function writeRaw(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  function ensure() {
    let data = readRaw();
    if (!data) {
      data = { entries: (window.BC_SEED || []).map(normalise), seeded: true };
      writeRaw(data);
    }
    return data;
  }

  function normalise(entry) {
    const e = JSON.parse(JSON.stringify(entry));
    e.id = e.id || uid();
    e.createdAt = e.createdAt || new Date().toISOString();
    e.updatedAt = e.updatedAt || e.createdAt;
    e.context = e.context || {};
    e.context.slug = e.context.slug || slugify(e.context.routeName) || e.id;
    e.a = e.a || {};
    e.b = e.b || {};
    e.a.slug = e.a.slug || slugify(e.a.title);
    e.b.slug = e.b.slug || slugify(e.b.title);
    return e;
  }

  function readingMinutes(html) {
    const d = document.createElement('div');
    d.innerHTML = html || '';
    const n = (d.textContent || '').trim().length;
    return Math.max(1, Math.ceil(n / 500));
  }

  const Store = {
    KEY,
    slugify,
    uid,
    readingMinutes,

    all() {
      return ensure().entries;
    },

    byContextSlug(slug) {
      return this.all().find((e) => e.context.slug === slug) || null;
    },

    byId(id) {
      return this.all().find((e) => e.id === id) || null;
    },

    /* 作品は複数のコンテクストに登場しうるので、出現箇所をまとめて返す */
    works() {
      const map = new Map();
      this.all().forEach((e) => {
        ['a', 'b'].forEach((side) => {
          const w = e[side];
          if (!w || !w.title) return;
          const key = w.slug || slugify(w.title);
          if (!map.has(key)) map.set(key, { work: w, slug: key, contexts: [] });
          map.get(key).contexts.push({ entry: e, side });
        });
      });
      return [...map.values()];
    },

    workBySlug(slug) {
      return this.works().find((w) => w.slug === slug) || null;
    },

    save(entry) {
      const data = ensure();
      const e = normalise(entry);
      e.updatedAt = new Date().toISOString();

      let slug = e.context.slug;
      const clash = data.entries.find((x) => x.context.slug === slug && x.id !== e.id);
      if (clash) slug = slug + '-' + Math.random().toString(36).slice(2, 5);
      e.context.slug = slug;

      const i = data.entries.findIndex((x) => x.id === e.id);
      if (i >= 0) data.entries[i] = e;
      else data.entries.unshift(e);

      data.seeded = false;
      const ok = writeRaw(data);
      return ok ? e : null;
    },

    remove(id) {
      const data = ensure();
      data.entries = data.entries.filter((e) => e.id !== id);
      writeRaw(data);
    },

    reset() {
      localStorage.removeItem(KEY);
      return ensure();
    },

    isPristine() {
      const d = readRaw();
      return !d || d.seeded === true;
    }
  };

  window.BCStore = Store;
})();

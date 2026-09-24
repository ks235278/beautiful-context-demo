/* Beautiful Context — データストア（第2版）

   1件は、エディターが作る {a, b, context} に、運営のための情報を足したもの。

     status   : 'public'（公開） / 'private'（非公開・下書き） / 'hidden'（一時非表示）
                非公開は書き手が選ぶもの、一時非表示は運営が選ぶもの。
                どちらもストリーム・路線図・検索から消えるが、データは残る。
     reactions: 共感の数（初期値。この端末で押した分は liked に持つ）
     comments : [{ id, name, text, at, hidden }]

   ほかに、広告枠（ads）、書き手ごとの表示状態（authors）、サービスの
   見た目の設定（settings）を持つ。

   サーバーは無い。すべてこの端末の localStorage に入る。端末をまたいで
   持ち運ぶには、管理画面の書き出し／読み込みを使う。 */
(() => {
  const KEY = 'beautiful-context-store-v2';
  const OLD_KEY = 'beautiful-context-store-v1';
  /* 見本を足したら上げる。端末に残っているデータへ、新しい見本だけを足し込む */
  const SEED_VERSION = 3;

  const DEFAULT_SETTINGS = {
    brand: 'Beautiful Context',
    tagline: '言葉から、つながりを辿る',
    theme: 'charcoal',          /* 'charcoal' | 'white' */
    accent: '#d9761f',
    adEvery: 2                  /* 何件ごとに広告枠を挟むか。0 で挟まない */
  };

  const slugify = (s) =>
    (s || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/['’"『』「」]/g, '')
      .replace(/[^a-z0-9぀-ヿ一-龯]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);

  const uid = (p) => (p || 'c') + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const clone = (v) => JSON.parse(JSON.stringify(v));

  function readRaw(key) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
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

  function normalise(entry) {
    const e = clone(entry);
    e.id = e.id || uid();
    e.createdAt = e.createdAt || new Date().toISOString();
    e.updatedAt = e.updatedAt || e.createdAt;
    e.a = e.a || {};
    e.b = e.b || {};
    e.context = e.context || {};
    e.context.slug = e.context.slug || slugify(e.context.routeName) || e.id;
    e.context.author = e.context.author || '編集部';
    e.context.aiUrl = e.context.aiUrl || '';
    e.context.line = e.context.line || {};
    e.a.slug = e.a.slug || slugify(e.a.title);
    e.b.slug = e.b.slug || slugify(e.b.title);
    if (!['public', 'private', 'hidden'].includes(e.status)) e.status = 'public';
    e.note = e.note || '';
    e.reactions = +e.reactions || 0;
    e.comments = Array.isArray(e.comments) ? e.comments : [];
    return e;
  }

  const seedEntries = () => (window.BC_SEED || []).map(normalise);
  const seedAds = () => clone(window.BC_SEED_ADS || []);

  function fresh() {
    return {
      version: 2,
      entries: seedEntries(),
      ads: seedAds(),
      settings: clone(DEFAULT_SETTINGS),
      authors: {},
      liked: {},
      seedIds: (window.BC_SEED || []).map((s) => s.id),
      seedVersion: SEED_VERSION,
      removedSeeds: []
    };
  }

  /* 見本が増えたとき。端末で作ったもの・手を入れた見本・消した見本はそのまま、
     まだ無い見本を足し、手を付けていない見本は新しい版に差し替える。 */
  function mergeSeeds(data) {
    const gone = new Set(data.removedSeeds || []);
    const at = new Map(data.entries.map((e, i) => [e.id, i]));
    seedEntries().forEach((s) => {
      if (gone.has(s.id)) return;
      if (!at.has(s.id)) { data.entries.push(s); return; }
      const cur = data.entries[at.get(s.id)];
      if (cur.updatedAt === cur.createdAt) {
        s.reactions = cur.reactions;
        s.comments = cur.comments;
        data.entries[at.get(s.id)] = s;
      } else {
        /* 手を入れた見本は本文を残し、型・ハブ・四軸だけを補う */
        ['kind', 'hub', 'score'].forEach((k) => {
          if (cur.context[k] == null && s.context[k] != null) cur.context[k] = s.context[k];
        });
      }
    });
    /* 札の絵（前の版の見本）のままの作品には、見本の新しい絵と出典を入れる。
       端末で作ったコンテクストが同じ作品を使っていても、絵が切れないように */
    const latest = new Map();
    seedEntries().forEach((s) => [s.a, s.b].forEach((w) => latest.set(w.slug, w)));
    data.entries.forEach((e) => ['a', 'b'].forEach((side) => {
      const w = e[side], n = w && latest.get(w.slug);
      if (n && /^img\/cards\/|^img\/goldberg\.jpg$/.test(w.image || '') && n.image !== w.image) {
        w.image = n.image; w.credit = n.credit; w.creditUrl = n.creditUrl;
      }
    }));
    data.seedIds = (window.BC_SEED || []).map((s) => s.id);
    data.seedVersion = SEED_VERSION;
  }

  /* 第1版からの引っ越し。先生や学生が端末で作ったものは残す。
     手を付けていない見本は、画像の揃った新しい見本に差し替える。 */
  function migrate(old) {
    const data = fresh();
    const seeds = new Map(data.entries.map((e) => [e.id, e]));
    const kept = [];
    old.entries.forEach((raw) => {
      const e = normalise(raw);
      const untouchedSeed = seeds.has(e.id) && e.updatedAt === e.createdAt;
      if (!untouchedSeed) kept.push(e);
    });
    const keptIds = new Set(kept.map((e) => e.id));
    data.entries = kept.concat(data.entries.filter((e) => !keptIds.has(e.id)));
    return data;
  }

  let cache = null;
  function ensure() {
    if (cache) return cache;
    let data = readRaw(KEY);
    if (!data) {
      const old = readRaw(OLD_KEY);
      data = old ? migrate(old) : fresh();
      writeRaw(data);
    }
    data.entries = data.entries.map(normalise);
    data.removedSeeds = Array.isArray(data.removedSeeds) ? data.removedSeeds : [];
    if ((data.seedVersion || 1) < SEED_VERSION) {
      mergeSeeds(data);
      writeRaw(data);
    }
    data.ads = Array.isArray(data.ads) ? data.ads : [];
    data.settings = Object.assign(clone(DEFAULT_SETTINGS), data.settings || {});
    data.authors = data.authors || {};
    data.liked = data.liked || {};
    cache = data;
    return data;
  }
  function commit() { return writeRaw(ensure()); }

  /* 別のタブ（エディターや管理画面）で書き換えられたら読み直す */
  window.addEventListener('storage', (ev) => { if (ev.key === KEY) cache = null; });

  /* 本文の HTML から文字だけを取り出す。DOMParser の文書は画像も
     読み込まず script も走らせないので、読み込んだファイルに何が
     混ざっていても安全に数えられる。 */
  const parser = new DOMParser();
  const plain = (html) =>
    (parser.parseFromString(String(html || ''), 'text/html').body.textContent || '')
      .replace(/\s+/g, ' ').trim();

  function readingMinutes(html) {
    return Math.max(1, Math.ceil(plain(html).length / 500));
  }

  const byNewest = (x, y) => (y.createdAt || '').localeCompare(x.createdAt || '');

  const Store = {
    KEY,
    slugify,
    uid,
    readingMinutes,
    plain,
    DEFAULT_SETTINGS,

    /* ---------- コンテクスト ---------- */
    all() {
      return ensure().entries.slice().sort(byNewest);
    },

    /* 読者に見えるもの。公開中で、書き手も止められていないもの */
    visible() {
      const authors = ensure().authors;
      return this.all().filter((e) => e.status === 'public' && authors[e.context.author] !== 'hidden');
    },

    isVisible(e) {
      return !!e && e.status === 'public' && ensure().authors[e.context.author] !== 'hidden';
    },

    byContextSlug(slug) {
      return ensure().entries.find((e) => e.context.slug === slug) || null;
    },

    byId(id) {
      return ensure().entries.find((e) => e.id === id) || null;
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
      if (i >= 0) {
        /* 編集画面が持っていない運営の情報は引き継ぐ */
        const prev = data.entries[i];
        e.comments = entry.comments ? e.comments : prev.comments;
        e.reactions = entry.reactions != null ? e.reactions : prev.reactions;
        e.createdAt = prev.createdAt;
        data.entries[i] = e;
      } else {
        data.entries.push(e);
      }
      return commit() ? e : null;
    },

    remove(id) {
      const data = ensure();
      data.entries = data.entries.filter((e) => e.id !== id);
      /* 消した見本は、見本が増えたときにも戻さない */
      if ((data.seedIds || []).includes(id) && !data.removedSeeds.includes(id)) data.removedSeeds.push(id);
      commit();
    },

    /* 生成AIの初稿を、編集者が確かめて通す（AGM） */
    approve(id) {
      const e = this.byId(id);
      if (!e) return null;
      e.context.review = 'approved';
      e.context.approvedAt = new Date().toISOString();
      e.updatedAt = e.context.approvedAt;
      commit();
      return e;
    },

    setStatus(id, status, note) {
      const e = this.byId(id);
      if (!e) return null;
      e.status = status;
      if (note != null) e.note = note;
      e.updatedAt = new Date().toISOString();
      commit();
      return e;
    },

    /* 同じ作品をルーツに持つ、ほかのコンテクスト */
    related(e) {
      if (!e) return [];
      const mine = new Set([e.a.slug, e.b.slug]);
      return this.visible().filter((x) => x.id !== e.id && (mine.has(x.a.slug) || mine.has(x.b.slug)));
    },

    /* ---------- 作品（駅） ---------- */
    works(list) {
      const map = new Map();
      (list || this.visible()).forEach((e) => {
        ['a', 'b'].forEach((side) => {
          const w = e[side];
          if (!w || !w.title) return;
          const key = w.slug || slugify(w.title);
          if (!map.has(key)) map.set(key, { work: w, slug: key, contexts: [] });
          const hit = map.get(key);
          if (!hit.work.image && w.image) hit.work = w;
          hit.contexts.push({ entry: e, side });
        });
      });
      return [...map.values()];
    },

    workBySlug(slug) {
      return this.works().find((w) => w.slug === slug) || null;
    },

    /* ---------- 共感・コメント ---------- */
    liked(id) {
      return !!ensure().liked[id];
    },

    reactionCount(e) {
      return (e ? e.reactions : 0) + (e && ensure().liked[e.id] ? 1 : 0);
    },

    react(id) {
      const data = ensure();
      if (data.liked[id]) delete data.liked[id];
      else data.liked[id] = true;
      commit();
      return { liked: !!data.liked[id], count: this.reactionCount(this.byId(id)) };
    },

    visibleComments(e) {
      return (e && e.comments ? e.comments : []).filter((c) => !c.hidden);
    },

    addComment(id, c) {
      const e = this.byId(id);
      const text = (c.text || '').trim();
      if (!e || !text) return null;
      const item = {
        id: uid('m'),
        name: (c.name || '').trim().slice(0, 30) || '匿名',
        text: text.slice(0, 600),
        at: new Date().toISOString(),
        hidden: false
      };
      e.comments.push(item);
      commit();
      return item;
    },

    setCommentHidden(id, cid, hidden) {
      const e = this.byId(id);
      const c = e && e.comments.find((x) => x.id === cid);
      if (!c) return;
      c.hidden = !!hidden;
      commit();
    },

    removeComment(id, cid) {
      const e = this.byId(id);
      if (!e) return;
      e.comments = e.comments.filter((x) => x.id !== cid);
      commit();
    },

    /* ---------- 書き手 ---------- */
    authors() {
      const data = ensure();
      const map = new Map();
      data.entries.forEach((e) => {
        const n = e.context.author;
        if (!map.has(n)) map.set(n, { name: n, count: 0, status: data.authors[n] || 'public' });
        map.get(n).count++;
      });
      return [...map.values()];
    },

    setAuthorStatus(name, status) {
      const data = ensure();
      if (status === 'public') delete data.authors[name];
      else data.authors[name] = status;
      commit();
    },

    /* ---------- 検索 ---------- */
    search(q) {
      const words = (q || '').toLowerCase().split(/[\s　#＃]+/).filter(Boolean);
      if (!words.length) return { contexts: [], works: [] };
      const hay = (e) =>
        [e.context.routeName, e.context.headline, e.context.relation, e.context.hub, e.context.kind, plain(e.context.body),
         e.a.title, e.a.type, e.a.creator, e.a.summary, e.b.title, e.b.type, e.b.creator, e.b.summary]
          .join(' ').toLowerCase();
      const contexts = this.visible().filter((e) => { const h = hay(e); return words.every((w) => h.includes(w)); });
      const works = this.works().filter(({ work: w }) => {
        const h = [w.title, w.type, w.creator, w.summary, w.year].join(' ').toLowerCase();
        return words.every((x) => h.includes(x));
      });
      return { contexts, works };
    },

    /* ---------- 広告枠 ---------- */
    ads() {
      return ensure().ads;
    },

    activeAds() {
      return ensure().ads.filter((a) => a.active);
    },

    saveAd(ad) {
      const data = ensure();
      const a = Object.assign({ id: uid('ad'), title: '', sub: '', image: '', url: '', active: true }, ad);
      const i = data.ads.findIndex((x) => x.id === a.id);
      if (i >= 0) data.ads[i] = a;
      else data.ads.push(a);
      return commit() ? a : null;
    },

    removeAd(id) {
      const data = ensure();
      data.ads = data.ads.filter((a) => a.id !== id);
      commit();
    },

    /* ---------- 設定 ---------- */
    settings() {
      return Object.assign({}, ensure().settings);
    },

    saveSettings(patch) {
      const data = ensure();
      data.settings = Object.assign(data.settings, patch);
      return commit();
    },

    /* ---------- 持ち運び ---------- */
    exportJSON() {
      return JSON.stringify(ensure(), null, 2);
    },

    importJSON(text) {
      const v = JSON.parse(text);
      if (!v || !Array.isArray(v.entries)) throw new Error('Beautiful Context の書き出しファイルではありません');
      cache = null;
      localStorage.setItem(KEY, JSON.stringify(v));
      ensure();
      return commit();
    },

    reset() {
      cache = null;
      localStorage.removeItem(KEY);
      localStorage.removeItem(OLD_KEY);
      return ensure();
    },

    usage() {
      try { return (localStorage.getItem(KEY) || '').length * 2; } catch (e) { return 0; }
    }
  };

  window.BCStore = Store;
})();

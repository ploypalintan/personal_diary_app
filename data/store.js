/* ═══════════════════════════════════════
   store.js — the one place data is read and written.

   Pages still call loadState() / saveState(state) (see diaryData.js), but those now go
   through Store, which adds what a synced, multi-device app needs:
     • schema version + numbered migrations (change the shape without losing anyone's data)
     • createdAt / updatedAt on every record (stamped automatically on save)
     • tombstones: the ids of deleted records, so a future sync can delete them elsewhere
     • an adapter (where data physically lives). Today: this browser's localStorage.
       Later: swap in a cloud adapter without touching any page.
═══════════════════════════════════════ */
const Store = (() => {
  const KEY = 'myDiaryState';
  const SCHEMA = 2;
  const COLLECTIONS = ['todos', 'products', 'moods', 'incomes', 'expenses'];
  const MAX_TOMBSTONES = 500;

  /* ── adapter: the only code that knows where data is stored ── */
  const localAdapter = {
    read() {
      try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; }
      catch { return null; }
    },
    /* returns false (instead of throwing) if the browser storage is full, e.g. too many photos */
    write(state) {
      try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
      catch (err) { console.error('Could not save:', err); return false; }
    },
  };
  let adapter = localAdapter;

  const nowISO = () => new Date().toISOString();

  function emptyState() {
    return {
      schema:   SCHEMA,
      userId:   null,          // filled in once accounts exist
      plan:     'free',        // 'free' | 'premium' (see features.js)
      userName: '',
      currency: 'SGD',
      todos:    [],
      products: [],            // { id, name, brand, shade, category, opened:'YYYY-MM-DD'|'', pao:months, ... }
      moods:    [],            // { id, date, key, label, sub, note }
      incomes:  [],
      expenses: [],
      nextIds:  { todo: 1, product: 1, mood: 1, income: 1, expense: 1 },
      deleted:  [],            // tombstones: { c:'products', id, at }
    };
  }

  /* ── migrations: MIGRATIONS[n] upgrades a version n-1 state to version n ── */
  const MIGRATIONS = {
    /* v2: every record gets createdAt / updatedAt; state gets userId and a tombstone list */
    2(s) {
      COLLECTIONS.forEach(c => {
        (s[c] || []).forEach(r => {
          if (!r.createdAt) r.createdAt = (Number(r.added) > 0) ? new Date(Number(r.added)).toISOString() : nowISO();
          if (!r.updatedAt) r.updatedAt = r.createdAt;
        });
      });
      if (!('userId' in s)) s.userId = null;
      if (!s.plan) s.plan = 'free';
      if (!Array.isArray(s.deleted)) s.deleted = [];
      return s;
    },
  };

  function migrate(raw) {
    const s = (raw && typeof raw === 'object') ? raw : emptyState();
    let v = Number(s.schema) || 1;
    while (v < SCHEMA) { v += 1; if (MIGRATIONS[v]) MIGRATIONS[v](s); }
    s.schema = SCHEMA;
    /* fill anything missing so pages never meet an undefined collection */
    const base = emptyState();
    Object.keys(base).forEach(k => { if (s[k] === undefined) s[k] = base[k]; });
    s.nextIds = Object.assign({}, base.nextIds, s.nextIds || {});
    return s;
  }

  /* ── change tracking: what each record looked like when it was last loaded/saved ── */
  let seen = {};   // collection -> Map(id -> JSON of the record without updatedAt)

  const fingerprint = (rec) => { const { updatedAt, ...rest } = rec; return JSON.stringify(rest); };

  function remember(s) {
    seen = {};
    COLLECTIONS.forEach(c => {
      const m = new Map();
      (s[c] || []).forEach(r => m.set(r.id, fingerprint(r)));
      seen[c] = m;
    });
  }

  /* stamp new/changed records, and record deletions as tombstones */
  function stamp(s) {
    const t = nowISO();
    COLLECTIONS.forEach(c => {
      const before = seen[c] || new Map();
      const present = new Set();
      (s[c] || []).forEach(r => {
        present.add(r.id);
        if (!r.createdAt) r.createdAt = t;
        const prev = before.get(r.id);
        if (prev === undefined || prev !== fingerprint(r) || !r.updatedAt) r.updatedAt = t;
      });
      before.forEach((_, id) => { if (!present.has(id)) s.deleted.push({ c, id, at: t }); });
    });
    if (s.deleted.length > MAX_TOMBSTONES) s.deleted = s.deleted.slice(-MAX_TOMBSTONES);
  }

  /* ── ids that stay unique across devices ──
     Old records use small counting ids (1, 2, 3 …), which two devices would both hand out.
     New records use a time-based id, so a phone and a laptop can never create the same one. */
  let lastId = 0;
  function newId() {
    const id = Date.now() * 1000 + Math.floor(Math.random() * 1000);
    lastId = id > lastId ? id : lastId + 1;
    return lastId;
  }
  const LEGACY_LIMIT = 1e12;   // anything below this is an old counting id

  /* give old counting ids a unique one (and repoint links). Run once before first sync. */
  function upgradeIds(state) {
    const map = { products: new Map(), expenses: new Map() };
    COLLECTIONS.forEach(c => (state[c] || []).forEach(r => {
      if (Number(r.id) < LEGACY_LIMIT) { const old = r.id; r.id = newId(); r.updatedAt = nowISO(); if (map[c]) map[c].set(old, r.id); }
    }));
    (state.products || []).forEach(p => { if (p.expenseId != null && map.expenses.has(p.expenseId)) p.expenseId = map.expenses.get(p.expenseId); });
    (state.expenses || []).forEach(e => { if (e.productId != null && map.products.has(e.productId)) e.productId = map.products.get(e.productId); });
    return state;
  }

  /* ── public API ── */
  function load() {
    const s = migrate(adapter.read());
    remember(s);
    return s;
  }

  /* opts.noStamp: keep the timestamps already on the records (used when sync brings data down)
     opts.quiet:   don't trigger another background sync */
  function save(state, opts = {}) {
    if (typeof Links !== 'undefined') Links.clean(state);   // drop links to deleted records
    if (!opts.noStamp) stamp(state);
    const ok = adapter.write(state);
    if (ok) { remember(state); if (!opts.quiet && typeof Cloud !== 'undefined' && Cloud.schedulePush) Cloud.schedulePush(); }
    return ok;
  }

  /* a copy of everything, for backup / export (the same shape that import would accept) */
  function exportAll(state) {
    return { app: 'my-diary', schema: SCHEMA, exportedAt: nowISO(), data: JSON.parse(JSON.stringify(state)) };
  }

  /* swap where data lives (e.g. a cloud adapter with read() and write(state)) */
  function useAdapter(next) { adapter = next || localAdapter; }

  return { load, save, exportAll, useAdapter, emptyState, migrate, newId, upgradeIds, SCHEMA, COLLECTIONS };
})();

if (typeof module !== 'undefined') module.exports = Store;

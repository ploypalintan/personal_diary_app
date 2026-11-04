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

  /* ── public API ── */
  function load() {
    const s = migrate(adapter.read());
    remember(s);
    return s;
  }

  function save(state) {
    if (typeof Links !== 'undefined') Links.clean(state);   // drop links to deleted records
    stamp(state);
    const ok = adapter.write(state);
    if (ok) remember(state);
    return ok;
  }

  /* a copy of everything, for backup / export (the same shape that import would accept) */
  function exportAll(state) {
    return { app: 'my-diary', schema: SCHEMA, exportedAt: nowISO(), data: JSON.parse(JSON.stringify(state)) };
  }

  /* swap where data lives (e.g. a cloud adapter with read() and write(state)) */
  function useAdapter(next) { adapter = next || localAdapter; }

  return { load, save, exportAll, useAdapter, emptyState, migrate, SCHEMA, COLLECTIONS };
})();

if (typeof module !== 'undefined') module.exports = Store;

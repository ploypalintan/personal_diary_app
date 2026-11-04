/* ═══════════════════════════════════════
   cloud.js — sign-in and sync across devices (Supabase).

   The app keeps working from this browser's storage exactly as before. When someone is signed in,
   changes are copied up to the database in the background, and changes made on other devices are
   copied down. If the same record was edited on two devices, the newest edit wins.

   Off unless data/config.js has a Supabase URL and key.
═══════════════════════════════════════ */
const Cloud = (() => {
  const cfg = (typeof window !== 'undefined' && window.DIARY_CONFIG) || {};
  const enabled = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);
  const META_KEY = 'myDiarySyncMeta';
  const LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
  const COLLECTIONS = ['todos', 'products', 'moods', 'incomes', 'expenses'];
  const LOCAL_ONLY = ['photo'];     // old inline photos (base64) stay on the device; new photos sync as files (photoId)
  const PAGE = 1000, BATCH = 200;

  /* ───────── pure functions (no network): unit-tested in Node ───────── */
  const ms = (iso) => { const t = Date.parse(iso); return Number.isNaN(t) ? 0 : t; };

  function toRow(userId, collection, rec) {
    const data = {}; Object.keys(rec).forEach(k => { if (!LOCAL_ONLY.includes(k)) data[k] = rec[k]; });
    return { user_id: userId, collection, id: rec.id, data, updated_at: rec.updatedAt, deleted: false };
  }

  /* what needs to go up: records and deletions changed since the last push (>= so an edit in the very same millisecond is never missed; re-sending one is harmless) */
  function pending(state, userId, lastPushed) {
    const since = ms(lastPushed), rows = [];
    COLLECTIONS.forEach(c => (state[c] || []).forEach(r => { if (ms(r.updatedAt) >= since) rows.push(toRow(userId, c, r)); }));
    (state.deleted || []).forEach(d => { if (ms(d.at) >= since) rows.push({ user_id: userId, collection: d.c, id: d.id, data: {}, updated_at: d.at, deleted: true }); });
    return rows;
  }

  /* fold rows from the database into local state. Newest edit wins. Returns true if anything changed. */
  function merge(state, rows) {
    let changed = false;
    rows.forEach(row => {
      const c = row.collection; if (!COLLECTIONS.includes(c)) return;
      const list = state[c] || (state[c] = []);
      const i = list.findIndex(r => r.id === row.id), local = i >= 0 ? list[i] : null;
      const remoteAt = ms(row.updated_at);
      if (row.deleted) {
        if (local && ms(local.updatedAt) <= remoteAt) { list.splice(i, 1); changed = true; }
        return;
      }
      if (!local) {
        const tomb = (state.deleted || []).find(d => d.c === c && d.id === row.id);
        if (tomb && ms(tomb.at) >= remoteAt) return;            // deleted here after that edit: stays deleted
        list.push(Object.assign({}, row.data, { id: row.id, updatedAt: row.updated_at }));
        changed = true; return;
      }
      if (remoteAt > ms(local.updatedAt)) {
        const keep = {}; LOCAL_ONLY.forEach(k => { if (local[k] !== undefined) keep[k] = local[k]; });
        list[i] = Object.assign({}, row.data, keep, { id: row.id, updatedAt: row.updated_at });
        changed = true;
      }
    });
    return changed;
  }

  /* ───────── browser side ───────── */
  let client = null, session = null, pushTimer = null, syncing = false, listeners = [], lastError = '', lastSyncedAt = null;
  const readMeta = () => { try { return JSON.parse(localStorage.getItem(META_KEY)) || {}; } catch { return {}; } };
  const writeMeta = (m) => { try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch { /* ignore */ } };
  const emit = () => listeners.forEach(f => { try { f(status()); } catch { /* ignore */ } });

  function status() {
    return { enabled, signedIn: !!session, email: session ? session.user.email : '', syncing, lastError, lastSyncedAt };
  }
  function onChange(fn) { listeners.push(fn); }

  function loadLib() {
    return new Promise((resolve, reject) => {
      if (window.supabase) return resolve();
      const s = document.createElement('script'); s.src = LIB; s.onload = resolve; s.onerror = () => reject(new Error('could not load sign-in library'));
      document.head.appendChild(s);
    });
  }

  async function init() {
    if (!enabled) return;
    try {
      await loadLib();
      client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
      const { data } = await client.auth.getSession(); session = data.session;
      client.auth.onAuthStateChange((event, s) => {
        session = s; emit();
        if (event === 'SIGNED_IN') sync();
        if (event === 'SIGNED_OUT') writeMeta({});
      });
      emit();
      if (session) sync();
    } catch (err) { lastError = err.message; emit(); }
  }

  async function signInWithEmail(email) {
    if (!client) throw new Error('sync is not set up yet');
    const redirect = new URL('pages/account.html', document.baseURI.replace(/pages\/.*$/, '')).href;
    const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect } });
    if (error) throw error;
  }
  async function signOut() { if (client) await client.auth.signOut(); session = null; emit(); }

  /* App Store rule: people must be able to delete their account and its data from inside the app */
  async function deleteAccount() {
    if (!client || !session) throw new Error('not signed in');
    /* remove this person's photo files first (deleting the login alone would leave them behind) */
    try {
      const folder = client.storage.from('photos');
      const { data: files } = await folder.list(session.user.id, { limit: 1000 });
      if (files && files.length) await folder.remove(files.map(f => `${session.user.id}/${f.name}`));
    } catch (err) { console.warn('could not clear photos', err); }
    const { error } = await client.rpc('delete_my_account');
    if (error) throw error;
    await signOut(); writeMeta({});
  }

  const getToken = () => (session ? session.access_token : null);

  async function sync() {
    if (!enabled || !client || !session || syncing) return;
    syncing = true; lastError = ''; emit();
    try {
      const userId = session.user.id;
      let meta = readMeta();
      let state = Store.load();

      /* first sync on this device: give old counting ids a unique id so devices cannot clash */
      if (!meta.idsUpgraded) {
        Store.upgradeIds(state);
        Store.save(state, { quiet: true, noStamp: true });   // no stamp: old ids must not be recorded as deletions
        meta.idsUpgraded = true; writeMeta(meta); state = Store.load();
      }

      /* pull */
      let cursor = meta.pullCursor || null, all = [];
      for (;;) {
        let q = client.from('records').select('collection,id,data,updated_at,deleted,synced_at').eq('user_id', userId).order('synced_at', { ascending: true }).limit(PAGE);
        if (cursor) q = q.gt('synced_at', cursor);
        const { data, error } = await q; if (error) throw error;
        all = all.concat(data); if (data.length) cursor = data[data.length - 1].synced_at;
        if (data.length < PAGE) break;
      }
      let changed = merge(state, all);

      /* settings and plan (the plan can only be changed by the server) */
      const [{ data: st }, { data: ent }] = await Promise.all([
        client.from('user_settings').select('user_name,currency').eq('user_id', userId).maybeSingle(),
        client.from('entitlements').select('plan').eq('user_id', userId).maybeSingle(),
      ]);
      if (st && st.user_name && !state.userName) { state.userName = st.user_name; changed = true; }
      if (st && st.currency && st.currency !== state.currency && !meta.settingsPushed) { state.currency = st.currency; changed = true; }
      if (ent && ent.plan && ent.plan !== state.plan) { state.plan = ent.plan; changed = true; }
      if (changed) Store.save(state, { quiet: true, noStamp: true });

      /* push */
      const startedAt = new Date().toISOString();
      const rows = pending(state, userId, meta.lastPushed || null);
      for (let i = 0; i < rows.length; i += BATCH) {
        const { error } = await client.from('records').upsert(rows.slice(i, i + BATCH), { onConflict: 'user_id,collection,id' });
        if (error) throw error;
      }
      if (state.userName || state.currency) {
        const { error } = await client.from('user_settings').upsert({ user_id: userId, user_name: state.userName || '', currency: state.currency || 'SGD', updated_at: startedAt });
        if (error) throw error; meta.settingsPushed = true;
      }
      /* photos: upload ones this device has, download ones it is missing */
      const photosChanged = await syncPhotos(state, userId, meta);
      meta.pullCursor = cursor; meta.lastPushed = startedAt; writeMeta(meta);
      lastSyncedAt = startedAt;

      /* pages hold their data in memory, so reload once to show what came down */
      if ((changed || photosChanged) && !sessionStorage.getItem('cloudReloaded')) { sessionStorage.setItem('cloudReloaded', '1'); location.reload(); return; }
      sessionStorage.removeItem('cloudReloaded');
    } catch (err) { lastError = (err && err.message) || 'sync failed'; console.error('Sync error:', err); }
    finally { syncing = false; emit(); }
  }

  /* returns true if a photo was downloaded (so the page should redraw) */
  async function syncPhotos(state, userId, meta) {
    if (typeof Photos === 'undefined') return false;
    const bucket = client.storage.from('photos'); meta.photosUp = meta.photosUp || {};
    let downloaded = false;
    for (const p of (state.products || [])) {
      if (!p.photoId) continue;
      const path = `${userId}/${p.photoId}`;
      try {
        if (await Photos.has(p.photoId)) {
          if (!meta.photosUp[p.photoId]) {
            const { error } = await bucket.upload(path, await Photos.get(p.photoId), { upsert: true, contentType: 'image/jpeg' });
            if (!error) meta.photosUp[p.photoId] = 1;
          }
        } else {
          const { data, error } = await bucket.download(path);
          if (!error && data) { await Photos.put(data, p.photoId); meta.photosUp[p.photoId] = 1; downloaded = true; }
        }
      } catch (err) { console.warn('photo sync skipped', p.photoId, err); }
    }
    return downloaded;
  }

  function schedulePush() {
    if (!enabled || !session) return;
    clearTimeout(pushTimer); pushTimer = setTimeout(sync, 3000);
  }

  if (typeof window !== 'undefined' && enabled) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init(); }

  return { enabled, status, onChange, signInWithEmail, signOut, deleteAccount, getToken, sync, schedulePush, _test: { merge, pending, toRow } };
})();

if (typeof module !== 'undefined') module.exports = Cloud;

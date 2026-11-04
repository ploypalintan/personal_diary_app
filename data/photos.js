/* ═══════════════════════════════════════
   photos.js — product photos live in IndexedDB (real files), not inside the diary text.

   Before: each photo was a ~50 KB block of text stored in localStorage, which has a ~5 MB limit
   shared by everything. Now photos are Blobs in IndexedDB (hundreds of MB available), and a
   product just remembers `photoId`. Old photos are moved over automatically.

   If IndexedDB is not available (some private windows), callers fall back to the old way.
═══════════════════════════════════════ */
const Photos = (() => {
  const DB = 'myDiaryPhotos', STORE = 'photos';
  let dbPromise = null;
  const urls = new Map();   // photoId -> object URL (so one photo is only turned into a URL once)

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') return reject(new Error('no IndexedDB'));
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('IndexedDB error'));
      req.onblocked = () => reject(new Error('IndexedDB blocked'));
    });
    dbPromise.catch(() => { dbPromise = null; });
    return dbPromise;
  }
  const run = (mode, fn) => open().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode), st = tx.objectStore(STORE), req = fn(st);
    tx.oncomplete = () => resolve(req ? req.result : undefined);
    tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
  }));

  const newPhotoId = () => 'ph' + (typeof Store !== 'undefined' ? Store.newId() : Date.now() * 1000 + Math.floor(Math.random() * 1000));
  const validId = (id) => typeof id === 'string' && /^ph\d+$/.test(id);

  async function put(blob, id) { id = id || newPhotoId(); await run('readwrite', st => st.put(blob, id)); return id; }
  async function get(id) { if (!validId(id)) return null; return (await run('readonly', st => st.get(id))) || null; }
  async function has(id) { return !!(await get(id)); }
  async function remove(id) {
    if (!validId(id)) return;
    if (urls.has(id)) { URL.revokeObjectURL(urls.get(id)); urls.delete(id); }
    await run('readwrite', st => st.delete(id));
  }
  async function url(id) {
    if (urls.has(id)) return urls.get(id);
    const b = await get(id); if (!b) return '';
    const u = URL.createObjectURL(b); urls.set(id, u); return u;
  }

  function dataUrlToBlob(dataUrl) {
    const m = /^data:(image\/(?:jpeg|png|webp));base64,([a-z0-9+/=]+)$/i.exec(dataUrl || '');
    if (!m) return null;
    const bin = atob(m[2]), bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: m[1] });
  }
  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(blob); });
  }
  async function dataUrl(id) { const b = await get(id); return b ? blobToDataUrl(b) : ''; }

  /* move old base64 photos (product.photo) into IndexedDB. Returns how many were moved. */
  async function migrate(state) {
    let moved = 0;
    for (const p of (state.products || [])) {
      if (p.photo && !p.photoId) {
        const blob = dataUrlToBlob(p.photo); if (!blob) continue;
        try { p.photoId = await put(blob); p.photo = ''; moved++; } catch { return moved; }   // IndexedDB unavailable: leave as is
      }
    }
    return moved;
  }

  return { put, get, has, remove, url, dataUrl, dataUrlToBlob, blobToDataUrl, migrate, validId };
})();

if (typeof module !== 'undefined') module.exports = Photos;

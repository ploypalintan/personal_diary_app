/* ═══════════════════════════════════════
   pager.js
   Turns a list into journal pages: only as many items as fit the
   available height are shown, with ‹ page 1 of 3 › to turn.
   The page itself never scrolls.

   paginate(container)        // call after (re)rendering the list
   The container must have a fixed height (flex:1; min-height:0).
═══════════════════════════════════════ */

const _pagers = new Map();   /* container -> { page, count } */

function paginate(container) {
  if (!container || container.hidden || container.offsetParent === null) return;
  const st = _pagers.get(container) || { page: 0, count: 0 };
  const items = Array.from(container.children);

  let bar = container.nextElementSibling;
  if (!bar || !bar.classList.contains('pager-bar')) {
    bar = document.createElement('div'); bar.className = 'pager-bar';
    bar.innerHTML = '<button type="button" class="pg-prev" aria-label="previous page">‹</button><span class="pg-count" role="status" aria-live="polite"></span><button type="button" class="pg-next" aria-label="next page">›</button>';
    container.after(bar);
    bar.querySelector('.pg-prev').addEventListener('click', () => { st.page--; _pagers.set(container, st); paginate(container); });
    bar.querySelector('.pg-next').addEventListener('click', () => { st.page++; _pagers.set(container, st); paginate(container); });
  }

  items.forEach(i => i.classList.remove('pg-hide'));
  const avail = container.clientHeight;
  const pages = []; let cur = [], used = 0;
  items.forEach(i => {
    const cs = getComputedStyle(i);
    const h = i.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
    if (cur.length && used + h > avail + 1) { pages.push(cur); cur = []; used = 0; }
    cur.push(i); used += h;
  });
  if (cur.length) pages.push(cur);

  if (items.length > st.count) st.page = 0;          /* something new was added: show page 1 */
  st.count = items.length;
  st.page = Math.max(0, Math.min(st.page, pages.length - 1));
  _pagers.set(container, st);

  items.forEach(i => i.classList.add('pg-hide'));
  (pages[st.page] || []).forEach(i => i.classList.remove('pg-hide'));
  container.style.overflowY = (pages[st.page] || []).length === 1 && (pages[st.page][0].offsetHeight > avail) ? 'auto' : 'hidden';  /* one very tall item */

  const many = pages.length > 1;
  bar.style.visibility = many ? 'visible' : 'hidden';
  bar.querySelector('.pg-count').textContent = many ? `page ${st.page + 1} of ${pages.length}` : '';
  bar.querySelector('.pg-prev').disabled = st.page <= 0;
  bar.querySelector('.pg-next').disabled = st.page >= pages.length - 1;
}

/* re-fit when the window changes or a card opens/closes */
let _pgTimer;
window.addEventListener('resize', () => { clearTimeout(_pgTimer); _pgTimer = setTimeout(() => _pagers.forEach((_, c) => paginate(c)), 120); });
document.addEventListener('toggle', (e) => { _pagers.forEach((_, c) => { if (c.contains(e.target)) setTimeout(() => paginate(c), 0); }); }, true);

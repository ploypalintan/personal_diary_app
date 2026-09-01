/* ═══════════════════════════════════════
   script.js
   Shared bootstrap helper for inner pages.
   Each page calls initPage() on load.
═══════════════════════════════════════ */

function initPage() {
  const state = loadState();

  /* redirect to index if no user name yet */
  if (!state.userName) {
    window.location.href = '../index.html';
    return null;
  }

  /* spine label */
  const spineEl = document.querySelector('.spine-text');
  if (spineEl) spineEl.textContent = state.userName.toLowerCase() + "'s diary";

  /* mini avatar back button */
  const mini = document.getElementById('miniAvatar');
  if (mini && state.character) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 88 130');
    svg.setAttribute('width', '28');
    svg.setAttribute('height', '34');
    if (state.character === 'girl') drawGirl(svg); else drawBoy(svg);
    mini.innerHTML = '';
    mini.appendChild(svg);
    mini.addEventListener('click', () => { window.location.href = '../index.html'; });
  }

  /* active bookmark */
  const current = window.location.pathname.split('/').pop();
  document.querySelectorAll('.bm[data-page]').forEach(bm => {
    const target = bm.getAttribute('data-page').split('/').pop();
    bm.classList.toggle('active', target === current);
    bm.addEventListener('click', e => {
      e.preventDefault();
      window.location.href = bm.getAttribute('data-page');
    });
  });

  /* today date string */
  const dateEls = document.querySelectorAll('.js-today');
  const ds = getTodayString();
  dateEls.forEach(el => el.textContent = ds);

  return state;
}

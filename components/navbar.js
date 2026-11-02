/* navbar.js: shared bootstrap for the inner pages */

function initPage() {
  const state = loadState();
  if (!state.userName) { window.location.href = '../index.html'; return null; }

  /* active tab + navigation */
  const current = window.location.pathname.split('/').pop();
  document.querySelectorAll('.bm[data-page]').forEach(bm => {
    const target = bm.getAttribute('data-page').split('/').pop();
    const on = target === current;
    bm.classList.toggle('active', on);
    if (on) bm.setAttribute('aria-current', 'page');
    bm.setAttribute('href', bm.getAttribute('data-page'));
  });

  /* today's date in the page header */
  document.querySelectorAll('.js-today').forEach(el => el.textContent = getTodayString());

  return state;
}

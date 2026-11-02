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

  buildMemoHeader(state);
  buildTurnButtons();
  if (typeof addStickers === 'function') addStickers(document.querySelector('.page'), STICKER_SETS.spread);
  return state;
}

/* turns each page's header into a memo: TO / FROM / date row, SUBJECT, MESSAGE */
function buildMemoHeader(state) {
  const header = document.querySelector('.page-header');
  const title = header && header.querySelector('.page-title');
  if (!title || header.dataset.memo) return;
  header.dataset.memo = '1';
  const mk = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const cell = (cls, label, value) => { const c = mk('div', 'memo-cell ' + cls); c.append(mk('span', 'memo-lbl', label), document.createTextNode(value)); return c; };
  const now = new Date(), pad = (n) => String(n).padStart(2, '0');

  const subject = mk('div', 'memo-subject');
  const subj = mk('div', 'memo-lbl', 'subject:');
  /* the visible script title is decoration; a screen-reader h1 stays in the DOM even when a phone hides this page */
  const h1 = mk('h1', 'sr-only', title.textContent);
  title.setAttribute('aria-hidden', 'true');
  const pgEl = document.querySelector('.page'); if (pgEl) pgEl.prepend(h1);
  subject.append(subj, title);

  const row = mk('div', 'memo-row');
  const date = mk('div', 'memo-cell date', `${pad(now.getDate())} / ${pad(now.getMonth() + 1)}`);
  date.setAttribute('aria-label', getTodayString());
  row.append(cell('to', 'to:', state.userName.toLowerCase()), cell('from', 'from:', 'me, today'), date);

  header.replaceChildren(mk('div', 'memo-kicker', 'diary memo'), row, subject);
  const right = document.querySelector('.pg-right');
  const page = document.querySelector('.page');
  const side = mk('div', 'memo-side', `the diary of ${state.userName}`); side.setAttribute('aria-hidden', 'true');
  if (page) page.appendChild(side);
}

/* phones show one page at a time: a button turns to the other side of the spread */
function buildTurnButtons() {
  const app = document.getElementById('mainApp');
  const left = document.querySelector('.pg-left'), right = document.querySelector('.pg-right');
  if (!app || !left || !right) return;
  app.dataset.side = 'left';
  const mk = (label, side, cls) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'turn ' + cls; b.textContent = label;
    b.addEventListener('click', () => { app.dataset.side = side; window.dispatchEvent(new Event('resize')); });
    return b;
  };
  left.appendChild(mk('turn the page ›', 'right', 'turn-next'));
  right.appendChild(mk('‹ back', 'left', 'turn-back'));
}

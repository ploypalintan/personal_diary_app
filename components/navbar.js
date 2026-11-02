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
  title.setAttribute('role', 'heading'); title.setAttribute('aria-level', '1');
  subject.append(subj, title);

  const row = mk('div', 'memo-row');
  const date = mk('div', 'memo-cell date', `${pad(now.getDate())} / ${pad(now.getMonth() + 1)}`);
  date.setAttribute('aria-label', getTodayString());
  row.append(cell('to', 'to:', state.userName.toLowerCase()), cell('from', 'from:', 'me, today'), date);

  header.replaceChildren(mk('div', 'memo-kicker', 'diary memo'), row, subject);
  const body = document.querySelector('.page-body');
  if (body) body.prepend(mk('div', 'memo-lbl memo-msg', 'message:'));
  const page = document.querySelector('.page');
  const side = mk('div', 'memo-side', `the diary of ${state.userName}`); side.setAttribute('aria-hidden', 'true');
  if (page) page.appendChild(side);
}

/* ═══════════════════════════════════════
   components/diaryCard.js
   Reusable card renderers for:
   – todo items
   – wish items
   – expense / income rows
═══════════════════════════════════════ */

/* ── TODO CARD ── */
function makeTodoCard(item, onToggle, onDelete) {
  const el = document.createElement('div');
  el.className = `card todo-card${item.done ? ' done-card' : ''}`;
  el.style.display = 'flex';
  el.style.alignItems = 'flex-start';
  el.style.gap = '10px';
  el.style.marginBottom = '8px';

  /* checkmark */
  const chk = document.createElement('div');
  chk.className = `chk${item.done ? ' on' : ''}`;
  chk.style.marginTop = '2px';
  chk.addEventListener('click', () => onToggle(item.id));
  el.appendChild(chk);

  /* body */
  const body = document.createElement('div');
  body.style.flex = '1';

  const name = document.createElement('div');
  name.className = 'tname';
  name.textContent = item.name;
  name.style.fontSize = '14px';
  name.style.color = 'var(--ink-soft)';
  name.style.fontFamily = "'Cormorant Garamond', serif";
  if (item.done) {
    name.style.textDecoration = 'line-through';
    name.style.color = 'var(--text-muted)';
  }
  body.appendChild(name);

  const meta = document.createElement('div');
  meta.className = 'tmeta';
  meta.style.cssText = 'display:flex;gap:5px;flex-wrap:wrap;margin-top:4px';

  const catPill = document.createElement('span');
  catPill.className = 'pill pill-cat';
  catPill.textContent = item.cat;
  meta.appendChild(catPill);

  const prioPill = document.createElement('span');
  prioPill.className = `pill pill-${item.prio}`;
  prioPill.textContent = item.prio === 'hi' ? 'high priority' : item.prio === 'me' ? 'medium' : 'low';
  meta.appendChild(prioPill);

  body.appendChild(meta);
  el.appendChild(body);

  /* delete */
  const del = document.createElement('button');
  del.className = 'del-btn';
  del.textContent = '×';
  del.addEventListener('click', () => onDelete(item.id));
  el.appendChild(del);

  return el;
}

/* ── WISH CARD ── */
function makeWishCard(item, onStar, onDelete) {
  const el = document.createElement('div');
  el.className = 'card';
  el.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:8px';

  const star = document.createElement('span');
  star.style.cssText = 'font-size:14px;cursor:pointer;flex-shrink:0;transition:transform 0.2s';
  star.textContent = item.star ? '✦' : '✧';
  star.addEventListener('click', () => onStar(item.id));
  el.appendChild(star);

  const name = document.createElement('span');
  name.style.cssText = "font-size:14px;color:var(--ink-soft);flex:1;font-family:'Cormorant Garamond',serif;font-style:italic";
  name.textContent = item.name;
  el.appendChild(name);

  const tag = document.createElement('span');
  tag.className = 'pill pill-cat';
  tag.textContent = item.cat;
  el.appendChild(tag);

  const del = document.createElement('button');
  del.className = 'del-btn';
  del.textContent = '×';
  del.addEventListener('click', () => onDelete(item.id));
  el.appendChild(del);

  return el;
}

/* ── EXPENSE / INCOME ROW ── */
function makeFinanceRow(item, colorMap, isIncome, onDelete) {
  const el = document.createElement('div');
  el.className = 'card';
  el.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:7px';

  const dot = document.createElement('div');
  dot.style.cssText = `width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${colorMap[item.cat || item.type] || '#c8bfc3'}`;
  el.appendChild(dot);

  const name = document.createElement('span');
  name.style.cssText = "font-size:13px;color:var(--ink-soft);flex:1;font-family:'Cormorant Garamond',serif;font-style:italic";
  name.textContent = item.name;
  el.appendChild(name);

  const tag = document.createElement('span');
  tag.className = 'pill pill-cat';
  tag.textContent = item.cat || item.type;
  el.appendChild(tag);

  const amt = document.createElement('span');
  amt.style.cssText = `font-size:13px;font-family:'Playfair Display',serif;white-space:nowrap;color:${isIncome ? 'var(--positive)' : 'var(--mauve-dark)'}`;
  amt.textContent = (isIncome ? '+' : '') + window._currSym + item.amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  el.appendChild(amt);

  const del = document.createElement('button');
  del.className = 'del-btn';
  del.textContent = '×';
  del.addEventListener('click', () => onDelete(item.id));
  el.appendChild(del);

  return el;
}

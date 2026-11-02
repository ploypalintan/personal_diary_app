/* ═══════════════════════════════════════
   components/diaryCard.js
   Reusable card renderers for:
   – todo items
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
  chk.setAttribute('role', 'checkbox'); chk.setAttribute('tabindex', '0');
  chk.setAttribute('aria-checked', String(!!item.done)); chk.setAttribute('aria-label', `${item.done ? 'done' : 'not done'}: ${item.name}`);
  chk.addEventListener('click', () => onToggle(item.id));
  chk.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggle(item.id); } });
  el.appendChild(chk);

  /* body */
  const body = document.createElement('div');
  body.style.flex = '1';

  const name = document.createElement('div');
  name.className = 'tname';
  name.textContent = item.name;
  name.style.fontSize = '14px';
  name.style.color = 'var(--ink-soft)';
  name.style.fontFamily = "var(--font)";
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

/* ── EXPENSE / INCOME ROW ── */
function makeFinanceRow(item, colorMap, isIncome, onDelete) {
  const el = document.createElement('div');
  el.className = 'card fin-row';
  el.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:7px';

  const dot = document.createElement('div');
  dot.style.cssText = `width:10px;height:10px;border-radius:50%;flex-shrink:0;background:${colorMap[item.cat || item.type] || '#c8bfc3'}`;
  el.appendChild(dot);

  const mid = document.createElement('div'); mid.style.cssText = 'flex:1;min-width:0';
  const name = document.createElement('div'); name.className = 'fin-name'; name.textContent = item.name;
  const meta = document.createElement('div'); meta.className = 'fin-meta';
  const when = (item.date && typeof formatDMY === 'function') ? formatDMY(item.date) : '';
  meta.textContent = [when, item.cat || item.type].filter(Boolean).join(' · ');
  mid.append(name, meta); el.appendChild(mid);

  const amt = document.createElement('span');
  amt.className = 'fin-amt';
  amt.style.color = isIncome ? 'var(--positive)' : 'var(--mauve-dark)';
  amt.textContent = (isIncome ? '+' : '') + window._currSym + item.amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  el.appendChild(amt);

  const del = document.createElement('button');
  del.className = 'del-btn';
  del.textContent = '×';
  del.setAttribute('aria-label', 'delete ' + item.name);
  del.addEventListener('click', () => onDelete(item.id));
  el.appendChild(del);

  return el;
}

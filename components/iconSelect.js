/* ═══════════════════════════════════════
   iconSelect.js
   An accessible dropdown whose options carry a picture.
   (A native <select> cannot show images.)
   Pattern: ARIA 1.2 "select-only combobox" + listbox.
   Keys: Up/Down, Home/End, Enter/Space, Escape, type a letter.

   const sel = createIconSelect({ root, id, labelId, options, value, onChange })
   options: [{ value, label, icon }]   icon = trusted SVG string
   sel.get() / sel.set(value)
═══════════════════════════════════════ */

function createIconSelect({ root, id, labelId, options, value, onChange }) {
  let current = value || options[0].value;
  let active = -1;
  let open = false;
  let typed = '', typedAt = 0;

  root.classList.add('isel');
  root.innerHTML = '';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = id;
  btn.className = 'isel-btn';
  btn.setAttribute('role', 'combobox');
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', id + '-list');
  if (labelId) btn.setAttribute('aria-labelledby', labelId + ' ' + id);

  const ico = document.createElement('span'); ico.className = 'isel-ico'; ico.setAttribute('aria-hidden', 'true');
  const txt = document.createElement('span'); txt.className = 'isel-text';
  const car = document.createElement('span'); car.className = 'isel-caret'; car.setAttribute('aria-hidden', 'true'); car.textContent = '▾';
  btn.append(ico, txt, car);

  const list = document.createElement('ul');
  list.id = id + '-list';
  list.className = 'isel-list';
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', 'options');
  list.hidden = true;

  const items = options.map((o, i) => {
    const li = document.createElement('li');
    li.id = `${id}-opt-${i}`;
    li.className = 'isel-opt';
    li.setAttribute('role', 'option');
    const oi = document.createElement('span'); oi.className = 'isel-ico'; oi.setAttribute('aria-hidden', 'true'); oi.innerHTML = o.icon;
    const ot = document.createElement('span'); ot.textContent = o.label;
    li.append(oi, ot);
    li.addEventListener('mousedown', (e) => e.preventDefault());       /* keep focus on the button */
    li.addEventListener('click', () => { choose(i); close(); btn.focus(); });
    list.appendChild(li);
    return li;
  });
  root.append(btn, list);

  function indexOfValue(v) { return Math.max(0, options.findIndex(o => o.value === v)); }
  function paint() {
    const o = options[indexOfValue(current)];
    ico.innerHTML = o.icon; txt.textContent = o.label;
    items.forEach((li, i) => li.setAttribute('aria-selected', String(options[i].value === current)));
  }
  function highlight(i) {
    active = Math.max(0, Math.min(options.length - 1, i));
    items.forEach((li, j) => li.classList.toggle('active', j === active));
    btn.setAttribute('aria-activedescendant', items[active].id);
    items[active].scrollIntoView({ block: 'nearest' });
  }
  function choose(i) {
    const changed = options[i].value !== current;
    current = options[i].value; paint();
    if (changed && onChange) onChange(current);
  }
  function openList() {
    if (open) return;
    open = true; list.hidden = false; btn.setAttribute('aria-expanded', 'true');
    highlight(indexOfValue(current));
  }
  function close() {
    if (!open) return;
    open = false; list.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.removeAttribute('aria-activedescendant');
  }

  btn.addEventListener('click', () => (open ? close() : openList()));
  btn.addEventListener('blur', close);
  btn.addEventListener('keydown', (e) => {
    const k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowUp') {
      e.preventDefault();
      if (!open) openList(); else highlight(active + (k === 'ArrowDown' ? 1 : -1));
    } else if (k === 'Home' || k === 'End') {
      e.preventDefault(); if (!open) openList(); highlight(k === 'Home' ? 0 : options.length - 1);
    } else if (k === 'Enter' || k === ' ') {
      e.preventDefault();
      if (open) { choose(active); close(); } else openList();
    } else if (k === 'Escape') {
      if (open) { e.preventDefault(); close(); }
    } else if (k === 'Tab') {
      if (open) { choose(active); close(); }
    } else if (k.length === 1 && /\S/.test(k)) {                      /* type-ahead */
      const now = Date.now(); typed = (now - typedAt > 700 ? '' : typed) + k.toLowerCase(); typedAt = now;
      const hit = options.findIndex(o => o.label.toLowerCase().startsWith(typed));
      if (hit >= 0) { if (!open) openList(); highlight(hit); }
    }
  });

  paint();
  return {
    get: () => current,
    set: (v) => { if (options.some(o => o.value === v)) { current = v; paint(); } },
  };
}

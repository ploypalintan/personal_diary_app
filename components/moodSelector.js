/* ═══════════════════════════════════════
   components/moodSelector.js
   Renders the three-group mood selector:
   core / emotional tension / identity moods
═══════════════════════════════════════ */

const MOOD_COLORS = {
  /* core */
  soft:     { bg: '#f5f0f0', border: '#E1CCCC', dot: '#AA9DA1' },
  light:    { bg: '#fdf8ee', border: '#e8d8a8', dot: '#c8a848' },
  alive:    { bg: '#f0f8f0', border: '#b8d8b0', dot: '#7aaa70' },
  held:     { bg: '#f8f0f5', border: '#e0c0d8', dot: '#c080a8' },
  still:    { bg: '#f5f4f3', border: '#d8d4d0', dot: '#9a9490' },
  heavy:    { bg: '#f2eeec', border: '#d0c4c0', dot: '#8a7878' },
  /* tension */
  restless: { bg: '#fdf0e8', border: '#e8c8a0', dot: '#c09050' },
  blue:     { bg: '#eff4fa', border: '#b8cce8', dot: '#5880b8' },
  tight:    { bg: '#faf0f0', border: '#e8b8b8', dot: '#c06060' },
  toomuch:  { bg: '#f8eef8', border: '#d8b0d8', dot: '#a060a0' },
  /* identity */
  alone:    { bg: '#f0f0f5', border: '#c0c0d8', dot: '#7070a8' },
  itching:  { bg: '#f0f8f5', border: '#b0d8c8', dot: '#50a890' },
  tooaware: { bg: '#f5f0f8', border: '#c8b0d8', dot: '#8858b0' },
};

function renderMoodSelector(containerId, selectedKey, onChange) {
  const container = document.getElementById(containerId);
  if (!container) return;

  function makeGroup(groupLabel, moods) {
    const wrap = document.createElement('div');
    wrap.style.marginBottom = '20px';

    const label = document.createElement('div');
    label.className = 'sec-label';
    label.textContent = groupLabel;
    wrap.appendChild(label);

    const grid = document.createElement('div');
    grid.className = 'mood-grid';
    wrap.appendChild(grid);

    moods.forEach(mood => {
      const tile = document.createElement('div');
      tile.className = 'mood-tile';
      tile.dataset.key = mood.key;

      const colors = MOOD_COLORS[mood.key] || { bg: '#f5f0f0', border: '#E1CCCC', dot: '#AA9DA1' };
      tile.style.background    = colors.bg;
      tile.style.borderColor   = colors.border;

      tile.innerHTML = `
        <div class="mood-dot" style="background:${colors.dot}"></div>
        <div class="mood-label-main">${mood.label}</div>
        <div class="mood-label-sub">${mood.sub}</div>`;

      if (mood.key === selectedKey) tile.classList.add('sel');

      tile.addEventListener('click', () => {
        container.querySelectorAll('.mood-tile').forEach(t => t.classList.remove('sel'));
        tile.classList.add('sel');
        if (onChange) onChange(mood);
      });

      grid.appendChild(tile);
    });

    return wrap;
  }

  container.innerHTML = '';
  container.appendChild(makeGroup('core',                 MOODS.core));
  container.appendChild(makeGroup('emotional tension',    MOODS.tension));
  container.appendChild(makeGroup('identity',             MOODS.identity));
}

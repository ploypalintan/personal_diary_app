/* navbar.js */

const BOW_SVG = `<svg viewBox="0 0 54 46" width="54" height="46" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="r1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f0e0e0"/>
      <stop offset="50%" stop-color="#dfc8c8"/>
      <stop offset="100%" stop-color="#ccb4b4"/>
    </linearGradient>
    <linearGradient id="r2" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e8d4d4"/>
      <stop offset="100%" stop-color="#c8b0b0"/>
    </linearGradient>
  </defs>
  <path d="M27 22 Q16 10 6 14 Q0 20 8 26 Q16 30 27 22Z" fill="url(#r1)" stroke="#d0b8b8" stroke-width="0.5"/>
  <path d="M27 22 Q18 12 10 15 Q5 20 12 24" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M27 22 Q38 10 48 14 Q54 20 46 26 Q38 30 27 22Z" fill="url(#r2)" stroke="#c8b0b0" stroke-width="0.5"/>
  <path d="M27 22 Q36 12 44 15 Q49 20 42 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" stroke-linecap="round"/>
  <ellipse cx="27" cy="22" rx="4.5" ry="3.5" fill="#ccb0b0"/>
  <ellipse cx="27" cy="21" rx="2.2" ry="1.4" fill="rgba(255,255,255,0.38)"/>
  <path d="M23 25 Q20 34 22 42" fill="none" stroke="#dcc8c8" stroke-width="6" stroke-linecap="round"/>
  <path d="M23 25 Q20 34 22 42" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M31 25 Q34 34 32 42" fill="none" stroke="#d4c0c0" stroke-width="6" stroke-linecap="round"/>
  <path d="M31 25 Q34 34 32 42" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

function initPage() {
  const state = loadState();
  if (!state.userName) { window.location.href = '../index.html'; return null; }

  /* spine label */
  const spineEl = document.querySelector('.spine-text');
  if (spineEl) spineEl.textContent = state.userName.toLowerCase() + "'s diary";

  /* bow */
  const bowEl = document.getElementById('sidebarBow');
  if (bowEl) bowEl.innerHTML = BOW_SVG;

  /* mini avatar — pixel canvas */
  const mini = document.getElementById('miniAvatar');
  if (mini) {
    const cv = document.createElement('canvas');
    cv.width = 32; cv.height = 48;
    cv.style.cssText = 'image-rendering:pixelated;width:28px;height:42px;cursor:pointer';
    const si = state.charSkin      !== undefined ? state.charSkin      : 1;
    const hi = state.charHairCol   !== undefined ? state.charHairCol   : 1;
    const hsk = ['longstraight','wavylong','bob','curly','short'][state.charHairStyle || 1];
    const outk = ['sweater','dress','knit','check','hoodie'][state.charOutfit || 0];
    drawPixelChar(cv, si, hi, hsk, outk);
    mini.innerHTML = '';
    mini.appendChild(cv);
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

  /* today date */
  document.querySelectorAll('.js-today').forEach(el => el.textContent = getTodayString());

  return state;
}

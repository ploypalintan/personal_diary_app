/* ═══════════════════════════════════════
   categoryIcons.js
   Small hand-drawn icons, one per product category.
   Same soft style throughout: ballet-pink fills, a deep-rose
   outline, a tiny highlight. Drawn for this app (not stock art).
   Each icon is a 32x32 SVG string.
═══════════════════════════════════════ */

const _O = '#73364b';   /* outline */
const _P = '#f3c2d0';   /* ballet pink */
const _L = '#fbe7ec';   /* light satin */
const _C = '#e9d3b4';   /* champagne */
const _W = '#ffffff';
const _s = `stroke="${_O}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"`;
const _face = (cx, cy) => `<circle cx="${cx - 3.6}" cy="${cy}" r="1" fill="${_O}"/><circle cx="${cx + 3.6}" cy="${cy}" r="1" fill="${_O}"/><path d="M${cx - 1.4} ${cy + 2.2} q1.4 1.3 2.8 0" fill="none" ${_s} stroke-width="1.1"/><circle cx="${cx - 6.2}" cy="${cy + 2}" r="1.5" fill="#f08aa6" opacity=".55"/><circle cx="${cx + 6.2}" cy="${cy + 2}" r="1.5" fill="#f08aa6" opacity=".55"/>`;
const _svg = (inner) => `<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false">${inner}</svg>`;

const CATEGORY_ICONS = {
  /* foundation: glass bottle with a pump and a skin-tone liquid */
  foundation: _svg(`<rect x="13.5" y="2.6" width="6" height="3" rx="1.2" fill="${_P}" ${_s} stroke-width="1.3"/><rect x="15.2" y="5.4" width="2.6" height="4" fill="${_C}" ${_s} stroke-width="1.2"/><rect x="9" y="9.2" width="15" height="19" rx="4.5" fill="#fff6ec" ${_s}/><path d="M10.4 17h12.2v7.4a3.2 3.2 0 0 1-3.2 3.2h-5.8a3.2 3.2 0 0 1-3.2-3.2z" fill="#f0c39c" stroke="${_O}" stroke-width="1" stroke-linejoin="round"/><path d="M12.2 12v3" stroke="${_W}" stroke-width="1.5" stroke-linecap="round" opacity=".85"/>`),
  /* blush: round compact, open, with a cheek-flush pan and a heart */
  blush: _svg(`<ellipse cx="16" cy="21" rx="12" ry="7" fill="${_L}" ${_s}/><path d="M6 20V11a10 7 0 0 1 20 0v9" fill="${_P}" ${_s}/><ellipse cx="16" cy="11.4" rx="6" ry="4" fill="${_W}" opacity=".75"/><ellipse cx="16" cy="21" rx="7.4" ry="3.8" fill="#f08aa6" stroke="${_O}" stroke-width="1.1"/><path d="M16 22.4c-2.2-1.4-2.7-2.6-1.9-3.5.7-.7 1.5-.5 1.9.3.4-.8 1.2-1 1.9-.3.8.9.3 2.1-1.9 3.5z" fill="#fff" opacity=".8"/>`),
  eyebrows: _svg(`<g transform="rotate(-38 16 16)"><rect x="12.6" y="2.5" width="6.8" height="5" rx="1.6" fill="${_P}" ${_s}/><rect x="12.6" y="7.5" width="6.8" height="14" fill="${_C}" ${_s}/><path d="M12.6 21.5h6.8L16 29z" fill="#f5e2cd" ${_s}/><path d="M15 26.6h2L16 29z" fill="${_O}"/><path d="M14.4 9.5v10" stroke="${_W}" stroke-width="1.2" stroke-linecap="round" opacity=".7"/></g>`),
  /* contour: a sculpting stick with a soft shadow swoosh */
  contour: _svg(`<g transform="rotate(-24 16 16)"><rect x="12" y="13" width="8" height="15" rx="2.2" fill="${_C}" ${_s}/><rect x="12.8" y="9" width="6.4" height="5" rx="1.4" fill="#fff4dc" ${_s}/><path d="M13 9V6.4Q16 2.6 19 6.4V9z" fill="#c78d6a" ${_s}/></g><path d="M3.5 26.5q5.5-2 11-6" fill="none" stroke="#c78d6a" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>`),
  /* bronzer: a golden compact with a little sun */
  bronzer: _svg(`<rect x="4" y="7" width="24" height="20" rx="6" fill="${_C}" ${_s}/><circle cx="16" cy="17" r="7.4" fill="#d9a066" stroke="${_O}" stroke-width="1.2"/><circle cx="16" cy="17" r="2.6" fill="#ffe3a8" stroke="${_O}" stroke-width="1"/><path d="M16 11.2v1.4M16 21.4v1.4M10.2 17h1.4M20.4 17h1.4M12 13l1 1M20 13l-1 1M12 21l1-1M20 21l-1-1" stroke="${_O}" stroke-width="1" stroke-linecap="round"/><path d="M7.2 10.4h5" stroke="${_W}" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`),
  /* eye tools: mascara tube with a wand */
  eyetools: _svg(`<rect x="4" y="19" width="18" height="9" rx="3.5" fill="#f08aa6" ${_s}/><rect x="2.6" y="21" width="3" height="5" rx="1.2" fill="${_O}"/><path d="M22 23.5h4.4" stroke="${_O}" stroke-width="1.6" stroke-linecap="round"/><g transform="rotate(-28 24 14)"><rect x="22.6" y="3" width="2.8" height="9" rx="1.2" fill="${_O}"/><path d="M23.2 4.6h-2.2M23.2 7h-2.4M23.2 9.4h-2.2M24.8 4.6H27M24.8 7h2.4M24.8 9.4H27" stroke="${_O}" stroke-width="1.1" stroke-linecap="round"/></g><path d="M8 22.6h8" stroke="${_W}" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>`),
  /* eyeshadow palette: a case with six pans and a tiny mirror */
  palette: _svg(`<rect x="3" y="6" width="26" height="21" rx="4.5" fill="${_L}" ${_s}/><rect x="5.6" y="8.4" width="20.8" height="5" rx="1.8" fill="${_W}" opacity=".75"/><circle cx="9.5" cy="19" r="3" fill="#f3c2d0" stroke="${_O}" stroke-width="1"/><circle cx="16" cy="19" r="3" fill="#b9657f" stroke="${_O}" stroke-width="1"/><circle cx="22.5" cy="19" r="3" fill="#e9d3b4" stroke="${_O}" stroke-width="1"/><circle cx="9.5" cy="19" r=".8" fill="#fff" opacity=".8"/><circle cx="16" cy="19" r=".8" fill="#fff" opacity=".6"/><circle cx="22.5" cy="19" r=".8" fill="#fff" opacity=".8"/><path d="M8 24.4h16" stroke="${_O}" stroke-width="1" opacity=".35" stroke-linecap="round"/>`),
  lip: _svg(`<rect x="11" y="17" width="10" height="11" rx="2.5" fill="${_C}" ${_s}/><rect x="12" y="13" width="8" height="5" rx="1.5" fill="#fff4dc" ${_s}/><path d="M12.4 13V8.4Q16 3 19.6 8.4V13z" fill="#e8607f" ${_s}/><path d="M14 12V9" stroke="${_W}" stroke-width="1.2" stroke-linecap="round" opacity=".7"/><path d="M13.5 22.5h5" stroke="${_O}" stroke-width="1" opacity=".5" stroke-linecap="round"/>`),
  other: _svg(`<path d="M15 4q1.2 8 9 11-7.8 3-9 11-1.2-8-9-11 7.8-3 9-11z" fill="${_P}" ${_s}/><path d="M25.4 3.6q.5 3 3.2 4-2.7 1-3.2 4-.5-3-3.2-4 2.7-1 3.2-4z" fill="#fff4dc" ${_s} stroke-width="1.2"/><path d="M12.4 10q1 3.2 4 4" stroke="${_W}" stroke-width="1.3" stroke-linecap="round" fill="none" opacity=".8"/>`),
};
function categoryIcon(key) { return CATEGORY_ICONS[key] || CATEGORY_ICONS.other; }

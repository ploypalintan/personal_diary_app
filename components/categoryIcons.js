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
  /* cream jar with a little face */
  skincare: _svg(`<rect x="5" y="14" width="22" height="13" rx="5" fill="${_L}" ${_s}/><rect x="6.5" y="6" width="19" height="8" rx="3" fill="${_P}" ${_s}/>${_face(16, 20)}<path d="M9 8.6h5" stroke="${_W}" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`),
  /* tube with a sun */
  sunscreen: _svg(`<rect x="11" y="3" width="10" height="6" rx="2" fill="${_P}" ${_s}/><path d="M9 9h14l-1.5 18a2 2 0 0 1-2 1.8h-7a2 2 0 0 1-2-1.8z" fill="#fff1c9" ${_s}/><circle cx="16" cy="18" r="3.4" fill="#ffd166" ${_s} stroke-width="1.2"/><path d="M16 12.2v1.4M16 22.4v1.4M10.4 18h1.4M20.2 18h1.4M12 14l1 1M20 14l-1 1M12 22l1-1M20 22l-1-1" stroke="${_O}" stroke-width="1.1" stroke-linecap="round"/>`),
  /* open powder compact with a mirror */
  face: _svg(`<ellipse cx="16" cy="21" rx="12" ry="7" fill="${_L}" ${_s}/><path d="M6 20V10a10 7 0 0 1 20 0v10" fill="${_P}" ${_s}/><ellipse cx="16" cy="11" rx="6" ry="4.2" fill="${_W}" opacity=".75"/><ellipse cx="16" cy="21" rx="7" ry="3.6" fill="#f6b9c9" stroke="${_O}" stroke-width="1.1"/><path d="M13 20.2q2-1.3 4-.2" stroke="${_W}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`),
  /* lashes and an eye */
  eyes: _svg(`<path d="M3 17q13-14 26 0q-13 12-26 0z" fill="${_W}" ${_s}/><circle cx="16" cy="16.4" r="4.6" fill="#b9657f" ${_s} stroke-width="1.2"/><circle cx="16" cy="16.4" r="2.1" fill="${_O}"/><circle cx="17.2" cy="15.2" r=".9" fill="${_W}"/><path d="M6 11.2l-2-3M10 8.6L8.6 5M16 7.4V3.6M22 8.6l1.4-3.6M26 11.2l2-3" ${_s} stroke-width="1.4"/>`),
  /* lipstick */
  lips: _svg(`<rect x="11" y="17" width="10" height="11" rx="2.5" fill="${_C}" ${_s}/><rect x="12" y="13" width="8" height="5" rx="1.5" fill="#fff4dc" ${_s}/><path d="M12.4 13V8.4Q16 3 19.6 8.4V13z" fill="#e8607f" ${_s}/><path d="M14 12V9" stroke="${_W}" stroke-width="1.2" stroke-linecap="round" opacity=".7"/><path d="M13.5 22.5h5" stroke="${_O}" stroke-width="1" opacity=".5" stroke-linecap="round"/>`),
  /* brow pencil */
  brows: _svg(`<g transform="rotate(-38 16 16)"><rect x="12.6" y="2.5" width="6.8" height="5" rx="1.6" fill="${_P}" ${_s}/><rect x="12.6" y="7.5" width="6.8" height="14" fill="${_C}" ${_s}/><path d="M12.6 21.5h6.8L16 29z" fill="#f5e2cd" ${_s}/><path d="M15 26.6h2L16 29z" fill="${_O}"/><path d="M14.4 9.5v10" stroke="${_W}" stroke-width="1.2" stroke-linecap="round" opacity=".7"/></g>`),
  /* nail polish bottle */
  nails: _svg(`<rect x="13" y="3" width="6" height="11" rx="2" fill="${_O}" ${_s}/><rect x="11.5" y="13" width="9" height="3" rx="1" fill="${_W}" ${_s}/><rect x="7.5" y="15.5" width="17" height="13" rx="5" fill="#f08aa6" ${_s}/><path d="M11 19.5v5" stroke="${_W}" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>`),
  /* perfume bottle with a spritz */
  fragrance: _svg(`<rect x="12" y="2.8" width="8" height="5" rx="1.8" fill="${_P}" ${_s}/><rect x="14" y="7.8" width="4" height="3.4" fill="${_C}" ${_s}/><rect x="7" y="11" width="18" height="17" rx="6" fill="${_L}" ${_s}/><path d="M16 24.4c-3.4-2.2-4.2-4-3-5.4 1-1.1 2.4-.8 3 .4.6-1.2 2-1.5 3-.4 1.2 1.4.4 3.2-3 5.4z" fill="#f08aa6" stroke="${_O}" stroke-width="1" stroke-linejoin="round"/><path d="M3 6l1.6 1.6M2 11h2.2M3.4 15.4L5 14" stroke="${_O}" stroke-width="1.2" stroke-linecap="round"/>`),
  /* makeup brush + a sponge */
  tools: _svg(`<g transform="rotate(32 16 16)"><path d="M16 2.6c4.2 1.8 5.2 6.4 4.6 9.4h-9.2c-.6-3 .4-7.6 4.6-9.4z" fill="${_P}" ${_s}/><rect x="11.6" y="12" width="8.8" height="5" rx="1.2" fill="#e5e0e6" ${_s}/><path d="M13.2 17h5.6l-.8 11.2a2 2 0 0 1-4 0z" fill="${_C}" ${_s}/></g><ellipse cx="7" cy="25" rx="4.4" ry="3.6" fill="#fde6c8" ${_s} stroke-width="1.3"/><circle cx="5.8" cy="24.4" r=".5" fill="${_O}"/><circle cx="8.4" cy="25.6" r=".5" fill="${_O}"/>`),
  /* pump bottle for body / hair */
  body: _svg(`<path d="M14 3h6v2h-3v3h-2V5.5h-2z" fill="${_P}" ${_s} stroke-width="1.3"/><rect x="14" y="8" width="4" height="3" fill="${_C}" ${_s} stroke-width="1.2"/><rect x="8" y="11" width="16" height="17" rx="5" fill="${_L}" ${_s}/>${_face(16, 19)}<path d="M11 14h4" stroke="${_W}" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`),
  /* sparkle */
  other: _svg(`<path d="M15 4q1.2 8 9 11-7.8 3-9 11-1.2-8-9-11 7.8-3 9-11z" fill="${_P}" ${_s}/><path d="M25.4 3.6q.5 3 3.2 4-2.7 1-3.2 4-.5-3-3.2-4 2.7-1 3.2-4z" fill="#fff4dc" ${_s} stroke-width="1.2"/><path d="M12.4 10q1 3.2 4 4" stroke="${_W}" stroke-width="1.3" stroke-linecap="round" fill="none" opacity=".8"/>`),
};
function categoryIcon(key) { return CATEGORY_ICONS[key] || CATEGORY_ICONS.other; }

/* ═══════════════════════════════════════
   components/moodFaces.js
   Little hand-drawn faces, one per mood.
   moodFace('blue', 36) -> an inline <svg> string (decorative, aria-hidden)
═══════════════════════════════════════ */
(function () {
  const INK = '#6a3f52';
  const mix = (hex, t) => { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v + (255 - v) * t)); return `rgb(${c})`; };
  const dotColor = k => (window.MOOD_COLORS && MOOD_COLORS[k] && MOOD_COLORS[k].dot) || '#AA9DA1';

  const arc = (x, y, w, up) => `<path d="M${x - w} ${y} Q${x} ${y + (up ? -w : w)} ${x + w} ${y}" />`;
  const dots = (y, r = 1.7) => `<circle cx="14" cy="${y}" r="${r}" fill="${INK}" stroke="none"/><circle cx="26" cy="${y}" r="${r}" fill="${INK}" stroke="none"/>`;
  const cheeks = `<circle cx="9.5" cy="25" r="2.6" fill="#f08aa0" opacity=".45" stroke="none"/><circle cx="30.5" cy="25" r="2.6" fill="#f08aa0" opacity=".45" stroke="none"/>`;

  const FEATURES = {
    soft:     arc(14, 19, 3, true) + arc(26, 19, 3, true) + `<path d="M16 26 Q20 29.5 24 26"/>` + cheeks,
    light:    dots(18.5, 2) + `<path d="M13.5 24.5 Q20 33 26.5 24.5 Z" fill="#fff" />` + cheeks,
    alive:    `<path d="M14 14.5 l1.2 3 3 .3 -2.3 2 .7 3 -2.6-1.7 -2.6 1.7 .7-3 -2.3-2 3-.3z" fill="#f2c14e" stroke="none" transform="translate(0 -1.5) scale(.95)"/><path d="M26 14.5 l1.2 3 3 .3 -2.3 2 .7 3 -2.6-1.7 -2.6 1.7 .7-3 -2.3-2 3-.3z" fill="#f2c14e" stroke="none" transform="translate(12 -1.5) scale(.95) translate(-12 0)"/><path d="M13 24 Q20 35 27 24 Z" fill="#fff"/>`,
    held:     arc(14, 19, 3, true) + arc(26, 19, 3, true) + `<path d="M16 26 Q20 29.5 24 26"/><path d="M20 11.5 c-1.6-2.4-5-.6-3.2 1.8 l3.2 2.8 3.2-2.8 c1.8-2.4-1.6-4.2-3.2-1.8z" fill="#e0607e" stroke="none" transform="translate(0 -3) scale(1)"/>` + cheeks,
    still:    dots(19) + `<path d="M16 27 H24"/>`,
    heavy:    `<path d="M11 19 H17 M23 19 H29"/><path d="M12.5 22 q1.5 1.5 3 0 M24.5 22 q1.5 1.5 3 0" opacity=".5"/><path d="M16.5 28 Q20 26 23.5 28"/>`,
    restless: `<circle cx="14" cy="18.5" r="3.2" fill="#fff"/><circle cx="26" cy="18.5" r="3.2" fill="#fff"/><circle cx="14.4" cy="18.8" r="1.3" fill="${INK}" stroke="none"/><circle cx="26.4" cy="18.8" r="1.3" fill="${INK}" stroke="none"/><path d="M14 27 q2-2.5 4 0 t4 0 t4 0"/><path d="M33 9 q2.2 3.2 0 4.6 q-2.2-1.4 0-4.6z" fill="#8fc7ea" stroke="none"/>`,
    blue:     `<path d="M11 15.5 L17 17.5 M29 15.5 L23 17.5" opacity=".7"/>` + dots(20) + `<path d="M16 29 Q20 25.5 24 29"/><path d="M14 22 q-1.4 3.2 0 4.6 q1.4-1.4 0-4.6z" fill="#8fc7ea" stroke="none"/>`,
    tight:    `<path d="M10.5 14.5 L17.5 17.5 M29.5 14.5 L22.5 17.5"/>` + dots(20.5, 1.6) + `<path d="M15 28 H25 M17 26.5 V29.5 M20 26.5 V29.5 M23 26.5 V29.5" stroke-width="1.2"/>`,
    toomuch:  `<path d="M14 18.5 m0 0 a1 1 0 1 1 1.6 .8 a2.4 2.4 0 1 1 -3.4 -1.4 a3.8 3.8 0 1 1 5.2 3.4" /><path d="M26 18.5 m0 0 a1 1 0 1 1 1.6 .8 a2.4 2.4 0 1 1 -3.4 -1.4 a3.8 3.8 0 1 1 5.2 3.4" /><path d="M15 28 q1.6-2.2 3.2 0 t3.2 0 t3.2 0"/>`,
    alone:    `<circle cx="15" cy="19" r="3" fill="#fff"/><circle cx="27" cy="19" r="3" fill="#fff"/><circle cx="14" cy="19.6" r="1.4" fill="${INK}" stroke="none"/><circle cx="26" cy="19.6" r="1.4" fill="${INK}" stroke="none"/><path d="M17 28.5 Q20 26.5 23 28.5"/>`,
    itching:  `<circle cx="14" cy="18" r="3" fill="#fff"/><circle cx="26" cy="18" r="3" fill="#fff"/><circle cx="15.3" cy="16.9" r="1.4" fill="${INK}" stroke="none"/><circle cx="27.3" cy="16.9" r="1.4" fill="${INK}" stroke="none"/><path d="M15 26 Q21 30 26 24.5"/>`,
    tooaware: `<circle cx="14" cy="18.5" r="4.2" fill="#fff"/><circle cx="26" cy="18.5" r="4.2" fill="#fff"/><circle cx="14" cy="18.5" r="1.1" fill="${INK}" stroke="none"/><circle cx="26" cy="18.5" r="1.1" fill="${INK}" stroke="none"/><ellipse cx="20" cy="28" rx="2" ry="2.4" fill="${INK}" stroke="none"/><path d="M10 12 Q14 9.5 18 11.5 M22 11.5 Q26 9.5 30 12" opacity=".6"/>`,
  };

  window.moodFace = function (key, size) {
    const s = size || 36, base = dotColor(key);
    const f = FEATURES[key] || FEATURES.still;
    return `<svg class="mface" viewBox="0 0 40 40" width="${s}" height="${s}" aria-hidden="true" focusable="false">` +
      `<circle cx="20" cy="20" r="18" fill="${mix(base, 0.55)}" stroke="${base}" stroke-width="1.6"/>` +
      `<g fill="none" stroke="${INK}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${f}</g></svg>`;
  };
})();

/* ═══════════════════════════════════════
   stickers.js
   Decorative stickers (ploy's own pictures) placed around the book.
   They are purely ornament: aria-hidden, never clickable.
   Add a new sticker: drop a transparent PNG in assets/stickers/
   and add a line to the STICKER_SETS below.
═══════════════════════════════════════ */
const STICKER_BASE = (location.pathname.indexOf('/pages/') !== -1) ? '../assets/stickers/' : 'assets/stickers/';

/* where each sticker sits on the spread: css offsets in px/%, width in px, tilt in deg */
const STICKER_SETS = {
  spread: [
    { file: 'clip-pink.png',  cls: 'st-clip', style: 'top:2px; right:21%; width:70px; transform:rotate(3deg);' },
    { file: 'wax-cupid.png',  cls: 'st-seal', style: 'bottom:14px; right:52px; width:74px; transform:rotate(-9deg);' },
  ],
};

function addStickers(host, list) {
  if (!host) return;
  list.forEach(s => {
    const img = document.createElement('img');
    img.src = STICKER_BASE + s.file; img.alt = ''; img.setAttribute('aria-hidden', 'true');
    img.className = 'sticker ' + (s.cls || ''); img.style.cssText = s.style || ''; img.draggable = false;
    host.appendChild(img);
  });
}

/* ═══════════════════════════════════════
   stickers.js
   Decorative stickers (ploy's own pictures) placed around the book.
   Ornament only: aria-hidden, never clickable. They sit on the lace
   bands at the top and bottom of each page so they never cover text.
   Add a new one: drop a transparent PNG in assets/stickers/ and add a line below.
═══════════════════════════════════════ */
const STICKER_BASE = (location.pathname.indexOf('/pages/') !== -1) ? '../assets/stickers/' : 'assets/stickers/';

const STICKER_SETS = {
  spread: [
    { file: 'clip-pink.png',     cls: 'st-clip',  style: 'top:2px; right:21%; width:70px; transform:rotate(3deg);' },
    { file: 'heart-pink-1.png',  cls: 'st-deco',  style: 'top:14px; left:11%; width:34px; transform:rotate(-12deg);' },
    { file: 'heart-angelic.png', cls: 'st-deco',  style: 'top:6px; left:30%; width:68px; transform:rotate(-7deg);' },
    { file: 'heart-pink-2.png',  cls: 'st-deco',  style: 'top:16px; left:40%; width:30px; transform:rotate(14deg);' },
    { file: 'patch-rhode.png',   cls: 'st-deco',  style: 'bottom:8px; left:17%; width:96px; transform:rotate(3deg);' },
    { file: 'heart-cupid.png',   cls: 'st-deco',  style: 'bottom:8px; left:58%; width:64px; transform:rotate(7deg);' },
    { file: 'wax-cupid.png',     cls: 'st-seal',  style: 'bottom:14px; right:52px; width:74px; transform:rotate(-9deg);' },
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

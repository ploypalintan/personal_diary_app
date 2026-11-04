/* ═══════════════════════════════════════
   stickers.js
   Decorative stickers (original vector art) placed around the book.
   Ornament only: aria-hidden, never clickable. They sit on the lace
   bands at the top and bottom of each page so they never cover text.
   Add a new one: drop an SVG or transparent PNG (only art you made or have a licence for) in assets/stickers/ and add a line below.
═══════════════════════════════════════ */
const STICKER_BASE = (location.pathname.indexOf('/pages/') !== -1) ? '../assets/stickers/' : 'assets/stickers/';

const STICKER_SETS = {
  spread: [
    { file: 'clip-pink.svg',     cls: 'st-clip',  style: 'top:2px; right:21%; width:70px; transform:rotate(3deg);' },
    { file: 'heart-pink-1.svg',  cls: 'st-deco',  style: 'top:14px; left:11%; width:34px; transform:rotate(-12deg);' },
    { file: 'heart-bow.svg',     cls: 'st-deco',  style: 'top:6px; left:30%; width:60px; transform:rotate(-7deg);' },
    { file: 'heart-pink-2.svg',  cls: 'st-deco',  style: 'top:16px; left:40%; width:30px; transform:rotate(14deg);' },
    { file: 'sparkle.svg',       cls: 'st-deco',  style: 'bottom:8px; left:17%; width:48px; transform:rotate(3deg);' },
    { file: 'ballerinas.svg',    cls: 'st-deco st-balle', style: 'bottom:2px; left:29%; width:90px;' },
    { file: 'heart-winged.svg',  cls: 'st-deco',  style: 'bottom:8px; left:58%; width:64px; transform:rotate(7deg);' },
    { file: 'flats.svg',         cls: 'st-deco', style: 'top:10px; left:61%; width:40px; transform:rotate(11deg);' },
    { file: 'butterfly-2.svg',   cls: 'st-fly st-fly-a', style: 'top:84%; left:4px; width:50px; --r:-14deg;' },
    { file: 'butterfly-1.svg',   cls: 'st-fly st-fly-b', style: 'top:58%; right:6px; width:50px; --r:12deg;' },
    { file: 'wax-seal.svg',      cls: 'st-seal',  style: 'bottom:14px; right:52px; width:74px; transform:rotate(-9deg);' },
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

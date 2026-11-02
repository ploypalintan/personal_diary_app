/* ═══════════════════════════════════════
   components/friend.js
   The imaginary friend on the mood page: a soft dark shaggy shadow with one
   glowing eye, sitting at a little tea table. Tap her to talk (starts the mic).
   She doesn't understand you; she listens, asks gentle questions, and your words are saved.
═══════════════════════════════════════ */
(function () {
  const PROMPTS = {
    _start: ["i saved you a seat. what's on your mind?", "pour yourself something. i'm listening.", "no rush. say it however it comes out.", "tell me about today. start anywhere.", "what are you carrying that you haven't told anyone?", "what's the loudest thought right now?", "what do you wish someone would ask you?", "say the thing you keep not saying."],
    _listen: ["i'm listening…", "mm. keep going…", "i'm right here…"],
    _done: ["i heard you. say more, or keep this one.", "got it. it's safe with me. keep it when you're ready."],
  };
  let last = -1;
  const pick = (k) => { const a = PROMPTS[k]; let i; do { i = Math.floor(Math.random() * a.length); } while (a.length > 1 && i === last && k === '_start'); if (k === '_start') last = i; return a[i]; };

  /* deterministic little pseudo-random so the fur looks the same every load */
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  function creatureSVG() {
    seed = 11;
    const cx = 100, cy = 90, rx = 50, ry = 56;
    const ring = (n, a0, a1, lenMin, lenVar, wMin, wVar, fill, rScale) => {
      let s = '';
      for (let i = 0; i < n; i++) {
        const a = (a0 + (i / (n - 1)) * (a1 - a0)) * Math.PI / 180 + (rnd() - .5) * .1;
        const px = cx + Math.cos(a) * rx * rScale, py = cy + Math.sin(a) * ry * rScale;
        const len = lenMin + rnd() * lenVar, w = wMin + rnd() * wVar, lean = (rnd() - .5) * .9;
        const tx = px + Math.cos(a + lean) * len, ty = py + Math.sin(a + lean) * len;
        const mx = (px + tx) / 2 - Math.sin(a) * (rnd() - .5) * 6, my = (py + ty) / 2 + Math.cos(a) * (rnd() - .5) * 6;
        const nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
        s += `<path fill="${fill}" d="M${(px + nx).toFixed(1)} ${(py + ny).toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)} Q${(mx + 1).toFixed(1)} ${(my + 2).toFixed(1)} ${(px - nx).toFixed(1)} ${(py - ny).toFixed(1)}Z"/>`;
      }
      return s;
    };
    const fur = ring(58, 150, 392, 9, 15, 3, 3.5, '#241320', 1.0) + ring(44, 160, 382, 6, 10, 3, 3, '#33202f', .8);
    return `<svg class="fr-svg" viewBox="0 0 200 190" aria-hidden="true" focusable="false">
      <defs><clipPath id="frClip"><rect x="0" y="0" width="200" height="139"/></clipPath>
      <radialGradient id="frHalo"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".4" stop-color="#ffd6ea" stop-opacity=".45"/><stop offset="1" stop-color="#ffd6ea" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="100" cy="183" rx="80" ry="6" fill="rgba(60,25,45,.22)"/>
      <g class="fr-body" clip-path="url(#frClip)">
        <ellipse cx="${cx}" cy="${cy + 8}" rx="${rx + 4}" ry="${ry + 6}" fill="#241320"/>
        ${fur}
      </g>
      <g class="fr-eye"><circle cx="113" cy="72" r="20" fill="url(#frHalo)"/><circle cx="113" cy="72" r="6.4" fill="#fff"/><circle cx="111.4" cy="70.4" r="1.9" fill="#ffd0e6"/></g>
      <g><rect x="18" y="134" width="164" height="9" rx="3.5" fill="#fff9fc"/><rect x="26" y="143" width="7" height="36" rx="2" fill="#f9e3ec"/><rect x="167" y="143" width="7" height="36" rx="2" fill="#f9e3ec"/>
      <g fill="#241320"><ellipse cx="74" cy="134" rx="17" ry="9"/><ellipse cx="126" cy="134" rx="17" ry="9"/></g>
      <g class="fr-cup"><path d="M146 120 h20 v7 a10 10 0 0 1 -20 0z" fill="#fff"/><path d="M166 122 q7 0 7 5 t-7 5" fill="none" stroke="#fff" stroke-width="2.6"/><path d="M151 114 q-3 -6 0 -10 M160 114 q-3 -6 0 -10" class="fr-steam" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2" stroke-linecap="round"/></g></g>
    </svg>`;
  }

  window.initFriend = function (host, micBtn) {
    host.innerHTML = `<button class="fr-hit" type="button" aria-label="talk to your friend (starts the microphone)">${creatureSVG()}</button>
      <div class="fr-name">tea with your shadow friend</div>
      <p class="fr-say" id="frSay" role="status" aria-live="polite"></p>`;
    const say = host.querySelector('#frSay'), hit = host.querySelector('.fr-hit');
    const set = (t) => { say.textContent = t; };
    set(pick('_start'));
    hit.addEventListener('click', () => micBtn.click());
    const sync = () => {
      const on = micBtn.getAttribute('aria-pressed') === 'true';
      host.classList.toggle('listening', on);
      if (on) set(pick('_listen'));
    };
    new MutationObserver(sync).observe(micBtn, { attributes: true, attributeFilter: ['aria-pressed'] });
    const status = document.getElementById('micStatus');
    if (status) new MutationObserver(() => { if (/transcribed/i.test(status.textContent)) set(pick('_done')); }).observe(status, { childList: true, characterData: true, subtree: true });
    host.ask = () => set(pick('_start'));
    return host;
  };
})();

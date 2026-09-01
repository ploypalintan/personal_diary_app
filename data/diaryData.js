/* ═══════════════════════════════════════
   diaryData.js — shared app state & data
═══════════════════════════════════════ */

/* ── QUOTES & POETRY POOL ── */
const QUOTES = [
  { type: 'quote',   text: 'she was a girl who knew how to be happy even when she was sad. and that\'s important.', author: 'Marilyn Monroe' },
  { type: 'poetry',  text: 'i carry your heart with me\ni carry it in my heart\ni am never without it.', author: 'e.e. cummings' },
  { type: 'quote',   text: 'you are allowed to be both a masterpiece and a work in progress simultaneously.', author: 'Sophia Bush' },
  { type: 'poetry',  text: 'and she loved a little wildly,\na little sadly,\na little like the moon\ntrying to hold the tide.', author: 'r.h. Sin' },
  { type: 'quote',   text: 'do small things with great love.', author: 'Mother Teresa' },
  { type: 'quote',   text: 'almost everything will work again if you unplug it for a few minutes — including you.', author: 'Anne Lamott' },
  { type: 'quote',   text: 'she remembered who she was and the game changed.', author: 'Lalah Delia' },
  { type: 'poetry',  text: 'tell me, what is it you plan to do\nwith your one wild and precious life?', author: 'Mary Oliver' },
  { type: 'quote',   text: 'one day or day one. you decide.', author: 'unknown' },
  { type: 'poetry',  text: 'hope is the thing with feathers\nthat perches in the soul\nand sings the tune without the words\nand never stops at all.', author: 'Emily Dickinson' },
  { type: 'quote',   text: 'be the energy you want to attract.', author: 'unknown' },
  { type: 'poetry',  text: 'what is coming is better\nthan what is gone.', author: 'Arabic Proverb' },
  { type: 'quote',   text: 'you don\'t have to be everything to everyone. you just have to be something to yourself.', author: 'unknown' },
  { type: 'poetry',  text: 'i am not afraid of storms,\nfor i am learning how to sail my ship.', author: 'Louisa May Alcott' },
];

/* ── MOOD LABELS ── */
const MOODS = {
  core: [
    { key: 'soft',    label: 'soft',    sub: 'calm' },
    { key: 'light',   label: 'light',   sub: 'happy' },
    { key: 'alive',   label: 'alive',   sub: 'excited' },
    { key: 'held',    label: 'held',    sub: 'loved' },
    { key: 'still',   label: 'still',   sub: 'neutral' },
    { key: 'heavy',   label: 'heavy',   sub: 'tired' },
  ],
  tension: [
    { key: 'restless',  label: 'restless',  sub: 'anxious' },
    { key: 'blue',      label: 'blue',      sub: 'sad' },
    { key: 'tight',     label: 'tight',     sub: 'stressed' },
    { key: 'toomuch',   label: 'too much',  sub: 'overwhelmed' },
  ],
  identity: [
    { key: 'alone',    label: 'alone',            sub: 'lonely' },
    { key: 'itching',  label: 'itching to leave', sub: 'wanderlust' },
    { key: 'tooaware', label: 'too aware',         sub: 'existential' },
  ],
};

/* ── CURRENCY SYMBOLS ── */
const CURRENCIES = {
  USD: '$', SGD: 'S$', GBP: '£', EUR: '€', JPY: '¥',
  AUD: 'A$', CAD: 'C$', THB: '฿', MYR: 'RM', IDR: 'Rp',
  HKD: 'HK$', KRW: '₩', INR: '₹', CNY: '¥', AED: 'د.إ',
};

/* ── EXPENSE / INCOME COLOURS ── */
const EXP_COLORS = {
  food: '#E1CCCC', beauty: '#c9b0c0', fashion: '#97727B',
  transport: '#AA9DA1', home: '#b8c0b0', health: '#d0b8d8',
  fun: '#d4b898', other: '#c8bfc3',
};
const INC_COLORS = {
  salary: '#a8c898', socials: '#c8a8d8', freelance: '#a8c0d8',
  passive: '#d8c8a8', investment: '#a8d8c8', gift: '#d8a8c8', other: '#c8c8c8',
};

/* ── DATE HELPERS ── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function getTodayString() {
  const n = new Date();
  return `${DAYS[n.getDay()]}, ${n.getDate()} ${MONTHS[n.getMonth()]} ${n.getFullYear()}`;
}

function getDailyQuote() {
  const n   = new Date();
  const doy = Math.floor((n - new Date(n.getFullYear(), 0, 0)) / 864e5);
  return QUOTES[doy % QUOTES.length];
}

/* ── APP STATE (persisted to localStorage) ── */
const STATE_KEY = 'myDiaryState';

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : defaultState();
  } catch { return defaultState(); }
}

function saveState(state) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function defaultState() {
  return {
    userName:  '',
    character: '',
    currency:  'SGD',
    todos:     [],
    wishes:    [],
    moods:     [],   // { date, key, label, note }
    incomes:   [],
    expenses:  [],
    nextIds:   { todo: 1, wish: 1, mood: 1, income: 1, expense: 1 },
  };
}

/* ── CHARACTER SVG RENDERERS ── */
function drawGirl(el) {
  el.setAttribute('viewBox', '0 0 88 130');
  el.innerHTML = `
  <path d="M24 22 Q14 50 16 90 Q18 112 30 122 Q37 128 44 128 Q51 128 58 122 Q70 112 72 90 Q74 50 64 22 Q56 10 44 10 Q32 10 24 22Z" fill="#b8927a"/>
  <ellipse cx="44" cy="30" rx="22" ry="24" fill="#fde8d8"/>
  <path d="M22 22 Q22 6 44 5 Q66 6 66 22 Q58 12 44 12 Q30 12 22 22Z" fill="#c4a088"/>
  <ellipse cx="44" cy="12" rx="20" ry="9" fill="#c4a088"/>
  <ellipse cx="38" cy="10" rx="6" ry="3" fill="#d4b09c" opacity="0.5"/>
  <path d="M22 22 Q19 36 21 52" fill="none" stroke="#b8927a" stroke-width="6" stroke-linecap="round"/>
  <path d="M66 22 Q69 36 67 52" fill="none" stroke="#b8927a" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="35" cy="32" rx="7" ry="8" fill="#fff"/>
  <ellipse cx="53" cy="32" rx="7" ry="8" fill="#fff"/>
  <ellipse cx="35" cy="33" rx="5.5" ry="6.5" fill="#7a9cc4"/>
  <ellipse cx="53" cy="33" rx="5.5" ry="6.5" fill="#7a9cc4"/>
  <ellipse cx="35" cy="33" rx="3.5" ry="4.5" fill="#2e1e1a"/>
  <ellipse cx="53" cy="33" rx="3.5" ry="4.5" fill="#2e1e1a"/>
  <ellipse cx="37" cy="30" rx="1.5" ry="2" fill="#fff" opacity="0.9"/>
  <ellipse cx="55" cy="30" rx="1.5" ry="2" fill="#fff" opacity="0.9"/>
  <circle cx="33" cy="35" r="0.8" fill="#fff" opacity="0.6"/>
  <circle cx="51" cy="35" r="0.8" fill="#fff" opacity="0.6"/>
  <path d="M28 26 Q29 24 32 25" fill="none" stroke="#2e1e1a" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M58 26 Q59 24 62 25" fill="none" stroke="#2e1e1a" stroke-width="1.2" stroke-linecap="round"/>
  <ellipse cx="28" cy="38" rx="6" ry="3.5" fill="#f5b8b8" opacity="0.5"/>
  <ellipse cx="60" cy="38" rx="6" ry="3.5" fill="#f5b8b8" opacity="0.5"/>
  <path d="M39 44 Q44 48 49 44" fill="#e8a0a0"/>
  <path d="M39 44 Q44 46 49 44" fill="none" stroke="#d08080" stroke-width="0.8"/>
  <circle cx="24" cy="18" r="5" fill="#f5d0d0"/>
  <circle cx="24" cy="18" r="2.5" fill="#E1CCCC"/>
  <circle cx="20" cy="16" r="3" fill="#f0c0c0"/>
  <circle cx="22" cy="13" r="3" fill="#f5d0d0"/>
  <circle cx="26" cy="13" r="3" fill="#f0c0c0"/>
  <circle cx="28" cy="16" r="3" fill="#f5d0d0"/>
  <rect x="40" y="52" width="8" height="8" rx="3" fill="#fde8d8"/>
  <path d="M26 58 Q16 66 18 86 Q19 96 44 98 Q69 96 70 86 Q72 66 62 58 Q55 52 44 52 Q33 52 26 58Z" fill="#E1CCCC"/>
  <path d="M18 78 Q16 92 18 98 Q24 106 44 106 Q64 106 70 98 Q72 92 70 78Z" fill="#ecd5d5"/>
  <path d="M36 58 Q44 65 52 58" fill="none" stroke="#c4a0a0" stroke-width="1.2"/>
  <path d="M16 90 Q20 102 44 104 Q68 102 72 90" fill="none" stroke="#d4b8b8" stroke-width="1.5"/>
  <ellipse cx="44" cy="56" rx="9" ry="6" fill="#fde8d8"/>
  <path d="M26 62 L13 78 Q11 86 17 88" fill="none" stroke="#E1CCCC" stroke-width="8" stroke-linecap="round"/>
  <path d="M62 62 L75 78 Q77 86 71 88" fill="none" stroke="#E1CCCC" stroke-width="8" stroke-linecap="round"/>
  <ellipse cx="15" cy="89" rx="4" ry="3.5" fill="#fde8d8"/>
  <ellipse cx="73" cy="89" rx="4" ry="3.5" fill="#fde8d8"/>
  <path d="M34 98 L33 118 Q33 122 37 122 Q41 122 41 118 L42 100" fill="#fde8d8" stroke="#f0d4c0" stroke-width="0.5"/>
  <path d="M54 98 L55 118 Q55 122 51 122 Q47 122 47 118 L46 100" fill="#fde8d8" stroke="#f0d4c0" stroke-width="0.5"/>
  <rect x="29" y="118" width="16" height="8" rx="4" fill="#fff" stroke="#ece8e8" stroke-width="0.5"/>
  <rect x="43" y="118" width="16" height="8" rx="4" fill="#fff" stroke="#ece8e8" stroke-width="0.5"/>
  <rect x="30" y="120" width="14" height="2" rx="1" fill="#f0eded"/>
  <rect x="44" y="120" width="14" height="2" rx="1" fill="#f0eded"/>
  <path d="M20 52 Q15 78 18 108 Q22 120 28 124" fill="none" stroke="#b8927a" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
  <path d="M68 52 Q73 78 70 108 Q66 120 60 124" fill="none" stroke="#b8927a" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
  <text x="8" y="60" font-size="8" fill="#E1CCCC" opacity="0.7">♡</text>
  <text x="74" y="55" font-size="6" fill="#E1CCCC" opacity="0.6">✦</text>`;
}

function drawBoy(el) {
  el.setAttribute('viewBox', '0 0 88 130');
  el.innerHTML = `
  <ellipse cx="44" cy="28" rx="22" ry="24" fill="#fde8d8"/>
  <ellipse cx="44" cy="14" rx="22" ry="13" fill="#5a3e2b"/>
  <path d="M22 22 Q22 8 44 6 Q66 8 66 22 Q60 14 44 14 Q28 14 22 22Z" fill="#5a3e2b"/>
  <path d="M26 12 Q29 7 33 10 Q37 7 40 11" fill="none" stroke="#3d2820" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M38 8 Q42 5 46 8 Q50 5 53 9"   fill="none" stroke="#3d2820" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M50 11 Q54 7 57 10 Q60 7 62 12" fill="none" stroke="#3d2820" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M23 18 Q20 12 24 9" fill="none" stroke="#5a3e2b" stroke-width="4" stroke-linecap="round"/>
  <path d="M65 18 Q68 12 64 9" fill="none" stroke="#5a3e2b" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="37" cy="9" rx="7" ry="3" fill="#7a5840" opacity="0.4"/>
  <ellipse cx="44" cy="28" rx="22" ry="24" fill="#fde8d8"/>
  <path d="M22 22 Q20 30 22 38" fill="none" stroke="#5a3e2b" stroke-width="4" stroke-linecap="round"/>
  <path d="M66 22 Q68 30 66 38" fill="none" stroke="#5a3e2b" stroke-width="4" stroke-linecap="round"/>
  <path d="M32 22 Q36 19 40 21" fill="none" stroke="#5a3e2b" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M48 21 Q52 19 56 22" fill="none" stroke="#5a3e2b" stroke-width="1.5" stroke-linecap="round"/>
  <ellipse cx="35" cy="31" rx="7" ry="8" fill="#fff"/>
  <ellipse cx="53" cy="31" rx="7" ry="8" fill="#fff"/>
  <ellipse cx="35" cy="32" rx="5.5" ry="6.5" fill="#8a7060"/>
  <ellipse cx="53" cy="32" rx="5.5" ry="6.5" fill="#8a7060"/>
  <ellipse cx="35" cy="32" rx="3.5" ry="4.5" fill="#2e1e1a"/>
  <ellipse cx="53" cy="32" rx="3.5" ry="4.5" fill="#2e1e1a"/>
  <ellipse cx="37" cy="29" rx="1.5" ry="2" fill="#fff" opacity="0.9"/>
  <ellipse cx="55" cy="29" rx="1.5" ry="2" fill="#fff" opacity="0.9"/>
  <ellipse cx="27" cy="37" rx="6" ry="3.5" fill="#f5c0a8" opacity="0.4"/>
  <ellipse cx="61" cy="37" rx="6" ry="3.5" fill="#f5c0a8" opacity="0.4"/>
  <path d="M39 43 Q44 46 49 43" fill="none" stroke="#c09080" stroke-width="1.3" stroke-linecap="round"/>
  <rect x="40" y="50" width="8" height="8" rx="3" fill="#fde8d8"/>
  <path d="M24 58 Q15 68 17 90 Q18 102 44 104 Q70 102 71 90 Q73 68 64 58 Q56 50 44 50 Q32 50 24 58Z" fill="#d4b896"/>
  <line x1="31" y1="50" x2="29" y2="104" stroke="#a07848" stroke-width="1.2" opacity="0.45"/>
  <line x1="38" y1="50" x2="37" y2="104" stroke="#a07848" stroke-width="1.2" opacity="0.45"/>
  <line x1="44" y1="50" x2="44" y2="104" stroke="#a07848" stroke-width="1.2" opacity="0.45"/>
  <line x1="50" y1="50" x2="51" y2="104" stroke="#a07848" stroke-width="1.2" opacity="0.45"/>
  <line x1="57" y1="50" x2="59" y2="104" stroke="#a07848" stroke-width="1.2" opacity="0.45"/>
  <line x1="15" y1="62" x2="73" y2="62" stroke="#a07848" stroke-width="1.2" opacity="0.45"/>
  <line x1="15" y1="70" x2="73" y2="70" stroke="#a07848" stroke-width="1.2" opacity="0.45"/>
  <line x1="15" y1="78" x2="73" y2="78" stroke="#a07848" stroke-width="1.2" opacity="0.45"/>
  <line x1="15" y1="86" x2="73" y2="86" stroke="#a07848" stroke-width="1.2" opacity="0.45"/>
  <line x1="16" y1="94" x2="72" y2="94" stroke="#a07848" stroke-width="1.2" opacity="0.45"/>
  <path d="M37 57 L44 66 L51 57" fill="none" stroke="#8a6838" stroke-width="1.2" stroke-linejoin="round"/>
  <rect x="28" y="64" width="12" height="9" rx="1.5" fill="none" stroke="#a07848" stroke-width="0.8" opacity="0.6"/>
  <circle cx="44" cy="70" r="1.2" fill="#8a6838" opacity="0.7"/>
  <circle cx="44" cy="77" r="1.2" fill="#8a6838" opacity="0.7"/>
  <circle cx="44" cy="84" r="1.2" fill="#8a6838" opacity="0.7"/>
  <ellipse cx="44" cy="55" rx="8" ry="6" fill="#fde8d8"/>
  <path d="M24 62 L10 80 Q8 90 15 92"   fill="none" stroke="#d4b896" stroke-width="9" stroke-linecap="round"/>
  <path d="M64 62 L78 80 Q80 90 73 92"  fill="none" stroke="#d4b896" stroke-width="9" stroke-linecap="round"/>
  <ellipse cx="13" cy="93" rx="5" ry="4" fill="#fde8d8"/>
  <ellipse cx="75" cy="93" rx="5" ry="4" fill="#fde8d8"/>
  <path d="M24 96 L26 122 Q26 127 31 127 Q36 127 36 122 L38 102 L44 100 L50 102 L52 122 Q52 127 57 127 Q62 127 62 122 L64 96 Z" fill="#6B4A3A"/>
  <line x1="31" y1="100" x2="29" y2="126" stroke="#5a3828" stroke-width="0.8" opacity="0.5"/>
  <line x1="57" y1="100" x2="59" y2="126" stroke="#5a3828" stroke-width="0.8" opacity="0.5"/>
  <rect x="24" y="93" width="40" height="5" rx="1.5" fill="#3d2418"/>
  <rect x="41" y="92" width="6" height="7" rx="1" fill="#7a5838"/>
  <rect x="22" y="122" width="18" height="9" rx="4.5" fill="#fff" stroke="#ece8e8" stroke-width="0.5"/>
  <rect x="48" y="122" width="18" height="9" rx="4.5" fill="#fff" stroke="#ece8e8" stroke-width="0.5"/>
  <rect x="23" y="124" width="16" height="2" rx="1" fill="#f0eded"/>
  <rect x="49" y="124" width="16" height="2" rx="1" fill="#f0eded"/>
  <text x="74" y="52" font-size="7" fill="#AA9DA1" opacity="0.55">✦</text>`;
}

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

/* returns false (instead of throwing) if the browser storage is full, e.g. too many photos */
function saveState(state) {
  try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); return true; }
  catch (err) { console.error('Could not save:', err); return false; }
}

function defaultState() {
  return {
    userName:  '',
    currency:  'SGD',
    todos:     [],
    products:  [],   // { id, name, brand, shade, category, opened:'YYYY-MM-DD'|'', pao:months }
    moods:     [],   // { date, key, label, note }
    incomes:   [],
    expenses:  [],
    nextIds:   { todo: 1, product: 1, mood: 1, income: 1, expense: 1 },
  };
}

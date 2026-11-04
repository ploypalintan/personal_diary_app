/* ═══════════════════════════════════════
   diaryData.js — shared app state & data
═══════════════════════════════════════ */


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

/* ── APP STATE (persisted to localStorage) ── */
/* All reads and writes now go through Store (data/store.js): schema versioning,
   createdAt/updatedAt stamps and deletion records live there. */
function loadState()      { return Store.load(); }
/* returns false (instead of throwing) if the browser storage is full, e.g. too many photos */
function saveState(state) { return Store.save(state); }
function defaultState()   { return Store.emptyState(); }

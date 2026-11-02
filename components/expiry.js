/* ═══════════════════════════════════════
   expiry.js
   Date maths + voice-phrase parsing for the product tracker.
   All dates are plain "YYYY-MM-DD" strings in the user's LOCAL
   time zone (never toISOString, which shifts the day in Singapore).
═══════════════════════════════════════ */

const PAO_OPTIONS = [3, 6, 9, 12, 18, 24, 36];          /* months after opening */
const SOON_DAYS = 30;

/* category -> rough default period-after-opening (months). A guide only:
   always follow the jar symbol on the actual packaging. */
const CATEGORIES = [
  { key: 'skincare',  pao: 12, words: ['moisturiser','moisturizer','cleanser','serum','toner','cream','lotion','essence','mask','retinol','niacinamide','eye cream','balm cleanser','sunscreen','spf'] },
  { key: 'face',      pao: 12, words: ['foundation','concealer','blush','bronzer','highlighter','powder','primer','contour','tint','cushion'] },
  { key: 'eyes',      pao: 6,  words: ['mascara','eyeliner','eye liner','eyeshadow','eye shadow','lash','kohl'] },
  { key: 'lips',      pao: 24, words: ['lipstick','lip gloss','gloss','lip liner','lip balm','lip oil','lip tint','lip mask'] },
  { key: 'brows',     pao: 12, words: ['brow','eyebrow'] },
  { key: 'nails',     pao: 24, words: ['nail','polish','top coat','base coat'] },
  { key: 'fragrance', pao: 36, words: ['perfume','fragrance','cologne','eau de'] },
  { key: 'other',     pao: 12, words: [] },
];

/* a small starter list so "Cetaphil moisturiser" splits into brand + product */
const KNOWN_BRANDS = ['Cetaphil','CeraVe','La Roche-Posay','Laneige','Innisfree','Sulwhasoo','Skinceuticals','The Ordinary','Neutrogena','Clinique','Estee Lauder','Shiseido','SK-II','Fenty Beauty','Rare Beauty','Maybelline','L\'Oreal','Dior','Chanel','MAC','NARS','Charlotte Tilbury','Glossier','Etude','Canmake','Heimish','Anua','Beauty of Joseon','COSRX','Some By Mi','Paula\'s Choice','Drunk Elephant','Kiehl\'s','Bioderma','Avene','Vichy','Eucerin','Hada Labo','Biore','Shu Uemura','Kose','Sk-II'];

/* ── date helpers ── */
function pad2(n) { return String(n).padStart(2, '0'); }
function toISO(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function todayISO(now = new Date()) { return toISO(now); }
function fromISO(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); }
function daysInMonth(y, m0) { return new Date(y, m0 + 1, 0).getDate(); }

/* add months, clamping the day (31 Jan + 1M = 28/29 Feb, not 3 Mar) */
function addMonths(iso, months) {
  const [y, m, d] = iso.split('-').map(Number);
  const total = (m - 1) + months;
  const ny = y + Math.floor(total / 12);
  const nm = ((total % 12) + 12) % 12;
  return `${ny}-${pad2(nm + 1)}-${pad2(Math.min(d, daysInMonth(ny, nm)))}`;
}
function diffDays(aISO, bISO) {            /* b - a in whole days, DST-safe */
  const a = fromISO(aISO), b = fromISO(bISO);
  return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000);
}

/* ── product maths ── */
function computeExpiry(openedISO, paoMonths) {
  if (!openedISO || !paoMonths) return null;     /* sealed / not opened yet */
  return addMonths(openedISO, paoMonths);
}
function productStatus(p, today) {
  const exp = computeExpiry(p.opened, p.pao);
  if (!exp) return { kind: 'sealed', exp: null, days: null };
  const days = diffDays(today, exp);
  if (days < 0) return { kind: 'expired', exp, days };
  if (days <= SOON_DAYS) return { kind: 'soon', exp, days };
  return { kind: 'ok', exp, days };
}
/* soonest expiry first; already expired at the very top; sealed last */
function sortProducts(list, today) {
  const rank = (p) => { const s = productStatus(p, today); return s.kind === 'sealed' ? Infinity : s.days; };
  return [...list].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}
function describeStatus(s) {
  if (s.kind === 'sealed') return 'not opened yet';
  if (s.kind === 'expired') return s.days === -1 ? 'expired yesterday' : `expired ${-s.days} days ago`;
  if (s.days === 0) return 'expires today';
  if (s.days === 1) return 'expires tomorrow';
  return `expires in ${s.days} days`;
}
function categoryDefaultPao(key) { return (CATEGORIES.find(c => c.key === key) || CATEGORIES[CATEGORIES.length - 1]).pao; }
function guessCategory(text) {
  /* the longest matching keyword wins, so "lip mask" -> lips, not skincare ("mask") */
  const t = text.toLowerCase();
  let best = { key: 'other', len: 0 };
  for (const c of CATEGORIES) for (const w of c.words) if (t.includes(w) && w.length > best.len) best = { key: c.key, len: w.length };
  return best.key;
}

/* ── voice / typed phrase → form fields ──
   "add Cetaphil moisturiser, opened today"
   "add Laneige lip mask opened 3 days ago, 12 months"
   Returns fields to PRE-FILL the form; the person confirms before saving. */
const MONTH_NAMES = ['january','february','march','april','may','june','july','august','september','october','november','december'];
function parseOpened(t, today) {
  if (/\b(not opened|unopened|sealed|haven'?t opened)\b/.test(t)) return { opened: '' };
  if (/\bopened\s+today\b|\btoday\b/.test(t)) return { opened: today };
  if (/\byesterday\b/.test(t)) return { opened: addDays(today, -1) };
  let m = t.match(/(\d+|a|one|two|three|four|five|six)\s+(day|week|month)s?\s+ago/);
  if (m) {
    const n = { a: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 }[m[1]] || Number(m[1]);
    if (m[2] === 'day') return { opened: addDays(today, -n) };
    if (m[2] === 'week') return { opened: addDays(today, -7 * n) };
    return { opened: addMonths(today, -n) };
  }
  m = t.match(new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTH_NAMES.join('|')})(?:\\s+(\\d{4}))?`));
  let day, mon, yr;
  if (m) { day = +m[1]; mon = MONTH_NAMES.indexOf(m[2]); yr = m[3] ? +m[3] : null; }
  else {
    m = t.match(new RegExp(`(${MONTH_NAMES.join('|')})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?`));
    if (m) { mon = MONTH_NAMES.indexOf(m[1]); day = +m[2]; yr = m[3] ? +m[3] : null; }
  }
  if (day && mon >= 0) {
    const ty = fromISO(today).getFullYear();
    let iso = `${yr || ty}-${pad2(mon + 1)}-${pad2(Math.min(day, daysInMonth(yr || ty, mon)))}`;
    if (!yr && diffDays(today, iso) > 0) iso = `${ty - 1}-${pad2(mon + 1)}-${pad2(Math.min(day, daysInMonth(ty - 1, mon)))}`;  /* "3 November" said in January = last year */
    return { opened: iso };
  }
  return {};
}
function addDays(iso, n) { const d = fromISO(iso); d.setDate(d.getDate() + n); return toISO(d); }

function parseProductPhrase(raw, today) {
  let text = (raw || '').trim().replace(/[.!]+$/, '');
  if (!text) return null;
  const lower = text.toLowerCase();
  const out = { name: '', brand: '', category: '', pao: null };
  Object.assign(out, parseOpened(lower, today));
  /* period after opening: "for 12 months", "12M", "12 months after opening".
     Ignore "5 months ago" - that describes WHEN it was opened, not the PAO. */
  for (const pm of lower.matchAll(/(\d{1,2})\s*(?:months?|mo|m)\b(?!\s+ago)/g)) {
    if (PAO_OPTIONS.includes(+pm[1])) { out.pao = +pm[1]; break; }
  }

  /* product part = text before "opened"/"sealed"/"for N months", minus leading "add" */
  let head = text.split(/,|\b(?:opened|open|sealed|unopened|not opened|haven'?t opened|for\s+\d+\s*(?:m|months?))\b/i)[0].trim();
  head = head.replace(/^(please\s+)?(add|put|log|track|save)\s+(a\s+|an\s+|my\s+|the\s+)?/i, '').trim();
  const byMatch = head.match(/^(.*?)\s+(?:by|from)\s+(.+)$/i);       /* "moisturiser by Cetaphil" */
  if (byMatch) { out.name = byMatch[1].trim(); out.brand = byMatch[2].trim(); }
  else {
    const brand = KNOWN_BRANDS.find(b => head.toLowerCase().startsWith(b.toLowerCase() + ' ') || head.toLowerCase() === b.toLowerCase());
    if (brand) { out.brand = brand; out.name = head.slice(brand.length).trim() || head; }
    else out.name = head;
  }
  out.name = out.name.replace(/\s+/g, ' ');
  out.category = guessCategory(head);
  return out;
}

if (typeof module !== 'undefined') module.exports = { addMonths, diffDays, computeExpiry, productStatus, sortProducts, describeStatus, parseProductPhrase, toISO, todayISO, categoryDefaultPao, guessCategory, addDays, CATEGORIES, PAO_OPTIONS, SOON_DAYS };

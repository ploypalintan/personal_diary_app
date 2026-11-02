/* ═══════════════════════════════════════
   expiry.js
   Date maths + voice-phrase parsing for the product tracker.
   Dates are stored as "YYYY-MM-DD" in the user's LOCAL time zone
   (never toISOString, which shifts the day in Singapore) and shown
   to people as DD/MM/YYYY.
═══════════════════════════════════════ */

const PAO_OPTIONS = [3, 6, 9, 12, 18, 24, 36];          /* months after opening */
const SOON_DAYS = 30;

/* label + default period-after-opening (months). A rough guide only:
   the open-jar symbol on the real packaging always wins. */
const CATEGORIES = [
  { key: 'foundation', label: 'foundation',        pao: 12, words: ['foundation','concealer','cushion','bb cream','cc cream','skin tint','primer','setting powder','powder','complexion'] },
  { key: 'blush',      label: 'blush',             pao: 18, words: ['blush','cheek tint','cheek'] },
  { key: 'eyebrows',   label: 'eyebrows',          pao: 12, words: ['eyebrow','brow'] },
  { key: 'contour',    label: 'contour',           pao: 18, words: ['contour','sculpt','highlighter','highlight','shaping'] },
  { key: 'bronzer',    label: 'bronzer',           pao: 24, words: ['bronzer','bronzing','sun powder'] },
  { key: 'eyetools',   label: 'eye tools',         pao: 6,  words: ['mascara','eyeliner','eye liner','lash','curler','tweezers','kohl','eye brush','eye glue'] },
  { key: 'palette',    label: 'eyeshadow palettes', pao: 24, words: ['eyeshadow','eye shadow','palette','shadow','eye palette'] },
  { key: 'lip',        label: 'lip',               pao: 24, words: ['lipstick','lip gloss','gloss','lip liner','lip balm','lip oil','lip tint','lip mask','lip stain','lip'] },
  { key: 'other',      label: 'others',            pao: 12, words: [] },
];
/* old category keys from earlier versions of the app -> the new shelf */
const LEGACY_CATEGORIES = { face: 'foundation', eyes: 'palette', brows: 'eyebrows', lips: 'lip', skincare: 'other', sunscreen: 'other', nails: 'other', fragrance: 'other', tools: 'other', body: 'other' };

/* a small starter list so "Cetaphil moisturiser" splits into brand + product */
const KNOWN_BRANDS = ['Cetaphil','CeraVe','La Roche-Posay','Laneige','Innisfree','Sulwhasoo','Skinceuticals','The Ordinary','Neutrogena','Clinique','Estee Lauder','Shiseido','SK-II','Fenty Beauty','Rare Beauty','Maybelline','L\'Oreal','Dior','Chanel','MAC','NARS','Charlotte Tilbury','Glossier','Etude','Canmake','Heimish','Anua','Beauty of Joseon','COSRX','Some By Mi','Paula\'s Choice','Drunk Elephant','Kiehl\'s','Bioderma','Avene','Vichy','Eucerin','Hada Labo','Biore','Shu Uemura','Kose'];

/* ── date helpers ── */
function pad2(n) { return String(n).padStart(2, '0'); }
function toISO(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function todayISO(now = new Date()) { return toISO(now); }
function fromISO(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); }
function daysInMonth(y, m0) { return new Date(y, m0 + 1, 0).getDate(); }

/* DD/MM/YYYY <-> YYYY-MM-DD. parseDMY returns null for anything that is not a real calendar date. */
function formatDMY(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function parseDMY(text) {
  const m = String(text || '').trim().match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
  if (!m) return null;
  const d = +m[1], mo = +m[2], y = +m[3];
  if (y < 1990 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > daysInMonth(y, mo - 1)) return null;
  return `${y}-${pad2(mo)}-${pad2(d)}`;
}

/* add months, clamping the day (31 Jan + 1M = 28/29 Feb, not 3 Mar) */
function addMonths(iso, months) {
  const [y, m, d] = iso.split('-').map(Number);
  const total = (m - 1) + months;
  const ny = y + Math.floor(total / 12);
  const nm = ((total % 12) + 12) % 12;
  return `${ny}-${pad2(nm + 1)}-${pad2(Math.min(d, daysInMonth(ny, nm)))}`;
}
function addDays(iso, n) { const d = fromISO(iso); d.setDate(d.getDate() + n); return toISO(d); }
function diffDays(aISO, bISO) {            /* b - a in whole days, DST-safe */
  const a = fromISO(aISO), b = fromISO(bISO);
  return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000);
}

/* ── product maths ──
   A product can have two limits: "opened + period after opening" and an
   optional printed date on the pack. The one that comes first is the expiry. */
function computeExpiry(openedISO, paoMonths) {
  if (!openedISO || !paoMonths) return null;     /* sealed / not opened yet */
  return addMonths(openedISO, paoMonths);
}
function productStatus(p, today) {
  const paoExp = computeExpiry(p.opened, p.pao);
  const printed = p.printedExpiry || null;
  let exp = null, basis = null;
  if (paoExp && printed) { if (printed < paoExp) { exp = printed; basis = 'printed'; } else { exp = paoExp; basis = 'pao'; } }
  else if (paoExp) { exp = paoExp; basis = 'pao'; }
  else if (printed) { exp = printed; basis = 'printed'; }
  if (!exp) return { kind: 'sealed', exp: null, days: null, basis: null, paoExp: null, printed };
  const days = diffDays(today, exp);
  const kind = days < 0 ? 'expired' : days <= SOON_DAYS ? 'soon' : 'ok';
  return { kind, exp, days, basis, paoExp, printed };
}
/* soonest expiry first; already expired at the very top; products with no date last */
function sortProducts(list, today) {
  const rank = (p) => { const s = productStatus(p, today); return s.kind === 'sealed' ? Infinity : s.days; };
  return [...list].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}
function describeStatus(s) {
  if (s.kind === 'sealed') return 'no expiry date yet';
  if (s.kind === 'expired') return s.days === -1 ? 'expired yesterday' : `expired ${-s.days} days ago`;
  if (s.days === 0) return 'expires today';
  if (s.days === 1) return 'expires tomorrow';
  return `expires in ${s.days} days`;
}
function categoryInfo(key) { return CATEGORIES.find(c => c.key === key) || CATEGORIES[CATEGORIES.length - 1]; }
function categoryDefaultPao(key) { return categoryInfo(key).pao; }
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
   "add Anua toner, expires 15/03/2027"
   Returns fields to PRE-FILL the form; the person confirms before saving. */
const MONTH_NAMES = ['january','february','march','april','may','june','july','august','september','october','november','december'];

/* an absolute date inside free text: 15/03/2027, 15 march 2027, march 15 2027.
   `future`: when no year is given, which way to roll ("opened" = past, "expires" = future). */
function parseAbsoluteDate(t, today, future) {
  let m = t.match(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})\b/);
  if (m) return parseDMY(`${m[1]}/${m[2]}/${m[3]}`);
  let day, mon, yr;
  m = t.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${MONTH_NAMES.join('|')})(?:\\s+(\\d{4}))?`));
  if (m) { day = +m[1]; mon = MONTH_NAMES.indexOf(m[2]); yr = m[3] ? +m[3] : null; }
  else {
    m = t.match(new RegExp(`\\b(${MONTH_NAMES.join('|')})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?`));
    if (m) { mon = MONTH_NAMES.indexOf(m[1]); day = +m[2]; yr = m[3] ? +m[3] : null; }
  }
  if (!(day && mon >= 0)) return null;
  const ty = fromISO(today).getFullYear();
  const build = (y) => `${y}-${pad2(mon + 1)}-${pad2(Math.min(day, daysInMonth(y, mon)))}`;
  if (yr) return build(yr);
  let iso = build(ty);
  if (future && diffDays(today, iso) < 0) iso = build(ty + 1);       /* "expires 3 March" said in November = next year */
  if (!future && diffDays(today, iso) > 0) iso = build(ty - 1);      /* "opened 15 December" said in November = last year */
  return iso;
}

function parseOpened(t, today) {
  if (/\b(not opened|unopened|sealed|haven'?t opened)\b/.test(t)) return { opened: '' };
  if (/\bopened\s+today\b|\btoday\b/.test(t)) return { opened: today };
  if (/\byesterday\b/.test(t)) return { opened: addDays(today, -1) };
  const m = t.match(/(\d+|a|one|two|three|four|five|six)\s+(day|week|month)s?\s+ago/);
  if (m) {
    const n = { a: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 }[m[1]] || Number(m[1]);
    if (m[2] === 'day') return { opened: addDays(today, -n) };
    if (m[2] === 'week') return { opened: addDays(today, -7 * n) };
    return { opened: addMonths(today, -n) };
  }
  const abs = parseAbsoluteDate(t, today, false);
  return abs ? { opened: abs } : {};
}

function parseProductPhrase(raw, today) {
  let text = (raw || '').trim().replace(/[.!]+$/, '');
  if (!text) return null;
  let lower = text.toLowerCase();
  const out = { name: '', brand: '', category: '', pao: null };

  /* printed expiry: "expires 15/03/2027", "best before March 2027" */
  const ex = lower.match(/\b(?:expires?|expiry|expiring|best before|use by)\s+(?:on\s+)?(.+)$/);
  if (ex) {
    const iso = parseAbsoluteDate(ex[1], today, true);
    if (iso) out.printedExpiry = iso;
    lower = lower.slice(0, ex.index);
    text = text.slice(0, ex.index).trim().replace(/[,\s]+$/, '');
  }
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

if (typeof module !== 'undefined') module.exports = { addMonths, diffDays, computeExpiry, productStatus, sortProducts, describeStatus, parseProductPhrase, toISO, todayISO, categoryDefaultPao, categoryInfo, guessCategory, addDays, formatDMY, parseDMY, fromISO, CATEGORIES, LEGACY_CATEGORIES, PAO_OPTIONS, SOON_DAYS, KNOWN_BRANDS };

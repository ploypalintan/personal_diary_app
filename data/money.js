/* ═══════════════════════════════════════
   money.js — money as whole minor units (cents), never decimals.

   0.1 + 0.2 is 0.30000000000000004 in a computer, so sums of decimal amounts drift. Every amount
   is stored as a whole number of the currency's smallest unit (S$12.50 -> 1250; ¥1200 -> 1200)
   in the field `cents`, together with the currency it was spent in (`cur`).

   Loaded before store.js, which uses it to upgrade old records that stored `amt` as a decimal.
═══════════════════════════════════════ */
const Money = (() => {
  /* currencies with no minor unit; everything else has 2 decimals */
  const ZERO_DECIMAL = ['JPY', 'KRW', 'VND', 'CLP', 'ISK', 'UGX', 'XAF', 'XOF'];
  const exp = (cur) => (ZERO_DECIMAL.includes(cur) ? 0 : 2);

  /* "1,234.5" -> 123450 (whole minor units). Returns null if it is not a plain positive-or-zero amount.
     Done on the digits as text, so there is no floating point and 1.005 rounds half-up to 1.01. */
  function parse(input, cur = 'SGD') {
    const s = String(input == null ? '' : input).trim().replace(/[,\s]/g, '');
    if (!/^\d*\.?\d*$/.test(s) || s === '' || s === '.') return null;
    const e = exp(cur);
    const [intPart0, frac = ''] = s.split('.');
    const intPart = intPart0 || '0';
    if (intPart.length > 12) return null;                       // keeps every sum safely under 2^53
    let minor = Number(intPart) * Math.pow(10, e) + Number(frac.slice(0, e).padEnd(e, '0') || 0);
    if (frac.length > e && frac.charAt(e) >= '5') minor += 1;   // round half up
    return minor;
  }

  /* a decimal number from an old record -> whole minor units */
  function fromDecimal(x, cur = 'SGD') {
    const n = Number(x);
    if (!isFinite(n)) return 0;
    const m = parse(Math.abs(n).toFixed(6), cur);
    return (n < 0 ? -1 : 1) * (m || 0);
  }

  /* the amount of any income/expense record, in minor units (understands old records too) */
  function of(rec) {
    if (!rec) return 0;
    if (Number.isInteger(rec.cents)) return rec.cents;
    return fromDecimal(rec.amt, rec.cur || 'SGD');
  }

  const sum = (list) => list.reduce((s, r) => s + of(r), 0);

  /* 1250, 'SGD' -> "S$12.50". Sign is not shown (callers decide). */
  function format(minor, cur = 'SGD') {
    const e = exp(cur);
    const sym = (typeof CURRENCIES !== 'undefined' && CURRENCIES[cur]) || (cur + ' ');
    return sym + (Math.abs(minor) / Math.pow(10, e)).toLocaleString('en-US', { minimumFractionDigits: e, maximumFractionDigits: e });
  }

  return { parse, fromDecimal, of, sum, format, exp };
})();

if (typeof module !== 'undefined') module.exports = Money;

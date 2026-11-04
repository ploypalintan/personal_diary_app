/* ═══════════════════════════════════════
   links.js — how the pillars talk to each other.

   Records never copy each other's data. They point to each other by id, and these helpers
   follow the pointers:
     shelf item  <->  purchase (expense)      product.expenseId  /  expense.productId
     a day       ->   what you felt, spent and opened (moods + expenses + shelf, joined by date)

   Nothing here changes what a page shows yet. It is the plumbing for:
     • "buying this adds it to your money"
     • "this month you spent S$X on beauty, S$Y of it still unopened"
     • "on blue days you spent more on beauty"  (opt-in, observation only)
═══════════════════════════════════════ */
const Links = (() => {
  const ISO = /^\d{4}-\d{2}-\d{2}$/;
  const MONTH_NAMES = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  const pad = (n) => String(n).padStart(2, '0');

  /* the calendar day (YYYY-MM-DD) of any record: new records use ISO dates, older mood entries
     store "Monday, 2 November 2026" */
  function dayOf(rec) {
    if (!rec) return '';
    if (ISO.test(rec.dateISO || '')) return rec.dateISO;
    const d = String(rec.date || '');
    if (ISO.test(d)) return d;
    const m = d.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (m) {
      const mi = MONTH_NAMES.indexOf(m[2].toLowerCase());
      if (mi >= 0) return `${m[3]}-${pad(mi + 1)}-${pad(Number(m[1]))}`;
    }
    return '';
  }

  const byId = (list, id) => (list || []).find(x => x.id === id) || null;

  /* ── shelf item <-> purchase ── */
  function linkPurchase(state, productId, expenseId) {
    const p = byId(state.products, productId), e = byId(state.expenses, expenseId);
    if (!p || !e) return false;
    p.expenseId = e.id; e.productId = p.id;
    return true;
  }
  const expenseForProduct = (state, productId) => { const p = byId(state.products, productId); return p && p.expenseId != null ? byId(state.expenses, p.expenseId) : null; };
  const productForExpense = (state, expenseId) => { const e = byId(state.expenses, expenseId); return e && e.productId != null ? byId(state.products, e.productId) : null; };

  /* drop pointers whose other side was deleted (called on every save) */
  function clean(state) {
    (state.products || []).forEach(p => { if (p.expenseId != null && !byId(state.expenses, p.expenseId)) delete p.expenseId; });
    (state.expenses || []).forEach(e => { if (e.productId != null && !byId(state.products, e.productId)) delete e.productId; });
  }

  /* ── money x shelf ── */
  const monthOf = (iso) => (iso || '').slice(0, 7);

  /* total spent in one month ('YYYY-MM'), and how much of it was beauty */
  function monthSpend(state, month) {
    const list = (state.expenses || []).filter(e => monthOf(e.date) === month);
    const total = list.reduce((s, e) => s + (Number(e.amt) || 0), 0);
    const beauty = list.filter(e => e.cat === 'beauty').reduce((s, e) => s + (Number(e.amt) || 0), 0);
    return { total, beauty, count: list.length };
  }

  /* beauty purchases from a month that are linked to a shelf item, split by whether it has been opened */
  function beautyOnShelf(state, month) {
    const out = { unopened: 0, inUse: 0, finished: 0, unlinked: 0 };
    (state.expenses || []).filter(e => e.cat === 'beauty' && monthOf(e.date) === month).forEach(e => {
      const p = productForExpense(state, e.id), amt = Number(e.amt) || 0;
      if (!p) out.unlinked += amt;
      else if (p.finished) out.finished += amt;
      else if (p.opened) out.inUse += amt;
      else out.unopened += amt;
    });
    return out;
  }

  /* ── one day, joined ── */
  function dayLog(state, iso) {
    const moods = (state.moods || []).filter(m => dayOf(m) === iso);
    const spent = (state.expenses || []).filter(e => e.date === iso);
    return {
      date: iso,
      moods,
      spend: spent.reduce((s, e) => s + (Number(e.amt) || 0), 0),
      beautySpend: spent.filter(e => e.cat === 'beauty').reduce((s, e) => s + (Number(e.amt) || 0), 0),
      opened: (state.products || []).filter(p => p.opened === iso),
    };
  }

  /* average beauty spend on days tagged with each mood key (needs several days of data to mean anything) */
  function spendByMood(state) {
    const acc = {};
    const days = new Set((state.moods || []).map(dayOf).filter(Boolean));
    days.forEach(iso => {
      const log = dayLog(state, iso);
      log.moods.forEach(m => {
        const a = acc[m.key] || (acc[m.key] = { days: 0, beauty: 0, total: 0 });
        a.days += 1; a.beauty += log.beautySpend; a.total += log.spend;
      });
    });
    Object.values(acc).forEach(a => { a.avgBeauty = a.days ? a.beauty / a.days : 0; a.avgTotal = a.days ? a.total / a.days : 0; });
    return acc;
  }

  return { dayOf, linkPurchase, expenseForProduct, productForExpense, clean, monthSpend, beautyOnShelf, dayLog, spendByMood };
})();

if (typeof module !== 'undefined') module.exports = Links;

const test = require('node:test'); const assert = require('node:assert');
const { device } = require('./helpers');

const legacy = () => ({
  userName: 'Ploy', currency: 'SGD',
  todos: [{ id: 1, name: 'a', date: '2026-11-02' }],
  products: [{ id: 1, name: 'Tint', brand: 'Rare', category: 'blush', added: 1700000000000, finished: false, opened: '' }],
  moods: [{ id: 1, date: 'Monday, 2 November 2026', key: 'talk', label: 'talk', note: 'hi' }],
  incomes: [{ id: 1, name: 'pay', amt: 3000.1, type: 'salary', date: '2026-11-01' }],
  expenses: [{ id: 1, name: 'Tint', amt: 30.3, cat: 'beauty', date: '2026-11-02' }, { id: 2, name: 'Lunch', amt: 10, cat: 'food', date: '2026-11-02' }],
  nextIds: { todo: 2, product: 2, mood: 2, income: 2, expense: 3 },
});

test('old data upgrades to the current schema without loss; money becomes whole cents', () => {
  const d = device(legacy()); const s = d.Store.load();
  assert.equal(s.schema, d.Store.SCHEMA); assert.equal(s.plan, 'free'); assert.equal(s.userName, 'Ploy');
  assert.equal(s.expenses[0].cents, 3030); assert.equal(s.expenses[0].cur, 'SGD'); assert.equal('amt' in s.expenses[0], false);
  assert.equal(s.incomes[0].cents, 300010);
  assert.equal(s.products[0].createdAt, new Date(1700000000000).toISOString());
});

test('unchanged saves keep timestamps; edits bump only the edited record; deletions leave tombstones', () => {
  const d = device(legacy()); let s = d.Store.load();
  const t0 = s.todos[0].updatedAt; d.Store.save(s); s = d.Store.load(); assert.equal(s.todos[0].updatedAt, t0);
  const other = JSON.stringify(s.expenses[1]); s.expenses[0].cents = 3500; d.Store.save(s);
  assert.equal(JSON.stringify(s.expenses[1]), other);
  s.todos = []; d.Store.save(s); assert.deepEqual(s.deleted.map(x => [x.c, x.id]), [['todos', 1]]);
});

test('links: purchase <-> shelf item, month totals in cents, dangling links cleaned', () => {
  const d = device(legacy()); let s = d.Store.load();
  assert.ok(d.Links.linkPurchase(s, 1, 1)); d.Store.save(s); s = d.Store.load();
  assert.equal(d.Links.expenseForProduct(s, 1).id, 1);
  assert.deepEqual(d.Links.monthSpend(s, '2026-11'), { total: 4030, beauty: 3030, count: 2 });
  assert.deepEqual(d.Links.beautyOnShelf(s, '2026-11'), { unopened: 3030, inUse: 0, finished: 0, unlinked: 0 });
  s.expenses = s.expenses.filter(e => e.id !== 1); d.Store.save(s);
  assert.equal(s.products[0].expenseId, undefined);
  assert.equal(d.Links.dayOf(s.moods[0]), '2026-11-02');
});

test('feature list: garden hidden until enabled; premium gating', () => {
  const d = device(legacy()); const s = d.Store.load();
  assert.deepEqual(d.Features.tabs(s).map(f => f.id), ['today', 'makeup', 'friend', 'finance', 'cover']);
  assert.equal(d.Features.available(s, 'garden'), false);
});

test('full storage: save returns false instead of throwing', () => {
  const d = device(legacy()); const s = d.Store.load();
  global.localStorage = { getItem: () => null, setItem: () => { throw new Error('quota'); } };
  const log = console.error; console.error = () => {}; try { assert.equal(d.Store.save(s), false); } finally { console.error = log; }
});

test('BACKUP RESTORE: export, wipe, restore gives back exactly the same diary', () => {
  const d = device(legacy()); let s = d.Store.load(); d.Store.save(s);
  const backup = JSON.parse(JSON.stringify(d.Store.exportAll(s)));
  const fresh = device();                       // a new empty browser
  assert.equal(fresh.Store.load().products.length, 0);
  const res = fresh.Store.importAll(backup); assert.equal(res.ok, true);
  const restored = fresh.Store.load();
  const strip = (list) => list.map(({ updatedAt, ...r }) => r);   // a restore counts as a fresh edit, so updatedAt is new
  ['todos', 'products', 'moods', 'incomes', 'expenses'].forEach(c => assert.deepEqual(strip(restored[c]), strip(s[c]), c));
  assert.equal(restored.userName, 'Ploy');
});

test('restore refuses broken, foreign or newer-version files and changes nothing', () => {
  const d = device(legacy()); d.Store.save(d.Store.load()); const before = JSON.stringify(d.Store.load());
  const bad = [null, 'x', {}, { app: 'other', data: {} }, { app: 'my-diary', schema: 999, data: {} }, { app: 'my-diary', schema: 3, data: { todos: 'nope' } }];
  bad.forEach(b => assert.equal(d.Store.importAll(b).ok, false));
  assert.equal(JSON.stringify(d.Store.load()), before);
});

test('ids: unique, time-based', () => {
  const d = device(); const ids = new Set(); for (let i = 0; i < 5000; i++) ids.add(d.Store.newId()); assert.equal(ids.size, 5000);
});

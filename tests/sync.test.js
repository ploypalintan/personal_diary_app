const test = require('node:test'); const assert = require('node:assert');
const { device } = require('./helpers');
const wait = (ms) => new Promise(r => setTimeout(r, ms));
/* fake server: a records table with a server-side synced_at */
const server = { rows: new Map(), clock: 0 };
const serverUpsert = (rows) => rows.forEach(r => server.rows.set(r.collection + ':' + r.id, { ...r, synced_at: ++server.clock }));
const serverPull = (cursor) => [...server.rows.values()].filter(r => r.synced_at > (cursor || 0)).sort((a, b) => a.synced_at - b.synced_at);
/* one sync round for a device, in the same order as cloud.js: (first time: unique ids) -> pull -> merge -> push */
function syncRound(d, meta, uid = 'u1') {
  d.use(); let st = d.Store.load();
  if (!meta.idsUpgraded) { d.Store.upgradeIds(st); d.Store.save(st, { quiet: true, noStamp: true }); meta.idsUpgraded = true; st = d.Store.load(); }
  const rows = serverPull(meta.cursor); if (rows.length) meta.cursor = rows[rows.length - 1].synced_at;
  if (d.Cloud.merge(st, rows)) d.Store.save(st, { quiet: true, noStamp: true });
  const startedAt = new Date().toISOString();
  serverUpsert(d.Cloud.pending(st, uid, meta.lastPushed || null)); meta.lastPushed = startedAt;
  return d.Store.load();
}
test('two devices stay in sync: no id clashes, edits and deletes travel, newest edit wins', async () => {
  const A = device({ userName: 'Ploy', products: [{ id: 1, name: 'A-tint', category: 'lip', photo: 'data:BIG' }], expenses: [{ id: 1, name: 'tint', cents: 3000, cur: 'SGD', cat: 'beauty', date: '2026-11-02', productId: 1 }] });
  const B = device({ userName: '', products: [{ id: 1, name: 'B-serum', category: 'other' }] });
  const mA = {}, mB = {};
  const pa0 = JSON.parse(A.mem.myDiaryState); pa0.products[0].expenseId = 1; A.mem.myDiaryState = JSON.stringify(pa0);
let a = syncRound(A,mA); await wait(5);
  assert.notEqual(a.products[0].id,1,'legacy id upgraded');
  assert.equal(a.products[0].expenseId, a.expenses[0].id,'link repointed'); assert.equal(a.expenses[0].productId,a.products[0].id);
  let b = syncRound(B,mB); await wait(5);
  assert.equal(b.products.length,2,'B has both products, no collision'); assert.deepEqual(b.products.map(p=>p.name).sort(),['A-tint','B-serum']);
  assert.equal(b.expenses.length,1);
  const pa = [...server.rows.values()].find(r=>r.data.name==='A-tint'); assert.equal(pa.data.photo,undefined,'photo not synced');
  a = syncRound(A,mA); await wait(5); assert.equal(a.products.length,2); assert.equal(a.products.find(p=>p.name==='A-tint').photo,'data:BIG','photo kept locally');
  

  // B edits A-tint; A sees it
  B.use();
  b = B.Store.load(); b.products.find(p=>p.name==='A-tint').love = true; B.Store.save(b,{quiet:true});
  syncRound(B,mB); await wait(5); a = syncRound(A,mA);
  assert.equal(a.products.find(p=>p.name==='A-tint').love,true); assert.equal(a.products.find(p=>p.name==='A-tint').photo,'data:BIG');
  

  // A deletes B-serum; B sees it gone and it does not come back
  A.use();
  a = A.Store.load(); a.products = a.products.filter(p=>p.name!=='B-serum'); A.Store.save(a,{quiet:true}); 
  await wait(5); syncRound(A,mA);  await wait(5); b = syncRound(B,mB); await wait(5);
  assert.deepEqual(b.products.map(p=>p.name),['A-tint']); b = syncRound(B,mB); a = syncRound(A,mA);
  assert.deepEqual(a.products.map(p=>p.name),['A-tint']); 

  // conflicting edits: newest wins
  A.use();
  a = A.Store.load(); a.products[0].name='from-A'; A.Store.save(a,{quiet:true}); await wait(20);
  B.use();
  b = B.Store.load(); b.products[0].name='from-B (later)'; B.Store.save(b,{quiet:true});
  syncRound(B,mB); await wait(5); a = syncRound(A,mA); b = syncRound(B,mB);
  assert.equal(a.products[0].name,'from-B (later)'); assert.equal(b.products[0].name,'from-B (later)');
  

  // ids are unique
  const ids = new Set(); for (let i=0;i<5000;i++) ids.add(A.Store.newId()); assert.equal(ids.size,5000); 

});

const test = require('node:test'); const assert = require('node:assert');
const Money = require('../data/money.js');

test('parse: plain, commas, rounding half-up, bad input', () => {
  assert.equal(Money.parse('12.5', 'SGD'), 1250);
  assert.equal(Money.parse('1,234.56', 'SGD'), 123456);
  assert.equal(Money.parse('1.005', 'SGD'), 101);          // half-up, no float error
  assert.equal(Money.parse('0.1', 'SGD') + Money.parse('0.2', 'SGD'), 30);   // 0.1 + 0.2 is exact
  assert.equal(Money.parse('1200', 'JPY'), 1200);          // no minor unit
  assert.equal(Money.parse('.5', 'SGD'), 50);
  ['', '.', 'abc', '-5', '1e3', '1.2.3'].forEach(x => assert.equal(Money.parse(x, 'SGD'), null, x));
  assert.equal(Money.parse('9'.repeat(13), 'SGD'), null);  // too large to be safe
});

test('fromDecimal converts old decimal records without drift', () => {
  assert.equal(Money.fromDecimal(0.1 + 0.2, 'SGD'), 30);
  assert.equal(Money.fromDecimal(19.99, 'SGD'), 1999);
  assert.equal(Money.fromDecimal(1234, 'JPY'), 1234);
});

test('of / sum understand new and old records', () => {
  assert.equal(Money.of({ cents: 500 }), 500);
  assert.equal(Money.of({ amt: 5.05 }), 505);
  assert.equal(Money.sum([{ cents: 10 }, { cents: 20 }, { amt: 0.3 }]), 60);
});

test('format', () => {
  assert.equal(Money.format(123456, 'SGD'), 'SGD 1,234.56'.replace('SGD ', 'SGD '));   // no CURRENCIES global in Node: falls back to code
  global.CURRENCIES = { SGD: 'S$', JPY: '¥' };
  assert.equal(Money.format(123456, 'SGD'), 'S$1,234.56');
  assert.equal(Money.format(-250, 'SGD'), 'S$2.50');
  assert.equal(Money.format(1200, 'JPY'), '¥1,200');
  delete global.CURRENCIES;
});

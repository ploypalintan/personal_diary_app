/* loads the app's data modules in Node, each "device" with its own fake browser storage */
const path = require('path');
const root = path.join(__dirname, '..', 'data');
function device(initial) {
  const mem = {};
  if (initial) mem.myDiaryState = JSON.stringify(initial);
  global.localStorage = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = v; } };
  Object.keys(require.cache).filter(k => k.startsWith(root)).forEach(k => delete require.cache[k]);
  global.Money = require(path.join(root, 'money.js'));
  global.Links = require(path.join(root, 'links.js'));
  const Store = require(path.join(root, 'store.js')); global.Store = Store;
  const Cloud = require(path.join(root, 'cloud.js'));
  const Features = require(path.join(root, 'features.js'));
  const use = () => { global.localStorage = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = v; } }; global.Store = Store; };
  return { mem, Store, Links: global.Links, Cloud: Cloud._test, Features, use };
}
module.exports = { device };

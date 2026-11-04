/* ═══════════════════════════════════════
   features.js — the list of things the app can do.

   To add a feature: add one entry here (and its page). The side tabs are built from this list,
   and the free / premium split is decided here, so nothing else needs editing.

     id       short name
     label    text on the tab
     icon     tiny glyph (hidden in the notebook look, kept for screen layouts that use it)
     page     file inside /pages (the cover lives one level up)
     pillar   beauty | money | mood | voice | life  (for grouping later)
     plan     'free' | 'premium'
     enabled  false = built into the list but not shown yet
═══════════════════════════════════════ */
const Features = (() => {
  const LIST = [
    { id: 'today',   label: 'today',   icon: '✦', page: 'today.html',   pillar: 'life',   plan: 'free', enabled: true },
    { id: 'makeup',  label: 'makeup',  icon: '✧', page: 'tracker.html', pillar: 'beauty', plan: 'free', enabled: true },
    { id: 'friend',  label: 'friend',  icon: '◌', page: 'mood.html',    pillar: 'voice',  plan: 'free', enabled: true },
    { id: 'finance', label: 'finance', icon: '◇', page: 'finance.html', pillar: 'money',  plan: 'free', enabled: true },
    /* next up: the monthly mood garden. Turn on once pages/garden.html exists. */
    { id: 'garden',  label: 'garden',  icon: '❀', page: 'garden.html',  pillar: 'mood',   plan: 'free', enabled: false },
  ];
  /* always the last tab */
  const COVER = { id: 'cover', label: 'cover', icon: '❀', page: '../index.html', pillar: 'life', plan: 'free', enabled: true };

  const get = (id) => LIST.concat(COVER).find(f => f.id === id) || null;

  /* can this person use it? (state.plan is 'free' until payments exist) */
  function available(state, id) {
    const f = get(id);
    if (!f || !f.enabled) return false;
    return f.plan === 'free' || (state && state.plan === 'premium');
  }

  /* the tabs to show, in order */
  const tabs = (state) => LIST.filter(f => f.enabled && available(state, f.id)).concat(COVER);

  /* build the side tabs; same markup the pages used to hard-code */
  function renderTabs(state) {
    const nav = document.querySelector('nav.bookmarks');
    if (!nav) return;
    nav.setAttribute('aria-label', 'diary pages');
    nav.replaceChildren(...tabs(state).map(f => {
      const a = document.createElement('a');
      a.className = 'bm'; a.dataset.page = f.page; a.dataset.feature = f.id;
      const icon = document.createElement('span'); icon.className = 'bm-icon'; icon.textContent = f.icon;
      a.append(icon, document.createTextNode(f.label));
      return a;
    }));
  }

  return { LIST, get, available, tabs, renderTabs };
})();

if (typeof module !== 'undefined') module.exports = Features;

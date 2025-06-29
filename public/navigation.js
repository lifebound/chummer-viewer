// navigation.js: Handles adaptive navigation and tab switching
console.log('[navigation.js] Loaded');

export function renderAdaptiveNavigation({ items, selectedKey, onTabSelect }) {
  console.log('[navigation.js] renderAdaptiveNavigation called');
  console.log('[navigation.js] Items:', items);
  // Remove any existing nav elements
  const oldRail = document.getElementById('mdRail');
  if (oldRail) oldRail.remove();
  const oldDrawer = document.getElementById('mdDrawer');
  if (oldDrawer) oldDrawer.remove();
  let tabBar = document.getElementById('mdTabs');
  if (tabBar) tabBar.innerHTML = '';

  const width = window.innerWidth;
  if (width <= 600) {
    // Mobile: Tabs
    if (!tabBar) {
      tabBar = document.createElement('md-tabs');
      tabBar.id = 'mdTabs';
      tabBar.setAttribute('style', 'margin-bottom:1.5em;');
      document.body.insertBefore(tabBar, document.getElementById('section-content'));
    }
    tabBar.innerHTML = '';
    tabBar.style.display = '';
    items.forEach((item) => {
      const tab = document.createElement('md-primary-tab');
      tab.setAttribute('label', item.label);
      tab.innerHTML = `<span class="material-icons" style="vertical-align:middle;">${item.icon}</span> <span style='vertical-align:middle;'>${item.label}</span>`;
      tab.selected = item.key === selectedKey;
      tab.addEventListener('click', () => onTabSelect(item.key));
      tabBar.appendChild(tab);
    });
  } else if (width <= 1024) {
    // Tablet: Navigation Rail
    let rail = document.createElement('nav');
    rail.id = 'mdRail';
    rail.style.display = 'flex';
    rail.setAttribute('aria-label', 'Section navigation');
    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'material-rail-btn';
      btn.title = item.label;
      btn.innerHTML = `<span class="material-icons">${item.icon}</span>`;
      btn.onclick = () => onTabSelect(item.key);
      if (item.key === selectedKey) btn.style.background = 'var(--md-sys-color-primary)';
      rail.appendChild(btn);
    });
    document.body.appendChild(rail);
  } else {
    // Desktop: Navigation Drawer
    let drawer = document.createElement('aside');
    drawer.id = 'mdDrawer';
    drawer.style.display = 'flex';
    drawer.style.flexDirection = 'column';
    drawer.style.alignItems = 'flex-start';
    drawer.style.padding = '1em 0';
    drawer.style.gap = '0.5em';
    drawer.setAttribute('aria-label', 'Section navigation');
    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'material-drawer-btn';
      btn.title = item.label;
      btn.innerHTML = `<span class="material-icons">${item.icon}</span> <span>${item.label}</span>`;
      btn.onclick = () => onTabSelect(item.key);
      if (item.key === selectedKey) btn.style.background = 'var(--md-sys-color-primary)';
      btn.style.width = '100%';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.gap = '1em';
      btn.style.padding = '0.75em 1.5em';
      btn.style.border = 'none';
      btn.style.background = 'none';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = '1.1em';
      btn.style.borderRadius = '20px';
      btn.style.transition = 'background 0.2s';
      btn.style.color = '#fff';
      drawer.appendChild(btn);
    });
    document.body.appendChild(drawer);
  }
}

import 'https://unpkg.com/@material/web/all.js?module';
import { initUploadForm } from './clientUpload.js';
import { renderAdaptiveNavigation,buildTabItems, showTab, renderAdaptiveNavigationDrawer } from './navigation.js';
import { renderSpells, renderComplexForms } from './renderers.js';
import { skillAttributeMap } from './skillAttributeMap.js';
import { spellDescriptions, complexFormDescriptions } from './spellDescriptions.js';
import 'mdui/mdui.css';
import 'mdui';
import '@mdui/icons/watch-later--outlined.js';
import '@mdui/icons/image--outlined.js';
import '@mdui/icons/library-music--outlined.js';
import { renderCharacterTab } from './characterDisplay.js';

const sectionContent = document.querySelectorAll('mdui-layout-main')[0];
var fileName = document.getElementById('fileName');

// --- Modular App Initialization ---

// State
window.appState = {
  characterData: null,
  currentMainSection: null,
  currentSubView: null,
  currentDetailId: null,
  viewStack: [],
  // selectedTab: 'upload',
  // pendingJobs: [],
  // // ...other state...
};
let tabItems = [];
let pendingJobs = [];


// On load, hide tabs and show upload
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded: hiding tabs and showing upload form');
  tabItems = buildTabItems({});
    console.log('Tab items built:', tabItems);
    // Prefer 'Character' tab if present, else first non-upload tab
    let defaultTab = tabItems.find(t => t.key === 'character') || tabItems.find(t => t.key !== 'upload');
    renderAdaptiveNavigationDrawer({ items: tabItems, selectedKey: defaultTab.key, onTabSelect: showTab });
    showTab('upload', sectionContent);
  //initUploadForm({ sectionContent, characterInput, fileName, onUpload: () => {} });
  let tabBar = document.getElementById('mdTabs');
  if (tabBar) tabBar.style.display = 'none';
  uploadForm.style.display = '';
  console.log('DOMContentLoaded: upload form shown, tabs hidden');
});



// If DOM is already loaded, run immediately; otherwise, wait for DOMContentLoaded
if (document.readyState === 'loading') {
  console.log('Document is still loading, waiting for DOMContentLoaded');
  window.addEventListener('DOMContentLoaded', setupUploadForm);
} else {
  console.log('Document already loaded');
}
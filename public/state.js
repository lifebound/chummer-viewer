// state.js: Manages app state (character data, jobs, etc.)
console.log('[state.js] Loaded');

export const state = {
  characterData: null,
  tabItems: [],
  pendingJobs: [],
};

export function setCharacterData(data) {
  console.log('[state.js] setCharacterData called');
  state.characterData = data;
}

export function setTabItems(items) {
  console.log('[state.js] setTabItems called');
  state.tabItems = items;
}

export function setPendingJobs(jobs) {
  console.log('[state.js] setPendingJobs called');
  state.pendingJobs = jobs;
}

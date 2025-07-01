import 'https://unpkg.com/@material/web/all.js?module';
import { initUploadForm } from './upload.js';
import { renderAdaptiveNavigation } from './navigation.js';
import { renderSpells, renderComplexForms, renderSpirits, renderSprites, renderGear } from './renderers.js';
import { skillAttributeMap } from './skillAttributeMap.js';
import { spellDescriptions, complexFormDescriptions } from './spellDescriptions.js';
import { renderCharacterSummary, renderCharacterTab} from './characterDisplay.js'
import  {fetchWithSessionRetry, uploadCharacterFile,login,logout,checkSession,appendJob} from './client.js';

const sectionContent = document.getElementById('section-content');
const uploadForm = document.getElementById('uploadForm');
const characterInput = document.getElementById('characterInput');
const fileName = document.getElementById('fileName');

// --- Modular App Initialization ---

// Global app state object
const appState = {
  isLoggedIn: false,
  username: null,
  characterData: null,
  tabItems: [],
  pendingJobs: [],
};

function buildTabItems(data) {
  console.log('Building tab items from data:', data);
  const summaryFields = {};
  Object.entries(data).forEach(([k, v]) => {
    if (typeof v !== 'object' || v === null) summaryFields[k] = v;
  });
  const items = [];
  if (Object.keys(summaryFields).length) {
    items.push({ label: 'Character', key: 'character', icon: 'person', content: summaryFields });
  }
  Object.entries(data).forEach(([k, v]) => {
    if (typeof v === 'object' && v !== null) {
      let icon = 'list';
      let label = k.charAt(0).toUpperCase() + k.slice(1);
      // Insert space before capital letters (except first letter)
      label = label.replace(/([a-z])([A-Z])/g, '$1 $2');
      if (/attr/i.test(k)) icon = 'tune';
      if (/skill/i.test(k)) icon = 'school';
      if (/limit/i.test(k)) icon = 'speed';
      items.push({ label, key: k, icon, content: v });
    }
  });
  // Add Karma & Nuyen section to navigationf
  items.push({ label: 'Karma & Nuyen', key: 'karmaNuyen', icon: 'savings', content: null });
  items.push({ label: 'Upload', key: 'upload', icon: 'upload', content: null });
  items.push({ label: 'Login', key: 'login', icon: 'logout', content: null });
  return items;
}

function showTab(key) {
  console.log('Showing tab:', key);
  sectionContent.innerHTML = '';
  appState.tabItems.forEach(item => {
    const tab = Array.from(document.querySelectorAll('#mdTabs md-primary-tab')).find(t => t.getAttribute('label') === item.label);
    if (tab) tab.selected = (item.key === key);
  });
  if (key === 'upload') {
    uploadForm.style.display = '';
    sectionContent.innerHTML = '';
    return;
  }
  uploadForm.style.display = 'none';
  if (key === 'character') {
    const title = document.createElement('h2');
    title.textContent = 'Character';
    sectionContent.appendChild(title);
    Object.entries(appState.characterData).forEach(([k, v]) => {
      if (typeof v !== 'object' || v === null) {
        const row = document.createElement('div');
        row.innerHTML = `<span class='json-label'>${k}:</span> <span class='json-value'>${v}</span>`;
        sectionContent.appendChild(row);
      }
    });
    return;
  }
  let myRenderedContent = ["attributes", "skills", "limits", "spells", "complexForms", "spirits", "sprites", "gear","conditionMonitor","initiationGrades"].includes(key);
  console.log(`Rendering content for key: ${key}, myRenderedContent: ${myRenderedContent}`);
  if (myRenderedContent) {
    console.log(`Rendering custom content for key: ${key}`);
    console.log('Current character data:', appState.characterData);
    console.log('Current appState:', appState);
    renderCharacterTab(sectionContent, key, appState.characterData);
    return;
  }
  
  if (key === 'karmaNuyen') {
    const title = document.createElement('h2');
    title.textContent = 'Karma & Nuyen';
    sectionContent.appendChild(title);
    // Warning for positive values only
    const warn = document.createElement('div');
    warn.style.color = 'var(--md-sys-color-warning, #b26a00)';
    warn.style.marginBottom = '0.5em';
    warn.style.fontWeight = 'bold';
    warn.innerHTML = "Please only enter positive values for Karma or Nuyen.<br>You can run downtime on your own time!";
    sectionContent.appendChild(warn);
    // Display current values
    const valuesDiv = document.createElement('div');
    valuesDiv.style.display = 'flex';
    valuesDiv.style.gap = '2em';
    valuesDiv.style.marginBottom = '1.5em';
    valuesDiv.innerHTML = `<span><strong>Karma:</strong> ${appState.characterData.karma ?? '—'}</span><span><strong>Nuyen:</strong> ${appState.characterData.nuyen ?? '—'}</span>`;
    sectionContent.appendChild(valuesDiv);
    // Add Job form
    const form = document.createElement('form');
    form.className = 'add-job-form';
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.gap = '1em';
    form.innerHTML = `
      <md-outlined-text-field label="Karma Earned" type="number" name="karma" min="0"></md-outlined-text-field>
      <md-outlined-text-field label="Nuyen Earned" type="number" name="nuyen" min="0" step="0.01"></md-outlined-text-field>
      <md-outlined-text-field label="Description/Comment" name="comment" maxlength="200"></md-outlined-text-field>
      <md-filled-button type="submit">Add Job</md-filled-button>
    `;
    sectionContent.appendChild(form);
    // List of pending jobs
    const jobsList = document.createElement('ul');
    jobsList.className = 'pending-jobs-list';
    sectionContent.appendChild(jobsList);
    function renderJobsList() {
      jobsList.innerHTML = '';
      appState.pendingJobs.forEach((job, idx) => {
        const li = document.createElement('li');
        li.textContent = `+${job.karma} Karma, +${job.nuyen} Nuyen: ${job.comment}`;
        jobsList.appendChild(li);
      });
    }
    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const karma = formData.get('karma');
      const nuyen = formData.get('nuyen');
      const comment = formData.get('comment');
      if (!karma && !nuyen) return;
      appState.pendingJobs.push({ karma, nuyen, comment });
      renderJobsList();
      form.reset();
    });
    renderJobsList();
    // Upload original XML and download updated XML
    const uploadDiv = document.createElement('div');
    uploadDiv.style.marginTop = '2em';
    uploadDiv.innerHTML = `
      <label style="font-weight:bold;">Re-upload your original XML to apply jobs and download updated file:</label><br>
      <input type="file" id="xmlReupload" accept=".xml,.chum5,.chum,.chummer" />
      <md-filled-button id="applyJobsBtn">Apply Jobs & Download</md-filled-button>
      <span id="jobStatusMsg" style="margin-left:1em;color:var(--md-sys-color-primary)"></span>
    `;
    sectionContent.appendChild(uploadDiv);
    const xmlInput = uploadDiv.querySelector('#xmlReupload');
    const applyBtn = uploadDiv.querySelector('#applyJobsBtn');
    const statusMsg = uploadDiv.querySelector('#jobStatusMsg');
    applyBtn.addEventListener('click', async () => {
      if (!xmlInput.files.length || !appState.pendingJobs.length) {
        statusMsg.textContent = 'Please select a file and add at least one job.';
        return;
      }
      statusMsg.textContent = 'Processing...';
      // For each job, send a request to /append-job and chain the result
      let file = xmlInput.files[0];
      let fileBlob = file;
      let lastResp = null;
      for (const job of appState.pendingJobs) {
        const formData = new FormData();
        formData.append('character', fileBlob, file.name);
        formData.append('karmaEarned', job.karma);
        formData.append('nuyenEarned', job.nuyen);
        formData.append('comment', job.comment);
        const resp = await fetchWithSessionRetry('/append-job', { method: 'POST', body: formData });
        lastResp = resp;
        if (!resp.ok) {
          statusMsg.textContent = 'Error updating XML.';
          return;
        }
        fileBlob = await resp.blob();
      }
      // Download the final file
      const url = URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.href = url;
      // Use filename from Content-Disposition header if available
      let filename = 'updated_character.xml';
      if (lastResp) {
        const disposition = lastResp.headers.get('Content-Disposition');
        if (disposition && disposition.includes('filename=')) {
          const match = disposition.match(/filename="?([^";]+)"?/);
          if (match && match[1]) filename = match[1];
        }
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      statusMsg.textContent = 'Download ready!';
      appState.pendingJobs = [];
      renderJobsList();
    });
    return;
  }
  
  if (key === 'login') {
    sectionContent.innerHTML = '';
    const loginArea = document.createElement('div');
    loginArea.id = 'login-area';
    loginArea.style.maxWidth = '400px';
    loginArea.style.margin = '3em auto';
    loginArea.style.padding = '2em';
    loginArea.style.background = 'var(--md-sys-color-surface, #222)';
    loginArea.style.borderRadius = '16px';
    loginArea.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)';
    loginArea.innerHTML = `
      <h2 style="color:var(--md-sys-color-on-surface,#fff);">Log In</h2>
      <form id="login-form" style="display:flex;flex-direction:column;gap:1em;">
        <input type="text" id="username" placeholder="Username" required style="padding:0.75em;font-size:1.1em;border-radius:8px;border:1px solid var(--md-sys-color-outline,#444);background:var(--md-sys-color-surface,#222);color:var(--md-sys-color-on-surface,#fff);">
        <input type="password" id="password" placeholder="Password" required style="padding:0.75em;font-size:1.1em;border-radius:8px;border:1px solid var(--md-sys-color-outline,#444);background:var(--md-sys-color-surface,#222);color:var(--md-sys-color-on-surface,#fff);">
        <button type="submit" id="login-btn" style="padding:0.75em;font-size:1.1em;border-radius:8px;background:var(--md-sys-color-primary,#4a90e2);color:var(--md-sys-color-on-primary,#fff);border:none;cursor:pointer;">Log In</button>
      </form>
      <button id="logout-btn" style="display:none;margin-top:1em;padding:0.75em;font-size:1.1em;border-radius:8px;background:var(--md-sys-color-error,#e24a4a);color:var(--md-sys-color-on-error,#fff);border:none;cursor:pointer;">Log Out</button>
      <div id="login-message" style="color:var(--md-sys-color-warning,#ffb);margin-top:1em;"></div>
    `;
    sectionContent.appendChild(loginArea);
    // Login logic
    function setLoggedIn(loggedIn, username) {
      loginArea.querySelector('#login-form').style.display = loggedIn ? 'none' : '';
      loginArea.querySelector('#logout-btn').style.display = loggedIn ? '' : 'none';
      loginArea.querySelector('#login-message').textContent = loggedIn ? `Logged in as ${username}` : '';
    }
    loginArea.querySelector('#login-form').onsubmit = async function(e) {
      e.preventDefault();
      const username = loginArea.querySelector('#username').value;
      const password = loginArea.querySelector('#password').value;
      const res = await fetchWithSessionRetry('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
          console.log('Login successful:', data);
        setLoggedIn(true, username);
        appState.isLoggedIn = true;
        appState.username = username;
      } else {
          console.error('Login failed:', data);
        loginArea.querySelector('#login-message').textContent = data.error || 'Login failed';
      }
    };
    loginArea.querySelector('#logout-btn').onclick = async function() {
      await fetchWithSessionRetry('/api/logout', { method: 'POST' });
      setLoggedIn(false);
      appState.isLoggedIn = false;
      appState.username = null;
    };
    setLoggedIn(false);
    return;
  }
  const title = document.createElement('h2');
  title.textContent = key.charAt(0).toUpperCase() + key.slice(1);
  sectionContent.appendChild(title);
  const pre = document.createElement('pre');
  pre.textContent = JSON.stringify(appState.characterData[key], null, 2);
  sectionContent.appendChild(pre);
}



function displayCharacter(appState) {
  //renderCharacterSummary(sectionContent, characterData);
  showTabswithData(appState);
  // Optionally render groups, tabs, etc.
}

function showTabswithData(appState) {
  console.log('Showing tabs with data:', appState.characterData);
  appState.tabItems = buildTabItems(appState.characterData);
  let defaultTab = appState.tabItems.find(item => item.key === 'character') || appState.find(item => item.key === 'upload') || appState.tabItems[0];
  renderAdaptiveNavigation({ items: appState.tabItems, selectedKey: defaultTab.key, onTabSelect: showTab });
  showTab(defaultTab.key);
  console.log('Tabs rendered with items:', appState.tabItems);
}

function showUploadError(err) {
  sectionContent.innerHTML = `<div style="color:#e74c3c">Upload failed: ${err.message || err}</div>`;
}

// // Helper: fetch with session retry (basic version)
// async function fetchWithSessionRetry(url, options = {}) {
//   try {
//     const res = await fetch(url, options);
//     // If session expired, try to clear cookie and retry once
//     if (res.status === 401) {
//       document.cookie = 'connect.sid=; Max-Age=0; path=/;';
//       return fetch(url, options);
//     }
//     return res;
//   } catch (err) {
//     throw err;
//   }
// }

// Replace upload form submit logic:
// uploadForm.addEventListener('submit', async (e) => {
//   e.preventDefault();
//   const file = characterInput.files[0];
//   if (!file) {
//     sectionContent.innerHTML = '<div style="color:#e74c3c">Please select a file to upload.</div>';
//     return;
//   }
//   await handleUpload(file);
// });

characterInput.addEventListener('change', () => {
  fileName.textContent = characterInput.files.length ? characterInput.files[0].name : '';
  console.log('File selected:', fileName.textContent);
});

// On load, hide tabs and show upload
window.addEventListener('DOMContentLoaded', () => {
  console.log('[app.js] DOMContentLoaded event fired');
  
  let tabBar = document.getElementById('mdTabs');
  //if (tabBar) tabBar.style.display = 'none';
  //uploadForm.style.display = '';
  //console.log('[app.js] Upload form shown, tabs hidden');
  // Build default nav items if not present
  if (!appState.tabItems || appState.tabItems.length === 0) {
    console.log('[app.js] No tabItems found, initializing default navigation items');
    appState.tabItems = [
      { label: 'Upload', key: 'upload', icon: 'upload', content: null },
      { label: 'Login', key: 'login', icon: 'logout', content: null }
    ];
  } else {
    console.log('[app.js] tabItems already present:', appState.tabItems);
  }
  // --- INJECT NAVIGATION INTO MWC-LIST ---
  const drawerList = document.getElementById('drawerList');
  if (drawerList) {
    drawerList.innerHTML = '';
    appState.tabItems.forEach(item => {
      const mwcItem = document.createElement('mwc-list-item');
      mwcItem.setAttribute('graphic', 'icon');
      mwcItem.setAttribute('tabindex', '0');
      mwcItem.innerHTML = `<span class="material-icons" slot="graphic">${item.icon}</span>${item.label}`;
      mwcItem.addEventListener('click', () => showTab(item.key));
      drawerList.appendChild(mwcItem);
    });
    console.log('[app.js] Navigation injected into <mwc-list>:', appState.tabItems);
  } else {
    console.warn('[app.js] <mwc-list id="drawerList"> not found!');
  }
  renderAdaptiveNavigation({ items: appState.tabItems, selectedKey: 'upload', onTabSelect: showTab });
  initUploadForm({ sectionContent, characterInput, fileName, onUpload: (characterData) => {
    console.log('[app.js] Character uploaded:', characterData);
    console.log('current appState:', appState);
    appState.characterData = characterData;
    displayCharacter(appState);
  }});
  // --- END INJECT ---
  // Optionally, show the default tab
  showTab('upload');
});

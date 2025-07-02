// navigation.js: Handles adaptive navigation and tab switching
console.log('[navigation.js] Loaded');
import { renderCharacterTab } from './characterDisplay.js';



export function renderAdaptiveNavigation({ items, selectedKey, onTabSelect }) {
  console.log('[navigation.js] renderAdaptiveNavigation called');
  console.log('[navigation.js] Items:', items);
  const main_navigation = document.querySelectorAll('mdui-navigation-rail')[0];
  main_navigation.innerHTML = ''; // Clear existing items

  items.forEach((item) => {
    // <mdui-navigation-rail-item  icon="upload--outlined" value="recent">Upload</mdui-navigation-rail-item>
    console.log(`[navigation.js] Processing item: ${item.label} (${item.key})`);
    const button = document.createElement('mdui-navigation-rail-item');
    button.setAttribute('icon', item.icon);
    button.setAttribute('value', item.key);
    button.textContent = item.label;
    button.addEventListener('click', () => onTabSelect(item.key));
    main_navigation.appendChild(button);
  });  
}

export function buildTabItems(data) {
  console.log('Building tab items from data:', data);
  const summaryFields = {};
  const items = [];
  items.push({ label: 'Upload', key: 'upload', icon: 'upload', content: null });

  // Only loop if data is a non-null object
  Object.entries(data || {}).forEach(([k, v]) => {
    if (typeof v !== 'object' || v === null) summaryFields[k] = v;
  });

  if (Object.keys(summaryFields).length) {
    items.push({ label: 'Character', key: 'character', icon: 'person', content: summaryFields });
  }

  Object.entries(data || {}).forEach(([k, v]) => {
    if (typeof v === 'object' && v !== null) {
      let icon = 'list';
      let label = k.charAt(0).toUpperCase() + k.slice(1);
      label = label.replace(/([a-z])([A-Z])/g, '$1 $2');
      if (/attr/i.test(k)) icon = 'tune';
      if (/skill/i.test(k)) icon = 'school';
      if (/limit/i.test(k)) icon = 'speed';
      items.push({ label, key: k, icon, content: v });
    }
  });

  items.push({ label: 'Karma & Nuyen', key: 'karmaNuyen', icon: 'savings', content: null });
  return items;
}

export function showTab(key) {
  let sectionContent = document.querySelectorAll('mdui-layout-main')[0];
  console.log('Showing tab:', key);
  sectionContent.innerHTML = '';
  // tabItems.forEach(item => {
  //   const tab = Array.from(document.querySelectorAll('#mdTabs md-primary-tab')).find(t => t.getAttribute('label') === item.label);
  //   if (tab) tab.selected = (item.key === key);
  // });
  if (key === 'upload') {

    renderUploadTab(sectionContent);
    initEventListenerUpload();
    initEventListenerCharacterInput();
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
    warn.textContent = 'Please only enter positive values for Karma or Nuyen. You can run downtime on your own time!';
    sectionContent.appendChild(warn);
    // Display current values
    const valuesDiv = document.createElement('div');
    valuesDiv.style.display = 'flex';
    valuesDiv.style.gap = '2em';
    valuesDiv.style.marginBottom = '1.5em';
    valuesDiv.innerHTML = `<span><strong>Karma:</strong> ${characterData.karma ?? '—'}</span><span><strong>Nuyen:</strong> ${characterData.nuyen ?? '—'}</span>`;
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
      pendingJobs.forEach((job, idx) => {
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
      pendingJobs.push({ karma, nuyen, comment });
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
      if (!xmlInput.files.length || !pendingJobs.length) {
        statusMsg.textContent = 'Please select a file and add at least one job.';
        return;
      }
      statusMsg.textContent = 'Processing...';
      // For each job, send a request to /append-job and chain the result
      let file = xmlInput.files[0];
      let fileBlob = file;
      let lastResp = null;
      for (const job of pendingJobs) {
        const formData = new FormData();
        formData.append('character', fileBlob, file.name);
        formData.append('karmaEarned', job.karma);
        formData.append('nuyenEarned', job.nuyen);
        formData.append('comment', job.comment);
        const resp = await fetch('/append-job', { method: 'POST', body: formData });
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
      pendingJobs = [];
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
    // Check DB health and hide login if DB is down
    async function checkDbAndMaybeHideLogin() {
      try {
        const res = await fetch('/api/db-health');
        if (!res.ok) throw new Error('DB down');
        // DB is up, do nothing
      } catch (e) {
        // Hide login area if present
        const loginArea = document.getElementById('login-area');
        if (loginArea) {
          loginArea.innerHTML = '<div style="color:#ffb;background:#222;padding:2em;border-radius:12px;text-align:center;">Database unavailable. Please try again later.</div>';
        }
        // Optionally hide login tab/menu if you want
        // document.querySelector('[data-key="login"]').style.display = 'none';
      }
    }
    setTimeout(checkDbAndMaybeHideLogin, 0);

    return;
  }
  uploadForm.style.display = 'none';

    renderCharacterTab(sectionContent,key,appState.characterData);
    return;

}

function initEventListenerUpload(){
  console.log('Initializing upload event listener for uploadForm');
  uploadForm = document.getElementById('uploadForm');
  uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  var uploadForm = document.getElementById('uploadForm');
  console.log('Upload form:', uploadForm);
  var characterInput = document.getElementById('characterInput');
  
  console.log('Upload form submitted');
  const formData = new FormData(uploadForm);
  const file = characterInput.files[0];
  if (!file) {
    sectionContent.innerHTML = '<div style="color:#e74c3c">Please select a file to upload.</div>';
    return;
  }
  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData
    });
    console.log('Upload response:', response);
    if (!response.ok) {
      sectionContent.innerHTML = '<div style="color:#e74c3c">Upload failed.</div>';
      return;
    }
    appState.characterData = await response.json();
    console.log('Received characterData:', appState.characterData);
    let tabItems = buildTabItems(appState.characterData);
    console.log('Tab items built:', tabItems);
    // Prefer 'Character' tab if present, else first non-upload tab
    let defaultTab = tabItems.find(t => t.key === 'character') || tabItems.find(t => t.key !== 'upload');
    renderAdaptiveNavigation({ items: tabItems, selectedKey: defaultTab.key, onTabSelect: showTab });
    showTab(defaultTab.key);
  } catch (err) {
    console.error('Network or server error:', err);
    sectionContent.innerHTML = '<div style="color:#e74c3c">Network or server error.</div>';
  }
});
}

function initEventListenerCharacterInput() {

  console.log('Initializing character input event listener');
  let characterInput = document.getElementById('characterInput');
  //let fileName = document.getElementById('fileName');
  characterInput.addEventListener('change', () => {
  //fileName.textContent = characterInput.files.length ? characterInput.files[0].name : '';
  console.log('File selected:', characterInput.files[0].name);
});
}
function renderUploadTab(sectionContent) {

        // <form id="uploadForm" method="POST" action="/upload" enctype="multipart/form-data" style="display:flex;flex-direction:column;gap:1.5em;margin-bottom:2em;">
        //   <label for="characterInput" style="font-weight:500;color:var(--md-sys-color-primary);cursor:pointer;">Choose file:</label>
        //   <input type="file" name="character" accept=".chum5,.xml" required id="characterInput" class="material-file-input" />
        //   <!-- <span id="fileName" style="color:var(--md-sys-color-on-surface);font-size:1em;"></span> -->
        //   <mdui-button type="submit">Upload</mdui-button>
        // </form>

  const form = document.createElement('form');
  form.id = 'uploadForm';
  form.method = 'POST';
  form.action = '/upload';
  form.enctype = 'multipart/form-data';
  form.style.display = 'flex';
  form.style.flexDirection = 'column';
  form.style.gap = '1.5em';
  form.style.marginBottom = '2em';
  const label = document.createElement('label');
  label.setAttribute('for', 'characterInput');
  label.style.fontWeight = '500';
  label.style.color = 'var(--md-sys-color-primary, #6750a4)';
  label.style.cursor = 'pointer';
  label.textContent = 'Choose file:';
  form.appendChild(label);
  const input = document.createElement('input');
  input.type = 'file';
  input.name = 'character';
  input.accept = '.chum5,.xml';
  input.required = true;
  input.id = 'characterInput';
  input.className = 'material-file-input';
  form.appendChild(input);
  // const fileNameSpan = document.createElement('span');
  // fileNameSpan.id = 'fileName';
  // fileNameSpan.style.color = 'var(--md-sys-color-on-surface, #494949)';
  // fileNameSpan.style.fontSize = '1em';
  // form.appendChild(fileNameSpan);
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Upload';
  form.appendChild(submitButton);
  sectionContent.appendChild(form);
}
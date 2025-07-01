import 'https://unpkg.com/@material/web/all.js?module';
import { initUploadForm } from './upload.js';
import { renderAdaptiveNavigation } from './navigation.js';
import { renderSpells, renderComplexForms } from './renderers.js';
import { skillAttributeMap } from './skillAttributeMap.js';
import { spellDescriptions, complexFormDescriptions } from './spellDescriptions.js';

const sectionContent = document.getElementById('section-content');
const uploadForm = document.getElementById('uploadForm');
const characterInput = document.getElementById('characterInput');
const fileName = document.getElementById('fileName');

// --- Modular App Initialization ---

// State
let characterData = null;
let tabItems = [];
let pendingJobs = [];

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
  // Add Karma & Nuyen section to navigation
  items.push({ label: 'Karma & Nuyen', key: 'karmaNuyen', icon: 'savings', content: null });
  items.push({ label: 'Upload', key: 'upload', icon: 'upload', content: null });
  
  return items;
}

function showTab(key) {
  console.log('Showing tab:', key);
  sectionContent.innerHTML = '';
  tabItems.forEach(item => {
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
    Object.entries(characterData).forEach(([k, v]) => {
      if (typeof v !== 'object' || v === null) {
        const row = document.createElement('div');
        row.innerHTML = `<span class='json-label'>${k}:</span> <span class='json-value'>${v}</span>`;
        sectionContent.appendChild(row);
      }
    });
    return;
  }
  if (key === 'attributes') {
    const title = document.createElement('h2');
    title.textContent = 'Attributes';
    sectionContent.appendChild(title);
    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '1em';
    (characterData[key] || []).forEach(attr => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '1em';
      // Compute complete value
      let base = attr.totalvalue || 0;
      let adeptMod = attr.adeptMod || 0;
      let complete = base + adeptMod;
      // Attribute name
      const nameSpan = document.createElement('span');
      nameSpan.textContent = attr.name;
      nameSpan.style.fontWeight = 'bold';
      nameSpan.style.minWidth = '6em';
      // Complete value (add asterisk if different from base)
      let valueText = complete;
      if (complete !== base) valueText += ' *';
      const valueSpan = document.createElement('span');
      valueSpan.textContent = valueText;
      valueSpan.style.fontSize = '1.2em';
      valueSpan.style.fontWeight = 'bold';
      row.appendChild(nameSpan);
      row.appendChild(valueSpan);
      list.appendChild(row);
    });
    sectionContent.appendChild(list);
    return;
  }
  if (key === 'skills') {
    const title = document.createElement('h2');
    title.textContent = 'Skills';
    sectionContent.appendChild(title);
    // Toggles
    const togglesDiv = document.createElement('div');
    togglesDiv.style.display = 'flex';
    togglesDiv.style.gap = '2em';
    togglesDiv.style.marginBottom = '1em';
    // Show/hide 0-value skills
    const showZeroToggle = document.createElement('label');
    showZeroToggle.style.cursor = 'pointer';
    const showZeroCheckbox = document.createElement('input');
    showZeroCheckbox.type = 'checkbox';
    showZeroCheckbox.checked = false;
    showZeroToggle.appendChild(showZeroCheckbox);
    showZeroToggle.appendChild(document.createTextNode(' Show 0-value skills'));
    togglesDiv.appendChild(showZeroToggle);
    // Sort toggle
    const sortToggle = document.createElement('label');
    sortToggle.style.cursor = 'pointer';
    const sortCheckbox = document.createElement('input');
    sortCheckbox.type = 'checkbox';
    sortCheckbox.checked = false;
    sortToggle.appendChild(sortCheckbox);
    sortToggle.appendChild(document.createTextNode(' Sort by dice pool'));
    togglesDiv.appendChild(sortToggle);
    sectionContent.appendChild(togglesDiv);
    // Render skills list
    function renderSkillsList() {
      let skills = (characterData[key] || []).slice();
      // Hide 0-value skills unless toggled
      if (!showZeroCheckbox.checked) {
        skills = skills.filter(skill => {
          const group = skill.skillGroupTotal || 0;
          const base = skill.base || 0;
          const karma = skill.karma || 0;
          return group > 0 || base + karma > 0;
        });
      }
      // Compute dice pool for each skill
      skills.forEach(skill => {
        // Find associated attribute using skillAttributeMap
        const attrName = skillAttributeMap[skill.name] || skill.linkedAttributeName || skill.linkedAttribute || 'Attribute';
        const attrObj = (characterData.attributes || []).find(a => a.name === attrName);
        const attrVal = attrObj ? Number(attrObj.totalvalue || 0) : 0;
        // Skill value: group or base+karma
        let skillVal = 0;
        if (Number(skill.skillGroupTotal) > 0) {
          skillVal = Number(skill.skillGroupTotal);
        } else {
          skillVal = Number(skill.base || 0) + Number(skill.karma || 0);
        }
        // Add adeptMod and skillsoftMod if present (for skills only)
        skillVal += Number(skill.adeptMod || 0) + Number(skill.skillsoftMod || 0);
        // Dice pool = skill value + attribute value
        skill._dicePool = skillVal + attrVal;
        skill._attrName = attrName;
      });
      // Sort
      if (sortCheckbox.checked) {
        skills.sort((a, b) => b._dicePool - a._dicePool || a.name.localeCompare(b.name));
      } else {
        skills.sort((a, b) => a.name.localeCompare(b.name));
      }
      // Render
      const list = document.createElement('div');
      list.style.display = 'flex';
      list.style.flexDirection = 'column';
      list.style.gap = '0.5em';
      skills.forEach(skill => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '1em';
        const nameSpan = document.createElement('span');
        nameSpan.textContent = skill.name;
        nameSpan.style.fontWeight = 'bold';
        nameSpan.style.minWidth = '10em';
        // Attribute label
        const attrSpan = document.createElement('span');
        attrSpan.textContent = `(${skill._attrName})`;
        attrSpan.style.fontSize = '0.95em';
        attrSpan.style.color = 'var(--md-sys-color-secondary, #b0b0b0)';
        attrSpan.style.marginRight = '0.5em';
        // Dice pool
        const dicePoolSpan = document.createElement('span');
        dicePoolSpan.textContent = skill._dicePool;
        dicePoolSpan.style.fontWeight = 'bold';
        dicePoolSpan.style.fontSize = '1.1em';
        row.appendChild(nameSpan);
        row.appendChild(attrSpan);
        row.appendChild(dicePoolSpan);
        list.appendChild(row);
      });
      // Replace old list
      const oldList = sectionContent.querySelector('.skills-list');
      if (oldList) oldList.remove();
      list.className = 'skills-list';
      sectionContent.appendChild(list);
    }
    showZeroCheckbox.addEventListener('change', renderSkillsList);
    sortCheckbox.addEventListener('change', renderSkillsList);
    renderSkillsList();
    return;
  }
  if (key === 'limits') {
    const limits = characterData[key] || {};
    const limitNames = Object.keys(limits);
    const title = document.createElement('h2');
    title.textContent = 'Limits';
    sectionContent.appendChild(title);
    limitNames.forEach(lim => {
      const limData = limits[lim];
      const limSection = document.createElement('section');
      limSection.style.marginBottom = '2em';
      // Find highest modifier value (absolute)
      let maxMod = 0;
      if (Array.isArray(limData.modifiers) && limData.modifiers.length > 0) {
        maxMod = Math.max(...limData.modifiers.map(m => Math.abs(Number(m.value) || 0)));
      }
      // Compute base total (minus highest modifier)
      const baseTotal = limData.total - maxMod;
      // Limit header
      const limHeader = document.createElement('div');
      limHeader.style.fontWeight = 'bold';
      limHeader.style.fontSize = '1.2em';
      limHeader.style.marginBottom = '0.3em';
      limHeader.textContent = `${lim}: ${baseTotal}`;
      limSection.appendChild(limHeader);
      // Modifiers list
      if (Array.isArray(limData.modifiers) && limData.modifiers.length > 0) {
        const modList = document.createElement('ul');
        modList.style.marginLeft = '1.5em';
        modList.style.marginTop = '0.2em';
        limData.modifiers.forEach(mod => {
          const modItem = document.createElement('li');
          const val = Number(mod.value) || 0;
          const sign = val > 0 ? '+' : val < 0 ? '-' : '';
          const absVal = Math.abs(val);
          let modText = `${sign}${absVal}`;
          if (mod.source && mod.source.trim()) {
            modText += ` (${mod.source}`;
            if (mod.condition && mod.condition.trim()) {
              modText += `, ${mod.condition}`;
            }
            modText += ')';
          } else if (mod.condition && mod.condition.trim()) {
            modText += ` (${mod.condition})`;
          }
          modItem.textContent = modText;
          modList.appendChild(modItem);
        });
        limSection.appendChild(modList);
      }
      sectionContent.appendChild(limSection);
    });
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
  if (key.toLowerCase().replace(/\s/g, '') === 'spells') {
    renderSpells({ spells: characterData[key] || [], spellDescriptions, sectionContent });
    return;
  }
  if (key.toLowerCase().replace(/\s/g, '') === 'complexforms') {
    renderComplexForms({ forms: characterData[key] || [], complexFormDescriptions, sectionContent });
    return;
  }
  const title = document.createElement('h2');
  title.textContent = key.charAt(0).toUpperCase() + key.slice(1);
  sectionContent.appendChild(title);
  const pre = document.createElement('pre');
  pre.textContent = JSON.stringify(characterData[key], null, 2);
  sectionContent.appendChild(pre);
}

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
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
    characterData = await response.json();
    console.log('Received characterData:', characterData);
    tabItems = buildTabItems(characterData);
    // Prefer 'Character' tab if present, else first non-upload tab
    let defaultTab = tabItems.find(t => t.key === 'character') || tabItems.find(t => t.key !== 'upload');
    renderAdaptiveNavigation({ items: tabItems, selectedKey: defaultTab.key, onTabSelect: showTab });
    showTab(defaultTab.key);
  } catch (err) {
    console.error('Network or server error:', err);
    sectionContent.innerHTML = '<div style="color:#e74c3c">Network or server error.</div>';
  }
});

characterInput.addEventListener('change', () => {
  fileName.textContent = characterInput.files.length ? characterInput.files[0].name : '';
  console.log('File selected:', fileName.textContent);
});

// On load, hide tabs and show upload
window.addEventListener('DOMContentLoaded', () => {
  initUploadForm({ sectionContent, characterInput, fileName, onUpload });
  let tabBar = document.getElementById('mdTabs');
  if (tabBar) tabBar.style.display = 'none';
  uploadForm.style.display = '';
  console.log('DOMContentLoaded: upload form shown, tabs hidden');
});

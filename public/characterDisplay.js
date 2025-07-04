// characterDisplay.js: Handles rendering of character summary and groups, including all group-specific logic
import { renderSpells, renderComplexForms, renderSpirits, renderSprites, renderGear, renderConditionMonitors, renderCyberware,renderBioware,renderVehiclesAndDrones, renderAdeptPowers } from './renderers.js';
import { skillAttributeMap } from './skillAttributeMap.js';
import { spellDescriptions, complexFormDescriptions } from './spellDescriptions.js';

export function renderCharacterSummary(sectionContent, characterData) {
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
}


export function renderCharacterTab(sectionContent, key, characterData, pendingJobs) {
    console.log(`[characterDisplay.js] Rendering section: ${key}`);
  if (key === 'upload' || key === 'uploadCharacter' || key === 'uploadCharacterFile') {
    console.log('[characterDisplay.js] Rendering upload section');
    renderUploadTab(sectionContent);
    return;
  }
  if (key === 'character') {
    renderCharacterSummary(sectionContent, characterData);
    return;
  }
  if (key === 'attributes') {
    console.log('[characterDisplay.js] Rendering attributes section');
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
      let base = attr.totalvalue || 0;
      let adeptMod = attr.adeptMod || 0;
      let complete = base + adeptMod;
      const nameSpan = document.createElement('span');
      nameSpan.textContent = attr.name;
      nameSpan.style.fontWeight = 'bold';
      nameSpan.style.minWidth = '6em';
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
    const togglesDiv = document.createElement('div');
    togglesDiv.style.display = 'flex';
    togglesDiv.style.gap = '2em';
    togglesDiv.style.marginBottom = '1em';
    const showZeroToggle = document.createElement('label');
    showZeroToggle.style.cursor = 'pointer';
    const showZeroCheckbox = document.createElement('input');
    showZeroCheckbox.type = 'checkbox';
    showZeroCheckbox.checked = false;
    showZeroToggle.appendChild(showZeroCheckbox);
    showZeroToggle.appendChild(document.createTextNode(' Show 0-value skills'));
    togglesDiv.appendChild(showZeroToggle);
    const sortToggle = document.createElement('label');
    sortToggle.style.cursor = 'pointer';
    const sortCheckbox = document.createElement('input');
    sortCheckbox.type = 'checkbox';
    sortCheckbox.checked = false;
    sortToggle.appendChild(sortCheckbox);
    sortToggle.appendChild(document.createTextNode(' Sort by dice pool'));
    togglesDiv.appendChild(sortToggle);
    sectionContent.appendChild(togglesDiv);
    function renderSkillsList() {
      let skills = (characterData[key] || []).slice();
      if (!showZeroCheckbox.checked) {
        skills = skills.filter(skill => {
          const group = skill.skillGroupTotal || 0;
          const base = skill.base || 0;
          const karma = skill.karma || 0;
          return group > 0 || base + karma > 0;
        });
      }
      skills.forEach(skill => {
        const attrName = skillAttributeMap[skill.name] || skill.linkedAttributeName || skill.linkedAttribute || 'Attribute';
        const attrObj = (characterData.attributes || []).find(a => a.name === attrName);
        const attrVal = attrObj ? Number(attrObj.totalvalue || 0) : 0;
        let skillVal = 0;
        if (Number(skill.skillGroupTotal) > 0) {
          skillVal = Number(skill.skillGroupTotal);
        } else {
          skillVal = Number(skill.base || 0) + Number(skill.karma || 0);
        }
        skillVal += Number(skill.adeptMod || 0) + Number(skill.skillsoftMod || 0);
        skill._dicePool = skillVal + attrVal;
        skill._attrName = attrName;
      });
      if (sortCheckbox.checked) {
        skills.sort((a, b) => b._dicePool - a._dicePool || a.name.localeCompare(b.name));
      } else {
        skills.sort((a, b) => a.name.localeCompare(b.name));
      }
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
        const attrSpan = document.createElement('span');
        attrSpan.textContent = `(${skill._attrName})`;
        attrSpan.style.fontSize = '0.95em';
        attrSpan.style.color = 'var(--md-sys-color-secondary, #b0b0b0)';
        attrSpan.style.marginRight = '0.5em';
        const dicePoolSpan = document.createElement('span');
        dicePoolSpan.textContent = skill._dicePool;
        dicePoolSpan.style.fontWeight = 'bold';
        dicePoolSpan.style.fontSize = '1.1em';
        row.appendChild(nameSpan);
        row.appendChild(attrSpan);
        row.appendChild(dicePoolSpan);
        list.appendChild(row);
      });
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
      let maxMod = 0;
      if (Array.isArray(limData.modifiers) && limData.modifiers.length > 0) {
        maxMod = Math.max(...limData.modifiers.map(m => Math.abs(Number(m.value) || 0)));
      }
      const baseTotal = limData.total - maxMod;
      const limHeader = document.createElement('div');
      limHeader.style.fontWeight = 'bold';
      limHeader.style.fontSize = '1.2em';
      limHeader.style.marginBottom = '0.3em';
      limHeader.textContent = `${lim}: ${baseTotal}`;
      limSection.appendChild(limHeader);
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
    const warn = document.createElement('div');
    warn.style.color = 'var(--md-sys-color-warning, #b26a00)';
    warn.style.marginBottom = '0.5em';
    warn.style.fontWeight = 'bold';
    warn.textContent = 'Please only enter positive values for Karma or Nuyen. You can run downtime on your own time!';
    sectionContent.appendChild(warn);
    const valuesDiv = document.createElement('div');
    valuesDiv.style.display = 'flex';
    valuesDiv.style.gap = '2em';
    valuesDiv.style.marginBottom = '1.5em';
    valuesDiv.innerHTML = `<span><strong>Karma:</strong> ${characterData.karma ?? '—'}</span><span><strong>Nuyen:</strong> ${characterData.nuyen ?? '—'}</span>`;
    sectionContent.appendChild(valuesDiv);
    const karmaSource = (characterData.karmaSource || []).find(s => s.type === 'total');
    const nuyenSource = (characterData.nuyenSource || []).find(s => s.type === 'total');
    const karmaNuyenSection = document.createElement('div');
    karmaNuyenSection.style.display = 'flex';
    karmaNuyenSection.style.flexDirection = 'column';
    karmaNuyenSection.style.gap = '1em';
    function addSourceRows(sources, isKarma) {
      sources.forEach(source => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.gap = '1em';
        const nameSpan = document.createElement('span');
        nameSpan.style.fontWeight = 'bold';
        nameSpan.style.minWidth = '8em';
        nameSpan.textContent = source.name;
        const valueSpan = document.createElement('span');
        valueSpan.style.fontWeight = 'bold';
        valueSpan.style.fontSize = '1.1em';
        valueSpan.textContent = `${isKarma ? '+' : ''}${source.value}`;
        row.appendChild(nameSpan);
        row.appendChild(valueSpan);
        karmaNuyenSection.appendChild(row);
      });
    }
    if (karmaSource) {
      addSourceRows([karmaSource], true);
    }
    if (nuyenSource) {
      addSourceRows([nuyenSource], false);
    }
    const karmaNuyenOld = characterData.karmaNuyen || {};
    const karmaNuyenKeys = Object.keys(karmaNuyenOld);
    if (karmaNuyenKeys.length > 0) {
      const subheader = document.createElement('div');
      subheader.style.fontWeight = 'bold';
      subheader.style.fontSize = '1.1em';
      subheader.textContent = 'From Karma & Nuyen';
      karmaNuyenSection.appendChild(subheader);
      const totalRow = document.createElement('div');
      totalRow.style.display = 'flex';
      totalRow.style.justifyContent = 'space-between';
      totalRow.style.alignItems = 'center';
      totalRow.style.gap = '1em';
      const totalNameSpan = document.createElement('span');
      totalNameSpan.style.fontWeight = 'bold';
      totalNameSpan.style.minWidth = '8em';
      totalNameSpan.textContent = 'Total';
      const totalValueSpan = document.createElement('span');
      totalValueSpan.style.fontWeight = 'bold';
      totalValueSpan.style.fontSize = '1.1em';
      totalValueSpan.textContent = `${karmaNuyenKeys.reduce((sum, key) => sum + (Number(karmaNuyenOld[key].value) || 0), 0)}`;
      totalRow.appendChild(totalNameSpan);
      totalRow.appendChild(totalValueSpan);
      karmaNuyenSection.appendChild(totalRow);
    }
    sectionContent.appendChild(karmaNuyenSection);
    return;
  }
  if (key.toString().toLowerCase().replace(/\s/g, '') === 'spells') {
    renderSpells({ spells: characterData[key] || [], spellDescriptions, sectionContent });
    return;
  }
  if (key.toString().toLowerCase().replace(/\s/g, '') === 'complexforms') {
    renderComplexForms({ forms: characterData[key] || [], complexFormDescriptions, sectionContent });
    return;
  }
  if (key.toString().toLowerCase().replace(/\s/g, '') === 'spirits') {
    renderSpirits({ spirits: characterData[key] || [], sectionContent });
    return;
  }
  if (key.toString().toLowerCase().replace(/\s/g, '') === 'sprites') {
    renderSprites({ sprites: characterData[key] || [], sectionContent });
    return;
  }
  if (key.toString().toLowerCase().replace(/\s/g, '') === 'gear') {
    renderGear({ gear: characterData[key] || [], sectionContent });
    return;
  }
  if (key.toString().toLowerCase().replace(/\s/g, '') === 'conditionmonitor') {
    console.log('[characterDisplay.js] Rendering condition monitors');
    console.log('[characterDisplay.js] Condition monitors data:', characterData[key]);
    // Call renderConditionMonitors and append its result if present
    const cmNode = renderConditionMonitors({ conditionMonitors: characterData[key] || {}, sectionContent });
    if (cmNode) sectionContent.appendChild(cmNode);
    return;
  }
  if (key.toString().toLowerCase().replace(/\s/g, '') === 'initiationgrades' || key.toString().toLowerCase().replace(/\s/g, '') === 'submersiongrades') {
    console.log('[characterDisplay.js] Rendering initiation grades');
    const title = document.createElement('h2');
    title.textContent = 'Initiation Grades';
    if(characterData.submersionGrades) {
      title.textContent = 'Submersion Grades';
    }
    let initiationGrades = ((characterData.initiationGrades || characterData.submersionGrades )|| []).slice();
    // Sort by ascending grade
    initiationGrades.sort((a, b) => Number(a.grade) - Number(b.grade));
    sectionContent.appendChild(title);
    if (!initiationGrades || initiationGrades.length === 0) {
      const noGrades = document.createElement('div');
      noGrades.textContent = 'No initiation grades';
      sectionContent.appendChild(noGrades);
      return;
    }
    const gradeList = document.createElement('ul');
    initiationGrades.forEach(grade => {
      const gradeItem = document.createElement('li');
      // Collect modifiers
      const modifiers = [];
      if (grade.group === 'True') modifiers.push('Group');
      if (grade.ordeal === 'True') {
        if (grade.res === 'True') 
          {
            modifiers.push('Task');
          } else {
            modifiers.push('Ordeal');
          }
      }
      if (grade.schooling === 'True') modifiers.push('Schooling');
      let text = `Grade ${grade.grade}`;
      if (modifiers.length) text += ` (${modifiers.join(', ')})`;
      gradeItem.textContent = text;
      // Render metamagics as a sub-list
      if (Array.isArray(grade.metamagic) && grade.metamagic.length > 0) {
        const metaList = document.createElement('ul');
        grade.metamagic.forEach(meta => {
          const metaItem = document.createElement('li');
          // Use improvementsource (or fallback to 'Metamagic'), then name
          const source = meta.improvementsource || 'Metamagic';
          const name = meta.name || meta.displayname || '(Unnamed)';
          metaItem.textContent = `${source}: ${name}`;
          metaList.appendChild(metaItem);
        });
        gradeItem.appendChild(metaList);
      }
      gradeList.appendChild(gradeItem);
    });
    sectionContent.appendChild(gradeList);
    return;
  }
  if (key.toString().toLowerCase().replace(/\s/g, '') === 'cyberware') {
    console.log('[characterDisplay.js] Rendering cyberware'); {
      console.log('[characterDisplay.js] Cyberware data:', characterData[key]);
    renderCyberware({ cyberBioWare: characterData[key] || [], sectionContent });

    return;
    }
  }
  //handle bioware
  if (key.toString().toLowerCase().replace(/\s/g, '') === 'bioware') {
    console.log('[characterDisplay.js] Rendering bioware');
    console.log('[characterDisplay.js] Bioware data:', characterData[key]);
    renderBioware({ cyberBioWare: characterData[key] || [], sectionContent });
    return;
  }
  // Handle vehicles and drones
  if (key.toString().toLowerCase().replace(/\s/g, '') === 'vehicles') {
    console.log('[characterDisplay.js] Rendering vehicles and drones');
    const vehiclesAndDrones = characterData[key] || [];
    renderVehiclesAndDrones({ vehiclesAndDrones, sectionContent });
    return;
  }
  if (key.toString().toLowerCase().replace(/\s/g, '') === 'adeptpowers') {
    console.log('[characterDisplay.js] Rendering powers');
    renderAdeptPowers({ adeptPowers: characterData[key] || [], sectionContent });
    return;
  }
  // Default: show as JSON
  const keyStr = (typeof key === 'string') ? key : String(key);
  const title = document.createElement('h2');
  title.textContent = keyStr.charAt(0).toUpperCase() + keyStr.slice(1);
  sectionContent.appendChild(title);
  const pre = document.createElement('pre');
  pre.textContent = JSON.stringify(characterData[key], null, 2);
  sectionContent.appendChild(pre);
}

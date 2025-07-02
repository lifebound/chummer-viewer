// renderers.js: Custom renderers for spells, complex forms, etc.
// Export functions like renderSpells, renderComplexForms, etc.

console.log('[renderers.js] Loaded');

function makeCollapsible(container, nameNode, contentNodes) {
  // Hide all content nodes initially (collapsed)
  let expanded = false;
  contentNodes.forEach(n => {
    n.style.display = 'none';
    n.style.marginTop = '0.7em'; // Add spacing between collapsed/expanded content
  });
  nameNode.style.cursor = 'pointer';
  nameNode.title = 'Click to expand/collapse';
  nameNode.addEventListener('click', () => {
    expanded = !expanded;
    contentNodes.forEach(n => n.style.display = expanded ? '' : 'none');
    nameNode.style.textDecoration = expanded ? 'underline' : '';
  });
}
function makeMDUICritterCard(nameNode,bindingTerm,forceTerm,ServiceTerm,classsName = 'mdui-card') {
  console.log('[renderers.js] makeMDUICard called', { nameNode, bindingTerm });
  // Hide all content nodes initially (collapsed)
  let mduiCard = document.createElement('mdui-card');
  let mduiSwitch = document.createElement('md-switch');
  mduiSwitch.title = bindingTerm;
  mduiCard.textContent = nameNode.name;
  mduiCard.className = classsName

  //mduiCard.appendChild(mduiSwitch);
  // let span1 = document.createElement('span');
  // span1.innerHTML = `<strong>Type:</strong> ${nameNode.type ?? '—'}`;
  // span1.classList = 'card-line';
  // mduiCard.appendChild(span1);
  let span2 = document.createElement('span');
  span2.innerHTML = `<strong>${forceTerm}:</strong> ${nameNode.force ?? '—'}`;
  span2.classList = 'card-line';
  mduiCard.appendChild(span2);
  let span3 = document.createElement('span');
  span3.innerHTML = `<strong>${ServiceTerm}:</strong> ${nameNode.services ?? '—'}`;
  span3.classList = 'card-line';
  mduiCard.appendChild(span3);
  mduiCard.clickable = true;
  return mduiCard;
  // Add MDUi card styles
}
function makeMDUISpellCard(nameNode, typeTerm, rangeTerm, durationTerm, dvTerm, classsName = 'mdui-card') {
  console.log('[renderers.js] makeMDUISpellCard called', { nameNode, typeTerm, rangeTerm, durationTerm, dvTerm });
  // Hide all content nodes initially (
}

export function renderSpells({ spells, spellDescriptions, sectionContent }) {
  console.log('[renderers.js] renderSpells called');
  const title = document.createElement('h2');
  title.textContent = 'Spells';
  sectionContent.appendChild(title);
  if (!Array.isArray(spells) || !spells.length) {
    sectionContent.appendChild(document.createTextNode('No spells found.'));
    return;
  }
  const list = document.createElement('div');
  list.className = 'chummer-list';
  spells.forEach(spell => {
    const spellDiv = document.createElement('div');
    spellDiv.className = 'chummer-card';
    // Name
    const name = document.createElement('div');
    name.className = 'chummer-card-title';
    name.textContent = spell.name || '(Unnamed)';
    spellDiv.appendChild(name);
    // Collapsible content
    const contentNodes = [];
    // Description (only if present in mapping)
    if (spell.name && spellDescriptions[spell.name]) {
      const desc = document.createElement('div');
      desc.textContent = spellDescriptions[spell.name];
      desc.className = 'chummer-card-extra';
      spellDiv.appendChild(desc);
      contentNodes.push(desc);
    }
    // Details row
    const details = document.createElement('div');
    details.className = 'chummer-card-details';
    details.innerHTML =
      `<span><strong>Type:</strong> ${spell.type ?? '—'}</span>` +
      `<span><strong>Range:</strong> ${spell.range ?? '—'}</span>` +
      `<span><strong>Duration:</strong> ${spell.duration ?? '—'}</span>` +
      `<span><strong>Drain Value:</strong> ${spell.dv ?? '—'}</span>`;
    spellDiv.appendChild(details);
    contentNodes.push(details);
    // Extra (only if present)
    if (spell.extra && String(spell.extra).trim()) {
      const extra = document.createElement('div');
      extra.textContent = `Extra: ${spell.extra}`;
      extra.className = 'chummer-card-extra';
      spellDiv.appendChild(extra);
      contentNodes.push(extra);
    }
    // Source and page (smaller text)
    const src = (spell.source ? String(spell.source) : '').trim();
    const page = (spell.page ? String(spell.page) : '').trim();
    if (src || page) {
      const srcPage = document.createElement('div');
      srcPage.className = 'chummer-card-source';
      srcPage.textContent = `${src}${src && page ? ', ' : ''}${page}`;
      spellDiv.appendChild(srcPage);
      contentNodes.push(srcPage);
    }
    makeCollapsible(spellDiv, name, contentNodes);
    list.appendChild(spellDiv);
  });
  sectionContent.appendChild(list);
}

export function renderComplexForms({ forms, complexFormDescriptions, sectionContent }) {
  const title = document.createElement('h2');
  title.textContent = 'Complex Forms';
  sectionContent.appendChild(title);
  if (!Array.isArray(forms) || !forms.length) {
    sectionContent.appendChild(document.createTextNode('No complex forms found.'));
    return;
  }
  const list = document.createElement('div');
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = '1.5em';
  forms.forEach(form => {
    const formDiv = document.createElement('div');
    formDiv.className = 'chummer-card';
    // Name
    const name = document.createElement('div');
    name.className = 'chummer-card-title';
    name.textContent = form.name || '(Unnamed)';
    formDiv.appendChild(name);
    // Collapsible content
    const contentNodes = [];
    // Description (only if present in mapping)
    if (form.name && complexFormDescriptions[form.name]) {
      const desc = document.createElement('div');
      desc.textContent = complexFormDescriptions[form.name];
      desc.className = 'chummer-card-extra';
      formDiv.appendChild(desc);
      contentNodes.push(desc);
    }
    // Details row
    const details = document.createElement('div');
    details.className = 'chummer-card-details';
    details.innerHTML =
      `<span><strong>Target:</strong> ${form.target ?? '—'}</span>` +
      `<span><strong>Duration:</strong> ${form.duration ?? '—'}</span>` +
      `<span><strong>Fading Value:</strong> ${form.fv ?? '—'}</span>`;
    formDiv.appendChild(details);
    contentNodes.push(details);
    // Extra (only if present)
    if (form.extra && String(form.extra).trim()) {
      const extra = document.createElement('div');
      extra.textContent = `Extra: ${form.extra}`;
      extra.className = 'chummer-card-extra';
      formDiv.appendChild(extra);
      contentNodes.push(extra);
    }
    // Source and page (smaller text)
    const src = (form.source ? String(form.source) : '').trim();
    const page = (form.page ? String(form.page) : '').trim();
    if (src || page) {
      const srcPage = document.createElement('div');
      srcPage.className = 'chummer-card-source';
      srcPage.textContent = `${src}${src && page ? ', ' : ''}${page}`;
      formDiv.appendChild(srcPage);
      contentNodes.push(srcPage);
    }
    makeCollapsible(formDiv, name, contentNodes);
    list.appendChild(formDiv);
  });
  sectionContent.appendChild(list);
}

export function renderSpirits({ spirits, sectionContent }) {
  console.log('[renderers.js] renderSpirits called');
  const title = document.createElement('h2');
  title.textContent = 'Spirits';
  sectionContent.appendChild(title);
  if (!Array.isArray(spirits) || !spirits.length) {
    sectionContent.appendChild(document.createTextNode('No spirits found.'));
    return;
  }
  spirits.forEach(spirit => {
    console.log(`[renderers.js] Processing spirit: ${spirit.name || '(Unnamed)'}`);
    const spiritCard = makeMDUICritterCard(spirit,'Bound','Force','Services');
    sectionContent.appendChild(spiritCard);
  });
  return;


}
export function OLDrenderSpirits({ spirits, sectionContent }) {
  const title = document.createElement('h2');
  title.textContent = 'Spirits';
  sectionContent.appendChild(title);
  if (!Array.isArray(spirits) || !spirits.length) {
    sectionContent.appendChild(document.createTextNode('No spirits found.'));
    return;
  }
  const list = document.createElement('div');
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = '1.5em';
  spirits.forEach(spirit => {
    const spiritDiv = document.createElement('div');
    spiritDiv.className = 'chummer-card';
    spiritDiv.style.display = 'flex';
    spiritDiv.style.alignItems = 'center';
    spiritDiv.style.justifyContent = 'space-between';
    // Left: Name and details
    const leftDiv = document.createElement('div');
    leftDiv.style.flex = '1 1 auto';
    // Name row with switch
    const nameRow = document.createElement('div');
    nameRow.className = 'chummer-card-details';
    const name = document.createElement('span');
    name.className = 'chummer-card-title';
    name.textContent = spirit.name || '(Unnamed)';
    nameRow.appendChild(name);
    // Material switch
    const switchLabel = document.createElement('label');
    switchLabel.className = 'chummer-card-switch-label';
    const matSwitch = document.createElement('md-switch');
    matSwitch.selected = !!spirit.bound;
    matSwitch.setAttribute('aria-label', 'Bound');
    switchLabel.appendChild(matSwitch);
    const boundText = document.createElement('span');
    boundText.className = 'chummer-card-switch-text';
    boundText.textContent = matSwitch.selected ? 'Bound' : '';
    switchLabel.appendChild(boundText);
    matSwitch.addEventListener('input', () => {
      boundText.textContent = matSwitch.selected ? 'Bound' : '';
    });
    nameRow.appendChild(switchLabel);
    leftDiv.appendChild(nameRow);
    // Collapsible content
    const contentNodes = [];
    // Details row
    const details = document.createElement('div');
    details.className = 'chummer-card-details';
    details.innerHTML =
      `<span style="min-width:7em; display: inline-block"><strong>Type:</strong> ${spirit.type ?? '—'}</span>` +
      `<span style="min-width:7em; display: inline-block"><strong>Force:</strong> ${spirit.force ?? '—'}</span>` +
      `<span style="min-width:7em; display: inline-block"><strong>Services:</strong> ${spirit.services ?? '—'}</span>`;
    leftDiv.appendChild(details);
    contentNodes.push(details);
    // Powers (if present)
    if (spirit.powers && spirit.powers.length) {
      const powers = document.createElement('div');
      powers.className = 'chummer-card-extra';
      powers.textContent = `Powers: ${spirit.powers.join(', ')}`;
      leftDiv.appendChild(powers);
      contentNodes.push(powers);
    }
    // Source and page (smaller text)
    const src = (spirit.source ? String(spirit.source) : '').trim();
    const page = (spirit.page ? String(spirit.page) : '').trim();
    if (src || page) {
      const srcPage = document.createElement('div');
      srcPage.className = 'chummer-card-source';
      srcPage.textContent = `${src}${src && page ? ', ' : ''}${page}`;
      leftDiv.appendChild(srcPage);
      contentNodes.push(srcPage);
    }
    makeCollapsible(leftDiv, name, contentNodes);
    spiritDiv.appendChild(leftDiv);
    list.appendChild(spiritDiv);
  });
  sectionContent.appendChild(list);
}

export function renderSprites({ sprites, sectionContent }) {
  console.log('[renderers.js] renderSprites called');
  const title = document.createElement('h2');
  title.textContent = 'Sprites';
  console.log(`[renderers.js] title: ${title.textContent}`);
  sectionContent.appendChild(title);
  console.log(`[renderers.js] sectionContent:`, sectionContent);
  if (!Array.isArray(sprites) || !sprites.length) {
    sectionContent.appendChild(document.createTextNode('No sprites found.'));
    return;
  }
  sprites.forEach(sprite => {
    console.log(`[renderers.js] Processing sprite: ${sprite.name || '(Unnamed)'}`);
    const spriteCard = makeMDUICritterCard(sprite,'Registered','Rating','Tasks');

    sectionContent.appendChild(spriteCard);
  });
  return
}


export function renderGear({ gear, sectionContent }) {
  console.log('[renderers.js] renderGear called', gear);
  const title = document.createElement('h2');
  title.textContent = 'Gear';
  sectionContent.appendChild(title);
  if (!Array.isArray(gear) || !gear.length) {
    sectionContent.appendChild(document.createTextNode('No gear found.'));
    return;
  }
  // MDC List root
  const list = document.createElement('ul');
  list.className = 'mdc-list mdc-list--two-line';
  list.style.listStyle = 'none';
  list.style.padding = '0';
  list.style.margin = '0';

  gear.forEach(item => {
    list.appendChild(renderGearItem(item));
  });
  sectionContent.appendChild(list);
  console.log('[renderers.js] renderGear completed');
}

function renderGearItem(item, depth = 0) {
    console.log(`[renderers.js] renderGearItem`, { item, depth });
    const li = document.createElement('li');
    li.className = 'mdc-list-item';
    li.style.paddingLeft = `${depth * 2}em`;
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    // Expand/collapse icon if children
    let expandIcon = null;
    if (item.children && item.children.length) {
      expandIcon = document.createElement('span');
      expandIcon.className = 'material-icons';
      expandIcon.textContent = 'chevron_right';
      expandIcon.style.cursor = 'pointer';
      expandIcon.style.marginRight = '0.5em';
      li.appendChild(expandIcon);
    } else {
      // Spacer for alignment
      const spacer = document.createElement('span');
      spacer.style.display = 'inline-block';
      spacer.style.width = '1.5em';
      li.appendChild(spacer);
    }
    // Main label
    const label = document.createElement('span');
    label.className = 'mdc-list-item__text';
    label.textContent = item.name || '(Unnamed)';
    li.appendChild(label);
    // Details (optional)
    if (item.qty) {
      const qty = document.createElement('span');
      qty.className = 'mdc-list-item__meta';
      qty.textContent = `x${item.qty}`;
      qty.style.marginLeft = '1em';
      li.appendChild(qty);
    }
    // Children
    let childrenUl = null;
    if (item.children && item.children.length) {
      console.log(`[renderers.js] renderGearItem has children`, item.children);
      // Create a nested list for children
      li.style.cursor = 'pointer'; // Make the item clickable
      li.style.position = 'relative'; // For absolute positioning of expand icon
      li.style.paddingRight = '2em'; // Space for expand icon
      li.style.marginBottom = '0.5em'; // Add some spacing between items
      li.style.borderBottom = '1px solid var(--md-sys-color-outline, #ccc)';
      li.style.background = 'var(--md-sys-color-surface, #fff)';
      li.style.color = 'var(--md-sys-color-on-surface, #000)';
      li.style.transition = 'background-color 0.2s ease';
      li.addEventListener('mouseover', () => {
        li.style.backgroundColor = 'var(--md-sys-color-surface-hover, #381e72)';
      });
      li.addEventListener('mouseout', () => {
        li.style.backgroundColor = 'var(--md-sys-color-surface, #fff)';
      });
      li.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling to parent items
        const expanded = childrenUl.style.display === '';
        childrenUl.style.display = expanded ? 'none' : '';
        expandIcon.textContent = expanded ? 'chevron_right' : 'expand_more';
      });
      childrenUl = document.createElement('ul');
      childrenUl.style.listStyle = 'none';
      childrenUl.style.padding = '0';
      childrenUl.style.margin = '0';
      childrenUl.style.display = 'none';
      item.children.forEach(child => {
        childrenUl.appendChild(renderGearItem(child, depth + 1));
      });
      li.appendChild(childrenUl);
      expandIcon.addEventListener('click', () => {
        const expanded = childrenUl.style.display === '';
        childrenUl.style.display = expanded ? 'none' : '';
        expandIcon.textContent = expanded ? 'chevron_right' : 'expand_more';
      });
    }
    return li;
};
// Global modifier for all dice pools based on condition monitors
window.ConditionMonitorModifier = 0;
window.physicalCM = 0;
window.stunCM = 0;

function createCMTracker(label, cmOverflow, cmMax, onChange) {
    console.log('[renderers.js] createCMTracker called', { label, cmOverflow, cmMax, onChange });
    let value = 0;
    const maxValue = cmMax + cmOverflow;
    const container = document.createElement('div');
    container.className = 'cm-tracker';
    const title = document.createElement('span');
    title.textContent = label + ': ';
    container.appendChild(title);
    const minus = document.createElement('button');
    minus.textContent = '–';
    minus.onclick = () => {
      if (value > 0) {
        value--;
        updateDisplay();
        onChange(value);
      }
    };
    container.appendChild(minus);
    const currentValue = document.createElement('span');
    currentValue.textContent = value;
    currentValue.className = 'cm-value';
    container.appendChild(currentValue);
    const plus = document.createElement('button');
    plus.textContent = '+';
    plus.onclick = () => {
      if (value < maxValue) {
        value++;
        updateDisplay();
        onChange(value);
      }
    };
    container.appendChild(plus);
    function updateDisplay() {
      currentValue.textContent = value;
      // Remove all state classes first
      container.classList.remove('cm-danger', 'cm-overflow');
      currentValue.classList.remove('cm-danger', 'cm-overflow');
      if (value === maxValue) {
        container.classList.add('cm-overflow');
        currentValue.classList.add('cm-overflow');
      } else if (value >= cmMax) {
        container.classList.add('cm-danger');
        currentValue.classList.add('cm-danger');
      }
      // Update global condition monitor modifier (cap at cmMax for modifier calculation)
      const cappedPhysical = Math.min(window.physicalCM, window.physicalCMMax || 0);
      const cappedStun = Math.min(window.stunCM, window.stunCMMax || 0);
      window.ConditionMonitorModifier = -1 * (Math.floor(cappedPhysical/3) + Math.floor(cappedStun/3));
    }
    updateDisplay();
    return container;
}

export function renderConditionMonitors({conditionMonitors, sectionContent}) {
    console.log('[renderers.js] renderConditionMonitors called', conditionMonitors);
    const cmSection = document.createElement('div');
    cmSection.className = 'condition-monitors';
  
    // Store cmMax values globally for use in modifier calculation
    window.physicalCMMax = conditionMonitors.physicalcm;
    window.stunCMMax = conditionMonitors.stuncm;
    
    function updateGlobalModifier() {
      // Calculate modifier: -1 * (floor(physicalCM/3) + floor(stunCM/3)), capping at cmMax
      const cappedPhysical = Math.min(window.physicalCM, window.physicalCMMax || 0);
      const cappedStun = Math.min(window.stunCM, window.stunCMMax || 0);
      window.ConditionMonitorModifier = -1 * (Math.floor(cappedPhysical/3) + Math.floor(cappedStun/3));
      console.log('[renderers.js] Global Condition Monitor Modifier updated:', window.ConditionMonitorModifier);
    }
    cmSection.appendChild(
      createCMTracker(
        'Physical',
        conditionMonitors.physicalcmoverflow,
        conditionMonitors.physicalcm,
        v => { window.physicalCM = v; updateGlobalModifier(); }
      )
    );
    cmSection.appendChild(
      createCMTracker(
        'Stun',
        conditionMonitors.stuncmoverflow || 0,
        conditionMonitors.stuncm,
        v => { window.stunCM = v; updateGlobalModifier(); }
      )
    );
    updateGlobalModifier();
    sectionContent.appendChild(cmSection);
  }


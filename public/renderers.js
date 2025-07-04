// renderers.js: Custom renderers for spells, complex forms, etc.
// Export functions like renderSpells, renderComplexForms, etc.

console.log('[renderers.js] Loaded');
const getLayoutMainElement = () => document.querySelector('mdui-layout-main');

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
export function renderCyberware({ cyberBioWare, sectionContent }) {
    console.log('[renderers.js] renderCyberware called', cyberBioWare);
    const cbSection = document.createElement('div');
    cbSection.className = 'cyber-bio-ware';

    // Render each cyberware item
    cyberBioWare.forEach(item => {
       const wareCard = cbSection.appendChild(makeMDUIWaresCard(item));
       sectionContent.appendChild(wareCard);
    });
    return;

}
export function renderBioware({ cyberBioWare, sectionContent }) {
    console.log('[renderers.js] renderBioware called', cyberBioWare);
    const cbSection = document.createElement('div');
    cbSection.className = 'cyber-bio-ware';
    // Render each bioware item
    cyberBioWare.forEach(item => {
        const wareCard = cbSection.appendChild(makeMDUIWaresCard(item));
        sectionContent.appendChild(wareCard);
    });
    return
}


function makeMDUIWaresCard(ware, classsName = 'mdui-card') {
  console.log('[renderers.js] makeMDUIWaresCard called', { ware, classsName });
  const mduiCard = document.createElement('mdui-card');
  mduiCard.className = classsName;

  // Name
  const nameSpan = document.createElement('span');
  nameSpan.innerHTML = `<strong>Name:</strong> ${ware.name ?? '—'}`;
  nameSpan.classList = 'card-title';
  mduiCard.appendChild(nameSpan);

  // Type
  const span1 = document.createElement('span');
  span1.innerHTML = `<strong>Type:</strong> ${ware.type ?? '—'}`;
  span1.classList = 'card-line';
  mduiCard.appendChild(span1);

  // Rating
  const span2 = document.createElement('span');
  span2.innerHTML = `<strong>Rating:</strong> ${ware.rating ?? '—'}`;
  span2.classList = 'card-line';
  mduiCard.appendChild(span2);
  
  //limb and limb slot
  if (ware.limb) {
    const span3 = document.createElement('span');
    span3.innerHTML = `<strong>Limb:</strong> ${ware.limb}`;
    span3.classList = 'card-line';
    mduiCard.appendChild(span3);
  }
  if (ware.limbslot) {
    const span4 = document.createElement('span');
    span4.innerHTML = `<strong>Limb Slot:</strong> ${ware.limbslot}`;
    span4.classList = 'card-line';
    mduiCard.appendChild(span4);
  }
  // Extra (if present)
  if (ware.extra && String(ware.extra).trim()) {
    const extra = document.createElement('div');
    extra.textContent = `Extra: ${ware.extra}`;
    mduiCard.appendChild(extra);
  }
  //process bonuses. If there's only one, it won't be an array, so we need to handle that
  if (ware.bonus && ware.bonus.length > 0) {
    //if the bonus is a limit modifier, we can ignore handling the bonus here
    if ((Array.isArray(ware.bonus) && ware.bonus.some(b => b.limitmodifier)) || ware.bonus.limitmodifier) {
      console.warn('[renderers.js] Bonus contains limit modifiers, skipping display');
    }
    else{
      const bonusDiv = document.createElement('div');
      bonusDiv.className = 'chummer-card-bonus';
      if (Array.isArray(ware.bonus)) {
        bonusDiv.textContent = `Bonuses: ${ware.bonus.map(b => b.name || b).join(', ')}`;
      } else {
        bonusDiv.textContent = `Bonus: ${ware.bonus.name || ware.bonus}`;
      }
      mduiCard.appendChild(bonusDiv);
    }
  }
  // Source and page (smaller text)
  const src = (ware.source ? String(ware.source) : '').trim();
  const page = (ware.page ? String(ware.page) : '').trim();
  if (src || page) {
    const srcPage = document.createElement('div');
    srcPage.className = 'chummer-card-source';
    srcPage.textContent = `${src}${src && page ? ', ' : ''}${page}`;
    mduiCard.appendChild(srcPage);
  }

  mduiCard.clickable = true;
  return mduiCard;
}

export function renderVehiclesAndDrones({ vehiclesAndDrones, sectionContent }) {
  console.log('[renderers.js] renderVehiclesAndDrones called', vehiclesAndDrones);
  const title = document.createElement('h2');
  title.textContent = 'Vehicles and Drones';

  //on a weird quirk that sectionContent is null, call getLayoutMainElement to get the main section
  if (!sectionContent) {
    console.warn('[renderers.js] sectionContent is null, using getLayoutMainElement');
    sectionContent = getLayoutMainElement();
  }

  sectionContent.appendChild(title);
  if (!Array.isArray(vehiclesAndDrones) || !vehiclesAndDrones.length) {
    sectionContent.appendChild(document.createTextNode('No vehicles or drones found.'));
    return;
  }
  vehiclesAndDrones.forEach(vehicle => {
    console.log(`[renderers.js] Processing vehicle/drone: ${vehicle.name || '(Unnamed)'}`);
    const vehicleCard = makeMDUIVehicleDroneCard(vehicle);
    sectionContent.appendChild(vehicleCard);
  });
      // After rendering the list, ensure the current view state is recorded if needed
    // (This is implicitly handled by renderCharacterTab calling this, but good to be explicit for transitions)
    appState.currentSubView = 'vehicleAndDrones';
    appState.currentDetailId = null;
    updateTopAppBar(); // Ensure top app bar is updated
}
function makeMDUIVehicleDroneCard(vehicleData, className = 'mdui-card') {
    const card = document.createElement('mdui-card');
    card.className = className;
    card.dataset.vehicleGuid = vehicleData.guid; // Store GUID for detail lookup

    // Card Content Container
    const cardContent = document.createElement('div');
    cardContent.className = 'mdui-card-content'; // A common class for card content areas

    // Vehicle Name (Headline)
    const headline = document.createElement('h3'); // Using h3 for a prominent title
    headline.className = 'mdui-card-title'; // Apply mdui-card-title class if it exists for styling
    headline.textContent = vehicleData.name;
    cardContent.appendChild(headline);

    // Vehicle Category (Supporting Text/Subtitle)
    const categoryText = document.createElement('p');
    categoryText.className = 'mdui-card-subtitle'; // Apply mdui-card-subtitle class if it exists for styling
    categoryText.textContent = `Category: ${vehicleData.category}`;
    cardContent.appendChild(categoryText);

    // Key Combat/Movement Stats (Summarized)
    const statsContainer = document.createElement('div');
    statsContainer.className = 'vehicle-stats-summary'; // Custom class for styling
    let statsHtml = "";

    statsHtml += `
        <p><strong>Body:</strong> ${vehicleData.body} | <strong>Armor:</strong> ${vehicleData.armor} | <strong>Speed:</strong> ${vehicleData.speed}</p>
        <p><strong>Handling:</strong> ${vehicleData.handling} | <strong>Pilot:</strong> ${vehicleData.pilot} | <strong>Sensor:</strong> ${vehicleData.sensor}</p>
        <p><strong>Weapon Mounts:</strong> ${vehicleData.weaponmounts ? vehicleData.weaponmounts.length : 0}</p>`;
        if(vehicleData.seats> 0) {
            statsHtml += `<p><strong>Seats:</strong> ${vehicleData.seats}</p>`;
        }
        statsHtml += `<p><strong>Damage:</strong> P:${vehicleData.physicalcmfilled || 0} | M:${vehicleData.matrixcmfilled || 0}</p>`;
    statsContainer.innerHTML = statsHtml;
    cardContent.appendChild(statsContainer);

    card.appendChild(cardContent); // Append content to the card

    // Card Actions (e.g., for "View Details" button)
    const cardActions = document.createElement('div');
    cardActions.className = 'mdui-card-actions'; // For Material 3 card actions styling

    // Action button to view details
    const detailButton = document.createElement('mdui-button'); // Or mdui-icon-button if preferred
    detailButton.textContent = 'View Details';
    detailButton.className = 'mdui-text-button'; // Material 3 text button style
    
    // Add an icon if using mdui-icon-button or want an icon next to text
    // const detailIcon = document.createElement('mdui-icon');
    // detailIcon.name = 'chevron_right';
    // detailButton.appendChild(detailIcon); // If using text + icon

    cardActions.appendChild(detailButton);
    card.appendChild(cardActions); // Append actions to the card

    // Add click listener to navigate to detail view
    // Using a delegated event listener is generally better for dynamic content,
    // but for a single card's action, a direct listener is fine.
    detailButton.addEventListener('click', () => {
        // --- Push current state to stack before navigating to detail ---
        appState.viewStack.push({
          mainSection: appState.currentMainSection,
          subView: appState.currentSubView,
          detailId: appState.currentDetailId // This would be null for list view
        });
        renderVehicleDetail(card.dataset.vehicleGuid);
    });

    return card;
}
// This function assumes appState.characterData exists and is populated
function renderVehicleDetail(vehicleGuid) {
    console.log(`[VEHICLES] Rendering detail for vehicle GUID: ${vehicleGuid}`);
    const sectionContent = getLayoutMainElement();
    sectionContent.innerHTML = ''; // Clear existing content

    const vehicle = appState.characterData.vehicles.find(v => v.guid === vehicleGuid);

    if (!vehicle) {
        sectionContent.textContent = "Vehicle not found.";
        return;
    }
    console.log('[VEHICLES] Vehicle data:', vehicle);
    appState.currentSubView = 'vehicleDetail';
    appState.currentDetailId = vehicleGuid;
    console.log('[VEHICLES] Updated appState:', appState);
    updateTopAppBar(); // Update top app bar to show back button

    // --- Top Section: Basic Vehicle Info Card ---
    const basicInfoCard = document.createElement('mdui-card');
    basicInfoCard.className = 'vehicle-detail-card';
    basicInfoCard.innerHTML = `
        <div class="mdui-card-content">
            <h3 class="mdui-card-title">${vehicle.name} (${vehicle.category})</h3>
            <!--<p><strong>GUID:</strong> ${vehicle.guid}</p>-->
            <p><strong>Body:</strong> ${vehicle.body} | <strong>Armor:</strong> ${vehicle.armor} | <strong>Seats:</strong> ${vehicle.seats}</p>
            <p><strong>Handling:</strong> ${vehicle.handling} (${vehicle.offroadhandling} Off-Road) | <strong>Accel:</strong> ${vehicle.accel} (${vehicle.offroadaccel} Off-Road)</p>
            <p><strong>Speed:</strong> ${vehicle.speed} (${vehicle.offroadspeed} Off-Road) | <strong>Pilot:</strong> ${vehicle.pilot} | <strong>Sensor:</strong> ${vehicle.sensor}</p>
            <p><strong>Device Rating:</strong> ${vehicle.devicerating || 'N/A'} | <strong>Mod Slots:</strong> ${vehicle.modslots}</p>
            <p><strong>Cost:</strong> ${vehicle.cost}¥ | <strong>Availability:</strong> ${vehicle.avail}</p>
            <p><strong>Source:</strong> ${vehicle.source}</p>
            <h4>Condition Monitors</h4>
            <p><strong>Physical:</strong> ${vehicle.physicalcmfilled || 0} / ${vehicle.body * 2 + 8} boxes</p>
            <p><strong>Matrix:</strong> ${vehicle.matrixcmfilled || 0} / ${vehicle.devicerating ? vehicle.devicerating * 2 + 8 : 0} boxes</p>
            </div>
    `;
    sectionContent.appendChild(basicInfoCard);
    const mainCollapsesContainer = document.createElement('mdui-collapse');
   // --- Weapon Mounts Section (using mdui-collapse and mdui-collapse-item) ---
    if (vehicle.weaponmounts && vehicle.weaponmounts.length > 0) {
        
        const weaponMountsOuterCollapseItem = document.createElement('mdui-collapse-item');

        // Header for the "Weapon Mounts" section
        const mountsHeader = document.createElement('mdui-list-item');
        mountsHeader.setAttribute('slot', 'header');
        mountsHeader.setAttribute('icon', 'add'); // Or whatever default icon mdui-collapse-item manages
        mountsHeader.textContent = `Weapon Mounts (${vehicle.weaponmounts.length} total)`;
        weaponMountsOuterCollapseItem.appendChild(mountsHeader);

        // Content for the "Weapon Mounts" section (This is what collapses/expands for the main mounts header)
        const mountsContentDiv = document.createElement('div');
        mountsContentDiv.style.marginLeft = '1rem'; // Indent content as per mdui example
        
        vehicle.weaponmounts.forEach(mount => {
            // Each mount will now be a distinct card or a simple div within the main mounts content
            const mountItemCard = document.createElement('mdui-card'); // Using a card for each mount for better visual separation
            mountItemCard.className = 'weapon-mount-item-card';
            mountItemCard.style.marginTop = '10px';
            mountItemCard.style.marginBottom = '10px';

            mountItemCard.innerHTML = `
                <div class="mdui-card-content">
                    <h4 class="mdui-card-title">${mount.name} (${mount.category})</h4>
                    <p><strong>Slots:</strong> ${mount.slots} | <strong>Capacity:</strong> ${mount.weaponcapacity}</p>
                    <p><strong>Avail:</strong> ${mount.avail} | <strong>Cost:</strong> ${mount.cost}¥</p>
                    <!--<p><strong>Categories:</strong> ${mount.weaponmountcategories}</p>-->
                    <p><strong>Source:</strong> ${mount.source}</p>
                </div>
            `;

            // --- Display Mounted Weapon Details Directly (if a weapon is present) ---
            if (mount.weapon) {
                const weaponContent = document.createElement('div');
                weaponContent.className = 'mounted-weapon-details';
                weaponContent.style.padding = '10px 16px';
                weaponContent.style.borderTop = '1px solid var(--mdui-color-outline-variant)';

                weaponContent.innerHTML += `
                    <h5>Attached Weapon: ${mount.weapon.name} (${mount.weapon.category})</h5>
                    <p><strong>Damage:</strong> ${mount.weapon.damage} | <strong>AP:</strong> ${mount.weapon.ap} | <strong>Mode:</strong> ${mount.weapon.mode}</p>
                    <p><strong>RC:</strong> ${mount.weapon.rc} | <strong>Ammo:</strong> ${mount.weapon.ammo}</p>
                    <p><strong>Accuracy:</strong> ${mount.weapon.accuracy} | <strong>Conceal:</strong> ${mount.weapon.conceal}</p>
                    <p><strong>Avail:</strong> ${mount.weapon.avail} | <strong>Cost:</strong> ${mount.weapon.cost}¥</p>
                    <p><strong>Source:</strong> ${mount.weapon.source}</p>
                    <p><strong>Equipped:</strong> ${mount.weapon.equipped ? 'Yes' : 'No'}</p>
                `;
                mountItemCard.appendChild(weaponContent); // Append weapon details directly to the mount card

                // Weapon Accessories (now a simple mdui-list if accessories are present, NO COLLAPSE-ITEM)
                if (mount.weapon.accessories && mount.weapon.accessories.length > 0) {
                    const accessoriesList = document.createElement('mdui-list');
                    accessoriesList.innerHTML = `<h6 style="margin-left: 16px;">Accessories:</h6>`; // Sub-heading for accessories
                    
                    mount.weapon.accessories.forEach(accessory => {
                        const accessoryListItem = document.createElement('mdui-list-item');
                        accessoryListItem.innerHTML = `
                            <strong>${accessory.name}</strong> (Mount: ${accessory.mount})<br>
                            RC: ${accessory.rc} | Acc: ${accessory.accuracy} | Avail: ${accessory.avail} | Cost: ${accessory.cost}¥<br>
                            Source: ${accessory.source} | Equipped: ${accessory.equipped ? 'Yes' : 'No'}
                        `;
                        // Accessory Gears (now a simple mdui-list if gears are present, NO COLLAPSE-ITEM)
                        if (accessory.gears && accessory.gears.length > 0) {
                             const gearContentDiv = document.createElement('div');
                             gearContentDiv.style.marginLeft = '1rem';
                             const gearList = document.createElement('mdui-list');
                             gearList.innerHTML = `<h6 style="margin-left: 16px;">Gears:</h6>`; // Sub-heading for gears
                             
                             accessory.gears.forEach(gear => {
                                 const gearListItem = document.createElement('mdui-list-item');
                                 gearListItem.innerHTML = `
                                     ${gear.name} (${gear.category})<br>
                                     Cap: ${gear.capacity} | Qty: ${gear.qty} | Avail: ${gear.avail} | Cost: ${gear.cost}¥<br>
                                     Source: ${gear.source} | Equipped: ${gear.equipped ? 'Yes' : 'No'}
                                 `;
                                 gearList.appendChild(gearListItem);
                             });
                             gearContentDiv.appendChild(gearList);
                             accessoryListItem.appendChild(gearContentDiv); // Append gear list to accessory list item
                        }
                        accessoriesList.appendChild(accessoryListItem);
                    });
                    weaponContent.appendChild(accessoriesList); // Append accessories list to weapon content
                }
            }

            // Weapon Mount Options (still part of the mount's details)
            if (mount.weaponmountoptions && mount.weaponmountoptions.length > 0) {
                const mountOptionsList = document.createElement('mdui-list');
                mountOptionsList.innerHTML = `<h6 style="margin-left: 16px;">Mount Options:</h6>`;
                
                mount.weaponmountoptions.forEach(option => {
                    const optionListItem = document.createElement('mdui-list-item');
                    optionListItem.textContent = `${option.name} (Slots: ${option.slots}, Cost: ${option.cost}¥)`;
                    mountOptionsList.appendChild(optionListItem);
                });
                mountItemCard.appendChild(mountOptionsList); // Append options to the mount card
            }
            
            mountsContentDiv.appendChild(mountItemCard); // Append each mount card to the main mounts content div
        });
        
        weaponMountsOuterCollapseItem.appendChild(mountsContentDiv);
        
        
        mainCollapsesContainer.appendChild(weaponMountsOuterCollapseItem);
        sectionContent.appendChild(mainCollapsesContainer);
    }

    // --- Sensor Array Section (if present, using mdui-collapse-item) ---
    // This section structure remains the same as it's a top-level collapse item
    const sensorArrayGear = vehicle.gears && Array.isArray(vehicle.gears) ? vehicle.gears.find(g => g.name === "Sensor Array") : null;
    if (sensorArrayGear) {
        const sensorCollapseItem = document.createElement('mdui-collapse-item');

        const sensorHeader = document.createElement('mdui-list-item');
        sensorHeader.setAttribute('slot', 'header');
        sensorHeader.setAttribute('icon', 'add');
        sensorHeader.textContent = `Sensor Array (Rating ${sensorArrayGear.rating || 'N/A'})`;
        sensorCollapseItem.appendChild(sensorHeader);

        const sensorContentDiv = document.createElement('div');
        sensorContentDiv.style.marginLeft = '1rem';
        sensorContentDiv.innerHTML = `
            <p><strong>Capacity:</strong> ${sensorArrayGear.capacity} | <strong>Min Rating:</strong> ${sensorArrayGear.minrating} | <strong>Max Rating:</strong> ${sensorArrayGear.maxrating}</p>
            <p><strong>Avail:</strong> ${sensorArrayGear.avail} | <strong>Cost:</strong> ${sensorArrayGear.cost}¥</p>
            <p><strong>Source:</strong> ${sensorArrayGear.source}</p>
        `;
        sensorCollapseItem.appendChild(sensorContentDiv);
        
        if (mainCollapsesContainer) {
            mainCollapsesContainer.appendChild(sensorCollapseItem);
        } else {
            sectionContent.appendChild(sensorCollapseItem);
        }
    }

    // --- Modifications Section (if present, using mdui-collapse-item) ---
    // This section structure also remains the same as it's a top-level collapse item
    if (vehicle.mods && vehicle.mods.length > 0) {
        const modsCollapseItem = document.createElement('mdui-collapse-item');

        const modsHeader = document.createElement('mdui-list-item');
        modsHeader.setAttribute('slot', 'header');
        modsHeader.setAttribute('icon', 'add');
        modsHeader.textContent = `Modifications (${vehicle.mods.length} total)`;
        modsCollapseItem.appendChild(modsHeader);

        const modsContentDiv = document.createElement('div');
        modsContentDiv.style.marginLeft = '1rem';
        const modsList = document.createElement('mdui-list');
        vehicle.mods.forEach(mod => {
            const modListItem = document.createElement('mdui-list-item');
            modListItem.textContent = `${mod.name} (Category: ${mod.category || 'N/A'}) - Cost: ${mod.cost || 'N/A'}`;
            modsList.appendChild(modListItem);
        });
        modsContentDiv.appendChild(modsList);
        modsCollapseItem.appendChild(modsContentDiv);
        
        if (mainCollapsesContainer) {
            mainCollapsesContainer.appendChild(modsCollapseItem);
        } else {
            sectionContent.appendChild(modsCollapseItem);
        }
    }

    // Optional: Add a "Back to List" button at the bottom of the details
    const backButtonContainer = document.createElement('div');
    backButtonContainer.style.textAlign = 'center';
    backButtonContainer.style.padding = '20px';
    const backButton = document.createElement('mdui-button');
    backButton.textContent = 'Back to Vehicle List';
    backButton.className = 'mdui-filled-button';
    backButton.addEventListener('click', goBack);
    backButtonContainer.appendChild(backButton);
    sectionContent.appendChild(backButtonContainer);
}


function goBack() {
    console.log('[NAV] goBack called', window.appState);
    if (window.appState.viewStack.length > 0) {
        const prevState = window.appState.viewStack.pop();
        console.log(`[NAV] Going back to: ${JSON.stringify(prevState)}`);
        
        const sectionContent = getLayoutMainElement();
        sectionContent.innerHTML = ''; // Clear current content
        console.log('[NAV] current state of mdui-layout-main:', sectionContent);

        appState.currentMainSection = prevState.mainSection;
        appState.currentSubView = prevState.subView;
        appState.currentDetailId = prevState.detailId;

        // Re-render based on the popped state
        if (prevState.subView === 'vehicleAndDrones') {
            console.log(window.appState.characterData.vehicles);
            renderVehiclesAndDrones({ vehiclesAndDrones: window.appState.characterData.vehicles }, sectionContent);
        } else if (prevState.subView === 'vehicleDetail') {
            // This case might not be strictly needed if we only go back from detail to list
            // but good for robustness if you have multi-level detail
            renderVehicleDetail(prevState.detailId, sectionContent);
        }
        // ... handle other sub-views if you add them later

        updateTopAppBar(); // Update top app bar for back button visibility
    } else {
        console.log('[NAV] View stack is empty, cannot go back.');
        // Optionally, return to a default view if stack is empty (e.g., the Upload screen)
        // renderCharacterTab('Upload');
    }
}

/**
 * Updates the mdui-top-app-bar with a new title and controls back button visibility.
 * @param {string | null} newTitle - The title to display. If null or undefined, defaults to main section title or generic.
 */
function updateTopAppBar(newTitle = null) {
    const appBar = document.querySelector('mdui-top-app-bar');
    if (!appBar) {
        console.log("mdui-top-app-bar not found!");
        return;
    }

    // --- Manage Title ---
    const titleElement = appBar.querySelector('mdui-title'); // Assuming mdui-title exists inside the app bar
    if (titleElement) {
        if (newTitle) {
            titleElement.textContent = newTitle;
        } else {
            // Default title logic if no specific title is provided
            if (appState.currentMainSection) {
                // Capitalize first letter for display
                titleElement.textContent = appState.currentMainSection.charAt(0).toUpperCase() + appState.currentMainSection.slice(1);
            } else {
                titleElement.textContent = 'Shadowrun Character Viewer'; // Fallback default title
            }
        }
    }

    // --- Manage Back Button ---
    let backButton = appBar.querySelector('.back-button-container'); // Look for a container for the back button
    let currentBackButtonIcon = appBar.querySelector('.app-bar-leading-section mdui-icon-button[name="arrow_back"]');


    if (!backButton) {
        // Create a container for the leading icon/back button if it doesn't exist
        // This assumes mdui-top-app-bar has a slot or designated area for leading elements
        // You might need to adjust this depending on the exact mdui-top-app-bar implementation.
        // A common pattern is to just directly append to the app bar or a specific leading slot.
        // For simplicity, let's assume we create/manage the button directly.
        
        // Remove any existing back button to avoid duplicates
        if (currentBackButtonIcon) {
            currentBackButtonIcon.remove();
        }
        
        if (newTitle) { // Only create if we need it
            backButton = document.createElement('mdui-icon-button');
            backButton.name = 'arrow_back'; // Material icon for back
            backButton.className = 'app-bar-leading-section'; // Use a class for consistency/targeting
            // If mdui-top-app-bar supports a 'slot="leading-icon"' or similar, use it here
            backButton.setAttribute('slot', 'leading-icon'); // Example: if mdui-top-app-bar expects a slot
            backButton.addEventListener('click', goBack);
            appBar.prepend(backButton); // Prepend to place it at the beginning
        }

    } else {
        // If a container already exists, just manage the button within it
        if (newTitle) {
            // Ensure button is present and visible
            if (!currentBackButtonIcon) {
                const newBackButton = document.createElement('mdui-icon-button');
                newBackButton.name = 'arrow_back';
                newBackButton.setAttribute('slot', 'leading-icon');
                newBackButton.addEventListener('click', goBack);
                backButton.innerHTML = ''; // Clear container before adding
                backButton.appendChild(newBackButton);
            }
        } else {
            // Remove back button if no specific title (i.e., not in a detail view)
            if (currentBackButtonIcon) {
                currentBackButtonIcon.remove();
            }
        }
    }

    // More robust way to handle the back button:
    // Find the current leading icon button that acts as a back button
    let existingBackButton = appBar.querySelector('mdui-icon-button[name="arrow_back"]');

    if (newTitle) {
        // If a specific title is provided, we need a back button
        if (!existingBackButton) {
            // Create if it doesn't exist
            existingBackButton = document.createElement('mdui-icon-button');
            existingBackButton.name = 'arrow_back';
            // Set slot if your mdui-top-app-bar requires it for leading icons
            existingBackButton.setAttribute('slot', 'leading-icon'); 
            existingBackButton.addEventListener('click', goBack);
            // Append to the correct location within your mdui-top-app-bar.
            // This might depend on how your mdui-top-app-bar is structured.
            // For general Web Components, you might append to a specific part,
            // or if it has a default slot for leading icons, just append to the component.
            appBar.prepend(existingBackButton); // A common way to add to the left
        }
        // Ensure it's visible (if you had a mechanism to hide/show it)
        // existingBackButton.style.display = ''; // Or add/remove a 'hidden' class

    } else {
        // No specific title, so hide/remove the back button
        if (existingBackButton) {
            existingBackButton.remove(); // Remove it from the DOM
            // existingBackButton.style.display = 'none'; // Or just hide it if you prefer
        }
    }
}
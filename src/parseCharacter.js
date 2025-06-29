const skillGroupMap = require('./skillGroupMap');
const { extractLimitModifiersFromBonus } = require('./limitConditionMap');
const skillAttributeMap = require('./skillAttributeMap');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or higher to `error.log`
    //   (i.e., error, fatal, but not other levels)
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    //
    // - Write all logs with importance level of `info` or higher to `combined.log`
    //   (i.e., fatal, error, warn, and info, but not silly)
    //
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
    forceConsole: true,
  }));
}



function parseCharacter(json) {
  const character = json.character || {};
  const traditionType = character.tradition && character.tradition.traditiontype;
  logger.silly('[PARSE-CHARACTER] Tradition type:', traditionType);
 
  // --- Attributes ---
  function parseAttributes(character, traditionType) {
    let attributes = [];
    if (character.attributes && character.attributes.attribute) {
      attributes = Array.isArray(character.attributes.attribute)
        ? character.attributes.attribute
        : [character.attributes.attribute];
    }
    return attributes.filter(attr => {
      if (attr.metatypecategory === 'Standard') return true;
      if (traditionType == attr.name && attr.metatypecategory === 'Special') {logger.silly('[PARSE-CHARACTER] Found matching attribute for tradition type:', attr); return true;}
      if (attr.name && attr.name.trim() === 'EDG') return true;
      return false;
    });
  }
  const filteredAttributes = parseAttributes(character, traditionType);
  logger.silly('[PARSE-CHARACTER] Filtered attributes:', filteredAttributes);
  // --- Skill Groups ---
  function parseSkillGroups(character) {
    if (character.newskills && character.newskills.groups && character.newskills.groups.group) {
      return Array.isArray(character.newskills.groups.group)
        ? character.newskills.groups.group
        : [character.newskills.groups.group];
    }
    return [];
  }
  const skillGroups = parseSkillGroups(character);

  // --- Skills ---
  function parseSkills(character, skillGroups, skillGroupMap) {
    let skills = [];
    if (character.newskills && character.newskills.skills && character.newskills.skills.skill) {
      skills = Array.isArray(character.newskills.skills.skill)
        ? character.newskills.skills.skill
        : [character.newskills.skills.skill];
    }
    // Build a lookup for group base+karma totals
    const groupTotals = {};
    skillGroups.forEach(group => {
      const total = (parseInt(group.base, 10) || 0) + (parseInt(group.karma, 10) || 0);
      groupTotals[group.name] = total;
    });
    // For each skill, find its group and add group info
    return skills.map(skill => {
      let skillGroupName = '';
      let skillGroupTotal = 0;
      for (const [groupName, skillNames] of Object.entries(skillGroupMap)) {
        if (skillNames.includes(skill.name)) {
          skillGroupName = groupName;
          skillGroupTotal = groupTotals[groupName] || 0;
          break;
        }
      }
      return {
        name: skill.name,
        karma: skill.karma,
        base: skill.base,
        skillGroupName: skillGroupName || '',
        skillGroupTotal: skillGroupTotal || 0
      };
    });
  }
  const skillsWithGroup = parseSkills(character, skillGroups, skillGroupMap);

  // --- Limits ---
  function calculateLimits(attributes) {
    const attrMap = {};
    attributes.forEach(attr => {
      attrMap[attr.name] = attr.totalvalue || 0;
    });
    function safeAttr(name) {
      return parseInt(attrMap[name] || 0, 10);
    }
    // Main formulae
    const limits = {
      Physical: Math.floor(((safeAttr('STR') * 2) + safeAttr('BOD') + safeAttr('REA')) / 3),
      Mental: Math.floor(((safeAttr('LOG') * 2) + safeAttr('INT') + safeAttr('WIL')) / 3),
      Social: Math.floor(((safeAttr('CHA') * 2) + safeAttr('WIL') + safeAttr('ESS')) / 3)
    };
    // Astral
    limits.Astral = Math.max(limits.Mental, limits.Social);
    return { limits, attrMap };
  }
  const { limits, attrMap } = calculateLimits(filteredAttributes);

  // --- Limit Modifiers ---
  function collectLimitModifiers(character, extractLimitModifiersFromBonus) {
    let armorLimitMods = [];
    if (character.armors && character.armors.armor) {
      const armors = Array.isArray(character.armors.armor) ? character.armors.armor : [character.armors.armor];
      armors.forEach(armor => {
        armorLimitMods.push(...extractLimitModifiersFromBonus(armor.bonus, armor.rating));
        if (armor.armormods && armor.armormods.armormod) {
          const mods = Array.isArray(armor.armormods.armormod) ? armor.armormods.armormod : [armor.armormods.armormod];
          mods.forEach(mod => {
            armorLimitMods.push(...extractLimitModifiersFromBonus(mod.bonus, mod.rating));
          });
        }
      });
    }
    let limitModifiers = [];
    if (character.limitmodifiers && character.limitmodifiers.limitmodifier) {
      limitModifiers = Array.isArray(character.limitmodifiers.limitmodifier)
        ? character.limitmodifiers.limitmodifier
        : [character.limitmodifiers.limitmodifier];
    }
    return [...limitModifiers, ...armorLimitMods];
  }
  const limitModifiers = collectLimitModifiers(character, extractLimitModifiersFromBonus);

  function dedupeModifiers(mods) {
    function getInfoScore(mod) {
      let score = 0;
      if (mod.source && mod.source.trim()) score += 2;
      if (mod.condition && mod.condition.trim()) score += 1;
      return score;
    }
    const map = new Map();
    for (const mod of mods) {
      const key = `${mod.limit}|${mod.value}|${mod.condition}`;
      if (!map.has(key)) {
        map.set(key, mod);
      } else {
        const existing = map.get(key);
        if (getInfoScore(mod) >= getInfoScore(existing)) {
          map.set(key, mod);
        }
      }
    }
    return Array.from(map.values());
  }

  function applyLimitModifiers(limits, modifiers) {
    const appliedLimitModifiers = [];
    for (const mod of modifiers) {
      if (mod.limit && limits[mod.limit] !== undefined) {
        limits[mod.limit] += parseInt(mod.value || mod.bonus || 0, 10);
        appliedLimitModifiers.push({
          limit: mod.limit,
          value: parseInt(mod.value || mod.bonus || 0, 10),
          source: mod.name || '',
          condition: mod.condition || ''
        });
      }
    }
    return dedupeModifiers(appliedLimitModifiers);
  }
  const appliedLimitModifiers = applyLimitModifiers(limits, limitModifiers);
  const limitDetails = {};
  ['Physical', 'Mental', 'Social'].forEach(lim => {
    limitDetails[lim] = {
      total: limits[lim],
      modifiers: appliedLimitModifiers.filter(m => m.limit === lim)
    };
  });
  // Ensure Astral is included in limitDetails
  if (!limitDetails.Astral) {
    limitDetails.Astral = {
      total: limits.Astral,
      modifiers: []
    };
  }
  // --- Magic/Resonance Sections ---
  // Complex Forms (Technomancer)
  let complexForms = [];
  if (character.complexforms && character.complexforms.complexform) {
    complexForms = Array.isArray(character.complexforms.complexform)
      ? character.complexforms.complexform
      : [character.complexforms.complexform];
  }
  // Sprites (Technomancer)
  let sprites = [];
  if (character.spirits && character.spirits.spirit) {
    const allSpirits = Array.isArray(character.spirits.spirit)
      ? character.spirits.spirit
      : [character.spirits.spirit];
    sprites = allSpirits.filter(s => s.type === 'Sprite');
  }
  // Spells (Magician)
  let spells = [];
  if (character.spells && character.spells.spell) {
    spells = Array.isArray(character.spells.spell)
      ? character.spells.spell
      : [character.spells.spell];
  }
  // Spirits (Magician)
  let spirits = [];
  if (character.spirits && character.spirits.spirit) {
    const allSpirits = Array.isArray(character.spirits.spirit)
      ? character.spirits.spirit
      : [character.spirits.spirit];
    spirits = allSpirits.filter(s => s.type !== 'Sprite');
  }
  // --- Adept Powers ---
  let adeptPowers = [];
  if (character.powers && character.powers.power) {
    adeptPowers = Array.isArray(character.powers.power)
      ? character.powers.power
      : [character.powers.power];
  }

  // Collect adept power modifications for attributes, skills, and limits
  const attributeMods = {};
  const skillMods = {};
  const limitMods = {};
  adeptPowers.forEach(power => {
    if (power.bonus) {
      // Attribute boost (e.g., Improved Reflexes, Attribute Boost)
      if (power.bonus.specificattribute && power.bonus.specificattribute.name) {
        const attr = power.bonus.specificattribute.name;
        const val = parseInt(power.bonus.specificattribute.val || power.rating || 0, 10);
        attributeMods[attr] = (attributeMods[attr] || 0) + val;
      }
      if (power.bonus.selectattribute && power.bonus.selectattribute.attribute) {
        const attrs = Array.isArray(power.bonus.selectattribute.attribute)
          ? power.bonus.selectattribute.attribute
          : [power.bonus.selectattribute.attribute];
        attrs.forEach(attr => {
          // For Attribute Boost, just note the boost exists (value may be rating)
          attributeMods[attr] = (attributeMods[attr] || 0) + (parseInt(power.rating || 0, 10));
        });
      }
      // Skill boost (e.g., Improved Ability)
      if (power.bonus.selectskill && power.extra) {
        skillMods[power.extra] = (skillMods[power.extra] || 0) + (parseInt(power.rating || 0, 10));
      }
      // Limit boost (e.g., Improved Potential)
      if (power.bonus.mentallimit) {
        limitMods['Mental'] = (limitMods['Mental'] || 0) + parseInt(power.bonus.mentallimit, 10);
      }
      if (power.bonus.physicallimit) {
        limitMods['Physical'] = (limitMods['Physical'] || 0) + parseInt(power.bonus.physicallimit, 10);
      }
      if (power.bonus.sociallimit) {
        limitMods['Social'] = (limitMods['Social'] || 0) + parseInt(power.bonus.sociallimit, 10);
      }
    }
  });

  // Apply attribute mods
  const attributesWithMods = filteredAttributes.map(attr => {
    const mod = attributeMods[attr.name] || 0;
    return mod ? { ...attr, adeptMod: mod } : attr;
  });
  // Apply skill mods
  const skillsWithMods = skillsWithGroup.map(skill => {
    const mod = skillMods[skill.name] || 0;
    return mod ? { ...skill, adeptMod: mod } : skill;
  });
  // Apply limit mods
  const limitsWithMods = { ...limitDetails };
  Object.keys(limitMods).forEach(lim => {
    if (limitsWithMods[lim]) {
      limitsWithMods[lim] = {
        ...limitsWithMods[lim],
        adeptMod: limitMods[lim]
      };
    }
  });
  
  // Build the result object, only including present sections
  const result = {
    name: character.alias,
    metatype: character.metatype,
    attributes: attributesWithMods,
    skills: skillsWithMods,
    limits: limitsWithMods,
    conditionMonitor: character.calculatedvalues
  };
  // Attach optional arrays if present
  if (complexForms.length > 0) result.complexForms = complexForms;
  if (sprites.length > 0) result.sprites = sprites;
  if (spells.length > 0) result.spells = spells;
  if (spirits.length > 0) result.spirits = spirits;

  // Helper to extract grade details (submersion/initiation)
  function extractGradeDetails(grade, gradesObj, key) {
    if (typeof grade !== 'undefined' && grade > 0) {
      result[key] = grade;
      if (gradesObj && gradesObj.initiationgrade) {
        const details = Array.isArray(gradesObj.initiationgrade)
          ? gradesObj.initiationgrade
          : [gradesObj.initiationgrade];
        if (details.length > 0) result[key + 'Grades'] = details;
      }
    }
  }
  logger.debug(`[PARSE-CHARACTER] Extracting submersion/initiation details: ${character.resenabled}`);
  if(character.resenabled === 'True' || character.resenabled === true){
    // Submersion (Technomancer)
    logger.info('[PARSE-CHARACTER] Resonance enabled, extracting submersion details');
    extractGradeDetails(character.submersiongrade, character.initiationgrades, 'submersion');
  }
  logger.debug(`[PARSE-CHARACTER] Extracting initiation details: ${character.mageenabled}`);
  if(character.magenabled === 'True' || character.magenabled === true){
     // Initiation (Magician)
     logger.info('[PARSE-CHARACTER] Mage enabled, extracting initiation details');
    extractGradeDetails(character.initiategrade, character.initiationgrades, 'initiation');
  }
 
  

  if (adeptPowers.length > 0) result.adeptPowers = adeptPowers;

  // Always include karma and nuyen in the result
  result.karma = character.karma ? Number(character.karma) : 0;
  result.nuyen = character.nuyen ? Number(character.nuyen) : 0;

  // Log limit calculations for debugging
  logger.silly('[LIMITS] Raw attribute map:', attrMap);
  logger.silly('[LIMITS] Initial calculated:', limits);
  if (appliedLimitModifiers && Array.isArray(appliedLimitModifiers)) {
    for (const lim of ['Physical', 'Mental', 'Social', 'Astral']) {
      const mods = appliedLimitModifiers.filter(m => m.limit === lim);
      if (mods.length) {
        logger.silly(`[LIMITS] Modifiers for ${lim}:`, mods);
      }
    }
  }
  logger.silly('[LIMITS] Final output:', limitDetails);

  // Debug: compare attrMap and safeAttr values
  function safeAttr(name) {
    return parseInt(attrMap[name] || 0, 10);
  }
  logger.silly('[LIMIT DEBUG] attrMap:', attrMap);
  logger.silly('[LIMIT DEBUG] safeAttr(LOG):', safeAttr('LOG'), typeof safeAttr('LOG'));
  logger.silly('[LIMIT DEBUG] safeAttr(INT):', safeAttr('INT'), typeof safeAttr('INT'));
  logger.silly('[LIMIT DEBUG] safeAttr(WIL):', safeAttr('WIL'), typeof safeAttr('WIL'));
  logger.silly('[LIMIT DEBUG] attrMap.LOG:', attrMap.LOG, typeof attrMap.LOG);
  logger.silly('[LIMIT DEBUG] attrMap.INT:', attrMap.INT, typeof attrMap.INT);
  logger.silly('[LIMIT DEBUG] attrMap.WIL:', attrMap.WIL, typeof attrMap.WIL);

  // --- Gear ---
  function extractAttributesMap(attributes) {
    const map = {};
    attributes.forEach(attr => {
      if (attr.name) map[attr.name] = attr.totalvalue;
    });
    return map;
  }

  // Generic attribute replacement for any value (robust, with logging)
  function replaceAttributeReference(val, attrMap) {
    if (typeof val === 'string') {
      const match = val.match(/^\{([A-Z]+)\}$/);
      if (match) {
        const attr = match[1];
        if (attrMap[attr] !== undefined) {
          logger.silly(`[ATTR REPLACE] Replacing ${val} with ${attrMap[attr]}`);
          return attrMap[attr];
        } else {
          logger.silly(`[ATTR REPLACE] No attribute found for ${val}, leaving as is.`);
        }
      }
    }
    return val;
  }

  function processGear(gearList, attrMap) {
    if (!Array.isArray(gearList)) return [];
    return gearList.map(gear => {
      // List all fields that could have attribute references
      const processed = {
        name: replaceAttributeReference(gear.name || gear.gearname || '', attrMap),
        category: replaceAttributeReference(gear.category || '', attrMap),
        rating: replaceAttributeReference(gear.rating, attrMap),
        equipped: gear.equipped === 'True' || gear.equipped === true,
        quantity: replaceAttributeReference(gear.qty, attrMap),
        devicerating: replaceAttributeReference(gear.devicerating, attrMap),
        attack: replaceAttributeReference(gear.attack, attrMap),
        sleaze: replaceAttributeReference(gear.sleaze, attrMap),
        dataprocessing: replaceAttributeReference(gear.dataprocessing, attrMap),
        firewall: replaceAttributeReference(gear.firewall, attrMap),
        source: gear.source && gear.page ? `${replaceAttributeReference(gear.source, attrMap)} ${replaceAttributeReference(gear.page, attrMap)}` : '',
      };
      let children = [];
      // children.gear (recursive, always treat as array)
      if (gear.children && gear.children.gear) {
        const childGearArr = Array.isArray(gear.children.gear) ? gear.children.gear : [gear.children.gear];
        children = children.concat(processGear(childGearArr, attrMap));
      }
      // mods
      if (gear.mods) {
        const modsArr = Array.isArray(gear.mods) ? gear.mods : [gear.mods];
        modsArr.forEach(mod => {
          if (mod) {
            children = children.concat(processGear([mod], attrMap));
          }
        });
      }
      // accessories
      if (gear.accessories) {
        const accArr = Array.isArray(gear.accessories) ? gear.accessories : [gear.accessories];
        accArr.forEach(acc => {
          if (acc) {
            children = children.concat(processGear([acc], attrMap));
          }
        });
      }
      // gears.gear (full recursion for nested gear)
      if (gear.gears && gear.gears.gear) {
        const nestedGearArr = Array.isArray(gear.gears.gear) ? gear.gears.gear : [gear.gears.gear];
        children = children.concat(processGear(nestedGearArr, attrMap));
      }
      if (children.length > 0) {
        processed.children = children;
      }
      return processed;
    });
  }

  function collectAllGear(character, attrMap) {
    let allGear = [];
    // Top-level gear (if present)
    if (character.gears && character.gears.gear) {
      allGear = allGear.concat(processGear(Array.isArray(character.gears.gear) ? character.gears.gear : [character.gears.gear], attrMap));
    }
    // Gear inside weapons > accessories > gears
    if (character.weapons && character.weapons.weapon) {
      const weapons = Array.isArray(character.weapons.weapon) ? character.weapons.weapon : [character.weapons.weapon];
      weapons.forEach(weapon => {
        if (weapon.accessories && weapon.accessories.accessory) {
          const accessories = Array.isArray(weapon.accessories.accessory) ? weapon.accessories.accessory : [weapon.accessories.accessory];
          accessories.forEach(acc => {
            if (acc.gears && acc.gears.gear) {
              allGear = allGear.concat(processGear(Array.isArray(acc.gears.gear) ? acc.gears.gear : [acc.gears.gear], attrMap));
            }
          });
        }
      });
    }
    // Gear inside armors > armormods > gears
    if (character.armors && character.armors.armor) {
      const armors = Array.isArray(character.armors.armor) ? character.armors.armor : [character.armors.armor];
      armors.forEach(armor => {
        if (armor.armormods && armor.armormods.armormod) {
          const mods = Array.isArray(armor.armormods.armormod) ? armor.armormods.armormod : [armor.armormods.armormod];
          mods.forEach(mod => {
            if (mod.gears && mod.gears.gear) {
              allGear = allGear.concat(processGear(Array.isArray(mod.gears.gear) ? mod.gears.gear : [mod.gears.gear], attrMap));
            }
          });
        }
      });
    }
    return allGear;
  }

  const attributesMap = extractAttributesMap(filteredAttributes);
  result.gear = collectAllGear(character, attributesMap);

  return result;
}

module.exports = { parseCharacter };

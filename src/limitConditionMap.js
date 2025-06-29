// Mapping of Chummer limit condition codes to user-friendly descriptions
// Extend this as needed for your use case

const limitConditionMap = {
  "LimitCondition_IntimidationVisible": "Only for Intimidation when visible",
  "LimitCondition_Visible": "Only when visible",
  "LimitCondition_TestSneakingThermal": "Only for Sneaking against thermographic vision or thermal sensors",
  "LimitCondition_SkillsActivePerceptionVisual": "Only for Perception (visual) tests",
  // Add more mappings as needed
};

function getFriendlyLimitCondition(code) {
  if (!code) return '';
  return limitConditionMap[code] || code;
}

// Utility to extract limit modifiers from a bonus object (used by parseCharacter)
function extractLimitModifiersFromBonus(bonus, rating) {
  let mods = [];
  if (!bonus) return mods;
  if (Array.isArray(bonus)) {
    bonus.forEach(b => mods.push(...extractLimitModifiersFromBonus(b, rating)));
  } else if (typeof bonus === 'object') {
    if (bonus.limitmodifier) {
      if (Array.isArray(bonus.limitmodifier)) {
        bonus.limitmodifier.forEach(lm => {
          mods.push({ ...lm, value: lm.value === 'Rating' ? rating : lm.value });
        });
      } else {
        const lm = bonus.limitmodifier;
        mods.push({ ...lm, value: lm.value === 'Rating' ? rating : lm.value });
      }
    }
  }
  return mods;
}

module.exports = { limitConditionMap, getFriendlyLimitCondition, extractLimitModifiersFromBonus };

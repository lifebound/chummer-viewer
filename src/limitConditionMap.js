// Mapping of Chummer limit condition codes to user-friendly descriptions
// Extend this as needed for your use case

const winston = require('winston');
// Logger setup (inherits from parent app, but fallback for direct use)
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'warn',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'debug',
    format: winston.format.simple(),
    forceConsole: true,
  }));
}

const limitConditionMap = {
  "LimitCondition_IntimidationVisible": "Only for Intimidation when visible",
  "LimitCondition_Visible": "Only when visible",
  "LimitCondition_TestSneakingThermal": "Only for Sneaking against thermographic vision or thermal sensors",
  "LimitCondition_SkillsActivePerceptionVisual": "Only for Perception (visual) tests",
  // Add more mappings as needed
};

function getFriendlyLimitCondition(code) {
  logger.info('[limitConditionMap.js] Enter getFriendlyLimitCondition');
  if (!code) {
    logger.warn('[limitConditionMap.js] getFriendlyLimitCondition called with empty code');
    return '';
  }
  const friendly = limitConditionMap[code] || code;
  logger.debug(`[limitConditionMap.js] getFriendlyLimitCondition: code=${code}, friendly=${friendly}`);
  logger.info('[limitConditionMap.js] Leave getFriendlyLimitCondition');
  return friendly;
}

// Utility to extract limit modifiers from a bonus object (used by parseCharacter)
function extractLimitModifiersFromBonus(bonus, rating) {
  logger.info('[limitConditionMap.js] Enter extractLimitModifiersFromBonus');
  let mods = [];
  if (!bonus) {
    logger.warn('[limitConditionMap.js] extractLimitModifiersFromBonus called with empty bonus');
    return mods;
  }
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
  logger.debug(`[limitConditionMap.js] extractLimitModifiersFromBonus: found ${mods.length} modifiers`);
  logger.info('[limitConditionMap.js] Leave extractLimitModifiersFromBonus');
  return mods;
}

module.exports = { limitConditionMap, getFriendlyLimitCondition, extractLimitModifiersFromBonus };

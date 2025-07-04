import {skillAttributeMap} from './skillAttributeMap.js'; // Import the skill-attribute mapping

// --- Critter Data Definitions ---
// Now includes a 'type' property to distinguish between Sprites and Spirits (or others).
// baseAttributes will contain relevant modifiers based on the critter's type.
const critterBaseData = {
    "Courier Sprite": {
        type: "Sprite", // New: identify as a Sprite
        // For sprites, these are modifiers to Force for ATT, SLZ, DP, FWL
        baseAttributes: { ATT: 0, SLZ: 3, DP: 1, FWL: 2 },
        initiativeType: "Matrix",
        initiativeDice: 4, 
        baseSkills: { // Base skill ratings before adding attribute
            'Computer': 2,
            'Hacking': 2,
        },
        powers: ["Cookie", "Hash"],
        optionalPowers: [],
        special: "",
        notes: "Courier sprites are great at delivering messages securely and are pretty good trackers."
    },
    "Crack Sprite": {
        type: "Sprite", // New: identify as a Sprite
        // For sprites, these are modifiers to Force for ATT, SLZ, DP, FWL
        baseAttributes: { ATT: 0, SLZ: 3, DP: 2, FWL: 1 },
        initiativeType: "Matrix",
        initiativeDice: 4, 
        baseSkills: { // Base skill ratings before adding attribute
            'Computer': 2,
            'Electronic Warfare': 2,
            'Hacking': 2,
        },
        powers: ["Suppression"],
        optionalPowers: [],
        special: "",
        notes: "If you need a sprite for a quiet run that stays under the radar, the Crack sprite has what you need."
    },
    "Data Sprite": {
        type: "Sprite", // New: identify as a Sprite
        // For sprites, these are modifiers to Force for ATT, SLZ, DP, FWL
        baseAttributes: { ATT: -1, SLZ: 0, DP: 4, FWL: 1 },
        initiativeType: "Matrix",
        initiativeDice: 4, 
        baseSkills: { // Base skill ratings before adding attribute
            'Computer': 2,
            'Electronic Warfare': 2,
        },
        powers: ["Camouflage", "Watermark"],
        optionalPowers: [],
        special: "",
        notes: "Data sprites are masters of finding and manipulating data. They make great librarians, searchbots, and trivia contest ringers."
    },
    "Fault Sprite": {
        type: "Sprite", // New: identify as a Sprite
        // For sprites, these are modifiers to Force for ATT, SLZ, DP, FWL
        baseAttributes: { ATT: 3, SLZ: 0, DP: 1, FWL: 2 },
        initiativeType: "Matrix",
        initiativeDice: 4, 
        baseSkills: { // Base skill ratings before adding attribute
            'Computer': 2,
            'Cybercombat': 2,
            'Hacking': 2,
        },
        powers: ["Electron Storm"],
        optionalPowers: [],
        special: "",
        notes: "The Fault sprite is the one you want to have your back in a fight. Cold as IC and twice as tenacious, they’ll shred your enemies in the blink of an icon."
    },
    "Machine Sprite": {
        type: "Sprite", // New: identify as a Sprite
        // For sprites, these are modifiers to Force for ATT, SLZ, DP, FWL
        baseAttributes: { ATT: 1, SLZ: 0, DP: 3, FWL: 2 },
        initiativeType: "Matrix",
        initiativeDice: 4, 
        baseSkills: { // Base skill ratings before adding attribute
            'Computer': 2,
            'Electronic Warfare': 2,
            'Hacking': 2,
        },
        powers: ["Diagnostics", "Gremlins","Stability"],
        optionalPowers: [],
        special: "",
        notes: "Of all the sprites, the Machine sprite is the most likely to interact with the physical world, although that would happen through a device. They’re experts at all sorts of electronics."
    },
    "Companion Sprite": {
        type: "Sprite", // New: identify as a Sprite
        // For sprites, these are modifiers to Force for ATT, SLZ, DP, FWL
        baseAttributes: { ATT: -1, SLZ: 1, DP: 0, FWL: 4 },
        initiativeType: "Matrix",
        initiativeDice: 4, 
        baseSkills: { // Base skill ratings before adding attribute
            'Computer': 2,
            'Electronic Warfare': 2,
        },
        powers: ["Shield, Bodyguard"],
        optionalPowers: [],
        special: "",
        notes: "Companion sprites are always by your side, right when you need them. They exist to protect and serve."
    },
    "Generalist Sprite": {
        type: "Sprite", // New: identify as a Sprite
        // For sprites, these are modifiers to Force for ATT, SLZ, DP, FWL
        baseAttributes: { ATT: 1, SLZ: 1, DP: 1, FWL: 1 },
        initiativeType: "Matrix",
        initiativeDice: 4, 
        baseSkills: { // Base skill ratings before adding attribute
            'Computer': 2,
            'Electronic Warfare': 2,
            'Hacking': 2,
        },
        powers: ["Any Two Optional Powers"],
        optionalPowers: [""],
        special: "",
        notes: "Not particularly good at any one thing, but also not bad. They are what you make of them."
    },
    "Spirit of Air": {
        type: "Spirit", // New: identify as a Spirit
        // For spirits, these are modifiers to Force for BOD, AGI, REA, etc.
        baseAttributes: { BOD: 0, AGI: 2, REA: 2, STR: 0, WIL: 2, LOG: 0, INT: 2, CHA: 0 },
        initiativeType: "Astral", // Or Physical for combat
        initiativeDice: 2, // Standard for Physical (REA + INT + 2D6), Astral (INT x 2 + 3D6)
        baseSkills: {
            'Unarmed Combat': 2,
            'Perception': 2,
            'Sneaking': 2,
            'Astral Combat': 2,
            'Assensing': 2
        },
        powers: ["Concealment (Self)", "Engulf", "Movement", "Sapience"],
        optionalPowers: ["Energy Aura (Electricity)", "Fear", "Influence", "Materialization"],
        special: "Spirits of Air gain a +2 bonus to all Movement tests.",
        notes: "Fast and elusive spirits, masters of wind and air."
    },
    "Spirit of Fire": {
        type: "Spirit",
        baseAttributes: { BOD: 2, AGI: 0, REA: 0, STR: 2, WIL: 2, LOG: 0, INT: 2, CHA: 0 },
        initiativeType: "Physical", // Can also be Astral
        initiativeDice: 2,
        baseSkills: {
            'Unarmed Combat': 3,
            'Intimidation': 2,
            'Perception': 1
        },
        powers: ["Concealment (Self)", "Engulf", "Elemental Attack (Fire)", "Materialization", "Sapience"],
        optionalPowers: ["Energy Aura (Fire)", "Fear", "Influence"],
        special: "Spirits of Fire deal an additional 2 boxes of Fire damage on successful melee attacks.",
        notes: "Aggressive and destructive spirits, embodying pure flame."
    },
    // Add more critter definitions here as needed
};

// --- Helper Function ---

/**
 * Calculates and returns the processed data for a given critter.
 * @param {string} critterName - The name of the critter (e.g., "Crack Sprite").
 * @param {number} force - The Force rating of the critter.
 * @returns {object | null} An object containing the critter's calculated stats, or null if not found.
 */
export function getProcessedCritterData(critterName, force) {
    const baseCritter = critterBaseData[critterName];

    if (!baseCritter) {
        console.warn(`[CritterHelper] Critter '${critterName}' not found in base data.`);
        return null;
    }

    const processedCritter = {
        name: critterName,
        force: force,
        attributes: {},
        initiativeDicePool: "",
        initiativeType: baseCritter.initiativeType,
        skills: {},
        powers: [...baseCritter.powers],
        optionalPowers: [...baseCritter.optionalPowers],
        special: baseCritter.special,
        notes: baseCritter.notes
    };

    // Internal variables for calculations, not necessarily added to processedCritter.attributes
    let _REA, _INT, _LOG, _CHA, _WIL, _BOD, _AGI, _STR;
    let _DR, _ATT, _SLZ, _DP, _FWL; // Sprite-specific attributes

    if (baseCritter.type === "Sprite") {
        // Calculate Sprite-specific attributes and add them to processedCritter.attributes
        //_DR = force + (baseCritter.baseAttributes.DR ?? 0);
        _ATT = force + (baseCritter.baseAttributes.ATT ?? 0);
        _SLZ = force + (baseCritter.baseAttributes.SLZ ?? 0);
        _DP = force + (baseCritter.baseAttributes.DP ?? 0);
        _FWL = force + (baseCritter.baseAttributes.FWL ?? 0);

        //processedCritter.attributes.DR = _DR;
        processedCritter.attributes.ATT = _ATT;
        processedCritter.attributes.SLZ = _SLZ;
        processedCritter.attributes.DP = _DP;
        processedCritter.attributes.FWL = _FWL;

        // Map Sprite attributes to traditional attributes for internal skill/initiative consistency
        // These are for calculation reference only and will NOT be added to processedCritter.attributes
        _CHA = _ATT; // Attack maps to Charisma
        _INT = _SLZ; // Sleaze maps to Intuition
        _LOG = _DP;  // Data Processing maps to Logic
        _WIL = _FWL; // Firewall maps to Willpower

        // For BOD, AGI, REA, STR on sprites, which are not primary, default them to Force for internal calculations
        _BOD = force;
        _AGI = force;
        _REA = force;
        _STR = force;

    } else { // Spirit/Traditional critter attributes
        for (const attrAbbrev in baseCritter.baseAttributes) {
            if (baseCritter.baseAttributes.hasOwnProperty(attrAbbrev)) {
                const calculatedValue = force + baseCritter.baseAttributes[attrAbbrev];
                processedCritter.attributes[attrAbbrev] = calculatedValue;

                // Also populate internal variables for direct use
                switch (attrAbbrev) {
                    case 'REA': _REA = calculatedValue; break;
                    case 'INT': _INT = calculatedValue; break;
                    case 'LOG': _LOG = calculatedValue; break;
                    case 'CHA': _CHA = calculatedValue; break;
                    case 'WIL': _WIL = calculatedValue; break;
                    case 'BOD': _BOD = calculatedValue; break;
                    case 'AGI': _AGI = calculatedValue; break;
                    case 'STR': _STR = calculatedValue; break;
                }
            }
        }
    }

    // 2. Calculate Initiative Dice Pool (Corrected Format and Formulas)
    let staticInitiativeValue = 0;
    let diceCount = baseCritter.initiativeDice;

    if (baseCritter.type === "Spirit") {
        if (baseCritter.initiativeType === "Physical") {
            // (force x 2) + base REA modifier + 2D6
            staticInitiativeValue = (force * 2) + (baseCritter.baseAttributes.REA ?? 0);
        } else if (baseCritter.initiativeType === "Astral") {
            // fx2 + 3d6
            staticInitiativeValue = force * 2;
        }
    } else if (baseCritter.type === "Sprite") {
        if (baseCritter.initiativeType === "Matrix") {
            // fx2 + base data processing modifier + 4d6
            staticInitiativeValue = (force * 2) + (baseCritter.baseAttributes.DP ?? 0);
        }
    }

    // Assign the formatted initiative string
    if (staticInitiativeValue !== 0 || diceCount !== 0) { // Only assign if initiative is meaningful
      processedCritter.initiativeDicePool = `${staticInitiativeValue} + ${diceCount}D6`;
    } else {
      processedCritter.initiativeDicePool = 'N/A'; // Fallback if no specific rule matched
    }


    // 3. Calculate Skills and Dice Pools (no changes needed here)
    for (const skillName in baseCritter.baseSkills) {
        if (baseCritter.baseSkills.hasOwnProperty(skillName)) {
            const baseRating = baseCritter.baseSkills[skillName];
            const governingAttributeAbbreviation = skillAttributeMap[skillName];

            let attributeValueForSkill;
            switch (governingAttributeAbbreviation) {
                case 'BOD': attributeValueForSkill = _BOD; break;
                case 'AGI': attributeValueForSkill = _AGI; break;
                case 'REA': attributeValueForSkill = _REA; break;
                case 'STR': attributeValueForSkill = _STR; break;
                case 'WIL': attributeValueForSkill = _WIL; break;
                case 'LOG': attributeValueForSkill = _LOG; break;
                case 'INT': attributeValueForSkill = _INT; break;
                case 'CHA': attributeValueForSkill = _CHA; break;
                //case 'DR': attributeValueForSkill = _DR; break;
                case 'ATT': attributeValueForSkill = _ATT; break;
                case 'SLZ': attributeValueForSkill = _SLZ; break;
                case 'DP': attributeValueForSkill = _DP; break;
                case 'FWL': attributeValueForSkill = _FWL; break;
                default: attributeValueForSkill = undefined;
            }

            if (attributeValueForSkill !== undefined && attributeValueForSkill !== null) {
                processedCritter.skills[skillName] = force + attributeValueForSkill;
            } else {
                console.warn(`[CritterHelper] Could not find governing attribute (${governingAttributeAbbreviation}) for skill: ${skillName}. Falling back to force only.`);
                processedCritter.skills[skillName] = force;
            }
        }
    }

    return processedCritter;
}

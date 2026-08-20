/**
 * =====================================================================
 * Content Moderation Policy Engine
 * =====================================================================
 * Deterministic policy rules and thresholds based on Hive's official
 * V2/V3 response semantics.
 */

export const MODERATION_POLICY_VERSION = 'v1.1';

/**
 * Text Moderation Thresholds (0 - 3 scale from Hive Text API)
 * 0 = Clean, 1 = Minor/Suggestive, 2 = Explicit/Targeted, 3 = Severe/Egregious
 * Tailored for professional CV, resume, and portfolio publishing safety.
 */
export const HIVE_TEXT_THRESHOLDS: Record<string, number> = {
  // Zero Tolerance (Score >= 1) - Child Safety, Self-Harm, Exploitation
  child_exploitation: 1,
  child_safety: 1,
  minor_explicitly_mentioned: 1,
  minor_implicitly_mentioned: 1,
  self_harm: 1,
  self_harm_intent: 1,

  // High Severity (Score >= 2) - Hate speech, Racism, Violence, Sexual/Harassment, Bullying, Defamation, Weapons, Drugs
  hate: 2,                 // Racism, slurs, hateful ideology, discrimination
  violence: 2,             // Physical violence descriptions, threats, assault
  violent_description: 2,  // Graphic violent descriptions
  sexual: 2,               // Explicit sexual solicitation, NSFW, vulgarity
  sexual_description: 2,   // Explicit sexual descriptions
  bullying: 2,             // Defamation, targeted harassment, cyberbullying
  weapons: 2,              // Firearms, weapon trafficking, explosives
  drugs: 2,                // Illicit narcotics, drug dealing, substance promotion
};

/**
 * Visual Moderation Thresholds (0.0 - 1.0 confidence score from Hive Visual API)
 * Deterministic thresholds to block NSFW/nudity, sexual acts, graphic gore/violence, weapons, and hate symbols.
 */
export const HIVE_VISUAL_THRESHOLDS: Record<string, number> = {
  general_nsfw: 0.80,
  general_suggestive: 0.95,
  yes_nude: 0.75,
  yes_male_nudity: 0.75,
  yes_female_nudity: 0.75,
  yes_sexual_activity: 0.70,
  violence: 0.80,
  gore: 0.80,
  gun_in_hand: 0.80,
  hate_symbols: 0.80,
  middle_finger: 0.85,
};

export interface PolicyEvaluationResult {
  allowed: boolean;
  reason?: string;
  violations: string[];
}

/**
 * Evaluates a Hive Text API response against our deterministic policy
 */
export function evaluateHiveTextResponse(responseObj: unknown): PolicyEvaluationResult {
  const violations: string[] = [];

  if (!responseObj || typeof responseObj !== 'object') {
    return { allowed: true, violations: [] };
  }

  const rawObj = responseObj as Record<string, any>;

  // 1. Check if top-level or sub-status has text_filters (pattern matches)
  const statusArray = Array.isArray(rawObj.status) ? rawObj.status : [rawObj];
  for (const statusItem of statusArray) {
    const resp = statusItem?.response || statusItem;

    // Pattern matching / text filters (e.g. profanity matches from Hive dictionary)
    if (Array.isArray(resp?.text_filters) && resp.text_filters.length > 0) {
      for (const filter of resp.text_filters) {
        violations.push(`Pattern match: ${filter.type || 'profanity'}`);
      }
    }

    // Deep learning classification classes
    if (Array.isArray(resp?.output)) {
      for (const out of resp.output) {
        if (Array.isArray(out.classes)) {
          for (const cls of out.classes) {
            const className = String(cls.class || '').toLowerCase();
            const score = Number(cls.value !== undefined ? cls.value : cls.score);

            if (className in HIVE_TEXT_THRESHOLDS) {
              const maxAllowed = HIVE_TEXT_THRESHOLDS[className];
              if (score >= maxAllowed) {
                violations.push(`Hive Class [${className}] severity ${score} >= threshold ${maxAllowed}`);
              }
            }
          }
        }
      }
    }
  }

  // 2. Moderation Dashboard / V2 Triggered Rules check (if project uses rule triggers)
  if (Array.isArray(rawObj.triggered_rules) && rawObj.triggered_rules.length > 0) {
    for (const rule of rawObj.triggered_rules) {
      violations.push(`Triggered Rule: ${rule.rule_name || rule.rule_id || 'Policy Violation'}`);
    }
  }

  if (violations.length > 0) {
    return {
      allowed: false,
      reason: 'Content violated platform safety policy',
      violations,
    };
  }

  return { allowed: true, violations: [] };
}

/**
 * Evaluates a Hive Visual API response against our visual policy
 */
export function evaluateHiveVisualResponse(responseObj: unknown): PolicyEvaluationResult {
  const violations: string[] = [];

  if (!responseObj || typeof responseObj !== 'object') {
    return { allowed: true, violations: [] };
  }

  const rawObj = responseObj as Record<string, any>;
  const statusArray = Array.isArray(rawObj.status) ? rawObj.status : [rawObj];
  for (const statusItem of statusArray) {
    const resp = statusItem?.response || statusItem;

    if (Array.isArray(resp?.output)) {
      for (const out of resp.output) {
        if (Array.isArray(out.classes)) {
          for (const cls of out.classes) {
            const className = String(cls.class || '').toLowerCase();
            const score = Number(cls.value !== undefined ? cls.value : cls.score);

            if (className in HIVE_VISUAL_THRESHOLDS) {
              const threshold = HIVE_VISUAL_THRESHOLDS[className];
              if (score >= threshold) {
                violations.push(`Visual [${className}] confidence ${score} >= ${threshold}`);
              }
            }
          }
        }
      }
    }
  }

  if (violations.length > 0) {
    return {
      allowed: false,
      reason: 'Image violated visual moderation policy',
      violations,
    };
  }

  return { allowed: true, violations: [] };
}

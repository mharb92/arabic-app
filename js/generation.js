/**
 * generation.js - Dynamic unit generation via Claude API
 * Generates 1-2 units based on placement results and mastery context
 * Saves to dynamic_units table, supports background prefetch
 */

import { AppState, save } from './state.js';
import { EDGE_FUNCTION_URL, SUPABASE_ANON_KEY, CLAUDE_MODEL } from './config.js';
import { saveDynamicUnit, loadDynamicUnits } from './database.js';
import { showToast } from './utils/ui.js';

/**
 * Generate units after placement test completes
 * Generates 2 units: current + next
 * @returns {Array} generated units
 */
export async function generateInitialUnits() {
  const level = AppState.profile.placementLevel ?? AppState.profile.placement_level ?? 0;
  const speakerType = AppState.profile.speaker_type || 'heritage';
  const goals = AppState.profile.goals || ['conversational fluency'];
  const dialect = AppState.profile.dialect || 'Palestinian';

  const units = [];

  // Generate unit 1
  const unit1 = await generateUnit({
    unitNumber: 1,
    level,
    speakerType,
    goals,
    dialect,
    masteryContext: null
  });
  if (unit1) units.push(unit1);

  // Generate unit 2
  const unit2 = await generateUnit({
    unitNumber: 2,
    level,
    speakerType,
    goals,
    dialect,
    masteryContext: null,
    previousUnit: unit1
  });
  if (unit2) units.push(unit2);

  return units;
}

/**
 * Background prefetch: generate the next unit based on current progress
 * Called when user is ~50% through current unit
 * @param {number} nextUnitNumber - the unit number to generate
 * @param {object} masteryContext - performance data from completed units
 */
export async function prefetchNextUnit(nextUnitNumber, masteryContext) {
  const level = AppState.profile.placementLevel ?? AppState.profile.placement_level ?? 0;
  const speakerType = AppState.profile.speaker_type || 'heritage';
  const goals = AppState.profile.goals || ['conversational fluency'];
  const dialect = AppState.profile.dialect || 'Palestinian';

  try {
    const unit = await generateUnit({
      unitNumber: nextUnitNumber,
      level,
      speakerType,
      goals,
      dialect,
      masteryContext
    });
    return unit;
  } catch (err) {
    // Silent failure for background prefetch
    console.warn('Background prefetch failed (non-critical):', err.message);
    return null;
  }
}

/**
 * Generate a single unit via Claude API
 */
async function generateUnit({ unitNumber, level, speakerType, goals, dialect, masteryContext, previousUnit }) {
  const levelLabels = ['Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced'];
  const levelLabel = levelLabels[level] || 'Beginner';

  const goalsText = Array.isArray(goals) ? goals.join(', ') : String(goals);

  let masteryBlock = '';
  if (masteryContext && masteryContext.weakPhrases && masteryContext.weakPhrases.length > 0) {
    masteryBlock = `\n\nThe student struggled with these phrases in previous units — incorporate reinforcement:\n${masteryContext.weakPhrases.slice(0, 8).map(p => `- ${p.ar} (${p.en})`).join('\n')}`;
  }

  let previousBlock = '';
  if (previousUnit) {
    previousBlock = `\n\nThe previous unit was "${previousUnit.title}" covering: ${previousUnit.phrases.slice(0, 4).map(p => p.en).join(', ')}, etc. Choose a DIFFERENT topic for variety.`;
  }

  const unitTopicHints = [
    'essential greetings and introductions',
    'family and relationships',
    'food, dining, and hospitality',
    'directions, transportation, and getting around',
    'shopping, numbers, and daily transactions',
    'expressing feelings, opinions, and desires',
    'work, education, and professional life',
    'health, body, and emergencies',
    'weather, nature, and environment',
    'culture, traditions, and celebrations'
  ];
  const topicHint = unitTopicHints[(unitNumber - 1) % unitTopicHints.length];

  const systemPrompt = `You are a Palestinian Arabic curriculum designer. You create practical, conversational lesson units for language learners. Always use Palestinian Arabic dialect, not MSA. Return ONLY valid JSON with no markdown or explanation.`;

  const userPrompt = `Generate lesson unit ${unitNumber} for a ${speakerType} learner at ${levelLabel} level.

Dialect: ${dialect}
Learning goals: ${goalsText}
Suggested topic area: ${topicHint}${masteryBlock}${previousBlock}

Return ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "id": "dynamic_unit_${unitNumber}",
  "title": "Short descriptive title",
  "subtitle": "One-line description",
  "phrases": [
    {"ar": "Arabic text with harakat", "rom": "romanization", "en": "English translation", "context": "When/how to use this phrase"},
    // ... exactly 12 phrases total
  ]
}

Rules:
- Exactly 12 phrases, no more, no less
- Use Palestinian Arabic dialect specifically
- Include harakat (vowel marks) on Arabic text
- Romanization should be intuitive for English speakers
- Context should explain when/where to use the phrase
- Progress from simpler to more complex within the unit
- ${levelLabel} level: ${level <= 1 ? 'basic vocabulary, short phrases, everyday situations' : level <= 2 ? 'complete sentences, common expressions, practical scenarios' : 'complex structures, idiomatic expressions, nuanced conversations'}`;

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`Generation API error: ${response.status}`);
  }

  const data = await response.json();

  // Parse Claude's response
  let unit;
  try {
    const text = data.content?.[0]?.text || data.response || '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    unit = JSON.parse(cleaned);
  } catch (parseError) {
    console.error('Unit parse error:', parseError);
    throw new Error('Failed to parse generated unit');
  }

  // Validate structure
  if (!unit || !unit.phrases || !Array.isArray(unit.phrases) || unit.phrases.length < 1) {
    throw new Error('Invalid unit structure');
  }

  // Ensure ID is correct
  unit.id = `dynamic_unit_${unitNumber}`;

  // Save to Supabase
  if (AppState.user && AppState.user.email) {
    await saveDynamicUnit(AppState.user.email, unit.id, unit);
  }

  return unit;
}

/**
 * Render the generation loading screen
 */
export function renderGenerationScreen(container, onComplete) {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100dvh;padding:32px;text-align:center;background:var(--cream);">
      <div style="width:60px;height:60px;border:4px solid var(--border);border-top-color:var(--green);border-radius:50%;animation:spin 1s linear infinite;margin-bottom:24px;"></div>
      <h2 style="font-family:var(--font-display);font-size:22px;margin-bottom:8px;">Building Your Course</h2>
      <p style="color:var(--text-soft);font-size:15px;margin-bottom:8px;">Creating personalized lessons based on your level...</p>
      <p style="color:var(--text-soft);font-size:13px;">This takes about 10 seconds</p>
    </div>
  `;

  generateInitialUnits().then(units => {
    if (units && units.length > 0) {
      // Store in AppState
      if (!AppState.dynamicUnits) AppState.dynamicUnits = [];
      AppState.dynamicUnits = units;
      save();
      if (onComplete) onComplete(true);
    } else {
      showOfflineMessage(container, onComplete);
    }
  }).catch(err => {
    console.error('Generation failed:', err);
    showOfflineMessage(container, onComplete);
  });
}

/**
 * Show offline/error message with retry
 */
function showOfflineMessage(container, onRetryComplete) {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100dvh;padding:32px;text-align:center;background:var(--cream);">
      <div style="font-size:48px;margin-bottom:16px;">📡</div>
      <h2 style="font-family:var(--font-display);font-size:22px;margin-bottom:8px;">Connection Needed</h2>
      <p style="color:var(--text-soft);font-size:15px;margin-bottom:24px;">
        Connect to the internet to unlock your next unit. We need to build a personalized lesson for you.
      </p>
      <button class="btn-primary" id="retry-btn" style="padding:14px 32px;font-size:16px;">
        Try Again
      </button>
      <button class="btn-secondary" id="back-btn" style="margin-top:12px;padding:12px 24px;font-size:14px;">
        Back to Home
      </button>
    </div>
  `;

  const retryBtn = container.querySelector('#retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      renderGenerationScreen(container, onRetryComplete);
    });
  }

  const backBtn = container.querySelector('#back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('home'));
    });
  }
}

/**
 * Get mastery context from completed units for adaptive generation
 */
export function getMasteryContext() {
  const weakPhrases = [];

  if (AppState.phrasesMastery) {
    Object.entries(AppState.phrasesMastery).forEach(([phrase, data]) => {
      if (data.mastery < 50) {
        weakPhrases.push({ ar: phrase, en: data.en || '' });
      }
    });
  }

  // Also check weakWords array
  if (AppState.weakWords && AppState.weakWords.length > 0) {
    // weakWords are phrase IDs, not actual phrases — limited usefulness
    // but we include the count for context
  }

  return {
    weakPhrases,
    totalWeakCount: weakPhrases.length + (AppState.weakWords?.length || 0),
    completedUnits: Object.keys(AppState.unitProgress || {}).filter(
      k => AppState.unitProgress[k]?.mastered
    ).length
  };
}

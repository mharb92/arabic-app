/**
 * generation.js - Phase plan + lesson generation via Claude API
 * v2: Dictionary-constrained, block-based lessons for heritage speakers
 * Legacy unit generation preserved for backward compat (Aya/beginners)
 */

import { AppState, save } from './state.js';
import { EDGE_FUNCTION_URL, SUPABASE_ANON_KEY, CLAUDE_MODEL } from './config.js';
import {
  queryDictionary,
  savePhasePlan,
  loadLatestPhasePlan,
  saveLessonProgress,
  loadCurrentLesson,
  loadLastQuizResult,
  loadMasteryForGeneration
} from './database.js';
import { showToast } from './utils/ui.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const CONTENT_RATIOS = {
  1: { phrases: 0.30, patterns: 0.30, dialogues: 0.15, conjugation: 0.10, production: 0.10, culture: 0.05 },
  2: { phrases: 0.20, patterns: 0.25, dialogues: 0.25, conjugation: 0.10, production: 0.15, culture: 0.05 },
  3: { phrases: 0.10, patterns: 0.15, dialogues: 0.35, conjugation: 0.05, production: 0.30, culture: 0.05 }
};

const RANK_THRESHOLDS = { 0: 500, 1: 500, 2: 1000, 3: 2000, 4: 2728 };

const SYSTEM_PROMPT = `You are a Palestinian Arabic curriculum designer and lesson author for a language learning app called Hoopoe (الهدهد).

DIALECT RULES — Palestinian Arabic (Urban Jerusalem/Ramallah), NOT MSA, NOT Egyptian, NOT Gulf:
- "want" = بدي (biddi), NEVER عايز or أريد
- "what" = شو (shu), NEVER إيش or ماذا in conversational speech
- "now" = هلق (halla'), NEVER دلوقتي or الآن in casual speech
- "this" (m) = هاد (hād), (f) = هاي (hāy)
- "not" = مش (mish) or ما (mā) + verb
- Future = رح (ra7) + verb, NEVER هـ prefix
- Progressive = عم (3am) + verb
- Present tense = b- prefix: بحكي، بروح، بعرف
- Possessive suffixes: ـي، ـك، ـه، ـها، ـنا، ـكم، ـهم
- Urban ق → glottal stop (ء): قال → ءال
- "there is" = في (fī)
- Questions: intonation-based in casual speech, not هل

DIALECT TAGS (from dictionary):
- D = dialect-only (no MSA equivalent in this form)
- D-var = regional variant (teach main urban form, mention variant)
- S = shared with MSA (same form + meaning)
- M = MSA-origin, adapted to Palestinian pronunciation
- MSA = formal register word used in educated speech
- SL = slang/informal (use sparingly, Phase 3 only)

ROMANIZATION — intuitive English-friendly:
- ع = 3, ح = 7, خ = kh, ش = sh, غ = gh, ق = ' (glottal)
- Long vowels: aa, ee, oo. No macrons or special Unicode.

HERITAGE SPEAKER CONTEXT:
- Heritage speakers grew up hearing Palestinian Arabic but may not read script or produce speech confidently
- They have large passive vocabulary but poor active production
- Don't waste time teaching vocabulary they already recognize — push production and script
- Grammar explanation should be intuitive ("you already say هاد — here's the pattern behind it") not academic

Return ONLY valid JSON. No markdown, no explanation, no preamble.`;

// ============================================================================
// PHASE PLAN GENERATION
// ============================================================================

/**
 * Generate a 30-day phase plan
 * @param {string} email
 * @param {number} phaseNumber - 1, 2, or 3
 * @param {object} [prevPhasePerformance] - stats from previous phase
 * @returns {object|null} the saved phase plan
 */
export async function generatePhasePlan(email, phaseNumber = 1, prevPhasePerformance = null) {
  const profile = AppState.profile || {};
  const pp = profile.placement_profile || {};
  const goals = Array.isArray(profile.goals) ? profile.goals.join(', ') : (profile.goals || 'conversational fluency');
  const ratios = CONTENT_RATIOS[phaseNumber] || CONTENT_RATIOS[1];

  // Build category strength/weakness lists from placement
  const catScores = pp.category_scores || {};
  const strengths = Object.entries(catScores).filter(([, s]) => s > 0.7).map(([c]) => c);
  const weaknesses = Object.entries(catScores).filter(([, s]) => s < 0.4).map(([c]) => c);

  let prevBlock = '';
  if (prevPhasePerformance && phaseNumber > 1) {
    prevBlock = `
Previous phase performance:
- Lessons completed: ${prevPhasePerformance.completed || 0}/30
- Average quiz score: ${prevPhasePerformance.avgQuizScore || 0}%
- Persistent weak areas: ${(prevPhasePerformance.weakAreas || []).join(', ') || 'none identified'}
- Strong areas: ${(prevPhasePerformance.strongAreas || []).join(', ') || 'none identified'}`;
  }

  const ratioStr = Object.entries(ratios).map(([k, v]) => `${k} ${v}`).join(', ');

  const userPrompt = `Generate a 30-day phase plan for a heritage Palestinian Arabic learner.

Phase: ${phaseNumber} of 3
Day 90 goal: ${goals}

Skill profile from placement:
- Recognition: ${pp.recognition || 0}/5
- Production: ${pp.production || 0}/5
- Grammar intuition: ${pp.grammar_intuition || 0}/5
- Script comfort: ${pp.script_comfort || 0}/5
- Vocab breadth: ${pp.vocab_breadth || 0}/5
- Listening: ${pp.listening || 0}/5
- Category strengths: ${strengths.length ? strengths.join(', ') : 'none yet'}
- Category weaknesses: ${weaknesses.length ? weaknesses.join(', ') : 'none yet'}
${prevBlock}

Content ratio targets for phase ${phaseNumber}:
${ratioStr}

Return ONLY valid JSON matching this structure (no markdown):
{
  "phase_id": "phase_${phaseNumber}",
  "content_ratios": { ${Object.entries(ratios).map(([k, v]) => `"${k}": ${v}`).join(', ')} },
  "weeks": [
    {
      "week": 1,
      "theme": "...",
      "skills": ["...", "..."],
      "primary_categories": ["...", "..."],
      "related_categories": ["...", "..."],
      "target_patterns": ["...", "..."],
      "heritage_notes": "..."
    }
  ]
}

Rules:
- 4 weeks per phase
- Heritage speakers: don't waste time on passive vocabulary they already know. Push production and script reading.
- Each week should build on the previous week's patterns
- Week 4 should include review/consolidation of weeks 1-3
- target_patterns must use Palestinian Arabic specifically
- primary_categories and related_categories must use ONLY from these exact category names: Adjectives (Abstract), Adjectives (Physical), Adverbs, Animals, Blessings & Wishes, Body, City & Places, Clothing, Colors, Common Verbs, Communication, Conjunctions, Connectors & Discourse, Conversational Fillers, Cooking, Culture & Customs, Daily Routine Verbs, Days & Months, Directions, Education, Emotions, Exclamations, Family, Farewells, Food & Drink, Greetings, Health & Medical, Household, Idioms & Expressions, Money & Shopping, Motion Verbs, Nature & Weather, Numbers, Particles, Personality, Politeness, Prepositions, Professions, Pronouns, Question Words, Religion, Sentence Patterns, Slang, Technology, Time, Transportation`;

  const result = await callClaude(userPrompt, 2000);
  if (!result) return null;

  // Attach metadata and save
  const plan = {
    ...result,
    phase_number: phaseNumber,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    day_90_goal: goals,
    generated_at: new Date().toISOString()
  };

  const saved = await savePhasePlan(email, plan);
  return saved || plan;
}

// ============================================================================
// LESSON GENERATION
// ============================================================================

/**
 * Generate a single lesson from the phase plan + dictionary
 * @param {string} email
 * @param {object} phasePlan - from phase_plans table
 * @param {number} dayInPhase - 1-30
 * @param {boolean} [isRemedial] - was the last quiz failed?
 * @param {object} [remedialContext] - weak areas from last quiz
 * @returns {object|null} lesson progress record
 */
export async function generateLesson(email, phasePlan, dayInPhase, isRemedial = false, remedialContext = null) {
  const weekNumber = Math.min(4, Math.ceil(dayInPhase / 7));
  const weekPlan = phasePlan.weeks?.[weekNumber - 1];
  if (!weekPlan) {
    console.error('No week plan for week', weekNumber);
    return null;
  }

  // Determine level for rank threshold
  const pp = AppState.profile?.placement_profile || {};
  const level = pp.ceiling_round || AppState.profile?.placementLevel || 0;
  const rankThreshold = RANK_THRESHOLDS[Math.min(level, 4)];

  // Query dictionary for vocabulary pool
  const vocabPool = await queryDictionary(
    weekPlan.primary_categories || [],
    weekPlan.related_categories || [],
    rankThreshold
  );

  if (vocabPool.length === 0) {
    console.warn('Empty vocabulary pool — dictionary query returned 0 entries');
  }

  // Format vocab pool for prompt (tab-separated, compact)
  const vocabLines = vocabPool.map(e =>
    `${e.arabic}\t${e.romanization}\t${e.english}\t${e.pos}\t${e.category}\t${e.dialect_tag}${e.notes ? '\t' + e.notes : ''}`
  ).join('\n');

  // Load mastery data for this user
  const mastery = await loadMasteryForGeneration(email);

  // Compute block counts from content ratios
  const totalBlocks = 8; // target blocks per lesson
  const ratios = phasePlan.content_ratios || CONTENT_RATIOS[1];
  const blockCounts = {};
  for (const [type, ratio] of Object.entries(ratios)) {
    blockCounts[type] = Math.max(0, Math.round(totalBlocks * ratio));
  }
  // Ensure at least 1 phrase block
  if (!blockCounts.phrases) blockCounts.phrases = 1;

  let remedialBlock = '';
  if (isRemedial && remedialContext) {
    remedialBlock = `
Is remedial: true
Previous quiz weak areas: ${JSON.stringify(remedialContext)}
Focus this lesson on reinforcing these weak areas with NEW examples, not replaying old content.`;
  }

  const masteredList = mastery.mastered.slice(0, 20).map(w => w.arabic).join(', ') || 'none yet';
  const reinforceList = mastery.reinforcing.slice(0, 15).map(w => `${w.arabic} (${w.english})`).join(', ') || 'none';
  const weakList = mastery.weak.slice(0, 10).map(w => `${w.arabic} (${w.english})`).join(', ') || 'none';

  const lessonId = `lesson_${new Date().toISOString().split('T')[0]}_${email.split('@')[0]}`;

  const userPrompt = `Generate a lesson for a heritage Palestinian Arabic learner.

Phase: ${phasePlan.phase_number}, Week: ${weekNumber}, Day in phase: ${dayInPhase}
Theme: ${weekPlan.theme}
Skills to teach: ${(weekPlan.skills || []).join(', ')}
Target patterns: ${(weekPlan.target_patterns || []).join(', ')}
Heritage notes: ${weekPlan.heritage_notes || 'Standard heritage approach'}
${remedialBlock}

Content block targets (approximate):
- ${blockCounts.phrases || 2} phrase blocks
- ${blockCounts.patterns || 2} pattern blocks
- ${blockCounts.conjugation || 0} conjugation blocks (0-1 per lesson)
- ${blockCounts.dialogues || 1} dialogue blocks (0-1 per lesson)
- ${blockCounts.culture || 0} culture note blocks (0-1 per lesson)
- 1 listening block
- ${blockCounts.production || 1} production blocks

Estimated lesson length: 15-25 minutes

User's current mastery data:
- Words with mastery > 80 (skip these): ${masteredList}
- Words with mastery 30-60 (reinforce): ${reinforceList}
- Words with mastery < 30 (needs teaching): ${weakList}

VOCABULARY POOL — Use ONLY words from this pool for new vocabulary. You may compose sentences and dialogues freely from these words. Mark any word not in this pool with [UNVERIFIED]:
${vocabLines}

DIALECT TAG GUIDANCE:
- Prioritize D (dialect-only) and M (MSA-origin adapted) entries for conversational lessons
- Use MSA-tagged entries only when teaching formal register awareness
- Include SL (slang) entries sparingly, only in Phase 3
- D-var entries: mention the variant but teach the main urban form

Return ONLY valid JSON with this structure (no markdown):
{
  "lesson_id": "${lessonId}",
  "phase_id": "${phasePlan.phase_id}",
  "week": ${weekNumber},
  "day_in_phase": ${dayInPhase},
  "theme": "${weekPlan.theme}",
  "estimated_minutes": 20,
  "is_remedial": ${isRemedial},
  "blocks": [
    { "type": "phrase", "id": "b1", "arabic": "...", "romanization": "...", "english": "...", "audio_text": "...", "context": "...", "dictionary_ref": "dict_NNN" },
    { "type": "pattern", "id": "b2", "pattern_name": "...", "pattern_formula": "...", "examples": [...], "practice_prompt": "...", "practice_answer": {...} },
    { "type": "conjugation", "id": "b3", "verb_base": "...", "verb_english": "...", "root": "...", "forms": [...], "drill_prompts": [...] },
    { "type": "dialogue", "id": "b4", "title": "...", "lines": [...], "practice_role": "B", "practice_instructions": "..." },
    { "type": "culture_note", "id": "b5", "title": "...", "content": "..." },
    { "type": "listening", "id": "b6", "audio_text": "...", "options": [...] },
    { "type": "production", "id": "b7", "prompt_english": "...", "acceptable_answers": [...], "evaluation_notes": "..." }
  ],
  "vocab_items": ["dict_NNN", ...],
  "patterns_taught": ["pattern_name", ...]
}

Each block must have a unique "id" field (b1, b2, b3...).
For phrase blocks: include dictionary_ref if the word came from the vocabulary pool.
For pattern blocks: include exactly 3 examples and 1 practice prompt.
For conjugation blocks: include at least أنا/إنت/هو/هي forms.
For dialogue blocks: 4-6 lines, assign a practice_role.
For listening blocks: 1 correct + 2 incorrect options.
For production blocks: include 1-3 acceptable answer variations.`;

  const lesson = await callClaude(userPrompt, 3000);
  if (!lesson) return null;

  // Ensure lesson_id is set correctly
  lesson.lesson_id = lessonId;

  // Save to lesson_progress
  const progress = {
    lesson_id: lessonId,
    phase_id: phasePlan.phase_id,
    week: weekNumber,
    day_in_phase: dayInPhase,
    theme: weekPlan.theme,
    estimated_minutes: lesson.estimated_minutes || 20,
    is_remedial: isRemedial,
    remedial_context: remedialContext,
    lesson_content: lesson,
    status: 'not_started',
    current_block_index: 0,
    block_results: {},
    quiz_result: null
  };

  const saved = await saveLessonProgress(email, progress);
  return saved || progress;
}

// ============================================================================
// ORCHESTRATION — post-placement flow
// ============================================================================

/**
 * Full post-placement generation flow:
 * 1. Generate phase plan
 * 2. Generate first lesson
 * Returns { phasePlan, lesson } or null on failure
 */
export async function generatePostPlacement(email) {
  // Step 1: Phase plan
  const phasePlan = await generatePhasePlan(email, 1);
  if (!phasePlan) {
    console.error('Phase plan generation failed');
    return null;
  }

  // Step 2: First lesson
  const lesson = await generateLesson(email, phasePlan, 1);
  if (!lesson) {
    console.error('First lesson generation failed');
    return { phasePlan, lesson: null };
  }

  return { phasePlan, lesson };
}

/**
 * Generate next lesson (called when user finishes current lesson)
 * Handles remedial detection from last quiz
 */
export async function generateNextLesson(email) {
  const phasePlan = await loadLatestPhasePlan(email);
  if (!phasePlan) {
    console.error('No phase plan found for', email);
    return null;
  }

  // Determine day in phase
  const startDate = new Date(phasePlan.start_date);
  const dayInPhase = Math.max(1, Math.min(30,
    Math.ceil((Date.now() - startDate.getTime()) / 86400000)
  ));

  // Check if last quiz was failed (remedial trigger)
  const lastQuiz = await loadLastQuizResult(email, phasePlan.phase_id);
  let isRemedial = false;
  let remedialContext = null;

  if (lastQuiz?.quiz_result && lastQuiz.status === 'completed' && lastQuiz.quiz_result.passed === false) {
    isRemedial = true;
    remedialContext = lastQuiz.quiz_result.weak_areas || null;
  }

  return generateLesson(email, phasePlan, dayInPhase, isRemedial, remedialContext);
}

// ============================================================================
// GENERATION SCREEN UI
// ============================================================================

/**
 * Render the generation loading screen (v2 — phase plan + lesson)
 */
export function renderGenerationScreen(container, onComplete) {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100dvh;padding:32px;text-align:center;background:var(--cream);">
      <div style="width:60px;height:60px;border:4px solid var(--border);border-top-color:var(--green);border-radius:50%;animation:spin 1s linear infinite;margin-bottom:24px;"></div>
      <h2 style="font-family:var(--font-display);font-size:22px;margin-bottom:8px;" id="gen-title">Building Your Course</h2>
      <p style="color:var(--text-soft);font-size:15px;margin-bottom:8px;" id="gen-subtitle">Designing your personalized curriculum...</p>
      <p style="color:var(--text-soft);font-size:13px;" id="gen-detail">This takes about 15 seconds</p>
    </div>
  `;

  const email = AppState.user?.email;
  if (!email) {
    showOfflineMessage(container, onComplete, 'Please log in first.');
    return;
  }

  const isHeritage = AppState.profile?.speaker_type === 'heritage';

  if (isHeritage) {
    runHeritageGeneration(container, email, onComplete);
  } else {
    // Legacy path for Aya/beginners
    runLegacyGeneration(container, onComplete);
  }
}

async function runHeritageGeneration(container, email, onComplete) {
  const subtitle = container.querySelector('#gen-subtitle');
  const detail = container.querySelector('#gen-detail');

  try {
    // Step 1: Phase plan
    if (subtitle) subtitle.textContent = 'Designing your 30-day curriculum...';
    if (detail) detail.textContent = 'Step 1 of 2';

    const phasePlan = await generatePhasePlan(email, 1);
    if (!phasePlan) throw new Error('Phase plan generation failed');

    // Step 2: First lesson
    if (subtitle) subtitle.textContent = 'Creating your first lesson...';
    if (detail) detail.textContent = 'Step 2 of 2';

    const lesson = await generateLesson(email, phasePlan, 1);
    if (!lesson) throw new Error('Lesson generation failed');

    save();
    if (onComplete) onComplete(true);
  } catch (err) {
    console.error('Heritage generation failed:', err);
    showOfflineMessage(container, onComplete, err.message);
  }
}

// ============================================================================
// LEGACY GENERATION (Aya/beginners — unchanged)
// ============================================================================

async function runLegacyGeneration(container, onComplete) {
  try {
    const units = await generateLegacyUnits();
    if (units && units.length > 0) {
      if (!AppState.dynamicUnits) AppState.dynamicUnits = [];
      AppState.dynamicUnits = units;
      save();
      if (onComplete) onComplete(true);
    } else {
      showOfflineMessage(container, onComplete);
    }
  } catch (err) {
    console.error('Legacy generation failed:', err);
    showOfflineMessage(container, onComplete);
  }
}

async function generateLegacyUnits() {
  const level = AppState.profile.placementLevel ?? AppState.profile.placement_level ?? 0;
  const speakerType = AppState.profile.speaker_type || 'beginner';
  const goals = AppState.profile.goals || ['conversational fluency'];
  const dialect = AppState.profile.dialect || 'Palestinian';

  const units = [];
  const unit1 = await generateLegacyUnit({ unitNumber: 1, level, speakerType, goals, dialect });
  if (unit1) units.push(unit1);
  const unit2 = await generateLegacyUnit({ unitNumber: 2, level, speakerType, goals, dialect, previousUnit: unit1 });
  if (unit2) units.push(unit2);
  return units;
}

async function generateLegacyUnit({ unitNumber, level, speakerType, goals, dialect, previousUnit }) {
  const levelLabels = ['Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced'];
  const levelLabel = levelLabels[level] || 'Beginner';
  const goalsText = Array.isArray(goals) ? goals.join(', ') : String(goals);

  let previousBlock = '';
  if (previousUnit) {
    previousBlock = `\n\nThe previous unit was "${previousUnit.title}" covering: ${previousUnit.phrases.slice(0, 4).map(p => p.en).join(', ')}, etc. Choose a DIFFERENT topic for variety.`;
  }

  const topicHints = [
    'essential greetings and introductions', 'family and relationships',
    'food, dining, and hospitality', 'directions, transportation, and getting around',
    'shopping, numbers, and daily transactions', 'expressing feelings, opinions, and desires',
    'work, education, and professional life', 'health, body, and emergencies',
    'weather, nature, and environment', 'culture, traditions, and celebrations'
  ];
  const topicHint = topicHints[(unitNumber - 1) % topicHints.length];

  const systemPrompt = 'You are a Palestinian Arabic curriculum designer. You create practical, conversational lesson units for language learners. Always use Palestinian Arabic dialect, not MSA. Return ONLY valid JSON with no markdown or explanation.';

  const userPrompt = `Generate lesson unit ${unitNumber} for a ${speakerType} learner at ${levelLabel} level.

Dialect: ${dialect}
Learning goals: ${goalsText}
Suggested topic area: ${topicHint}${previousBlock}

Return ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "id": "dynamic_unit_${unitNumber}",
  "title": "Short descriptive title",
  "subtitle": "One-line description",
  "phrases": [
    {"ar": "Arabic text with harakat", "rom": "romanization", "en": "English translation", "context": "When/how to use this phrase"}
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

  const result = await callClaude(userPrompt, 2000, systemPrompt);
  if (!result || !result.phrases || !Array.isArray(result.phrases)) return null;
  result.id = `dynamic_unit_${unitNumber}`;
  return result;
}

/**
 * Background prefetch for legacy system
 */
export async function prefetchNextUnit(nextUnitNumber, masteryContext) {
  const level = AppState.profile.placementLevel ?? AppState.profile.placement_level ?? 0;
  const speakerType = AppState.profile.speaker_type || 'heritage';
  const goals = AppState.profile.goals || ['conversational fluency'];
  const dialect = AppState.profile.dialect || 'Palestinian';

  try {
    return await generateLegacyUnit({ unitNumber: nextUnitNumber, level, speakerType, goals, dialect });
  } catch (err) {
    console.warn('Background prefetch failed (non-critical):', err.message);
    return null;
  }
}

// ============================================================================
// SHARED UTILITIES
// ============================================================================

/**
 * Call Claude API and parse JSON response
 * @param {string} userPrompt
 * @param {number} maxTokens
 * @param {string} [systemOverride] - use SYSTEM_PROMPT if not provided
 * @returns {object|null} parsed JSON
 */
async function callClaude(userPrompt, maxTokens, systemOverride) {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: systemOverride || SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  if (!response.ok) {
    const status = response.status;
    if (status === 402) throw new Error('API credit limit reached');
    if (status === 429) throw new Error('Too many requests — try again shortly');
    throw new Error(`API error: ${status}`);
  }

  const data = await response.json();

  try {
    const text = data.content?.[0]?.text || data.response || '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (parseError) {
    console.error('JSON parse error:', parseError, 'Raw:', data.content?.[0]?.text?.slice(0, 200));
    throw new Error('Failed to parse API response as JSON');
  }
}

/**
 * Show offline/error message with retry
 */
function showOfflineMessage(container, onRetryComplete, errorMsg) {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100dvh;padding:32px;text-align:center;background:var(--cream);">
      <div style="font-size:48px;margin-bottom:16px;">📡</div>
      <h2 style="font-family:var(--font-display);font-size:22px;margin-bottom:8px;">Connection Needed</h2>
      <p style="color:var(--text-soft);font-size:15px;margin-bottom:24px;">
        ${errorMsg || 'Connect to the internet to build your personalized course.'}
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
 * Get mastery context (legacy — for prefetch compatibility)
 */
export function getMasteryContext() {
  const weakPhrases = [];
  if (AppState.phrasesMastery) {
    Object.entries(AppState.phrasesMastery).forEach(([phrase, data]) => {
      if (data.mastery < 50) weakPhrases.push({ ar: phrase, en: data.en || '' });
    });
  }
  return {
    weakPhrases,
    totalWeakCount: weakPhrases.length + (AppState.weakWords?.length || 0),
    completedUnits: Object.keys(AppState.unitProgress || {}).filter(
      k => AppState.unitProgress[k]?.mastered
    ).length
  };
}

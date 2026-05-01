/**
 * focused-study.js - Situational practice with dictionary-powered scenarios
 * 6 real-life scenario clusters + custom topic, all backed by dictionary table
 * Implicit session scaling: review ratio increases with repeat visits
 */

import { AppState, save } from './state.js';
import {
  saveFocusedSession, countFocusedSessionsByScenario, loadWeakVocabBySource,
  queryDictionary, upsertPersonalVocab
} from './database.js';
import { speakArabic } from './utils/audio.js';
import { showError, showToast, showLoading, hideLoading } from './utils/ui.js';
import { EDGE_FUNCTION_URL, SUPABASE_ANON_KEY, CLAUDE_MODEL } from './config.js';

// Structural categories injected into every scenario query
const STRUCTURAL_CATEGORIES = ['Common Verbs', 'Prepositions'];

// Scenario clusters — each maps to dictionary categories
const SCENARIOS = [
  {
    id: 'meeting_people',
    name: 'Meeting People',
    icon: '👋',
    description: 'Greetings, introductions, and small talk',
    primary: ['Greetings', 'Farewells', 'Politeness', 'Question Words', 'Pronouns', 'Conversational Fillers']
  },
  {
    id: 'family_gathering',
    name: 'Family Gathering',
    icon: '👨‍👩‍👧‍👦',
    description: 'Family events, blessings, and cultural moments',
    primary: ['Family', 'Emotions', 'Blessings & Wishes', 'Culture & Customs', 'Personality', 'Religion']
  },
  {
    id: 'food_dining',
    name: 'Food & Dining',
    icon: '🍽️',
    description: 'Ordering, cooking, and talking about food',
    primary: ['Food & Drink', 'Cooking', 'Money & Shopping', 'Politeness', 'Numbers']
  },
  {
    id: 'getting_around',
    name: 'Getting Around',
    icon: '🚕',
    description: 'Directions, transport, and navigating places',
    primary: ['Transportation', 'Directions', 'City & Places', 'Motion Verbs', 'Numbers', 'Time']
  },
  {
    id: 'daily_life',
    name: 'Daily Life',
    icon: '🏠',
    description: 'Home, routines, health, and everyday needs',
    primary: ['Daily Routine Verbs', 'Household', 'Clothing', 'Body', 'Health & Medical', 'Days & Months']
  },
  {
    id: 'expressing_yourself',
    name: 'Expressing Yourself',
    icon: '💬',
    description: 'Feelings, opinions, idioms, and slang',
    primary: ['Emotions', 'Adjectives (Abstract)', 'Adjectives (Physical)', 'Exclamations', 'Idioms & Expressions', 'Slang']
  }
];

let currentSession = null;
let currentPhraseIndex = 0;

/**
 * Get rank threshold based on user level
 */
function getRankThreshold() {
  const profile = AppState.profile || {};
  const pp = profile.placement_profile;
  if (pp) {
    const ceiling = pp.ceiling_round || 0;
    if (ceiling <= 2) return 500;
    if (ceiling <= 4) return 1000;
    if (ceiling <= 6) return 2000;
    return 2728;
  }
  const level = profile.placementLevel;
  if (!level || level <= 1) return 500;
  if (level <= 2) return 1000;
  if (level <= 3) return 2000;
  return 2728;
}

/**
 * Determine new/review split based on past sessions
 */
function getSessionSplit(pastSessionCount) {
  if (pastSessionCount === 0) return { newCount: 10, reviewCount: 0 };
  if (pastSessionCount <= 3) return { newCount: 7, reviewCount: 3 };
  return { newCount: 5, reviewCount: 5 };
}

/**
 * Render focused study home screen
 */
export function renderFocusedStudyScreen(container) {
  container.innerHTML = `
    <div class="focused-study-screen" style="min-height:100dvh;background:var(--cream);display:flex;flex-direction:column;">
      <div style="padding:16px 20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border-light);">
        <button id="back-btn" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text);">&#x2190;</button>
        <h2 style="margin:0;font-family:var(--font-display);font-size:20px;">Focused Study</h2>
      </div>

      <div style="padding:16px 20px;flex:1;overflow-y:auto;">
        <p style="font-size:15px;color:var(--text-soft);margin:0 0 16px;">Practice Arabic for real-life situations</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
          ${SCENARIOS.map(s => `
            <button class="scenario-card" data-scenario="${s.id}" style="background:var(--sand);border:2px solid var(--border-light);border-radius:var(--radius-lg);padding:18px 14px;cursor:pointer;text-align:left;transition:border-color 0.2s;">
              <div style="font-size:32px;margin-bottom:8px;">${s.icon}</div>
              <div style="font-family:var(--font-display);font-size:15px;font-weight:600;margin-bottom:3px;color:var(--text);">${s.name}</div>
              <div style="font-size:12px;color:var(--text-soft);line-height:1.3;">${s.description}</div>
            </button>
          `).join('')}
        </div>

        <div style="display:flex;align-items:center;gap:12px;margin:8px 0 16px;">
          <div style="flex:1;height:1px;background:var(--border);"></div>
          <span style="font-size:13px;color:var(--text-soft);">or describe a situation</span>
          <div style="flex:1;height:1px;background:var(--border);"></div>
        </div>

        <div style="display:flex;gap:8px;">
          <input
            type="text"
            id="custom-topic-input"
            placeholder="e.g., visiting a doctor, haggling at a market..."
            autocomplete="off"
            style="flex:1;padding:12px 14px;border:2px solid var(--border);border-radius:var(--radius-md);font-size:15px;background:var(--cream);color:var(--text);font-family:var(--font-body);"
          />
          <button class="btn-primary" id="generate-custom-btn" style="padding:12px 16px;white-space:nowrap;font-size:15px;">Go</button>
        </div>
      </div>
    </div>
  `;

  attachHomeListeners(container);
}

/**
 * Attach home screen listeners
 */
function attachHomeListeners(container) {
  container.querySelector('#back-btn')?.addEventListener('click', () => {
    import('./router.js').then(({ navigateTo }) => navigateTo('home'));
  });

  container.querySelectorAll('.scenario-card').forEach(card => {
    card.addEventListener('click', () => {
      const scenarioId = card.dataset.scenario;
      const scenario = SCENARIOS.find(s => s.id === scenarioId);
      if (scenario) startScenarioSession(container, scenario);
    });
  });

  const customInput = container.querySelector('#custom-topic-input');
  const generateBtn = container.querySelector('#generate-custom-btn');

  if (generateBtn && customInput) {
    const go = () => {
      const topic = customInput.value.trim();
      if (topic.length < 3) {
        showToast('Please describe a situation (at least 3 characters)');
        return;
      }
      startCustomSession(container, topic);
    };
    generateBtn.addEventListener('click', go);
    customInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') go(); });
  }
}

/**
 * Start a scenario session — query dictionary, determine review split, generate
 */
async function startScenarioSession(container, scenario) {
  showLoading(`Preparing ${scenario.name}...`);

  try {
    const email = AppState.user?.email;
    const rankThreshold = getRankThreshold();
    const sourcePrefix = `focused_${scenario.id}`;

    // Determine review split
    let pastCount = 0;
    let reviewPhrases = [];
    if (email) {
      pastCount = await countFocusedSessionsByScenario(email, scenario.id);
      const split = getSessionSplit(pastCount);
      if (split.reviewCount > 0) {
        reviewPhrases = await loadWeakVocabBySource(email, sourcePrefix, split.reviewCount);
      }
    }

    const split = getSessionSplit(pastCount);
    const newCount = split.newCount + (split.reviewCount - reviewPhrases.length); // Fill unused review slots with new

    // Query dictionary for scenario categories
    const dictEntries = await queryDictionary(scenario.primary, STRUCTURAL_CATEGORIES, rankThreshold);

    if (!dictEntries || dictEntries.length === 0) {
      hideLoading();
      showError('No vocabulary found for this scenario. Please try another.');
      return;
    }

    // Build vocab pool string for Claude prompt
    const vocabPool = dictEntries.slice(0, 60).map(e =>
      `${e.arabic}\t${e.romanization}\t${e.english}\t${e.category}`
    ).join('\n');

    // Build review block for prompt
    let reviewBlock = '';
    if (reviewPhrases.length > 0) {
      reviewBlock = `\n\nREVIEW PHRASES — include these in your response (the student needs to practice them again):\n${reviewPhrases.map(r => `${r.arabic}\t${r.romanization || ''}\t${r.english}`).join('\n')}`;
    }

    // Generate session via Claude
    const phrases = await generateScenarioPhrases(scenario, vocabPool, newCount, reviewBlock);
    if (!phrases) {
      hideLoading();
      showError('Failed to generate practice session. Please try again.');
      return;
    }

    hideLoading();

    const session = {
      name: scenario.name,
      icon: scenario.icon,
      scenarioId: scenario.id,
      phrases: phrases,
      isCustom: false
    };

    launchSession(container, session);
  } catch (err) {
    hideLoading();
    showError('Something went wrong. Please try again.');
    console.error('Scenario session error:', err);
  }
}

/**
 * Start a custom topic session
 */
async function startCustomSession(container, topic) {
  showLoading(`Generating practice for "${topic}"...`);

  try {
    // Step 1: Map topic to dictionary categories via Claude
    const mappingResponse = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 300,
        system: 'You map user topics to dictionary categories. Return ONLY valid JSON, no markdown.',
        messages: [{ role: 'user', content: `Map this topic to the most relevant categories from the following list.

Topic: "${topic}"

Categories: Adjectives (Abstract), Adjectives (Physical), Adverbs, Animals, Blessings & Wishes, Body, City & Places, Clothing, Colors, Common Verbs, Communication, Conjunctions, Connectors & Discourse, Conversational Fillers, Cooking, Culture & Customs, Daily Routine Verbs, Days & Months, Directions, Education, Emotions, Exclamations, Family, Farewells, Food & Drink, Greetings, Health & Medical, Household, Idioms & Expressions, Money & Shopping, Motion Verbs, Nature & Weather, Numbers, Particles, Personality, Politeness, Prepositions, Professions, Pronouns, Question Words, Religion, Sentence Patterns, Slang, Technology, Time, Transportation

Return ONLY: { "primary": ["Cat1", "Cat2", ...], "related": ["Cat3", ...] }
Pick 3-6 primary categories most relevant to the topic. Pick 1-3 related categories.` }]
      })
    });

    if (!mappingResponse.ok) throw new Error('Category mapping failed');

    const mappingData = await mappingResponse.json();
    const mappingText = (mappingData.content?.[0]?.text || '')
      .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const mapping = JSON.parse(mappingText);

    if (!mapping.primary || !mapping.primary.length) {
      throw new Error('No categories mapped');
    }

    // Step 2: Query dictionary
    const rankThreshold = getRankThreshold();
    const dictEntries = await queryDictionary(
      mapping.primary,
      [...(mapping.related || []), ...STRUCTURAL_CATEGORIES],
      rankThreshold
    );

    if (!dictEntries || dictEntries.length === 0) {
      hideLoading();
      showError('No vocabulary found for this topic. Try a different description.');
      return;
    }

    const vocabPool = dictEntries.slice(0, 60).map(e =>
      `${e.arabic}\t${e.romanization}\t${e.english}\t${e.category}`
    ).join('\n');

    // Step 3: Generate phrases
    const customScenario = { name: topic, icon: '✨', id: 'custom', primary: mapping.primary };
    const phrases = await generateScenarioPhrases(customScenario, vocabPool, 10, '');

    if (!phrases) {
      hideLoading();
      showError('Failed to generate practice session. Please try again.');
      return;
    }

    hideLoading();

    const session = {
      name: topic.charAt(0).toUpperCase() + topic.slice(1),
      icon: '✨',
      scenarioId: 'custom_' + topic.toLowerCase().replace(/\s+/g, '_').slice(0, 30),
      phrases: phrases,
      isCustom: true
    };

    launchSession(container, session);
  } catch (err) {
    hideLoading();
    showError('Failed to generate custom session. Please try again.');
    console.error('Custom session error:', err);
  }
}

/**
 * Generate situational phrases via Claude using dictionary vocab pool
 */
async function generateScenarioPhrases(scenario, vocabPool, phraseCount, reviewBlock) {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      system: `You are a Palestinian Arabic language expert. Generate practice phrases for real-life situations.
Use Palestinian Arabic dialect. Be natural and conversational.
Return ONLY a valid JSON array, no markdown, no explanation.`,
      messages: [{ role: 'user', content: `Generate ${phraseCount} useful Palestinian Arabic phrases for the situation: "${scenario.name}".

Use vocabulary from this dictionary pool where possible:
${vocabPool}
${reviewBlock}

Return ONLY a JSON array:
[
  {"ar": "Arabic text with harakat", "rom": "romanization", "en": "English translation", "context": "when/how to use this phrase"}
]

Rules:
- Use Palestinian Arabic dialect specifically
- Include common everyday phrases people actually say
- Mix simple and slightly complex phrases
- Each phrase should be practical and immediately usable
- Romanization should use: 2=hamza, 3=ain, 7=ha, 9=sad, kh=kha, gh=ghain
- Add harakat (tashkeel) to the Arabic text` }]
    })
  });

  if (!response.ok) return null;

  const data = await response.json();
  try {
    const cleaned = (data.content?.[0]?.text || data.response || '')
      .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const phrases = JSON.parse(cleaned);
    if (!Array.isArray(phrases) || phrases.length === 0) return null;
    return phrases;
  } catch (e) {
    console.error('Parse scenario phrases error:', e);
    return null;
  }
}

/**
 * Launch a practice session (shared for scenario + custom)
 */
function launchSession(container, session) {
  currentSession = session;
  currentPhraseIndex = 0;

  // Auto-save phrases to personal_vocab
  const email = AppState.user?.email;
  if (email && session.phrases?.length > 0) {
    const entries = session.phrases.map(p => ({
      arabic: p.ar || '',
      transliteration: p.rom || '',
      english: p.en || '',
      mastery_score: 0,
      is_dialect: true,
      source: `focused_${session.scenarioId}`
    })).filter(e => e.arabic && e.english);

    if (entries.length > 0) {
      upsertPersonalVocab(email, entries).catch(e =>
        console.warn('Auto-save focused vocab failed (non-critical):', e.message)
      );
    }

    // Save session record
    saveFocusedSession(email, {
      scenario: session.scenarioId,
      contextName: session.name,
      isCustom: session.isCustom || false,
      phrasesCount: session.phrases.length,
      timestamp: new Date().toISOString()
    }).catch(() => {});
  }

  renderSessionCard(container);
}

/**
 * Render current flashcard in session
 */
function renderSessionCard(container) {
  const phrase = currentSession.phrases[currentPhraseIndex];
  const progress = ((currentPhraseIndex + 1) / currentSession.phrases.length) * 100;

  container.innerHTML = `
    <div class="focused-session-screen" style="min-height:100dvh;background:var(--cream);display:flex;flex-direction:column;">
      <div style="padding:16px 20px;display:flex;align-items:center;gap:12px;">
        <button id="back-to-scenarios" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text);">&#x2190;</button>
        <div style="flex:1;">
          <h3 style="margin:0;font-family:var(--font-display);font-size:17px;">${currentSession.icon} ${currentSession.name}</h3>
          <p style="margin:2px 0 0;font-size:13px;color:var(--text-soft);">Phrase ${currentPhraseIndex + 1} of ${currentSession.phrases.length}</p>
        </div>
      </div>

      <div style="padding:0 20px 8px;">
        <div style="background:rgba(0,0,0,0.08);height:4px;border-radius:2px;overflow:hidden;">
          <div style="height:100%;background:var(--green);width:${progress}%;border-radius:2px;transition:width 0.3s;"></div>
        </div>
      </div>

      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 20px;">
        <div id="flashcard" style="background:white;border-radius:var(--radius-lg);padding:32px 24px;box-shadow:0 2px 12px rgba(0,0,0,0.08);cursor:pointer;min-height:220px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;">
          <div id="card-front">
            <div style="font-size:12px;color:var(--text-soft);margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;">Arabic</div>
            <div style="font-size:28px;font-weight:500;direction:rtl;line-height:1.6;margin-bottom:16px;">${phrase.ar || phrase.arabic || ''}</div>
            <button id="audio-btn" style="background:var(--green-l);border:none;border-radius:var(--radius-md);padding:10px 20px;font-size:16px;cursor:pointer;color:var(--green);">🔊 Listen</button>
          </div>
          <div id="card-back" style="display:none;">
            <div style="font-size:12px;color:var(--text-soft);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Meaning</div>
            <div style="font-size:22px;font-weight:500;margin-bottom:8px;color:var(--text);">${phrase.en || phrase.english || ''}</div>
            <div style="font-size:16px;color:var(--green-m);margin-bottom:12px;font-style:italic;">${phrase.rom || phrase.romanization || ''}</div>
            ${phrase.context ? `<div style="font-size:14px;color:var(--text-soft);margin-top:8px;line-height:1.4;"><strong>💡</strong> ${phrase.context}</div>` : ''}
            <button id="audio-btn-back" style="background:var(--green-l);border:none;border-radius:var(--radius-md);padding:10px 20px;font-size:16px;cursor:pointer;color:var(--green);margin-top:14px;">🔊 Listen Again</button>
          </div>
        </div>
        <p style="text-align:center;font-size:13px;color:var(--text-soft);margin:14px 0 0;">Tap card to flip</p>
      </div>

      <div style="padding:16px 20px;display:flex;justify-content:space-between;gap:12px;">
        ${currentPhraseIndex > 0
          ? `<button class="btn-secondary" id="prev-btn" style="flex:1;padding:14px;">← Previous</button>`
          : '<div style="flex:1;"></div>'}
        ${currentPhraseIndex < currentSession.phrases.length - 1
          ? `<button class="btn-primary" id="next-btn" style="flex:1;padding:14px;">Next →</button>`
          : `<button class="btn-primary" id="finish-btn" style="flex:1;padding:14px;">Finish ✓</button>`}
      </div>
    </div>
  `;

  attachSessionListeners(container, phrase);
}

/**
 * Attach session card listeners
 */
function attachSessionListeners(container, phrase) {
  container.querySelector('#back-to-scenarios')?.addEventListener('click', () => {
    renderFocusedStudyScreen(container);
  });

  // Flashcard flip
  const flashcard = container.querySelector('#flashcard');
  let flipped = false;
  if (flashcard) {
    flashcard.addEventListener('click', (e) => {
      if (e.target.closest('button')) return; // Don't flip on button clicks
      flipped = !flipped;
      container.querySelector('#card-front').style.display = flipped ? 'none' : 'block';
      container.querySelector('#card-back').style.display = flipped ? 'block' : 'none';
    });
  }

  // Audio
  const playAudio = (e) => {
    e.stopPropagation();
    speakArabic(phrase.ar || phrase.arabic);
  };
  container.querySelector('#audio-btn')?.addEventListener('click', playAudio);
  container.querySelector('#audio-btn-back')?.addEventListener('click', playAudio);

  // Navigation
  container.querySelector('#prev-btn')?.addEventListener('click', () => {
    currentPhraseIndex--;
    renderSessionCard(container);
  });

  container.querySelector('#next-btn')?.addEventListener('click', () => {
    currentPhraseIndex++;
    renderSessionCard(container);
  });

  container.querySelector('#finish-btn')?.addEventListener('click', () => {
    showToast(`✅ Completed: ${currentSession.name}`);
    renderFocusedStudyScreen(container);
  });
}

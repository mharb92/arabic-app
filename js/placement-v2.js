/**
 * placement-v2.js - Multi-dimensional placement test for heritage speakers
 * 8 rounds, 8 questions each, mixed question types per round
 * Outputs a placement_profile with 6 skill dimensions + category scores
 */

import { AppState, save } from './state.js';
import { queryDictionary } from './database.js';
import { upsertPersonalVocab } from './database.js';
import { showToast } from './utils/ui.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const QUESTIONS_PER_ROUND = 8;
const PASS_THRESHOLD = 5; // 5/8 to advance
const MAX_ROUNDS = 8;

// Categories per round difficulty level
const ROUND_CATEGORIES = [
  ['Greetings', 'Pronouns', 'Numbers'],
  ['Politeness', 'Question Words', 'Common Verbs'],
  ['Daily Routine Verbs', 'Adjectives (Physical)', 'Family'],
  ['Food & Drink', 'Motion Verbs', 'Prepositions'],
  ['Idioms & Expressions', 'Emotions', 'Sentence Patterns'],
  ['Connectors & Discourse', 'Conjunctions', 'Culture & Customs'],
  ['Slang', 'Conversational Fillers', 'Blessings & Wishes'],
  ['Idioms & Expressions', 'Sentence Patterns', 'Exclamations']
];

// Rank thresholds per round (controls difficulty)
const ROUND_RANK_LIMITS = [200, 400, 700, 1000, 1400, 1800, 2200, 2728];

// Question type mix per round: [translation, translation, translation, translation, production, pattern, listening, script]
const QUESTION_TYPES = ['recognition', 'recognition', 'recognition', 'recognition', 'production', 'grammar_intuition', 'listening', 'script_comfort'];

// ============================================================================
// STATE
// ============================================================================

let currentRound = 0;
let questionIndex = 0;
let roundCorrect = 0;
let allAnswers = [];
let roundQuestions = [];
let vocabPool = [];
let testComplete = false;
let container = null;

function resetState() {
  currentRound = 0;
  questionIndex = 0;
  roundCorrect = 0;
  allAnswers = [];
  roundQuestions = [];
  vocabPool = [];
  testComplete = false;
}

// ============================================================================
// ENTRY POINT
// ============================================================================

export async function renderPlacementV2Screen(cont) {
  container = cont;

  // Already completed?
  if (AppState.profile?.placement_profile) {
    showAlreadyCompleted();
    return;
  }

  // Resume?
  const saved = localStorage.getItem('arabic_placement_v2_state');
  if (saved) {
    try {
      const s = JSON.parse(saved);
      currentRound = s.round || 0;
      questionIndex = s.qIndex || 0;
      roundCorrect = s.correct || 0;
      allAnswers = s.answers || [];
    } catch (e) {
      resetState();
    }
  } else {
    resetState();
  }

  showRoundIntro();
}

// ============================================================================
// ROUND FLOW
// ============================================================================

async function showRoundIntro() {
  const roundNum = currentRound + 1;

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100dvh;background:var(--cream);">
      <div style="padding:16px 20px;border-bottom:1px solid var(--border-light);display:flex;justify-content:space-between;align-items:center;">
        <h2 style="margin:0;font-family:var(--font-display);font-size:18px;">Placement Test</h2>
        <button id="exit-btn" style="background:none;border:none;font-size:14px;color:var(--text-soft);cursor:pointer;">Exit</button>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">${getRoundEmoji(roundNum)}</div>
        <h3 style="font-family:var(--font-display);font-size:24px;margin-bottom:8px;">Round ${roundNum} of ${MAX_ROUNDS}</h3>
        <p style="color:var(--text-soft);font-size:15px;margin-bottom:8px;">${getRoundDescription(roundNum)}</p>
        <p style="color:var(--text-muted);font-size:13px;margin-bottom:32px;">${QUESTIONS_PER_ROUND} questions — need ${PASS_THRESHOLD} correct to advance</p>
        <button class="hoopoe-btn-gold" id="start-round-btn" style="width:100%;max-width:320px;">
          ${currentRound === 0 ? 'Begin' : 'Continue'} &#x2192;
        </button>
      </div>
    </div>
  `;

  container.querySelector('#exit-btn').addEventListener('click', () => {
    saveState();
    import('./router.js').then(({ navigateTo }) => navigateTo('home'));
  });

  container.querySelector('#start-round-btn').addEventListener('click', async () => {
    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100dvh;background:var(--cream);">
        <div style="width:40px;height:40px;border:3px solid var(--border);border-top-color:var(--green);border-radius:50%;animation:spin 1s linear infinite;"></div>
      </div>
    `;
    await loadRoundQuestions();
    questionIndex = 0;
    roundCorrect = 0;
    showQuestion();
  });
}

async function loadRoundQuestions() {
  const categories = ROUND_CATEGORIES[currentRound] || ROUND_CATEGORIES[0];
  const rankLimit = ROUND_RANK_LIMITS[currentRound] || 500;

  vocabPool = await queryDictionary(categories, [], rankLimit);

  // If dictionary query fails or returns too few, use what we have
  if (vocabPool.length < QUESTIONS_PER_ROUND) {
    // Expand to all categories at this rank
    vocabPool = await queryDictionary([], categories, rankLimit);
  }

  // Shuffle and build questions
  const shuffled = shuffleArray([...vocabPool]);
  roundQuestions = [];

  for (let i = 0; i < QUESTIONS_PER_ROUND && i < shuffled.length; i++) {
    const entry = shuffled[i];
    const qType = QUESTION_TYPES[i];
    roundQuestions.push(buildQuestion(entry, qType, shuffled));
  }

  // Pad if needed (shouldn't happen with 2728 entries)
  while (roundQuestions.length < QUESTIONS_PER_ROUND && shuffled.length > 0) {
    const entry = shuffled[roundQuestions.length % shuffled.length];
    roundQuestions.push(buildQuestion(entry, 'recognition', shuffled));
  }
}

function buildQuestion(entry, dimension, allEntries) {
  const q = {
    dimension,
    arabic: entry.arabic,
    english: entry.english,
    romanization: entry.romanization,
    category: entry.category,
    pos: entry.pos,
    dictId: entry.id
  };

  switch (dimension) {
    case 'recognition':
      // Arabic → English multiple choice
      q.type = 'multiple_choice';
      q.prompt = entry.arabic;
      q.correct = entry.english;
      q.options = generateDistractors(entry.english, allEntries, 3);
      break;

    case 'production':
      // English → type Arabic/romanization
      q.type = 'typed';
      q.prompt = entry.english;
      q.acceptableArabic = entry.arabic;
      q.acceptableRoman = entry.romanization;
      break;

    case 'grammar_intuition':
      // Pattern completion — use a verb or phrase with conjugation
      if (entry.conjugation && entry.conjugation !== '—') {
        q.type = 'pattern';
        q.prompt = `If "${entry.arabic}" means "${entry.english}", what form is: ${entry.conjugation.split('=')[0]?.trim() || entry.conjugation}?`;
        q.hint = entry.conjugation;
        q.correct = entry.conjugation.split('=')[1]?.trim() || entry.english;
        q.options = generateDistractors(q.correct, allEntries, 3);
      } else {
        // Fallback to recognition
        q.dimension = 'recognition';
        q.type = 'multiple_choice';
        q.prompt = entry.arabic;
        q.correct = entry.english;
        q.options = generateDistractors(entry.english, allEntries, 3);
      }
      break;

    case 'listening':
      // Audio + multiple choice (uses Web Speech API)
      q.type = 'listening';
      q.audioText = entry.arabic;
      q.correct = entry.english;
      q.options = generateDistractors(entry.english, allEntries, 3);
      break;

    case 'script_comfort':
      // Bare Arabic (no romanization hint) → English
      q.type = 'script_reading';
      q.prompt = entry.arabic;
      q.correct = entry.english;
      q.options = generateDistractors(entry.english, allEntries, 3);
      break;
  }

  return q;
}

function generateDistractors(correct, pool, count) {
  const candidates = pool
    .map(e => e.english)
    .filter(e => e !== correct)
    .filter((v, i, a) => a.indexOf(v) === i);
  const shuffled = shuffleArray(candidates).slice(0, count);
  const options = shuffleArray([correct, ...shuffled]);
  return options;
}

// ============================================================================
// QUESTION RENDERING
// ============================================================================

function showQuestion() {
  if (questionIndex >= roundQuestions.length) {
    finishRound();
    return;
  }

  const q = roundQuestions[questionIndex];
  const roundNum = currentRound + 1;

  let questionHTML = '';

  switch (q.type) {
    case 'multiple_choice':
      questionHTML = renderMultipleChoice(q, false);
      break;
    case 'script_reading':
      questionHTML = renderMultipleChoice(q, true);
      break;
    case 'typed':
      questionHTML = renderTyped(q);
      break;
    case 'pattern':
      questionHTML = renderMultipleChoice(q, false);
      break;
    case 'listening':
      questionHTML = renderListening(q);
      break;
    default:
      questionHTML = renderMultipleChoice(q, false);
  }

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100dvh;background:var(--cream);">
      <div style="padding:16px 20px;border-bottom:1px solid var(--border-light);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:14px;color:var(--text-soft);">Round ${roundNum} · Question ${questionIndex + 1}/${QUESTIONS_PER_ROUND}</span>
          <button id="exit-q-btn" style="background:none;border:none;font-size:13px;color:var(--text-muted);cursor:pointer;">Exit</button>
        </div>
        <div style="height:4px;background:var(--sand);border-radius:2px;overflow:hidden;">
          <div style="height:100%;width:${((questionIndex) / QUESTIONS_PER_ROUND) * 100}%;background:var(--green);border-radius:2px;transition:width 0.3s;"></div>
        </div>
      </div>
      <div style="flex:1;padding:24px 20px;overflow-y:auto;">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
          ${getDimensionLabel(q.dimension)}
        </div>
        ${questionHTML}
      </div>
    </div>
  `;

  container.querySelector('#exit-q-btn')?.addEventListener('click', () => {
    saveState();
    import('./router.js').then(({ navigateTo }) => navigateTo('home'));
  });

  attachQuestionListeners(q);
}

function renderMultipleChoice(q, isScript) {
  const promptStyle = isScript
    ? 'font-size:36px;font-family:var(--font-arabic,serif);direction:rtl;line-height:1.5;'
    : 'font-size:32px;font-family:var(--font-arabic,serif);direction:rtl;line-height:1.5;';

  return `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="${promptStyle}">${q.prompt}</div>
      ${!isScript && q.romanization ? `<div style="color:var(--text-soft);font-size:15px;margin-top:4px;">${q.romanization}</div>` : ''}
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;" id="options-container">
      ${q.options.map((opt, i) => `
        <button class="placement-option" data-value="${escapeAttr(opt)}" style="
          width:100%;padding:16px;text-align:left;font-size:16px;
          background:var(--sand);border:1.5px solid var(--border);
          border-radius:var(--radius-md);cursor:pointer;font-family:var(--font-body);
          transition:all 0.15s;">
          ${opt}
        </button>
      `).join('')}
    </div>
  `;
}

function renderTyped(q) {
  return `
    <div style="text-align:center;margin-bottom:32px;">
      <p style="font-size:15px;color:var(--text-soft);margin-bottom:8px;">How would you say:</p>
      <div style="font-size:22px;font-weight:500;">${q.prompt}</div>
    </div>
    <div>
      <input type="text" id="typed-answer" placeholder="Type in Arabic or romanization..." style="
        width:100%;padding:16px;font-size:18px;
        border:1.5px solid var(--border);border-radius:var(--radius-md);
        background:white;font-family:var(--font-body);
        box-sizing:border-box;" autocomplete="off" autocorrect="off" spellcheck="false" />
      <button class="hoopoe-btn-gold" id="submit-typed" style="width:100%;margin-top:16px;">Check</button>
    </div>
  `;
}

function renderListening(q) {
  return `
    <div style="text-align:center;margin-bottom:32px;">
      <p style="font-size:15px;color:var(--text-soft);margin-bottom:16px;">Listen and select the meaning:</p>
      <button id="play-audio-btn" style="
        width:80px;height:80px;border-radius:50%;
        background:var(--green);color:white;border:none;
        font-size:32px;cursor:pointer;margin:0 auto;display:block;
        box-shadow:var(--shadow-md);">
        &#x1F50A;
      </button>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;" id="options-container">
      ${q.options.map(opt => `
        <button class="placement-option" data-value="${escapeAttr(opt)}" style="
          width:100%;padding:16px;text-align:left;font-size:16px;
          background:var(--sand);border:1.5px solid var(--border);
          border-radius:var(--radius-md);cursor:pointer;font-family:var(--font-body);
          transition:all 0.15s;">
          ${opt}
        </button>
      `).join('')}
    </div>
  `;
}

function attachQuestionListeners(q) {
  // Multiple choice / pattern / listening / script
  container.querySelectorAll('.placement-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.dataset.value;
      const correct = selected === q.correct;
      showFeedback(q, correct, selected);
    });
  });

  // Typed production
  const submitTyped = container.querySelector('#submit-typed');
  if (submitTyped) {
    const input = container.querySelector('#typed-answer');
    submitTyped.addEventListener('click', () => {
      const answer = (input?.value || '').trim();
      if (!answer) return;
      const correct = evaluateTypedAnswer(answer, q);
      showFeedback(q, correct, answer);
    });
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitTyped.click();
    });
  }

  // Listening play
  const playBtn = container.querySelector('#play-audio-btn');
  if (playBtn && q.audioText) {
    playBtn.addEventListener('click', () => {
      playArabicAudio(q.audioText);
    });
    // Auto-play on load
    setTimeout(() => playArabicAudio(q.audioText), 500);
  }
}

function evaluateTypedAnswer(answer, q) {
  const normalize = s => s.replace(/[\u064B-\u065F\u0670]/g, '').trim().toLowerCase();

  // Check against Arabic
  if (normalize(answer) === normalize(q.acceptableArabic || '')) return true;

  // Check against romanization
  const normRoman = (q.acceptableRoman || '').toLowerCase().trim();
  const normAnswer = answer.toLowerCase().trim();
  if (normAnswer === normRoman) return true;

  // Fuzzy: Levenshtein ≤ 2 against romanization
  if (normRoman && levenshtein(normAnswer, normRoman) <= 2) return true;

  return false;
}

function showFeedback(q, correct, userAnswer) {
  if (correct) roundCorrect++;

  allAnswers.push({
    round: currentRound + 1,
    dimension: q.dimension,
    category: q.category,
    arabic: q.arabic,
    english: q.english,
    romanization: q.romanization,
    correct,
    userAnswer
  });

  saveState();

  // Show brief feedback
  const feedbackEl = document.createElement('div');
  feedbackEl.style.cssText = `
    position:fixed;bottom:0;left:0;right:0;
    padding:20px;text-align:center;
    background:${correct ? 'var(--green-light)' : 'var(--red-light)'};
    border-top:2px solid ${correct ? 'var(--green)' : 'var(--red)'};
    z-index:100;
  `;
  feedbackEl.innerHTML = `
    <div style="font-size:18px;font-weight:600;color:${correct ? 'var(--green)' : 'var(--red)'};">
      ${correct ? '✓ Correct!' : '✗ Not quite'}
    </div>
    ${!correct ? `<div style="font-size:14px;color:var(--text-soft);margin-top:4px;">Answer: ${q.correct || q.acceptableRoman || ''}</div>` : ''}
    <button id="next-q-btn" class="hoopoe-btn-gold" style="margin-top:12px;width:100%;max-width:320px;">Continue</button>
  `;
  container.appendChild(feedbackEl);

  container.querySelector('#next-q-btn').addEventListener('click', () => {
    questionIndex++;
    showQuestion();
  });
}

// ============================================================================
// ROUND COMPLETION
// ============================================================================

function finishRound() {
  const roundNum = currentRound + 1;
  const passed = roundCorrect >= PASS_THRESHOLD;

  if (!passed || currentRound >= MAX_ROUNDS - 1) {
    // Test complete
    finishTest();
    return;
  }

  // Show round complete card
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100dvh;padding:32px;text-align:center;background:var(--cream);">
      <div style="font-size:48px;margin-bottom:16px;">&#x1F389;</div>
      <h3 style="font-family:var(--font-display);font-size:24px;margin-bottom:8px;">Round ${roundNum} Complete!</h3>
      <p style="color:var(--text-soft);font-size:16px;margin-bottom:4px;">${roundCorrect}/${QUESTIONS_PER_ROUND} correct</p>
      <p style="color:var(--green);font-weight:600;font-size:15px;margin-bottom:32px;">Advancing to Round ${roundNum + 1}</p>
      <button class="hoopoe-btn-gold" id="next-round-btn" style="width:100%;max-width:320px;">Next Round &#x2192;</button>
    </div>
  `;

  container.querySelector('#next-round-btn').addEventListener('click', () => {
    currentRound++;
    questionIndex = 0;
    roundCorrect = 0;
    saveState();
    showRoundIntro();
  });
}

// ============================================================================
// TEST COMPLETION — SCORING
// ============================================================================

async function finishTest() {
  testComplete = true;
  localStorage.removeItem('arabic_placement_v2_state');

  const ceilingRound = currentRound + 1;
  const profile = computeSkillProfile(allAnswers, ceilingRound);

  // Save to AppState
  if (!AppState.profile) AppState.profile = {};
  AppState.profile.placement_profile = profile;
  // Backward compat
  AppState.profile.placementLevel = mapCeilingToLevel(ceilingRound);
  AppState.profile.placementRoundsCompleted = ceilingRound;
  AppState.profile.placementDate = profile.placement_date;
  await save();

  // Auto-save tested vocab
  if (AppState.user?.email && allAnswers.length > 0) {
    try {
      const entries = allAnswers
        .filter(a => a.arabic && a.english)
        .map(a => ({
          arabic: a.arabic,
          transliteration: a.romanization || '',
          english: a.english,
          mastery_score: a.correct ? 80 : 20,
          is_dialect: true,
          source: 'placement_v2'
        }));
      if (entries.length > 0) await upsertPersonalVocab(AppState.user.email, entries);
    } catch (e) {
      console.warn('Auto-save placement vocab failed:', e.message);
    }
  }

  showResults(profile, ceilingRound);
}

function computeSkillProfile(answers, ceilingRound) {
  const dims = ['recognition', 'production', 'grammar_intuition', 'script_comfort', 'listening'];
  const profile = {};

  for (const dim of dims) {
    const dimAnswers = answers.filter(a => a.dimension === dim);
    if (dimAnswers.length === 0) { profile[dim] = 0; continue; }
    const correct = dimAnswers.filter(a => a.correct).length;
    profile[dim] = Math.round((correct / dimAnswers.length) * 5);
  }

  // vocab_breadth = number of categories with >50% correct
  const catScores = {};
  for (const a of answers) {
    if (!a.category) continue;
    if (!catScores[a.category]) catScores[a.category] = { correct: 0, total: 0 };
    catScores[a.category].total++;
    if (a.correct) catScores[a.category].correct++;
  }
  profile.vocab_breadth = Object.values(catScores).filter(c => c.correct / c.total > 0.5).length;

  const categoryScores = {};
  for (const [cat, scores] of Object.entries(catScores)) {
    categoryScores[cat] = Math.round((scores.correct / scores.total) * 100) / 100;
  }

  const levelLabels = ['Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced', 'Advanced+', 'Advanced++', 'Near-Native'];

  return {
    ...profile,
    ceiling_round: ceilingRound,
    level_label: levelLabels[Math.min(ceilingRound - 1, levelLabels.length - 1)],
    category_scores: categoryScores,
    tested_items: answers.map(a => ({
      arabic: a.arabic, english: a.english, correct: a.correct,
      category: a.category, dimension: a.dimension
    })),
    placement_date: new Date().toISOString()
  };
}

function mapCeilingToLevel(ceiling) {
  if (ceiling <= 2) return 0;
  if (ceiling <= 4) return 1;
  if (ceiling <= 5) return 2;
  if (ceiling <= 7) return 3;
  return 4;
}

function showResults(profile, ceilingRound) {
  const totalCorrect = allAnswers.filter(a => a.correct).length;
  const totalQ = allAnswers.length;
  const dims = [
    { key: 'recognition', label: 'Recognition', emoji: '👂' },
    { key: 'production', label: 'Production', emoji: '🗣️' },
    { key: 'grammar_intuition', label: 'Grammar', emoji: '📐' },
    { key: 'script_comfort', label: 'Script Reading', emoji: '📖' },
    { key: 'listening', label: 'Listening', emoji: '🎧' },
    { key: 'vocab_breadth', label: 'Vocab Breadth', emoji: '📚' }
  ];

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;min-height:100dvh;background:var(--cream);">
      <div style="padding:16px 20px;border-bottom:1px solid var(--border-light);">
        <h2 style="margin:0;font-family:var(--font-display);font-size:20px;">Placement Complete!</h2>
      </div>
      <div style="flex:1;padding:24px 20px;overflow-y:auto;">
        <div class="hoopoe-card-primary" style="text-align:center;margin-bottom:24px;">
          <div style="position:relative;z-index:1;font-size:48px;margin-bottom:12px;">&#x1F3C6;</div>
          <div style="position:relative;z-index:1;font-family:var(--font-display);font-size:28px;font-weight:600;color:white;margin-bottom:6px;">
            ${profile.level_label}
          </div>
          <div style="position:relative;z-index:1;color:rgba(255,255,255,0.85);font-size:16px;margin-bottom:16px;">
            ${totalCorrect}/${totalQ} correct · ${ceilingRound} rounds
          </div>
          <button class="hoopoe-btn-gold" id="start-course-btn">Build My Course &#x2192;</button>
        </div>

        <h3 style="font-family:var(--font-display);font-size:16px;margin-bottom:12px;">Skill Profile</h3>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:24px;">
          ${dims.map(d => {
            const score = profile[d.key] || 0;
            const pct = (score / 5) * 100;
            return `
              <div style="padding:12px 16px;background:var(--sand);border-radius:var(--radius-md);">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                  <span style="font-size:14px;">${d.emoji} ${d.label}</span>
                  <span style="font-size:14px;font-weight:600;color:var(--green);">${score}/5</span>
                </div>
                <div style="height:6px;background:var(--stone);border-radius:3px;overflow:hidden;">
                  <div style="height:100%;width:${pct}%;background:var(--green);border-radius:3px;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <h3 style="font-family:var(--font-display);font-size:16px;margin-bottom:12px;">Round Breakdown</h3>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${Array.from({length: ceilingRound}, (_, i) => {
            const ra = allAnswers.filter(a => a.round === i + 1);
            const rc = ra.filter(a => a.correct).length;
            const passed = rc >= PASS_THRESHOLD;
            return `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--sand);border-radius:var(--radius-md);">
                <span style="font-size:15px;">Round ${i + 1}</span>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-size:14px;color:var(--text-soft);">${rc}/${QUESTIONS_PER_ROUND}</span>
                  <span style="font-size:13px;font-weight:600;color:${passed ? 'var(--green)' : 'var(--red)'};"> ${passed ? 'PASS' : 'FAIL'}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  container.querySelector('#start-course-btn').addEventListener('click', () => {
    import('./generation.js').then(({ renderGenerationScreen }) => {
      renderGenerationScreen(container, (success) => {
        if (success) {
          import('./router.js').then(({ navigateTo }) => navigateTo('home'));
        }
      });
    });
  });
}

function showAlreadyCompleted() {
  const pp = AppState.profile.placement_profile;
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100dvh;padding:32px;text-align:center;background:var(--cream);">
      <div style="font-size:48px;margin-bottom:16px;">&#x1F3C6;</div>
      <h2 style="font-family:var(--font-display);font-size:24px;margin-bottom:8px;">Placement Complete</h2>
      <p style="color:var(--text-soft);margin-bottom:8px;">You're placed at:</p>
      <p style="font-size:22px;font-weight:600;color:var(--green);margin-bottom:32px;">${pp.level_label || 'Intermediate'}</p>
      <button class="hoopoe-btn-gold" id="home-btn" style="width:100%;max-width:360px;">Back to Home</button>
      <button id="retake-btn" style="margin-top:12px;background:none;border:none;color:var(--text-soft);font-size:14px;cursor:pointer;text-decoration:underline;">
        Retake test
      </button>
    </div>
  `;

  container.querySelector('#home-btn').addEventListener('click', () => {
    import('./router.js').then(({ navigateTo }) => navigateTo('home'));
  });
  container.querySelector('#retake-btn').addEventListener('click', () => {
    delete AppState.profile.placement_profile;
    delete AppState.profile.placementLevel;
    resetState();
    showRoundIntro();
  });
}

// ============================================================================
// UTILITIES
// ============================================================================

function saveState() {
  localStorage.setItem('arabic_placement_v2_state', JSON.stringify({
    round: currentRound,
    qIndex: questionIndex,
    correct: roundCorrect,
    answers: allAnswers
  }));
}

function playArabicAudio(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'ar-SA';
  utt.rate = 0.75;
  window.speechSynthesis.speak(utt);
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m + 1}, (_, i) => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i-1][j] + 1,
        dp[i][j-1] + 1,
        dp[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

function escapeAttr(s) {
  return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getRoundEmoji(round) {
  return ['🌱', '🌿', '🌳', '🏔️', '⭐', '💫', '🌟', '👑'][round - 1] || '📝';
}

function getRoundDescription(round) {
  return [
    'Basic greetings, pronouns, and numbers',
    'Polite expressions, questions, and common verbs',
    'Daily routines, descriptions, and family',
    'Food, movement, and prepositions',
    'Idioms, emotions, and sentence patterns',
    'Advanced connectors and cultural expressions',
    'Slang, fillers, and blessings',
    'Expert-level idioms and expressions'
  ][round - 1] || 'Advanced content';
}

function getDimensionLabel(dim) {
  return {
    recognition: 'Translation',
    production: 'Production',
    grammar_intuition: 'Grammar',
    listening: 'Listening',
    script_comfort: 'Script Reading'
  }[dim] || 'Question';
}

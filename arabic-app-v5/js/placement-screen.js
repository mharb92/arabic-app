/**
 * placement-screen.js - 8-Round Adaptive Placement Test
 * Rounds 1-2: multiple choice with romanization
 * Rounds 3-4: multiple choice Arabic only
 * Rounds 5-6: phrase translation (pick correct)
 * Rounds 7-8: open response
 * 50% threshold per round (4/8) to advance
 */

import { AppState, save } from './state.js';
import { PLACEMENT_QUESTIONS } from './data/placement.js';
import { upsertPersonalVocab } from './database.js';
import { showToast } from './utils/ui.js';

const QUESTIONS_PER_ROUND = 8;
const PASS_THRESHOLD = 0.5; // 4/8

let currentRound = 1;       // 1-8
let roundQuestionIndex = 0; // 0-7 within round
let roundCorrect = 0;
let allAnswers = [];         // {question, correct, userAnswer, roundNum}
let testComplete = false;

export function renderPlacementScreen(container) {
  if (AppState.profile && AppState.profile.placementLevel !== undefined) {
    showAlreadyCompleted(container);
    return;
  }

  // Resume if saved
  const saved = localStorage.getItem('arabic_placement_state');
  if (saved) {
    try {
      const s = JSON.parse(saved);
      currentRound = s.round || 1;
      roundQuestionIndex = s.qIndex || 0;
      roundCorrect = s.correct || 0;
      allAnswers = s.answers || [];
    } catch (e) {
      resetState();
    }
  } else {
    resetState();
  }

  renderRoundIntro(container);
}

function resetState() {
  currentRound = 1;
  roundQuestionIndex = 0;
  roundCorrect = 0;
  allAnswers = [];
  testComplete = false;
}

function saveState() {
  localStorage.setItem('arabic_placement_state', JSON.stringify({
    round: currentRound,
    qIndex: roundQuestionIndex,
    correct: roundCorrect,
    answers: allAnswers
  }));
}

// ─── Round intro screen ────────────────────────────────────────────────────

function renderRoundIntro(container) {
  const descriptions = [
    'Multiple choice with romanization',
    'Multiple choice with romanization',
    'Multiple choice — Arabic only',
    'Multiple choice — Arabic only',
    'Phrase translation',
    'Phrase translation',
    'Open response',
    'Open response'
  ];
  const desc = descriptions[currentRound - 1] || 'Questions';

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100dvh;background:var(--cream);">
      <div style="padding:16px 20px;display:flex;align-items:center;border-bottom:1px solid var(--border-light);">
        <button id="exit-btn" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text);">&#x2715;</button>
        <span style="margin-left:12px;font-family:var(--font-display);font-size:18px;">Placement Test</span>
      </div>

      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;text-align:center;">
        <!-- Round dots -->
        <div class="placement-round-bar" style="width:100%;max-width:400px;margin-bottom:32px;">
          ${Array.from({length: 8}, (_, i) => `
            <div class="placement-round-dot ${i + 1 < currentRound ? 'done' : i + 1 === currentRound ? 'active' : ''}"></div>
          `).join('')}
        </div>

        <div style="font-size:48px;margin-bottom:16px;">&#x1F9ED;</div>
        <h2 style="font-family:var(--font-display);font-size:26px;margin-bottom:8px;">Round ${currentRound} of 8</h2>
        <p style="color:var(--text-soft);font-size:16px;margin-bottom:8px;">${desc}</p>
        <p style="color:var(--text-soft);font-size:14px;margin-bottom:32px;">${QUESTIONS_PER_ROUND} questions &mdash; score 4+ to advance</p>

        <button id="start-round-btn" class="hoopoe-btn-gold" style="width:100%;max-width:360px;">
          ${currentRound === 1 ? 'Start Test' : 'Start Round ' + currentRound} &#x2192;
        </button>
      </div>
    </div>
  `;

  container.querySelector('#exit-btn').addEventListener('click', () => {
    if (confirm('Exit placement test? Your progress will be saved.')) {
      saveState();
      import('./router.js').then(({ navigateTo }) => navigateTo('home'));
    }
  });

  container.querySelector('#start-round-btn').addEventListener('click', () => {
    roundQuestionIndex = 0;
    roundCorrect = 0;
    renderQuestion(container);
  });
}

// ─── Question rendering ────────────────────────────────────────────────────

function getRoundQuestions(round) {
  const allQ = PLACEMENT_QUESTIONS || [];
  // Each round gets 8 questions from the bank, cycling if needed
  const startIdx = ((round - 1) * QUESTIONS_PER_ROUND) % Math.max(allQ.length, 1);
  const slice = [];
  for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
    slice.push(allQ[(startIdx + i) % allQ.length]);
  }
  return slice;
}

function getQuestionType(round) {
  if (round <= 2) return 'mc_with_roman';
  if (round <= 4) return 'mc_arabic_only';
  if (round <= 6) return 'phrase_translation';
  return 'open_response';
}

function renderQuestion(container) {
  if (roundQuestionIndex >= QUESTIONS_PER_ROUND) {
    evaluateRound(container);
    return;
  }

  const questions = getRoundQuestions(currentRound);
  const question = questions[roundQuestionIndex];
  const qType = getQuestionType(currentRound);
  const progress = ((roundQuestionIndex) / QUESTIONS_PER_ROUND) * 100;
  const totalProgress = (((currentRound - 1) * QUESTIONS_PER_ROUND + roundQuestionIndex) / (8 * QUESTIONS_PER_ROUND)) * 100;

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100dvh;background:var(--cream);">
      <!-- Header -->
      <div style="padding:12px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light);">
        <button id="exit-btn" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text);">&#x2715;</button>
        <span style="font-size:14px;color:var(--text-soft);">Round ${currentRound}/8 &bull; Q${roundQuestionIndex + 1}/${QUESTIONS_PER_ROUND}</span>
        <span style="font-size:14px;color:var(--green);font-weight:600;">${roundCorrect} correct</span>
      </div>

      <!-- Round progress dots -->
      <div class="placement-round-bar" style="padding:8px 20px;">
        ${Array.from({length: 8}, (_, i) => `
          <div class="placement-round-dot ${i + 1 < currentRound ? 'done' : i + 1 === currentRound ? 'active' : ''}"></div>
        `).join('')}
      </div>

      <!-- Question progress bar -->
      <div style="height:3px;background:var(--border);margin:0 20px;border-radius:2px;overflow:hidden;">
        <div style="height:100%;background:var(--gold);width:${progress}%;transition:width 0.3s;border-radius:2px;"></div>
      </div>

      <div style="flex:1;overflow-y:auto;padding:24px 20px;">
        ${renderQuestionContent(question, qType)}
      </div>
    </div>
  `;

  container.querySelector('#exit-btn').addEventListener('click', () => {
    if (confirm('Exit? Progress saved.')) {
      saveState();
      import('./router.js').then(({ navigateTo }) => navigateTo('home'));
    }
  });

  attachQuestionListeners(container, question, qType);
}

function renderQuestionContent(q, qType) {
  if (!q) return '<p>Loading question...</p>';

  const arabic = q.arabic || q.ar || '';
  const english = q.english || q.en || '';
  const roman = q.romanization || q.roman || q.rom || '';
  const options = q.options || generateOptions(q);

  if (qType === 'mc_with_roman') {
    return `
      <div style="margin-bottom:20px;">
        <p style="color:var(--text-soft);font-size:14px;margin-bottom:12px;">What does this mean?</p>
        <div style="background:var(--gradient-card);border:2px solid var(--green-medium);border-radius:var(--radius-lg);padding:24px;text-align:center;margin-bottom:8px;position:relative;overflow:hidden;">
          <div style="position:absolute;inset:0;background:var(--pattern-gold);pointer-events:none;"></div>
          <div style="font-family:var(--font-arabic);font-size:32px;direction:rtl;position:relative;z-index:1;margin-bottom:8px;">${arabic}</div>
          ${roman ? '<div style="font-size:16px;color:var(--text-soft);font-style:italic;position:relative;z-index:1;">' + roman + '</div>' : ''}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;" id="options-container">
        ${options.map((opt, i) => `
          <button class="mc-option" data-answer="${opt}" data-correct="${opt === english}"
            style="padding:16px 20px;border:2px solid var(--border);border-radius:var(--radius-md);background:var(--cream);text-align:left;font-size:16px;cursor:pointer;font-family:var(--font-body);color:var(--text);transition:all 0.15s;">
            ${opt}
          </button>
        `).join('')}
      </div>
    `;
  }

  if (qType === 'mc_arabic_only') {
    return `
      <div style="margin-bottom:20px;">
        <p style="color:var(--text-soft);font-size:14px;margin-bottom:12px;">What does this Arabic phrase mean?</p>
        <div style="background:var(--gradient-card);border:2px solid var(--green-medium);border-radius:var(--radius-lg);padding:28px;text-align:center;margin-bottom:8px;position:relative;overflow:hidden;">
          <div style="position:absolute;inset:0;background:var(--pattern-gold);pointer-events:none;"></div>
          <div style="font-family:var(--font-arabic);font-size:36px;direction:rtl;position:relative;z-index:1;">${arabic}</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;" id="options-container">
        ${options.map(opt => `
          <button class="mc-option" data-answer="${opt}" data-correct="${opt === english}"
            style="padding:16px 20px;border:2px solid var(--border);border-radius:var(--radius-md);background:var(--cream);text-align:left;font-size:16px;cursor:pointer;font-family:var(--font-body);color:var(--text);transition:all 0.15s;">
            ${opt}
          </button>
        `).join('')}
      </div>
    `;
  }

  if (qType === 'phrase_translation') {
    return `
      <div style="margin-bottom:20px;">
        <p style="color:var(--text-soft);font-size:14px;margin-bottom:12px;">Choose the best translation:</p>
        <div style="background:var(--gradient-card);border:2px solid var(--green-medium);border-radius:var(--radius-lg);padding:20px;margin-bottom:8px;position:relative;overflow:hidden;">
          <div style="position:absolute;inset:0;background:var(--pattern-gold);pointer-events:none;"></div>
          <div style="font-size:18px;font-weight:500;position:relative;z-index:1;margin-bottom:6px;">${english}</div>
          ${roman ? '<div style="font-size:14px;color:var(--text-soft);font-style:italic;position:relative;z-index:1;">(Hint: ' + roman + ')</div>' : ''}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;" id="options-container">
        ${generateArabicOptions(q).map(opt => `
          <button class="mc-option" data-answer="${opt.ar}" data-correct="${opt.isCorrect}"
            style="padding:16px 20px;border:2px solid var(--border);border-radius:var(--radius-md);background:var(--cream);text-align:right;font-family:var(--font-arabic);font-size:22px;direction:rtl;cursor:pointer;color:var(--text);transition:all 0.15s;">
            ${opt.ar}
          </button>
        `).join('')}
      </div>
    `;
  }

  // open_response
  return `
    <div style="margin-bottom:20px;">
      <p style="color:var(--text-soft);font-size:14px;margin-bottom:12px;">How do you say this in Arabic?</p>
      <div style="background:var(--gradient-card);border:2px solid var(--green-medium);border-radius:var(--radius-lg);padding:24px;text-align:center;margin-bottom:20px;position:relative;overflow:hidden;">
        <div style="position:absolute;inset:0;background:var(--pattern-gold);pointer-events:none;"></div>
        <div style="font-size:22px;font-weight:500;position:relative;z-index:1;">${english}</div>
      </div>
      <textarea id="open-answer"
        placeholder="Type in Arabic or transliteration..."
        style="width:100%;padding:14px;border:2px solid var(--border);border-radius:var(--radius-md);font-size:18px;min-height:80px;background:var(--cream);color:var(--text);font-family:var(--font-arabic);direction:rtl;resize:none;box-sizing:border-box;"
        dir="rtl"
      ></textarea>
      <button id="submit-open-btn" class="hoopoe-btn-gold" style="margin-top:12px;padding:14px;">
        Submit Answer &#x2192;
      </button>
      <p style="font-size:13px;color:var(--text-soft);text-align:center;margin-top:8px;">
        Any attempt counts &mdash; we grade leniently
      </p>
    </div>
  `;
}

function generateOptions(q) {
  const correct = q.english || q.en || '';
  const distractors = [
    'Thank you', 'Good morning', 'How are you?', 'My name is',
    'Where is', 'I want', 'Please', 'Excuse me', 'Yes', 'No',
    'Hello', 'Goodbye', 'Welcome', 'Sorry'
  ].filter(d => d !== correct);
  const opts = [correct];
  while (opts.length < 4 && distractors.length > 0) {
    const idx = Math.floor(Math.random() * distractors.length);
    opts.push(distractors.splice(idx, 1)[0]);
  }
  return opts.sort(() => Math.random() - 0.5);
}

function generateArabicOptions(q) {
  const correct = q.arabic || q.ar || '';
  const distractors = [
    'شكراً', 'صباح الخير', 'كيف حالك؟', 'اسمي', 'أين', 'أريد',
    'من فضلك', 'عفواً', 'نعم', 'لا', 'مرحبا', 'مع السلامة', 'أهلاً'
  ].filter(d => d !== correct);
  const opts = [{ ar: correct, isCorrect: true }];
  while (opts.length < 4 && distractors.length > 0) {
    const idx = Math.floor(Math.random() * distractors.length);
    opts.push({ ar: distractors.splice(idx, 1)[0], isCorrect: false });
  }
  return opts.sort(() => Math.random() - 0.5);
}

// ─── Answer handling ───────────────────────────────────────────────────────

function attachQuestionListeners(container, question, qType) {
  if (qType === 'open_response') {
    const submitBtn = container.querySelector('#submit-open-btn');
    const input = container.querySelector('#open-answer');
    if (submitBtn && input) {
      submitBtn.addEventListener('click', () => {
        const answer = input.value.trim();
        // Lenient grading: any non-empty attempt gets partial credit
        const correct = answer.length > 0;
        recordAnswer(container, question, answer, correct);
      });
      input.addEventListener('keypress', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitBtn.click(); }
      });
    }
    return;
  }

  // Multiple choice
  container.querySelectorAll('.mc-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const isCorrect = btn.dataset.correct === 'true';
      const answer = btn.dataset.answer;

      // Visual feedback
      container.querySelectorAll('.mc-option').forEach(b => {
        b.style.pointerEvents = 'none';
        if (b.dataset.correct === 'true') {
          b.style.background = 'var(--green-light)';
          b.style.borderColor = 'var(--green)';
          b.style.color = 'var(--green-dark)';
        } else if (b === btn && !isCorrect) {
          b.style.background = 'var(--red-light)';
          b.style.borderColor = 'var(--red)';
          b.style.color = 'var(--red)';
        }
      });

      setTimeout(() => recordAnswer(container, question, answer, isCorrect), 700);
    });
  });
}

function recordAnswer(container, question, answer, isCorrect) {
  if (isCorrect) roundCorrect++;
  allAnswers.push({
    arabic: question.arabic || question.ar || '',
    english: question.english || question.en || '',
    romanization: question.romanization || question.rom || '',
    userAnswer: answer,
    correct: isCorrect,
    round: currentRound
  });
  roundQuestionIndex++;
  saveState();
  renderQuestion(container);
}

// ─── Round evaluation ──────────────────────────────────────────────────────

function evaluateRound(container) {
  const passed = (roundCorrect / QUESTIONS_PER_ROUND) >= PASS_THRESHOLD;
  const isLastRound = currentRound >= 8;

  if (!passed || isLastRound) {
    // Test over — this is their ceiling
    finishPlacement(container);
    return;
  }

  showRoundComplete(container, passed);
}

function showRoundComplete(container, passed) {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100dvh;background:var(--cream);">
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;text-align:center;">
        <div class="placement-round-complete" style="width:100%;max-width:400px;">
          <div style="font-size:52px;margin-bottom:16px;position:relative;z-index:1;">${passed ? '&#x2705;' : '&#x274C;'}</div>
          <h2 style="font-family:var(--font-display);font-size:24px;position:relative;z-index:1;margin-bottom:8px;">
            Round ${currentRound} Complete
          </h2>
          <p style="color:var(--text-soft);position:relative;z-index:1;margin-bottom:4px;">
            ${roundCorrect} / ${QUESTIONS_PER_ROUND} correct
          </p>
          <p style="font-size:14px;color:var(--text-soft);position:relative;z-index:1;margin-bottom:24px;">
            ${passed ? 'Great work! Moving to the next round.' : 'Test complete.'}
          </p>

          <!-- Progress dots -->
          <div class="placement-round-bar" style="margin-bottom:24px;">
            ${Array.from({length: 8}, (_, i) => `
              <div class="placement-round-dot ${i + 1 <= currentRound ? 'done' : ''}"></div>
            `).join('')}
          </div>

          <button id="next-round-btn" class="hoopoe-btn-gold" style="position:relative;z-index:1;">
            ${passed ? 'Next Round &#x2192;' : 'See Results &#x2192;'}
          </button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#next-round-btn').addEventListener('click', () => {
    if (passed) {
      currentRound++;
      roundQuestionIndex = 0;
      roundCorrect = 0;
      renderRoundIntro(container);
    } else {
      finishPlacement(container);
    }
  });
}

// ─── Finish & results ──────────────────────────────────────────────────────

async function finishPlacement(container) {
  // Ceiling is the last round passed (currentRound - 1 if failed, currentRound if last)
  const ceilingRound = roundCorrect >= QUESTIONS_PER_ROUND * PASS_THRESHOLD
    ? currentRound
    : Math.max(currentRound - 1, 1);

  // Map rounds to levels
  let level, levelLabel;
  if (ceilingRound <= 1) { level = 0; levelLabel = 'Beginner'; }
  else if (ceilingRound <= 3) { level = 1; levelLabel = 'Elementary'; }
  else if (ceilingRound <= 5) { level = 2; levelLabel = 'Intermediate'; }
  else if (ceilingRound <= 7) { level = 3; levelLabel = 'Upper Intermediate'; }
  else { level = 4; levelLabel = 'Advanced'; }

  // Save placement result
  if (!AppState.profile) AppState.profile = {};
  AppState.profile.placementLevel = level;
  AppState.profile.placementRoundsCompleted = ceilingRound;
  AppState.profile.placementDate = new Date().toISOString();
  await save();

  // Auto-save all tested vocab to My Vocab
  if (AppState.user && AppState.user.email && allAnswers.length > 0) {
    try {
      const entries = allAnswers
        .filter(a => a.arabic && a.english)
        .map(a => ({
          arabic: a.arabic,
          romanization: a.romanization || '',
          english: a.english,
          mastery_score: a.correct ? 80 : 20,
          is_dialect: true,
          source: 'placement_test'
        }));
      if (entries.length > 0) {
        await upsertPersonalVocab(AppState.user.email, entries);
      }
    } catch (e) {
      console.warn('Auto-save placement vocab failed (non-critical):', e.message);
    }
  }

  // Clear saved state
  localStorage.removeItem('arabic_placement_state');

  // Show results
  const totalCorrect = allAnswers.filter(a => a.correct).length;
  const totalQ = allAnswers.length;

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;min-height:100dvh;background:var(--cream);">
      <div style="padding:16px 20px;border-bottom:1px solid var(--border-light);">
        <h2 style="margin:0;font-family:var(--font-display);font-size:20px;">Placement Complete!</h2>
      </div>

      <div style="flex:1;padding:24px 20px;overflow-y:auto;">
        <!-- Result card -->
        <div class="hoopoe-card-primary" style="text-align:center;margin-bottom:24px;">
          <div style="position:relative;z-index:1;font-size:48px;margin-bottom:12px;">&#x1F3C6;</div>
          <div style="position:relative;z-index:1;font-family:var(--font-display);font-size:28px;font-weight:600;color:white;margin-bottom:6px;">
            ${levelLabel}
          </div>
          <div style="position:relative;z-index:1;color:rgba(255,255,255,0.85);font-size:16px;margin-bottom:20px;">
            Your Arabic level
          </div>
          <div style="position:relative;z-index:1;display:flex;gap:24px;justify-content:center;margin-bottom:20px;">
            <div style="text-align:center;">
              <div style="font-size:28px;font-weight:700;color:white;">${ceilingRound}</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.7);">Rounds passed</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:28px;font-weight:700;color:white;">${totalCorrect}/${totalQ}</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.7);">Total correct</div>
            </div>
          </div>
          <button class="hoopoe-btn-gold" id="home-btn">Start Learning &#x2192;</button>
        </div>

        <!-- Round breakdown -->
        <h3 style="font-family:var(--font-display);font-size:16px;margin-bottom:12px;">Round breakdown</h3>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${Array.from({length: ceilingRound}, (_, i) => {
            const roundAnswers = allAnswers.filter(a => a.round === i + 1);
            const rCorrect = roundAnswers.filter(a => a.correct).length;
            const rPct = Math.round((rCorrect / QUESTIONS_PER_ROUND) * 100);
            const rPassed = rPct >= 50;
            return `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--sand);border-radius:var(--radius-md);">
                <span style="font-size:15px;">Round ${i + 1}</span>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-size:14px;color:var(--text-soft);">${rCorrect}/${QUESTIONS_PER_ROUND}</span>
                  <span style="font-size:13px;font-weight:600;color:${rPassed ? 'var(--green)' : 'var(--red)'};">${rPassed ? 'PASS' : 'FAIL'}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  container.querySelector('#home-btn').addEventListener('click', () => {
    import('./router.js').then(({ navigateTo }) => navigateTo('home'));
  });
}

function showAlreadyCompleted(container) {
  const levelNames = ['Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced'];
  const level = AppState.profile.placementLevel || 0;
  const levelName = levelNames[level] || 'Beginner';

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100dvh;padding:32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:16px;">&#x1F3C6;</div>
      <h2 style="font-family:var(--font-display);font-size:24px;margin-bottom:8px;">Placement Complete</h2>
      <p style="color:var(--text-soft);margin-bottom:8px;">You're placed at:</p>
      <p style="font-size:22px;font-weight:600;color:var(--green);margin-bottom:32px;">${levelName}</p>
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
    delete AppState.profile.placementLevel;
    resetState();
    renderRoundIntro(container);
  });
}

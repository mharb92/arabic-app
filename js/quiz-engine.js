/**
 * quiz-engine.js - End-of-lesson quiz (heritage speakers)
 * Generates 5-7 questions from lesson blocks, 70% pass threshold
 * Pass → mastered, Fail → next lesson is remedial
 */

import { AppState, save } from './state.js';
import { saveLessonProgress, updateMasteryWithReview } from './database.js';
import { showToast } from './utils/ui.js';

const PASS_THRESHOLD = 0.7;
const MIN_QUESTIONS = 5;
const MAX_QUESTIONS = 7;

let questions = [];
let questionIndex = 0;
let correctCount = 0;
let quizAnswers = [];
let lesson = null;
let container = null;

// ============================================================================
// ENTRY POINT
// ============================================================================

export function renderQuizV2Screen(cont, lessonData) {
  container = cont;
  lesson = lessonData;

  if (!lesson?.lesson_content?.blocks) {
    showError('No lesson data available for quiz.');
    return;
  }

  questions = generateQuizQuestions(lesson.lesson_content);
  questionIndex = 0;
  correctCount = 0;
  quizAnswers = [];

  showQuizIntro();
}

// ============================================================================
// QUIZ GENERATION
// ============================================================================

function generateQuizQuestions(lessonContent) {
  const blocks = lessonContent.blocks || [];
  const qs = [];

  for (const block of blocks) {
    switch (block.type) {
      case 'phrase':
        qs.push({
          type: 'multiple_choice',
          prompt: block.arabic,
          promptType: 'arabic',
          correct: block.english,
          distractors: [],
          blockId: block.id,
          arabic: block.arabic,
          english: block.english
        });
        break;

      case 'pattern':
        if (block.practice_prompt) {
          qs.push({
            type: 'typed',
            prompt: block.practice_prompt,
            promptType: 'english',
            acceptable: block.practice_answer,
            blockId: block.id,
            arabic: block.examples?.[0]?.arabic || '',
            english: block.practice_prompt
          });
        }
        break;

      case 'conjugation':
        if (block.drill_prompts?.length > 0) {
          const drill = block.drill_prompts[0];
          qs.push({
            type: 'typed',
            prompt: drill.prompt,
            promptType: 'drill',
            acceptable: { romanization: drill.answer },
            blockId: block.id,
            arabic: block.verb_base || '',
            english: block.verb_english || ''
          });
        }
        break;

      case 'listening':
        qs.push({
          type: 'listening',
          audioText: block.audio_text,
          correct: block.options?.find(o => o.correct)?.text || '',
          options: block.options || [],
          blockId: block.id,
          arabic: block.audio_text,
          english: block.options?.find(o => o.correct)?.text || ''
        });
        break;

      case 'production':
        qs.push({
          type: 'typed',
          prompt: block.prompt_english,
          promptType: 'production',
          acceptable: block.acceptable_answers || [],
          blockId: block.id,
          arabic: block.acceptable_answers?.[0]?.arabic || '',
          english: block.prompt_english
        });
        break;
    }
  }

  // Shuffle and limit
  const shuffled = shuffleArray(qs);
  const count = Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, shuffled.length));
  const selected = shuffled.slice(0, count);

  // Generate distractors for MC questions
  const allEnglish = blocks
    .filter(b => b.english)
    .map(b => b.english)
    .filter((v, i, a) => a.indexOf(v) === i);

  for (const q of selected) {
    if (q.type === 'multiple_choice' && q.distractors.length === 0) {
      const candidates = allEnglish.filter(e => e !== q.correct);
      const distractors = shuffleArray(candidates).slice(0, 3);
      // Pad with generic distractors if needed
      while (distractors.length < 3) {
        distractors.push(['greeting', 'thank you', 'goodbye', 'yes', 'no', 'please'][distractors.length] || 'other');
      }
      q.options = shuffleArray([q.correct, ...distractors]);
    }
  }

  return selected;
}

// ============================================================================
// UI
// ============================================================================

function showQuizIntro() {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100dvh;padding:32px;text-align:center;background:var(--cream);">
      <div style="font-size:48px;margin-bottom:16px;">📝</div>
      <h2 style="font-family:var(--font-display);font-size:24px;margin-bottom:8px;">End-of-Lesson Quiz</h2>
      <p style="color:var(--text-soft);font-size:15px;margin-bottom:8px;">${questions.length} questions from today's lesson</p>
      <p style="color:var(--text-muted);font-size:13px;margin-bottom:32px;">Need ${Math.ceil(questions.length * PASS_THRESHOLD)}/${questions.length} correct to master this lesson</p>
      <button class="hoopoe-btn-gold" id="start-quiz-btn" style="width:100%;max-width:320px;">Start Quiz</button>
    </div>
  `;

  container.querySelector('#start-quiz-btn').addEventListener('click', () => showQuestion());
}

function showQuestion() {
  if (questionIndex >= questions.length) {
    finishQuiz();
    return;
  }

  const q = questions[questionIndex];
  const pct = Math.round((questionIndex / questions.length) * 100);

  let questionHTML = '';
  switch (q.type) {
    case 'multiple_choice':
      questionHTML = renderMC(q);
      break;
    case 'typed':
      questionHTML = renderTyped(q);
      break;
    case 'listening':
      questionHTML = renderListening(q);
      break;
    default:
      questionHTML = renderMC(q);
  }

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100dvh;background:var(--cream);">
      <div style="padding:12px 20px;border-bottom:1px solid var(--border-light);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:14px;color:var(--text-soft);">Quiz · ${questionIndex + 1}/${questions.length}</span>
          <span style="font-size:14px;color:var(--green);font-weight:500;">${correctCount} correct</span>
        </div>
        <div style="height:4px;background:var(--sand);border-radius:2px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:var(--green);border-radius:2px;transition:width 0.3s;"></div>
        </div>
      </div>
      <div style="flex:1;padding:24px 20px;overflow-y:auto;">
        ${questionHTML}
      </div>
    </div>
  `;

  attachListeners(q);
}

function renderMC(q) {
  return `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:32px;font-family:var(--font-arabic,serif);direction:rtl;line-height:1.5;">${q.prompt}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;" id="quiz-options">
      ${(q.options || []).map(opt => `
        <button class="quiz-option" data-value="${escapeAttr(opt)}" style="
          width:100%;padding:16px;text-align:left;font-size:16px;
          background:var(--sand);border:1.5px solid var(--border);
          border-radius:var(--radius-md);cursor:pointer;font-family:var(--font-body);">
          ${opt}
        </button>
      `).join('')}
    </div>
  `;
}

function renderTyped(q) {
  const label = q.promptType === 'drill' ? 'Complete:' :
    q.promptType === 'production' ? 'How would you say:' : 'Translate:';
  return `
    <div style="text-align:center;margin-bottom:24px;">
      <p style="font-size:14px;color:var(--text-soft);margin-bottom:8px;">${label}</p>
      <div style="font-size:20px;font-weight:500;padding:16px;background:var(--sand);border-radius:var(--radius-md);">${q.prompt}</div>
    </div>
    <input type="text" id="quiz-typed" placeholder="Type your answer..." style="
      width:100%;padding:16px;font-size:18px;
      border:1.5px solid var(--border);border-radius:var(--radius-md);
      background:white;font-family:var(--font-body);box-sizing:border-box;" autocomplete="off" autocorrect="off" spellcheck="false" />
    <button class="hoopoe-btn-gold" id="quiz-check" style="width:100%;margin-top:12px;">Check</button>
  `;
}

function renderListening(q) {
  return `
    <div style="text-align:center;margin-bottom:32px;">
      <p style="font-size:15px;color:var(--text-soft);margin-bottom:16px;">Listen and select:</p>
      <button id="quiz-play-btn" style="width:80px;height:80px;border-radius:50%;background:var(--green);color:white;border:none;font-size:32px;cursor:pointer;box-shadow:var(--shadow-md);">&#x1F50A;</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;" id="quiz-options">
      ${(q.options || []).map(opt => `
        <button class="quiz-option" data-value="${escapeAttr(opt.text)}" data-correct="${opt.correct}" style="
          width:100%;padding:16px;text-align:left;font-size:16px;
          background:var(--sand);border:1.5px solid var(--border);
          border-radius:var(--radius-md);cursor:pointer;font-family:var(--font-body);">
          ${opt.text}
        </button>
      `).join('')}
    </div>
  `;
}

function attachListeners(q) {
  // MC options
  container.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => {
      let correct;
      if (q.type === 'listening') {
        correct = btn.dataset.correct === 'true';
      } else {
        correct = btn.dataset.value === q.correct;
      }
      recordAnswer(q, correct, btn.dataset.value);
    });
  });

  // Typed
  const checkBtn = container.querySelector('#quiz-check');
  if (checkBtn) {
    const input = container.querySelector('#quiz-typed');
    checkBtn.addEventListener('click', () => {
      const answer = (input?.value || '').trim();
      if (!answer) return;
      const correct = evaluateTyped(answer, q);
      recordAnswer(q, correct, answer);
    });
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') checkBtn.click(); });
  }

  // Listening play
  const playBtn = container.querySelector('#quiz-play-btn');
  if (playBtn && q.audioText) {
    playBtn.addEventListener('click', () => playAudio(q.audioText));
    setTimeout(() => playAudio(q.audioText), 500);
  }
}

function evaluateTyped(answer, q) {
  const normalize = s => s.replace(/[\u064B-\u065F\u0670]/g, '').trim().toLowerCase();
  const normAnswer = normalize(answer);

  const acceptable = q.acceptable;
  if (!acceptable) return false;

  // Single answer object
  if (!Array.isArray(acceptable)) {
    if (acceptable.arabic && normalize(acceptable.arabic) === normAnswer) return true;
    if (acceptable.romanization) {
      const normRom = acceptable.romanization.toLowerCase().trim();
      if (normRom === answer.toLowerCase().trim()) return true;
      if (levenshtein(answer.toLowerCase().trim(), normRom) <= 2) return true;
    }
    return false;
  }

  // Array of acceptable answers
  for (const acc of acceptable) {
    if (typeof acc === 'string' && normalize(acc) === normAnswer) return true;
    if (acc.arabic && normalize(acc.arabic) === normAnswer) return true;
    if (acc.romanization) {
      const normRom = acc.romanization.toLowerCase().trim();
      if (normRom === answer.toLowerCase().trim()) return true;
      if (levenshtein(answer.toLowerCase().trim(), normRom) <= 2) return true;
    }
  }
  return false;
}

function recordAnswer(q, correct, userAnswer) {
  if (correct) correctCount++;

  quizAnswers.push({
    blockId: q.blockId,
    correct,
    userAnswer,
    arabic: q.arabic,
    english: q.english
  });

  // Update mastery
  if (AppState.user?.email && q.arabic && q.english) {
    updateMasteryWithReview(AppState.user.email, q.arabic, q.english, correct, 'quiz_v2')
      .catch(e => console.warn('Mastery update failed:', e.message));
  }

  showQuizFeedback(correct, q);
}

function showQuizFeedback(correct, q) {
  const correctText = q.correct || q.acceptable?.romanization ||
    (Array.isArray(q.acceptable) ? q.acceptable[0]?.romanization : '') || '';

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
      ${correct ? '✓ Correct!' : '✗ Incorrect'}
    </div>
    ${!correct && correctText ? `<div style="font-size:14px;color:var(--text-soft);margin-top:4px;">${correctText}</div>` : ''}
    <button class="hoopoe-btn-gold" id="quiz-next" style="margin-top:12px;width:100%;max-width:320px;">Continue</button>
  `;

  container.appendChild(feedbackEl);
  container.querySelector('#quiz-next').addEventListener('click', () => {
    feedbackEl.remove();
    questionIndex++;
    showQuestion();
  });
}

// ============================================================================
// QUIZ COMPLETION
// ============================================================================

async function finishQuiz() {
  const total = questions.length;
  const pct = Math.round((correctCount / total) * 100);
  const passed = pct >= PASS_THRESHOLD * 100;

  // Build quiz result
  const quizResult = {
    passed,
    score: pct,
    correct: correctCount,
    total,
    answers: quizAnswers,
    weak_areas: quizAnswers.filter(a => !a.correct).map(a => ({
      arabic: a.arabic,
      english: a.english,
      blockId: a.blockId
    })),
    completed_at: new Date().toISOString()
  };

  // Update lesson status
  if (lesson) {
    lesson.status = passed ? 'mastered' : 'completed';
    lesson.quiz_result = quizResult;
    if (AppState.user?.email) {
      await saveLessonProgress(AppState.user.email, lesson);
    }
  }

  showResults(passed, pct, correctCount, total, quizResult);
}

function showResults(passed, pct, correct, total, quizResult) {
  const weakAreas = quizResult.weak_areas || [];

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;min-height:100dvh;background:var(--cream);">
      <div style="flex:1;padding:32px 20px;display:flex;flex-direction:column;align-items:center;">
        <div style="font-size:56px;margin-bottom:16px;">${passed ? '🎉' : '💪'}</div>
        <h2 style="font-family:var(--font-display);font-size:24px;margin-bottom:8px;">
          ${passed ? 'Lesson Mastered!' : 'Keep Going!'}
        </h2>
        <p style="font-size:20px;font-weight:600;color:${passed ? 'var(--green)' : 'var(--gold)'}; margin-bottom:4px;">
          ${correct}/${total} correct (${pct}%)
        </p>
        <p style="color:var(--text-soft);font-size:14px;margin-bottom:24px;">
          ${passed ? 'Your next lesson will advance to new material.' : `Need ${Math.ceil(total * PASS_THRESHOLD)}/${total} to pass. Your next lesson will reinforce these areas.`}
        </p>

        ${weakAreas.length > 0 ? `
          <div style="width:100%;max-width:360px;margin-bottom:24px;">
            <h4 style="font-size:14px;color:var(--text-soft);margin-bottom:8px;">Areas to review:</h4>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${weakAreas.map(w => `
                <div style="padding:10px 14px;background:var(--red-light);border-radius:var(--radius-sm);font-size:14px;">
                  <span style="direction:rtl;font-family:var(--font-arabic,serif);">${w.arabic}</span> — ${w.english}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <button class="hoopoe-btn-gold" id="quiz-home-btn" style="width:100%;max-width:320px;">
          ${passed ? 'Continue' : 'Back to Home'} &#x2192;
        </button>
      </div>
    </div>
  `;

  container.querySelector('#quiz-home-btn').addEventListener('click', () => {
    import('./router.js').then(({ navigateTo }) => navigateTo('home'));
  });
}

// ============================================================================
// UTILITIES
// ============================================================================

function playAudio(text) {
  if (!text || !window.speechSynthesis) return;
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
      dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
    }
  }
  return dp[m][n];
}

function escapeAttr(s) {
  return (s || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function showError(msg) {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100dvh;padding:32px;text-align:center;background:var(--cream);">
      <p style="color:var(--text-soft);font-size:16px;margin-bottom:24px;">${msg}</p>
      <button class="hoopoe-btn-gold" id="err-home">Back to Home</button>
    </div>
  `;
  container.querySelector('#err-home')?.addEventListener('click', () => {
    import('./router.js').then(({ navigateTo }) => navigateTo('home'));
  });
}

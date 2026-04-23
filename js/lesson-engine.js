/**
 * lesson-engine.js - Block-based lesson renderer (heritage speakers)
 * Renders 7 content block types, save/resume, progress tracking
 */

import { AppState, save } from './state.js';
import { saveLessonProgress, loadCurrentLesson, updateMasteryWithReview, upsertPersonalVocab } from './database.js';
import { showToast } from './utils/ui.js';

let currentLesson = null;
let blockIndex = 0;
let blockResults = {};
let container = null;

// ============================================================================
// ENTRY POINT
// ============================================================================

export async function renderLessonV2Screen(cont) {
  container = cont;
  const email = AppState.user?.email;
  if (!email) {
    showError('Please log in to access lessons.');
    return;
  }

  // Load current lesson
  const lesson = await loadCurrentLesson(email);
  if (!lesson || !lesson.lesson_content) {
    showNoLesson();
    return;
  }

  currentLesson = lesson;
  blockIndex = lesson.current_block_index || 0;
  blockResults = lesson.block_results || {};

  // Mark in-progress
  if (lesson.status === 'not_started') {
    lesson.status = 'in_progress';
    lesson.started_at = new Date().toISOString();
    await saveLessonProgress(email, lesson);
  }

  renderLesson();
}

// ============================================================================
// LESSON LAYOUT
// ============================================================================

function renderLesson() {
  const lesson = currentLesson.lesson_content;
  const blocks = lesson.blocks || [];
  const total = blocks.length;

  if (blockIndex >= total) {
    finishLesson();
    return;
  }

  const block = blocks[blockIndex];
  const pct = Math.round((blockIndex / total) * 100);

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100dvh;background:var(--cream);">
      <div style="padding:12px 20px;border-bottom:1px solid var(--border-light);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:14px;color:var(--text-soft);">${lesson.theme || 'Lesson'}</span>
          <button id="exit-lesson-btn" style="background:none;border:none;font-size:13px;color:var(--text-muted);cursor:pointer;">Save & Exit</button>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="flex:1;height:4px;background:var(--sand);border-radius:2px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:var(--green);border-radius:2px;transition:width 0.3s;"></div>
          </div>
          <span style="font-size:12px;color:var(--text-muted);">${blockIndex + 1}/${total}</span>
        </div>
      </div>
      <div style="flex:1;overflow-y:auto;" id="block-container"></div>
    </div>
  `;

  container.querySelector('#exit-lesson-btn').addEventListener('click', () => saveAndExit());

  const blockContainer = container.querySelector('#block-container');
  renderBlock(blockContainer, block);
}

// ============================================================================
// BLOCK RENDERERS
// ============================================================================

function renderBlock(cont, block) {
  const renderer = {
    phrase: renderPhraseBlock,
    pattern: renderPatternBlock,
    conjugation: renderConjugationBlock,
    dialogue: renderDialogueBlock,
    culture_note: renderCultureBlock,
    listening: renderListeningBlock,
    production: renderProductionBlock
  }[block.type];

  if (!renderer) {
    console.warn('Unknown block type:', block.type);
    advanceBlock({});
    return;
  }

  renderer(cont, block);
}

// --- PHRASE BLOCK ---
function renderPhraseBlock(cont, block) {
  cont.innerHTML = `
    <div style="padding:24px 20px;">
      <div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">New Phrase</div>
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:36px;font-family:var(--font-arabic,serif);direction:rtl;line-height:1.6;margin-bottom:8px;">${block.arabic}</div>
        <div style="font-size:16px;color:var(--text-soft);margin-bottom:4px;">${block.romanization || ''}</div>
        <div style="font-size:18px;font-weight:500;">${block.english}</div>
      </div>
      ${block.context ? `<div style="padding:12px 16px;background:var(--sand);border-radius:var(--radius-md);font-size:14px;color:var(--text-soft);margin-bottom:24px;">💡 ${block.context}</div>` : ''}
      <div style="display:flex;gap:12px;">
        <button id="audio-btn" style="width:56px;height:56px;border-radius:50%;background:var(--green-light);border:1.5px solid var(--green);color:var(--green);font-size:24px;cursor:pointer;flex-shrink:0;">&#x1F50A;</button>
        <button class="hoopoe-btn-gold" id="got-it-btn" style="flex:1;">Got it &#x2192;</button>
      </div>
    </div>
  `;

  cont.querySelector('#audio-btn')?.addEventListener('click', () => playAudio(block.audio_text || block.arabic));
  cont.querySelector('#got-it-btn').addEventListener('click', () => {
    addVocab(block);
    advanceBlock({ seen: true });
  });
}

// --- PATTERN BLOCK ---
function renderPatternBlock(cont, block) {
  const examples = block.examples || [];
  cont.innerHTML = `
    <div style="padding:24px 20px;">
      <div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">Pattern</div>
      <h3 style="font-family:var(--font-display);font-size:20px;margin-bottom:4px;">${block.pattern_name || 'Pattern'}</h3>
      <p style="color:var(--text-soft);font-size:15px;margin-bottom:20px;">${block.pattern_formula || ''}</p>

      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">
        ${examples.map(ex => `
          <div style="padding:12px 16px;background:var(--sand);border-radius:var(--radius-md);">
            <div style="font-size:20px;direction:rtl;font-family:var(--font-arabic,serif);margin-bottom:4px;">${ex.arabic}</div>
            <div style="font-size:13px;color:var(--text-soft);">${ex.romanization || ''}</div>
            <div style="font-size:14px;margin-top:2px;">${ex.english}</div>
          </div>
        `).join('')}
      </div>

      ${block.practice_prompt ? `
        <div style="padding:16px;background:var(--gold-light);border:1.5px solid var(--gold);border-radius:var(--radius-md);margin-bottom:16px;">
          <p style="font-size:15px;font-weight:500;margin-bottom:12px;">🎯 ${block.practice_prompt}</p>
          <input type="text" id="pattern-answer" placeholder="Type your answer..." style="width:100%;padding:12px;font-size:16px;border:1px solid var(--border);border-radius:var(--radius-sm);box-sizing:border-box;" autocomplete="off" />
          <button class="hoopoe-btn-gold" id="check-pattern" style="width:100%;margin-top:8px;">Check</button>
        </div>
      ` : `
        <button class="hoopoe-btn-gold" id="got-it-btn" style="width:100%;">Continue &#x2192;</button>
      `}
    </div>
  `;

  if (block.practice_prompt) {
    const checkBtn = cont.querySelector('#check-pattern');
    const input = cont.querySelector('#pattern-answer');
    checkBtn.addEventListener('click', () => {
      const answer = (input?.value || '').trim();
      if (!answer) return;
      const correct = evaluatePatternAnswer(answer, block.practice_answer);
      showBlockFeedback(cont, correct, block.practice_answer, () => advanceBlock({ seen: true, practice_correct: correct }));
    });
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') checkBtn.click(); });
  } else {
    cont.querySelector('#got-it-btn').addEventListener('click', () => advanceBlock({ seen: true }));
  }
}

// --- CONJUGATION BLOCK ---
function renderConjugationBlock(cont, block) {
  const forms = block.forms || [];
  const drills = block.drill_prompts || [];

  cont.innerHTML = `
    <div style="padding:24px 20px;">
      <div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">Conjugation</div>
      <h3 style="font-family:var(--font-display);font-size:20px;margin-bottom:4px;">${block.verb_base || ''} — ${block.verb_english || ''}</h3>
      ${block.root ? `<p style="color:var(--text-soft);font-size:14px;margin-bottom:16px;">Root: ${block.root}</p>` : ''}

      <div style="overflow-x:auto;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:var(--sand);">
              <th style="padding:10px 12px;text-align:left;">Pronoun</th>
              <th style="padding:10px 12px;text-align:center;">Past</th>
              <th style="padding:10px 12px;text-align:center;">Present</th>
            </tr>
          </thead>
          <tbody>
            ${forms.map(f => `
              <tr style="border-bottom:1px solid var(--border-light);">
                <td style="padding:10px 12px;font-family:var(--font-arabic,serif);font-size:18px;direction:rtl;">${f.pronoun}</td>
                <td style="padding:10px 12px;text-align:center;">
                  <div style="font-family:var(--font-arabic,serif);font-size:18px;direction:rtl;">${f.past}</div>
                  <div style="font-size:12px;color:var(--text-muted);">${f.romanization_past || ''}</div>
                </td>
                <td style="padding:10px 12px;text-align:center;">
                  <div style="font-family:var(--font-arabic,serif);font-size:18px;direction:rtl;">${f.present}</div>
                  <div style="font-size:12px;color:var(--text-muted);">${f.romanization_present || ''}</div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${drills.length > 0 ? `
        <h4 style="font-size:15px;font-weight:500;margin-bottom:12px;">Quick Drills</h4>
        <div id="drills-container" style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">
          ${drills.map((d, i) => `
            <div class="drill-card" data-index="${i}" style="padding:14px 16px;background:var(--sand);border-radius:var(--radius-md);cursor:pointer;">
              <div style="font-size:15px;margin-bottom:4px;">${d.prompt}</div>
              <div class="drill-answer" style="display:none;font-size:15px;color:var(--green);font-weight:500;margin-top:8px;">→ ${d.answer}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <button class="hoopoe-btn-gold" id="continue-conj-btn" style="width:100%;">Continue &#x2192;</button>
    </div>
  `;

  // Tap-to-reveal drills
  cont.querySelectorAll('.drill-card').forEach(card => {
    card.addEventListener('click', () => {
      const answer = card.querySelector('.drill-answer');
      if (answer) answer.style.display = 'block';
    });
  });

  cont.querySelector('#continue-conj-btn').addEventListener('click', () => {
    advanceBlock({ seen: true, drill_results: drills.map(() => true) });
  });
}

// --- DIALOGUE BLOCK ---
function renderDialogueBlock(cont, block) {
  const lines = block.lines || [];

  cont.innerHTML = `
    <div style="padding:24px 20px;">
      <div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">Dialogue</div>
      <h3 style="font-family:var(--font-display);font-size:20px;margin-bottom:16px;">${block.title || 'Conversation'}</h3>

      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">
        ${lines.map(l => {
          const isA = l.speaker === 'A';
          return `
            <div style="display:flex;flex-direction:column;${isA ? 'align-items:flex-start' : 'align-items:flex-end'};">
              <div style="font-size:12px;color:var(--text-muted);margin-bottom:2px;">Speaker ${l.speaker}</div>
              <div style="max-width:85%;padding:12px 16px;border-radius:var(--radius-md);${isA ? 'background:var(--sand);' : 'background:var(--green-light);'}">
                <div style="font-size:18px;font-family:var(--font-arabic,serif);direction:rtl;margin-bottom:4px;">${l.arabic}</div>
                <div style="font-size:13px;color:var(--text-soft);">${l.romanization || ''}</div>
                <div style="font-size:14px;margin-top:2px;">${l.english}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <button id="play-dialogue-btn" style="width:100%;padding:14px;background:var(--green-light);border:1.5px solid var(--green);border-radius:var(--radius-md);color:var(--green);font-size:15px;cursor:pointer;margin-bottom:12px;">
        &#x1F50A; Listen to Full Dialogue
      </button>
      <button class="hoopoe-btn-gold" id="continue-dialogue-btn" style="width:100%;">Continue &#x2192;</button>
    </div>
  `;

  cont.querySelector('#play-dialogue-btn')?.addEventListener('click', () => {
    const fullText = lines.map(l => l.arabic).join('. ');
    playAudio(fullText);
  });

  cont.querySelector('#continue-dialogue-btn').addEventListener('click', () => {
    advanceBlock({ seen: true, role_play_attempted: false });
  });
}

// --- CULTURE NOTE BLOCK ---
function renderCultureBlock(cont, block) {
  cont.innerHTML = `
    <div style="padding:24px 20px;">
      <div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">Culture Note</div>
      <div style="padding:20px;background:var(--gold-light);border:1.5px solid var(--gold);border-radius:var(--radius-lg);">
        <h3 style="font-family:var(--font-display);font-size:20px;margin-bottom:12px;">${block.title || 'Did You Know?'}</h3>
        <p style="font-size:15px;line-height:1.6;color:var(--text);">${block.content || ''}</p>
      </div>
      <button class="hoopoe-btn-gold" id="continue-culture-btn" style="width:100%;margin-top:24px;">Continue &#x2192;</button>
    </div>
  `;

  cont.querySelector('#continue-culture-btn').addEventListener('click', () => {
    advanceBlock({ seen: true });
  });
}

// --- LISTENING BLOCK ---
function renderListeningBlock(cont, block) {
  const options = block.options || [];

  cont.innerHTML = `
    <div style="padding:24px 20px;">
      <div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">Listening</div>
      <div style="text-align:center;margin-bottom:32px;">
        <p style="font-size:15px;color:var(--text-soft);margin-bottom:16px;">Listen and select the meaning:</p>
        <button id="play-listen-btn" style="width:80px;height:80px;border-radius:50%;background:var(--green);color:white;border:none;font-size:32px;cursor:pointer;box-shadow:var(--shadow-md);">&#x1F50A;</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;" id="listen-options">
        ${options.map(opt => `
          <button class="listen-option" data-correct="${opt.correct}" style="
            width:100%;padding:16px;text-align:left;font-size:16px;
            background:var(--sand);border:1.5px solid var(--border);
            border-radius:var(--radius-md);cursor:pointer;font-family:var(--font-body);">
            ${opt.text}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  cont.querySelector('#play-listen-btn')?.addEventListener('click', () => playAudio(block.audio_text));
  setTimeout(() => playAudio(block.audio_text), 500);

  cont.querySelectorAll('.listen-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const correct = btn.dataset.correct === 'true';
      const correctText = options.find(o => o.correct)?.text || '';
      showBlockFeedback(cont, correct, { text: correctText }, () => {
        advanceBlock({ answered: true, correct });
      });
    });
  });
}

// --- PRODUCTION BLOCK ---
function renderProductionBlock(cont, block) {
  cont.innerHTML = `
    <div style="padding:24px 20px;">
      <div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">Your Turn</div>
      <div style="text-align:center;margin-bottom:24px;">
        <p style="font-size:15px;color:var(--text-soft);margin-bottom:8px;">How would you say:</p>
        <div style="font-size:20px;font-weight:500;padding:16px;background:var(--sand);border-radius:var(--radius-md);">${block.prompt_english}</div>
      </div>
      <input type="text" id="production-input" placeholder="Type in Arabic or romanization..." style="
        width:100%;padding:16px;font-size:18px;
        border:1.5px solid var(--border);border-radius:var(--radius-md);
        background:white;font-family:var(--font-body);box-sizing:border-box;" autocomplete="off" autocorrect="off" spellcheck="false" />
      <button class="hoopoe-btn-gold" id="check-production" style="width:100%;margin-top:12px;">Check</button>
    </div>
  `;

  const checkBtn = cont.querySelector('#check-production');
  const input = cont.querySelector('#production-input');

  checkBtn.addEventListener('click', () => {
    const answer = (input?.value || '').trim();
    if (!answer) return;
    const acceptable = block.acceptable_answers || [];
    const correct = evaluateProduction(answer, acceptable);
    const correctDisplay = acceptable[0] || {};
    showBlockFeedback(cont, correct, {
      arabic: correctDisplay.arabic,
      romanization: correctDisplay.romanization,
      text: `${correctDisplay.arabic || ''} (${correctDisplay.romanization || ''})`
    }, () => {
      advanceBlock({ answered: true, correct, user_input: answer });
    });
  });

  input?.addEventListener('keydown', e => { if (e.key === 'Enter') checkBtn.click(); });
}

// ============================================================================
// FEEDBACK & ADVANCEMENT
// ============================================================================

function showBlockFeedback(cont, correct, correctAnswer, onContinue) {
  const feedbackEl = document.createElement('div');
  feedbackEl.style.cssText = `
    position:fixed;bottom:0;left:0;right:0;
    padding:20px;text-align:center;
    background:${correct ? 'var(--green-light)' : 'var(--red-light)'};
    border-top:2px solid ${correct ? 'var(--green)' : 'var(--red)'};
    z-index:100;
  `;

  const answerText = typeof correctAnswer === 'string' ? correctAnswer :
    (correctAnswer?.text || correctAnswer?.arabic || correctAnswer?.romanization || '');

  feedbackEl.innerHTML = `
    <div style="font-size:18px;font-weight:600;color:${correct ? 'var(--green)' : 'var(--red)'};">
      ${correct ? '✓ Correct!' : '✗ Not quite'}
    </div>
    ${!correct && answerText ? `<div style="font-size:14px;color:var(--text-soft);margin-top:4px;">Answer: ${answerText}</div>` : ''}
    <button class="hoopoe-btn-gold" id="feedback-continue" style="margin-top:12px;width:100%;max-width:320px;">Continue</button>
  `;

  container.appendChild(feedbackEl);
  container.querySelector('#feedback-continue').addEventListener('click', () => {
    feedbackEl.remove();
    onContinue();
  });
}

async function advanceBlock(result) {
  const block = currentLesson.lesson_content.blocks[blockIndex];
  blockResults[block.id] = result;
  blockIndex++;

  // Update mastery for phrase blocks
  if (block.type === 'phrase' && block.arabic && block.english) {
    addVocab(block);
  }

  // Save progress
  currentLesson.current_block_index = blockIndex;
  currentLesson.block_results = blockResults;

  if (AppState.user?.email) {
    await saveLessonProgress(AppState.user.email, currentLesson);
  }

  renderLesson();
}

// ============================================================================
// LESSON COMPLETION
// ============================================================================

function finishLesson() {
  currentLesson.status = 'completed';
  currentLesson.completed_at = new Date().toISOString();

  if (AppState.user?.email) {
    saveLessonProgress(AppState.user.email, currentLesson);
  }

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100dvh;padding:32px;text-align:center;background:var(--cream);">
      <div style="font-size:56px;margin-bottom:16px;">&#x1F389;</div>
      <h2 style="font-family:var(--font-display);font-size:24px;margin-bottom:8px;">Lesson Complete!</h2>
      <p style="color:var(--text-soft);font-size:15px;margin-bottom:32px;">
        ${currentLesson.lesson_content?.theme || 'Great work today'}
      </p>
      <button class="hoopoe-btn-gold" id="start-quiz-btn" style="width:100%;max-width:320px;margin-bottom:12px;">
        Take Quiz &#x2192;
      </button>
      <button id="skip-quiz-btn" style="background:none;border:none;color:var(--text-soft);font-size:14px;cursor:pointer;text-decoration:underline;">
        Skip for now
      </button>
    </div>
  `;

  container.querySelector('#start-quiz-btn').addEventListener('click', () => {
    import('./quiz-engine.js').then(({ renderQuizV2Screen }) => {
      renderQuizV2Screen(container, currentLesson);
    });
  });

  container.querySelector('#skip-quiz-btn').addEventListener('click', () => {
    import('./router.js').then(({ navigateTo }) => navigateTo('home'));
  });
}

// ============================================================================
// UTILITIES
// ============================================================================

async function saveAndExit() {
  currentLesson.current_block_index = blockIndex;
  currentLesson.block_results = blockResults;
  if (AppState.user?.email) {
    await saveLessonProgress(AppState.user.email, currentLesson);
  }
  showToast('Progress saved');
  import('./router.js').then(({ navigateTo }) => navigateTo('home'));
}

function addVocab(block) {
  if (!AppState.user?.email || !block.arabic || !block.english) return;
  upsertPersonalVocab(AppState.user.email, [{
    arabic: block.arabic,
    transliteration: block.romanization || '',
    english: block.english,
    mastery_score: 15,
    is_dialect: true,
    source: 'lesson_v2'
  }]).catch(e => console.warn('Vocab save failed:', e.message));
}

function evaluatePatternAnswer(answer, acceptable) {
  if (!acceptable) return false;
  const normalize = s => s.replace(/[\u064B-\u065F\u0670]/g, '').trim().toLowerCase();
  const normAnswer = normalize(answer);

  if (typeof acceptable === 'string') return normAnswer === normalize(acceptable);
  if (acceptable.arabic && normalize(acceptable.arabic) === normAnswer) return true;
  if (acceptable.romanization && acceptable.romanization.toLowerCase().trim() === answer.toLowerCase().trim()) return true;
  if (acceptable.romanization && levenshtein(answer.toLowerCase().trim(), acceptable.romanization.toLowerCase().trim()) <= 2) return true;
  return false;
}

function evaluateProduction(answer, acceptableAnswers) {
  const normalize = s => s.replace(/[\u064B-\u065F\u0670]/g, '').trim().toLowerCase();
  const normAnswer = normalize(answer);

  for (const acc of acceptableAnswers) {
    if (acc.arabic && normalize(acc.arabic) === normAnswer) return true;
    if (acc.romanization && acc.romanization.toLowerCase().trim() === answer.toLowerCase().trim()) return true;
    if (acc.romanization && levenshtein(answer.toLowerCase().trim(), acc.romanization.toLowerCase().trim()) <= 2) return true;
  }
  return false;
}

function playAudio(text) {
  if (!text || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'ar-SA';
  utt.rate = 0.75;
  window.speechSynthesis.speak(utt);
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

function showError(msg) {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100dvh;padding:32px;text-align:center;background:var(--cream);">
      <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
      <p style="color:var(--text-soft);font-size:16px;margin-bottom:24px;">${msg}</p>
      <button class="hoopoe-btn-gold" id="error-home">Back to Home</button>
    </div>
  `;
  container.querySelector('#error-home')?.addEventListener('click', () => {
    import('./router.js').then(({ navigateTo }) => navigateTo('home'));
  });
}

function showNoLesson() {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100dvh;padding:32px;text-align:center;background:var(--cream);">
      <div style="font-size:48px;margin-bottom:16px;">📚</div>
      <h2 style="font-family:var(--font-display);font-size:22px;margin-bottom:8px;">No Lesson Ready</h2>
      <p style="color:var(--text-soft);font-size:15px;margin-bottom:24px;">We need to generate your next lesson first.</p>
      <button class="hoopoe-btn-gold" id="generate-btn" style="width:100%;max-width:320px;">Generate Lesson</button>
      <button id="back-btn" style="margin-top:12px;background:none;border:none;color:var(--text-soft);font-size:14px;cursor:pointer;">Back to Home</button>
    </div>
  `;

  container.querySelector('#generate-btn')?.addEventListener('click', () => {
    import('./generation.js').then(({ renderGenerationScreen }) => {
      renderGenerationScreen(container, (success) => {
        if (success) renderLessonV2Screen(container);
      });
    });
  });
  container.querySelector('#back-btn')?.addEventListener('click', () => {
    import('./router.js').then(({ navigateTo }) => navigateTo('home'));
  });
}

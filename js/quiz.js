/**
 * quiz.js - Practice mode with 3-stage mastery
 * Stage 1: Full harakaat + romanization (75%)
 * Stage 2: Harakaat only (75%)
 * Stage 3: Bare script (80% × 2 consecutive)
 */

import { AppState, save } from './state.js';
import { UNITS } from './data/units.js';
import { AYA_UNITS } from './data/aya-course.js';
import { getCurrentUnitIndex } from './lesson.js';
import { speakArabic } from './utils/audio.js';
import { handleInputDirection } from './utils/rtl.js';
import { showError, showToast } from './utils/ui.js';

let currentUnitIndex = 0;
let currentStage = 1;
let quizPhrases = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let userAnswers = [];

/**
 * Render quiz screen
 */
export function renderQuizScreen(container) {
  const units = AppState.isAya ? AYA_UNITS : UNITS;
  const progress = AppState.unitProgress || {};
  
  // Get unit index from lesson or find first unmastered
  currentUnitIndex = getCurrentUnitIndex();
  const unitId = `unit${currentUnitIndex + 1}`;
  const unitProgress = progress[unitId] || { stage: 1, consec: 0, mastered: false };
  
  currentStage = unitProgress.stage || 1;
  
  // Prepare quiz phrases
  const unit = units[currentUnitIndex];
  quizPhrases = shuffleArray([...unit.phrases]);
  currentQuestionIndex = 0;
  correctCount = 0;
  userAnswers = [];
  
  renderQuestion(container, unit);
}

/**
 * Render individual question
 */
function renderQuestion(container, unit) {
  const phrase = quizPhrases[currentQuestionIndex];
  const isAya = AppState.isAya;
  
  // Determine what to show based on stage
  let promptText = '';
  let showRomanization = false;
  
  if (isAya) {
    // Aya: 2-stage system
    if (currentStage === 1) {
      promptText = phrase.rom || phrase.romanization || '';
      showRomanization = true;
    } else {
      promptText = phrase.ar || phrase.arabic;
    }
  } else {
    // Standard: 3-stage system
    if (currentStage === 1) {
      promptText = phrase.ar || phrase.arabic; // Full harakaat + romanization
      showRomanization = true;
    } else if (currentStage === 2) {
      promptText = phrase.ar || phrase.arabic; // Harakaat only
    } else {
      promptText = removeDiacritics(phrase.ar || phrase.arabic); // Bare script
    }
  }
  
  container.innerHTML = `
    <div class="quiz-screen">
      <!-- Header -->
      <div class="quiz-header">
        <button class="btn-back" id="exit-btn">✕ Exit</button>
        <div class="quiz-title">
          <h2>${unit.title}</h2>
          <p>Stage ${currentStage}/${isAya ? 2 : 3}</p>
        </div>
      </div>
      
      <!-- Progress -->
      <div class="quiz-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${((currentQuestionIndex + 1) / quizPhrases.length) * 100}%"></div>
        </div>
        <p>Question ${currentQuestionIndex + 1} of ${quizPhrases.length}</p>
      </div>
      
      <!-- Question -->
      <div class="quiz-question">
        <div class="question-prompt" dir="${showRomanization ? 'ltr' : 'rtl'}">
          ${promptText}
          ${!showRomanization ? `<button class="audio-btn" id="audio-btn">🔊</button>` : ''}
        </div>
        
        <p class="question-instruction">
          ${isAya && currentStage === 1 ? 'Type in Arabic' : 'Translate to English'}
        </p>
        
        <textarea 
          id="answer-input" 
          class="answer-input" 
          placeholder="${isAya && currentStage === 1 ? 'اكتب هنا...' : 'Type your answer...'}"
          rows="3"
        ></textarea>
      </div>
      
      <!-- Submit -->
      <button class="btn-primary" id="submit-btn">Check Answer</button>
    </div>
  `;
  
  attachQuizListeners(container, unit, phrase);
}

/**
 * Attach event listeners
 */
function attachQuizListeners(container, unit, phrase) {
  const isAya = AppState.isAya;
  
  // Exit button
  const exitBtn = container.querySelector('#exit-btn');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      if (confirm('Exit quiz? Your progress will not be saved.')) {
        import('./router.js').then(({ navigateTo }) => navigateTo('home'));
      }
    });
  }
  
  // Audio button
  const audioBtn = container.querySelector('#audio-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      speakArabic(phrase.ar || phrase.arabic);
    });
  }
  
  // Answer input
  const answerInput = container.querySelector('#answer-input');
  if (answerInput) {
    handleInputDirection(answerInput);
    answerInput.focus();
  }
  
  // Submit button
  const submitBtn = container.querySelector('#submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      checkAnswer(container, unit, phrase, answerInput.value.trim());
    });
  }
  
  // Enter to submit
  if (answerInput) {
    answerInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        checkAnswer(container, unit, phrase, answerInput.value.trim());
      }
    });
  }
}

/**
 * Check answer
 */
function checkAnswer(container, unit, phrase, userAnswer) {
  const expectedAnswer = phrase.en || phrase.english;
  const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(expectedAnswer);
  
  userAnswers.push({
    phrase: phrase,
    userAnswer: userAnswer,
    correct: isCorrect
  });
  
  if (isCorrect) {
    correctCount++;
  } else {
    // Track weak word
    if (!AppState.weakWords) AppState.weakWords = [];
    const phraseId = `unit${currentUnitIndex + 1}_phrase${currentQuestionIndex + 1}`;
    if (!AppState.weakWords.includes(phraseId)) {
      AppState.weakWords.push(phraseId);
    }
  }
  
  // Show feedback
  showFeedback(container, unit, phrase, isCorrect, expectedAnswer);
}

/**
 * Show feedback after answer
 */
function showFeedback(container, unit, phrase, isCorrect, expectedAnswer) {
  container.innerHTML = `
    <div class="quiz-feedback">
      <div class="feedback-icon ${isCorrect ? 'correct' : 'incorrect'}">
        ${isCorrect ? '✓' : '✗'}
      </div>
      
      <h2>${isCorrect ? 'Correct!' : 'Not quite'}</h2>
      
      ${!isCorrect ? `
        <div class="correct-answer">
          <p>The correct answer is:</p>
          <p class="answer-text">${expectedAnswer}</p>
        </div>
      ` : ''}
      
      <div class="phrase-review" dir="rtl">
        ${phrase.ar || phrase.arabic}
      </div>
      
      <button class="btn-primary" id="continue-btn">
        ${currentQuestionIndex < quizPhrases.length - 1 ? 'Next Question' : 'See Results'}
      </button>
    </div>
  `;
  
  const continueBtn = container.querySelector('#continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (currentQuestionIndex < quizPhrases.length - 1) {
        currentQuestionIndex++;
        renderQuestion(container, unit);
      } else {
        showResults(container, unit);
      }
    });
  }
}

/**
 * Show quiz results
 */
async function showResults(container, unit) {
  const isAya = AppState.isAya;
  const percentage = Math.round((correctCount / quizPhrases.length) * 100);
  const unitId = `unit${currentUnitIndex + 1}`;
  
  // Determine if passed
  let threshold = isAya ? 75 : (currentStage === 3 ? 80 : 75);
  let passed = percentage >= threshold;
  
  // Update progress
  if (!AppState.unitProgress) AppState.unitProgress = {};
  if (!AppState.unitProgress[unitId]) {
    AppState.unitProgress[unitId] = { stage: 1, consec: 0, mastered: false };
  }
  
  if (passed) {
    if (currentStage === 3 && !isAya) {
      // Stage 3: Need 2 consecutive passes
      AppState.unitProgress[unitId].consec++;
      if (AppState.unitProgress[unitId].consec >= 2) {
        AppState.unitProgress[unitId].mastered = true;
      }
    } else if (currentStage === 2 && isAya) {
      // Aya Stage 2: Mastered
      AppState.unitProgress[unitId].mastered = true;
    } else {
      // Advance to next stage
      AppState.unitProgress[unitId].stage = currentStage + 1;
      AppState.unitProgress[unitId].consec = 0;
    }
  } else {
    // Reset consecutive count
    AppState.unitProgress[unitId].consec = 0;
  }
  
  await save();
  
  const isMastered = AppState.unitProgress[unitId].mastered;
  
  container.innerHTML = `
    <div class="quiz-results">
      <h1>${isMastered ? '🎉' : passed ? '✓' : '📝'}</h1>
      <h2>${isMastered ? 'Unit Mastered!' : passed ? 'Stage Complete!' : 'Keep Practicing'}</h2>
      
      <div class="results-score">
        <div class="score-circle">
          <div class="score-value">${percentage}%</div>
          <div class="score-label">${correctCount}/${quizPhrases.length} correct</div>
        </div>
      </div>
      
      <div class="results-message">
        ${isMastered ? `
          <p>You've mastered ${unit.title}!</p>
          <p>Ready to move to the next unit.</p>
        ` : passed ? `
          <p>You passed Stage ${currentStage}!</p>
          <p>Continue to Stage ${currentStage + 1} to master this unit.</p>
        ` : `
          <p>You need ${threshold}% to pass Stage ${currentStage}.</p>
          <p>Review the phrases and try again.</p>
        `}
      </div>
      
      <div class="results-actions">
        ${!isMastered && !passed ? `
          <button class="btn-secondary" id="review-btn">Review Phrases</button>
        ` : ''}
        <button class="btn-primary" id="done-btn">
          ${isMastered ? 'Continue' : 'Back to Home'}
        </button>
      </div>
    </div>
  `;
  
  const reviewBtn = container.querySelector('#review-btn');
  if (reviewBtn) {
    reviewBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('lesson'));
    });
  }
  
  const doneBtn = container.querySelector('#done-btn');
  if (doneBtn) {
    doneBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('home'));
    });
  }
}

/**
 * Utility functions
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function normalizeAnswer(text) {
  return text.toLowerCase().trim().replace(/[.,!?]/g, '');
}

function removeDiacritics(text) {
  // Remove Arabic diacritics (harakaat)
  return text.replace(/[\u064B-\u065F]/g, '');
}

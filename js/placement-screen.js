/**
 * placement-screen.js - Placement test
 * Named with -screen suffix to avoid collision with data/placement.js
 * 5 levels, 32 questions per level, 50% threshold routing
 */

import { AppState, save } from './state.js';
import { PLACEMENT_LEVELS } from './data/placement.js';
import { evaluatePlacement } from './api.js';
import { handleInputDirection } from './utils/rtl.js';
import { showError, showLoading, hideLoading } from './utils/ui.js';

let currentLevel = 0;
let currentQuestionIndex = 0;
let correctCount = 0;
let placementAnswers = [];

/**
 * Render placement test screen
 */
export function renderPlacementScreen(container) {
  // Check if placement already completed
  if (AppState.profile.placementLevel !== undefined) {
    showAlreadyCompleted(container);
    return;
  }
  
  // Resume from saved state if exists
  const savedState = localStorage.getItem('arabic_placement_state');
  if (savedState) {
    const state = JSON.parse(savedState);
    currentLevel = state.level || 0;
    currentQuestionIndex = state.questionIndex || 0;
    correctCount = state.correctCount || 0;
    placementAnswers = state.answers || [];
  } else {
    currentLevel = 0;
    currentQuestionIndex = 0;
    correctCount = 0;
    placementAnswers = [];
  }
  
  renderQuestion(container);
}

/**
 * Show already completed message
 */
function showAlreadyCompleted(container) {
  const levelName = getLevelName(AppState.profile.placementLevel);
  
  container.innerHTML = `
    <div class="placement-complete">
      <h2>Placement Test Complete</h2>
      <p>You've already completed the placement test.</p>
      <p class="level-result">Your level: <strong>${levelName}</strong></p>
      <button class="btn-primary" id="home-btn">Back to Home</button>
    </div>
  `;
  
  const homeBtn = container.querySelector('#home-btn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('home'));
    });
  }
}

/**
 * Render placement question
 */
function renderQuestion(container) {
  const level = PLACEMENT_LEVELS[currentLevel];
  const totalQuestions = level.questions.length;
  
  if (currentQuestionIndex >= totalQuestions) {
    evaluateLevel(container);
    return;
  }
  
  const question = level.questions[currentQuestionIndex];
  
  container.innerHTML = `
    <div class="placement-screen">
      <!-- Header -->
      <div class="placement-header">
        <button class="btn-back" id="exit-btn">✕ Exit</button>
        <div class="placement-title">
          <h2>Placement Test</h2>
          <p>${level.name} - Question ${currentQuestionIndex + 1}/${totalQuestions}</p>
        </div>
      </div>
      
      <!-- Progress -->
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${((currentQuestionIndex + 1) / totalQuestions) * 100}%"></div>
      </div>
      
      <!-- Question -->
      <div class="placement-question">
        <div class="question-prompt" dir="${question.type === 'translate_to_arabic' ? 'ltr' : 'rtl'}">
          ${question.prompt}
        </div>
        
        <p class="question-instruction">
          ${question.type === 'translate_to_arabic' ? 'Translate to Arabic' : 'Translate to English'}
        </p>
        
        <textarea 
          id="answer-input" 
          class="answer-input" 
          placeholder="Type your answer..."
          rows="3"
        ></textarea>
      </div>
      
      <!-- Submit -->
      <button class="btn-primary" id="submit-btn">Submit</button>
    </div>
  `;
  
  attachPlacementListeners(container, question);
  saveProgress();
}

/**
 * Attach event listeners
 */
function attachPlacementListeners(container, question) {
  // Exit button
  const exitBtn = container.querySelector('#exit-btn');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      if (confirm('Exit placement test? Your progress will be saved.')) {
        import('./router.js').then(({ navigateTo }) => navigateTo('home'));
      }
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
      checkAnswer(container, question, answerInput.value.trim());
    });
  }
  
  // Enter to submit
  if (answerInput) {
    answerInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        checkAnswer(container, question, answerInput.value.trim());
      }
    });
  }
}

/**
 * Check answer
 */
function checkAnswer(container, question, userAnswer) {
  const expectedAnswer = question.answer;
  const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(expectedAnswer);
  
  placementAnswers.push({
    question: question,
    userAnswer: userAnswer,
    correct: isCorrect
  });
  
  if (isCorrect) {
    correctCount++;
  }
  
  // Show feedback
  showFeedback(container, question, isCorrect, expectedAnswer);
}

/**
 * Show answer feedback
 */
function showFeedback(container, question, isCorrect, expectedAnswer) {
  container.innerHTML = `
    <div class="placement-feedback">
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
      
      <button class="btn-primary" id="continue-btn">Continue</button>
    </div>
  `;
  
  const continueBtn = container.querySelector('#continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      currentQuestionIndex++;
      renderQuestion(container);
    });
  }
}

/**
 * Evaluate level completion
 */
async function evaluateLevel(container) {
  const level = PLACEMENT_LEVELS[currentLevel];
  const totalQuestions = level.questions.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const passed = percentage >= 50; // 50% threshold
  
  container.innerHTML = `
    <div class="placement-results">
      <h2>Level ${currentLevel + 1} Complete</h2>
      <div class="score-circle">
        <div class="score-value">${percentage}%</div>
        <div class="score-label">${correctCount}/${totalQuestions} correct</div>
      </div>
      
      <p class="result-message">
        ${passed ? 
          `Great job! Moving to ${currentLevel < PLACEMENT_LEVELS.length - 1 ? 'the next level' : 'final evaluation'}...` : 
          'Evaluating your placement...'
        }
      </p>
      
      <button class="btn-primary" id="continue-btn">Continue</button>
    </div>
  `;
  
  const continueBtn = container.querySelector('#continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', async () => {
      if (passed && currentLevel < PLACEMENT_LEVELS.length - 1) {
        // Advance to next level
        currentLevel++;
        currentQuestionIndex = 0;
        correctCount = 0;
        renderQuestion(container);
      } else {
        // Complete placement
        await completePlacement(container);
      }
    });
  }
}

/**
 * Complete placement test
 */
async function completePlacement(container) {
  showLoading('Evaluating your level...');
  
  try {
    // Call API for evaluation
    const result = await evaluatePlacement(placementAnswers, AppState.profile.goals);
    
    // Save placement level
    AppState.profile.placementLevel = currentLevel;
    AppState.profile.placementScore = Math.round((correctCount / PLACEMENT_LEVELS[currentLevel].questions.length) * 100);
    
    await save();
    
    // Clear saved state
    localStorage.removeItem('arabic_placement_state');
    
    hideLoading();
    
    // Show final results
    showFinalResults(container, result);
    
  } catch (error) {
    hideLoading();
    showError('Failed to evaluate placement. Please try again.');
    console.error('Placement evaluation error:', error);
  }
}

/**
 * Show final placement results
 */
function showFinalResults(container, result) {
  const levelName = getLevelName(AppState.profile.placementLevel);
  
  container.innerHTML = `
    <div class="placement-final">
      <h1>🎯</h1>
      <h2>Placement Complete!</h2>
      
      <div class="final-level">
        <p>Your Level:</p>
        <h3>${levelName}</h3>
      </div>
      
      ${result.feedback ? `
        <div class="final-feedback">
          <p>${result.feedback}</p>
        </div>
      ` : ''}
      
      <button class="btn-primary" id="start-btn">Start Learning</button>
    </div>
  `;
  
  const startBtn = container.querySelector('#start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('home'));
    });
  }
}

/**
 * Save progress to localStorage
 */
function saveProgress() {
  const state = {
    level: currentLevel,
    questionIndex: currentQuestionIndex,
    correctCount: correctCount,
    answers: placementAnswers
  };
  localStorage.setItem('arabic_placement_state', JSON.stringify(state));
}

/**
 * Utility functions
 */
function normalizeAnswer(text) {
  return text.toLowerCase().trim().replace(/[.,!?]/g, '');
}

function getLevelName(level) {
  const names = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
  return names[level] || 'Unknown';
}

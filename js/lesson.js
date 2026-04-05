/**
 * lesson.js - Phrase learning screen
 * Teaches new phrases with audio and examples
 */

import { AppState, save } from './state.js';
import { UNITS } from './data/units.js';
import { AYA_UNITS } from './data/aya-course.js';
import { speakArabic } from './utils/audio.js';
import { showError, showToast } from './utils/ui.js';

let currentUnitIndex = 0;
let currentPhraseIndex = 0;

/**
 * Render lesson screen
 */
export function renderLessonScreen(container) {
  const units = AppState.isAya ? AYA_UNITS : UNITS;
  const progress = AppState.profile.unitProgress || {};
  
  // Find current unit
  for (let i = 0; i < units.length; i++) {
    const unitId = `unit${i + 1}`;
    if (!progress[unitId] || !progress[unitId].mastered) {
      currentUnitIndex = i;
      break;
    }
  }
  
  const unit = units[currentUnitIndex];
  currentPhraseIndex = 0;
  
  renderPhrase(container, unit);
}

/**
 * Render individual phrase
 */
function renderPhrase(container, unit) {
  const phrase = unit.phrases[currentPhraseIndex];
  const isAya = AppState.isAya;
  
  container.innerHTML = `
    <div class="lesson-screen">
      <!-- Header -->
      <div class="lesson-header">
        <button class="btn-back" id="back-btn">← Back</button>
        <div class="lesson-title">
          <h2>${unit.title}</h2>
          <p>Phrase ${currentPhraseIndex + 1} of ${unit.phrases.length}</p>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${((currentPhraseIndex + 1) / unit.phrases.length) * 100}%"></div>
      </div>
      
      <!-- Phrase Card -->
      <div class="phrase-display">
        <!-- Arabic -->
        <div class="phrase-arabic" dir="rtl">
          ${phrase.ar || phrase.arabic}
          <button class="audio-btn" id="audio-btn">🔊</button>
        </div>
        
        <!-- Romanization (for beginners) -->
        ${AppState.profile.speaker_type === 'beginner' ? `
          <div class="phrase-romanization">${phrase.rom || phrase.romanization || ''}</div>
        ` : ''}
        
        <!-- Context -->
        ${phrase.context ? `
          <div class="phrase-context">
            <strong>Context:</strong> ${phrase.context}
          </div>
        ` : ''}
        
        <!-- Beginner: Show input field -->
        ${AppState.profile.speaker_type === 'beginner' ? `
          <div class="practice-section">
            <label for="answer-input">Type the English meaning:</label>
            <input type="text" id="answer-input" class="practice-input" placeholder="Type here..." autocomplete="off" />
            <button class="btn-primary" id="check-btn">Check Answer</button>
            <div id="feedback" class="feedback-message"></div>
          </div>
        ` : `
          <!-- Non-beginner: Show English directly -->
          <div class="phrase-english">${phrase.en || phrase.english}</div>
        `}
      </div>
      
      <!-- Navigation (only for non-beginners, beginners auto-advance) -->
      ${AppState.profile.speaker_type !== 'beginner' ? `
      <div class="lesson-nav">
        ${currentPhraseIndex > 0 ? `
          <button class="btn-secondary" id="prev-btn">← Previous</button>
        ` : '<div></div>'}
        
        ${currentPhraseIndex < unit.phrases.length - 1 ? `
          <button class="btn-primary" id="next-btn">Next →</button>
        ` : `
          <button class="btn-primary" id="finish-btn">Start Quiz</button>
        `}
      </div>
      ` : ''}
      <div class="lesson-nav">
        ${currentPhraseIndex > 0 ? `
          <button class="btn-secondary" id="prev-btn">← Previous</button>
        ` : '<div></div>'}
        
        ${currentPhraseIndex < unit.phrases.length - 1 ? `
          <button class="btn-primary" id="next-btn">Next →</button>
        ` : `
          <button class="btn-primary" id="finish-btn">Start Quiz</button>
        `}
      </div>
    </div>
  `;
  
  attachLessonListeners(container, unit);
}

/**
 * Attach event listeners
 */
function attachLessonListeners(container, unit, phrase) {
  const isBeginner = AppState.profile.speaker_type === 'beginner';
  
  // Attach beginner listeners if needed
  if (isBeginner) {
    attachBeginnerListeners(container, unit);
  }
  
  // Back button
  const backBtn = container.querySelector('#back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('home'));
    });
  }
  
  // Audio button
  const audioBtn = container.querySelector('#audio-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      speakArabic(phrase.ar || phrase.arabic);
    });
  }
  
  // Check answer button (beginners only)
  if (isBeginner) {
    const checkBtn = container.querySelector('#check-btn');
    const answerInput = container.querySelector('#answer-input');
    const feedbackDiv = container.querySelector('#feedback');
    
    if (checkBtn && answerInput) {
      const handleCheck = () => {
        const userAnswer = answerInput.value.trim().toLowerCase();
        const correctAnswer = (phrase.en || phrase.english).toLowerCase();
        
        if (userAnswer === correctAnswer) {
          feedbackDiv.innerHTML = '<span style="color: #059669;">✓ Correct!</span>';
          feedbackDiv.style.display = 'block';
          
          // Auto-advance after 1 second
          setTimeout(() => {
            if (currentPhraseIndex < unit.phrases.length - 1) {
              currentPhraseIndex++;
              renderPhrase(container, unit);
            } else {
              // Finished unit
              showToast('Unit complete! Great work!');
              import('./router.js').then(({ navigateTo }) => navigateTo('home'));
            }
          }, 1000);
        } else {
          feedbackDiv.innerHTML = "<span style=\"color: #DC2626;\">✗ Not quite. The answer is: \"" + (phrase.en || phrase.english) + "\"</span>";
          feedbackDiv.style.display = 'block';
          answerInput.value = '';
          answerInput.focus();
        }
      };
      
      checkBtn.addEventListener('click', handleCheck);
      answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleCheck();
        }
      });
      
      // Auto-focus input
      setTimeout(() => answerInput.focus(), 100);
    }
  }
  
  // Previous button
  const prevBtn = container.querySelector('#prev-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPhraseIndex > 0) {
        currentPhraseIndex--;
        renderPhrase(container, unit);
      }
    });
  }
  
  // Next button (non-beginners only)
  const nextBtn = container.querySelector('#next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentPhraseIndex < unit.phrases.length - 1) {
        currentPhraseIndex++;
        renderPhrase(container, unit);
      }
    });
  }
  
  // Finish button (non-beginners only)
  const finishBtn = container.querySelector('#finish-btn');
  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('quiz'));
    });
  }
}

/**
 * Get current unit index (for quiz to access)
 */
export function getCurrentUnitIndex() {
  return currentUnitIndex;
}

// BUILD 1: Beginner answer checking
function attachBeginnerListeners(container, unit) {
  const phrase = unit.phrases[currentPhraseIndex];
  const checkBtn = container.querySelector('#check-btn');
  const answerInput = container.querySelector('#answer-input');
  const feedbackDiv = container.querySelector('#feedback');
  
  if (!checkBtn || !answerInput) return;
  
  const handleCheck = () => {
    const userAnswer = answerInput.value.trim().toLowerCase();
    const correctAnswer = (phrase.en || phrase.english).toLowerCase();
    
    if (userAnswer === correctAnswer) {
      feedbackDiv.innerHTML = '<span style="color: #059669;">✓ Correct!</span>';
      feedbackDiv.style.display = 'block';
      
      setTimeout(() => {
        if (currentPhraseIndex < unit.phrases.length - 1) {
          currentPhraseIndex++;
          renderPhrase(container, unit);
        } else {
          import('./router.js').then(m => m.navigateTo('home'));
        }
      }, 1000);
    } else {
      feedbackDiv.innerHTML = "<span style='color: #DC2626;'>✗ Not quite. The answer is: \"" + correctAnswer + "\"</span>";
      feedbackDiv.style.display = 'block';
      answerInput.value = '';
      answerInput.focus();
    }
  };
  
  checkBtn.addEventListener('click', handleCheck);
  answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleCheck();
  });
  
  answerInput.focus();
}

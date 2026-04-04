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
        
        <!-- Romanization (Aya only, Stage 1) -->
        ${isAya && (!AppState.profile.unitProgress || AppState.profile.unitProgress[`unit${currentUnitIndex + 1}`]?.stage === 1) ? `
          <div class="phrase-romanization">${phrase.rom || phrase.romanization || ''}</div>
        ` : ''}
        
        <!-- English -->
        <div class="phrase-english">${phrase.en || phrase.english}</div>
        
        <!-- Context (if available) -->
        ${phrase.context ? `
          <div class="phrase-context">
            <strong>Context:</strong> ${phrase.context}
          </div>
        ` : ''}
        
        <!-- Example (if available) -->
        ${phrase.example ? `
          <div class="phrase-example">
            <strong>Example:</strong>
            <p dir="rtl">${phrase.example.ar || phrase.example.arabic}</p>
            <p>${phrase.example.en || phrase.example.english}</p>
          </div>
        ` : ''}
      </div>
      
      <!-- Navigation -->
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
function attachLessonListeners(container, unit) {
  const phrase = unit.phrases[currentPhraseIndex];
  
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
  
  // Next button
  const nextBtn = container.querySelector('#next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentPhraseIndex < unit.phrases.length - 1) {
        currentPhraseIndex++;
        renderPhrase(container, unit);
      }
    });
  }
  
  // Finish button
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

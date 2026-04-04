/**
 * focused-study.js - Stage B contextual study
 * Situational phrase banks for focused learning
 */

import { AppState, save } from './state.js';
import { FOCUSED_CONTEXTS } from './data/focused-contexts.js';
import { saveFocusedSession, loadFocusedSessions } from './database.js';
import { speakArabic } from './utils/audio.js';
import { showError, showToast } from './utils/ui.js';

let currentContext = null;
let currentPhraseIndex = 0;

/**
 * Render focused study home (context selection)
 */
export function renderFocusedStudyScreen(container) {
  container.innerHTML = `
    <div class="focused-study-screen">
      <!-- Header -->
      <div class="focused-header">
        <button class="btn-back" id="back-btn">← Back</button>
        <h2>Focused Study</h2>
      </div>
      
      <!-- Description -->
      <div class="focused-description">
        <p>Practice phrases for specific situations and contexts</p>
      </div>
      
      <!-- Context Grid -->
      <div class="context-grid">
        ${FOCUSED_CONTEXTS.map((context, index) => `
          <button class="context-card" data-index="${index}">
            <div class="context-icon">${context.icon}</div>
            <div class="context-name">${context.name}</div>
            <div class="context-count">${context.phrases.length} phrases</div>
          </button>
        `).join('')}
      </div>
    </div>
  `;
  
  attachFocusedStudyListeners(container);
}

/**
 * Attach focused study listeners
 */
function attachFocusedStudyListeners(container) {
  const backBtn = container.querySelector('#back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('home'));
    });
  }
  
  const contextCards = container.querySelectorAll('.context-card');
  contextCards.forEach(card => {
    card.addEventListener('click', () => {
      const index = parseInt(card.dataset.index);
      startContextSession(container, index);
    });
  });
}

/**
 * Start a context session
 */
function startContextSession(container, contextIndex) {
  currentContext = FOCUSED_CONTEXTS[contextIndex];
  currentPhraseIndex = 0;
  
  renderContextSession(container);
}

/**
 * Render context session (flashcard style)
 */
function renderContextSession(container) {
  if (currentPhraseIndex >= currentContext.phrases.length) {
    completeSession(container);
    return;
  }
  
  const phrase = currentContext.phrases[currentPhraseIndex];
  
  container.innerHTML = `
    <div class="focused-session">
      <!-- Header -->
      <div class="session-header">
        <button class="btn-back" id="exit-btn">✕ Exit</button>
        <div class="session-title">
          <h2>${currentContext.name}</h2>
          <p>Phrase ${currentPhraseIndex + 1} of ${currentContext.phrases.length}</p>
        </div>
      </div>
      
      <!-- Progress -->
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${((currentPhraseIndex + 1) / currentContext.phrases.length) * 100}%"></div>
      </div>
      
      <!-- Phrase Card -->
      <div class="phrase-display">
        <div class="phrase-arabic" dir="rtl">
          ${phrase.ar || phrase.arabic}
          <button class="audio-btn" id="audio-btn">🔊</button>
        </div>
        
        ${phrase.rom || phrase.romanization ? `
          <div class="phrase-romanization">${phrase.rom || phrase.romanization}</div>
        ` : ''}
        
        <div class="phrase-english">${phrase.en || phrase.english}</div>
        
        ${phrase.context ? `
          <div class="phrase-context">
            <strong>When to use:</strong> ${phrase.context}
          </div>
        ` : ''}
        
        ${phrase.note ? `
          <div class="phrase-note">
            <strong>Note:</strong> ${phrase.note}
          </div>
        ` : ''}
      </div>
      
      <!-- Navigation -->
      <div class="session-nav">
        ${currentPhraseIndex > 0 ? `
          <button class="btn-secondary" id="prev-btn">← Previous</button>
        ` : '<div></div>'}
        
        ${currentPhraseIndex < currentContext.phrases.length - 1 ? `
          <button class="btn-primary" id="next-btn">Next →</button>
        ` : `
          <button class="btn-primary" id="finish-btn">Finish</button>
        `}
      </div>
    </div>
  `;
  
  attachSessionListeners(container, phrase);
}

/**
 * Attach session listeners
 */
function attachSessionListeners(container, phrase) {
  const exitBtn = container.querySelector('#exit-btn');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      if (confirm('Exit session? Your progress will not be saved.')) {
        renderFocusedStudyScreen(container);
      }
    });
  }
  
  const audioBtn = container.querySelector('#audio-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      speakArabic(phrase.ar || phrase.arabic);
    });
  }
  
  const prevBtn = container.querySelector('#prev-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPhraseIndex > 0) {
        currentPhraseIndex--;
        renderContextSession(container);
      }
    });
  }
  
  const nextBtn = container.querySelector('#next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentPhraseIndex < currentContext.phrases.length - 1) {
        currentPhraseIndex++;
        renderContextSession(container);
      }
    });
  }
  
  const finishBtn = container.querySelector('#finish-btn');
  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      completeSession(container);
    });
  }
}

/**
 * Complete session
 */
async function completeSession(container) {
  // Save session to database
  try {
    await saveFocusedSession({
      contextId: currentContext.id,
      contextName: currentContext.name,
      phrasesReviewed: currentContext.phrases.length,
      completedAt: new Date().toISOString()
    });
    
    showToast('Session complete! Great work.');
  } catch (error) {
    console.error('Failed to save focused session:', error);
  }
  
  // Show completion screen
  container.innerHTML = `
    <div class="session-complete">
      <h1>🎯</h1>
      <h2>Session Complete!</h2>
      <p>You reviewed ${currentContext.phrases.length} phrases for</p>
      <p class="context-name">${currentContext.name}</p>
      
      <div class="completion-actions">
        <button class="btn-secondary" id="review-btn">Review Again</button>
        <button class="btn-primary" id="home-btn">Back to Home</button>
      </div>
    </div>
  `;
  
  const reviewBtn = container.querySelector('#review-btn');
  if (reviewBtn) {
    reviewBtn.addEventListener('click', () => {
      currentPhraseIndex = 0;
      renderContextSession(container);
    });
  }
  
  const homeBtn = container.querySelector('#home-btn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('home'));
    });
  }
}

/**
 * flashcards.js - Spaced repetition flashcard system
 * Reviews weak words and recent phrases
 */

import { AppState, save } from './state.js';
import { UNITS } from './data/units.js';
import { AYA_UNITS } from './data/aya-course.js';
import { speakArabic } from './utils/audio.js';
import { showError, showToast } from './utils/ui.js';

let flashcardDeck = [];
let currentCardIndex = 0;
let isFlipped = false;
let studyMode = 'weak_to_strong'; // 'weak_only', 'weak_to_strong', 'all', 'mastered'

/**
 * Render flashcards screen
 */
export function renderFlashcardsScreen(container) {
  // Show mode selector first
  if (!studyMode) {
    renderModeSelector(container);
    return;
  }
  
  const units = AppState.isAya ? AYA_UNITS : UNITS;
  const weakWords = AppState.profile.weakWords || [];
  
  // Build deck based on study mode
  flashcardDeck = buildDeck(units, studyMode);
  
  // OLD: Build deck from weak words
  flashcardDeck = [];
  for (const phraseId of weakWords) {
    const phrase = getPhraseById(phraseId, units);
    if (phrase) {
      flashcardDeck.push(phrase);
    }
  }
  
  // If no weak words, use recent phrases from current unit
  if (flashcardDeck.length === 0) {
    const progress = AppState.profile.unitProgress || {};
    let currentUnitIndex = 0;
    for (let i = 0; i < units.length; i++) {
      const unitId = `unit${i + 1}`;
      if (!progress[unitId] || !progress[unitId].mastered) {
        currentUnitIndex = i;
        break;
      }
    }
    flashcardDeck = units[currentUnitIndex].phrases.slice(0, 10);
  }
  
  currentCardIndex = 0;
  isFlipped = false;
  
  renderCard(container);
}

/**
 * Render study mode selector
 */
function renderModeSelector(container) {
  container.innerHTML = `
    <div class="flashcards-screen">
      <div class="flashcards-header">
        <button class="btn-back" id="back-btn">← Back</button>
        <h2>Choose Study Mode</h2>
      </div>
      
      <div class="study-modes">
        <button class="study-mode-btn" data-mode="weak_only">
          <h3>⚠️ Weak Words Only</h3>
          <p>Focus on struggling phrases (0-49% mastery)</p>
        </button>
        
        <button class="study-mode-btn recommended" data-mode="weak_to_strong">
          <h3>💪 Weak → Strong</h3>
          <p>Prioritize weak, include familiar/strong (0-95%)</p>
          <span class="recommended-badge">Recommended</span>
        </button>
        
        <button class="study-mode-btn" data-mode="all">
          <h3>📚 All Words</h3>
          <p>Full review of all phrases</p>
        </button>
        
        <button class="study-mode-btn" data-mode="mastered">
          <h3>🏆 Mastered Only</h3>
          <p>Maintenance review (96-100% mastery)</p>
        </button>
      </div>
    </div>
  `;
  
  // Attach listeners
  container.querySelector('#back-btn')?.addEventListener('click', () => {
    import('./router.js').then(({ navigateTo }) => navigateTo('home'));
  });
  
  container.querySelectorAll('.study-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      studyMode = btn.dataset.mode;
      renderFlashcardsScreen(container);
    });
  });
}

/**
 * Build deck based on study mode
 */
async function buildDeck(units, mode) {
  const { mastery } = await import('./database.js').then(m => m.loadPhrasesMastery(AppState.user.email));
  
  let allPhrases = [];
  units.forEach((unit, unitIdx) => {
    unit.phrases.forEach((phrase, phraseIdx) => {
      const phraseId = `unit${unitIdx + 1}_phrase${phraseIdx}`;
      const masteryScore = mastery[phraseId]?.mastery || 0;
      allPhrases.push({ ...phrase, phraseId, mastery: masteryScore });
    });
  });
  
  // Filter based on mode
  if (mode === 'weak_only') {
    allPhrases = allPhrases.filter(p => p.mastery < 50);
  } else if (mode === 'weak_to_strong') {
    allPhrases = allPhrases.filter(p => p.mastery < 96);
    allPhrases.sort((a, b) => a.mastery - b.mastery); // Weak first
  } else if (mode === 'mastered') {
    allPhrases = allPhrases.filter(p => p.mastery >= 96);
  }
  // 'all' mode uses all phrases
  
  // Shuffle if not weak_to_strong
  if (mode !== 'weak_to_strong') {
    allPhrases = allPhrases.sort(() => Math.random() - 0.5);
  }
  
  return allPhrases;
}

/**
 * Render individual flashcard
 */
function renderCard(container) {
  if (flashcardDeck.length === 0) {
    container.innerHTML = `
      <div class="flashcards-empty">
        <h2>No cards to review</h2>
        <p>Complete some lessons to build your flashcard deck!</p>
        <button class="btn-primary" id="home-btn">Back to Home</button>
      </div>
    `;
    
    const homeBtn = container.querySelector('#home-btn');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        import('./router.js').then(({ navigateTo }) => navigateTo('home'));
      });
    }
    return;
  }
  
  const card = flashcardDeck[currentCardIndex];
  
  container.innerHTML = `
    <div class="flashcards-screen">
      <!-- Header -->
      <div class="flashcards-header">
        <button class="btn-back" id="back-btn">← Back</button>
        <div class="flashcards-title">
          <h2>Flashcards</h2>
          <p>Card ${currentCardIndex + 1} of ${flashcardDeck.length}</p>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${((currentCardIndex + 1) / flashcardDeck.length) * 100}%"></div>
      </div>
      
      <!-- Card -->
      <div class="flashcard-container">
        <div class="flashcard ${isFlipped ? 'flipped' : ''}" id="flashcard">
          <!-- Front (Arabic) -->
          <div class="flashcard-front">
            <div class="card-content" dir="rtl">
              ${card.ar || card.arabic}
            </div>
            <button class="audio-btn" id="audio-btn">🔊</button>
          </div>
          
          <!-- Back (English) -->
          <div class="flashcard-back">
            <div class="card-content">
              ${card.en || card.english}
            </div>
            ${card.context ? `
              <div class="card-context">${card.context}</div>
            ` : ''}
          </div>
        </div>
        
        <button class="btn-flip" id="flip-btn">
          ${isFlipped ? 'Flip Back' : 'Show Answer'}
        </button>
      </div>
      
      <!-- Navigation -->
      <div class="flashcard-nav">
        ${currentCardIndex > 0 ? `
          <button class="btn-secondary" id="prev-btn">← Previous</button>
        ` : '<div></div>'}
        
        ${isFlipped ? `
          <div class="difficulty-btns">
            <button class="btn-difficulty easy" id="easy-btn">Easy</button>
            <button class="btn-difficulty hard" id="hard-btn">Hard</button>
          </div>
        ` : '<div></div>'}
        
        ${currentCardIndex < flashcardDeck.length - 1 ? `
          <button class="btn-primary" id="next-btn">Next →</button>
        ` : `
          <button class="btn-primary" id="finish-btn">Finish</button>
        `}
      </div>
    </div>
  `;
  
  attachFlashcardListeners(container, card);
}

/**
 * Attach event listeners
 */
function attachFlashcardListeners(container, card) {
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
      speakArabic(card.ar || card.arabic);
    });
  }
  
  // Flip button
  const flipBtn = container.querySelector('#flip-btn');
  if (flipBtn) {
    flipBtn.addEventListener('click', () => {
      isFlipped = !isFlipped;
      renderCard(container);
    });
  }
  
  // Difficulty buttons (for spaced repetition)
  const easyBtn = container.querySelector('#easy-btn');
  if (easyBtn) {
    easyBtn.addEventListener('click', () => {
      handleDifficulty('easy', card);
      nextCard(container);
    });
  }
  
  const hardBtn = container.querySelector('#hard-btn');
  if (hardBtn) {
    hardBtn.addEventListener('click', () => {
      handleDifficulty('hard', card);
      nextCard(container);
    });
  }
  
  // Previous button
  const prevBtn = container.querySelector('#prev-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentCardIndex > 0) {
        currentCardIndex--;
        isFlipped = false;
        renderCard(container);
      }
    });
  }
  
  // Next button
  const nextBtn = container.querySelector('#next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextCard(container);
    });
  }
  
  // Finish button
  const finishBtn = container.querySelector('#finish-btn');
  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      showToast('Great work! Flashcard session complete.');
      import('./router.js').then(({ navigateTo }) => navigateTo('home'));
    });
  }
}

/**
 * Handle difficulty rating
 */
async function handleDifficulty(rating, card) {
  // If easy, remove from weak words
  if (rating === 'easy') {
    const phraseId = card.id || `${card.ar}_${card.en}`;
    const weakWords = AppState.profile.weakWords || [];
    AppState.profile.weakWords = weakWords.filter(id => !id.includes(phraseId));
    await save();
  }
}

/**
 * Move to next card
 */
function nextCard(container) {
  if (currentCardIndex < flashcardDeck.length - 1) {
    currentCardIndex++;
    isFlipped = false;
    renderCard(container);
  } else {
    showToast('Great work! Flashcard session complete.');
    import('./router.js').then(({ navigateTo }) => navigateTo('home'));
  }
}

/**
 * Get phrase by ID from units
 */
function getPhraseById(phraseId, units) {
  // phraseId format: "unit1_phrase5"
  const match = phraseId.match(/unit(\d+)_phrase(\d+)/);
  if (!match) return null;
  
  const unitIndex = parseInt(match[1]) - 1;
  const phraseIndex = parseInt(match[2]) - 1;
  
  if (unitIndex >= 0 && unitIndex < units.length) {
    const unit = units[unitIndex];
    if (phraseIndex >= 0 && phraseIndex < unit.phrases.length) {
      return unit.phrases[phraseIndex];
    }
  }
  
  return null;
}

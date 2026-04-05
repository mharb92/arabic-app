/**
 * lesson.js - Comprehensive Lesson Teaching Flow
 * TEACH → PRACTICE → REVIEW cycle
 * 4 cycles × 3 phrases = 12 phrases per unit
 * Flashcards → Cumulative retrieval practice → Error correction
 */

import { AppState, save } from './state.js';
import { UNITS } from './data/units.js';
import { AYA_UNITS } from './data/aya-course.js';
import { speakArabic } from './utils/audio.js';
import { showError, showToast } from './utils/ui.js';
import { updatePhraseMastery } from './database.js';

// Lesson state
let currentUnitIndex = 0;
let currentCycle = 0; // 0-3 (4 cycles per unit)
let lessonPhase = 'teach'; // 'teach' | 'practice' | 'review'
let currentCardIndex = 0;
let learnedPhrases = []; // Phrases from all previous cycles
let cyclePhrases = []; // Current cycle's 3 phrases
let practiceQueue = []; // Phrases to practice (cumulative)
let incorrectAnswers = []; // Track mistakes for re-testing

/**
 * Main entry point - Start a lesson
 */
export function renderLessonScreen(container) {
  const units = AppState.isAya ? AYA_UNITS : UNITS;
  const progress = AppState.unitProgress || {};
  
  // Find current unit
  for (let i = 0; i < units.length; i++) {
    const unitId = units[i].id;
    if (!progress[unitId] || progress[unitId].stage !== 'mastered') {
      currentUnitIndex = i;
      break;
    }
  }
  
  const unit = units[currentUnitIndex];
  
  // Initialize lesson state
  currentCycle = 0;
  learnedPhrases = [];
  lessonPhase = 'teach';
  currentCardIndex = 0;
  
  // Get first cycle's phrases (0-2)
  cyclePhrases = unit.phrases.slice(0, 3);
  
  renderTeachPhase(container, unit);
}

/**
 * TEACH PHASE: Show flashcards for the cycle's 3 phrases
 * User just observes and clicks "Got it" to acknowledge
 */
function renderTeachPhase(container, unit) {
  const phrase = cyclePhrases[currentCardIndex];
  const isFlipped = false; // Start with Arabic side
  
  container.innerHTML = `
    <div class="lesson-screen">
      <!-- Header -->
      <div class="lesson-header">
        <button class="btn-back" id="back-btn">← Back</button>
        <div class="lesson-title">
          <h2>${unit.title}</h2>
          <p class="phase-indicator">📚 Learning - Cycle ${currentCycle + 1}/4</p>
        </div>
      </div>
      
      <!-- Cycle Progress -->
      <div class="cycle-progress">
        ${[0, 1, 2].map(i => `
          <div class="cycle-dot ${i < currentCardIndex ? 'completed' : i === currentCardIndex ? 'active' : ''}"></div>
        `).join('')}
      </div>
      
      <!-- Flashcard -->
      <div class="flashcard-container" id="flashcard">
        <div class="flashcard">
          <!-- Front: Arabic -->
          <div class="flashcard-front">
            <div class="flashcard-label">Arabic</div>
            <div class="flashcard-arabic" dir="rtl">${phrase.ar}</div>
            <button class="audio-btn-large" id="audio-btn">🔊 Listen</button>
          </div>
          
          <!-- Back: English + Romanization + Context -->
          <div class="flashcard-back" style="display: none;">
            <div class="flashcard-label">Meaning</div>
            <div class="flashcard-english">${phrase.en}</div>
            ${AppState.profile.speaker_type === 'beginner' ? `
              <div class="flashcard-romanization">${phrase.rom}</div>
            ` : ''}
            ${phrase.context ? `
              <div class="flashcard-context">
                <strong>💡 Context:</strong> ${phrase.context}
              </div>
            ` : ''}
            <button class="audio-btn-large" id="audio-btn-back">🔊 Listen Again</button>
          </div>
        </div>
      </div>
      
      <!-- Instructions -->
      <div class="flashcard-instructions">
        <p>👆 Tap the card to flip and see the meaning</p>
      </div>
      
      <!-- Navigation -->
      <div class="lesson-actions">
        <button class="btn-primary" id="got-it-btn">
          ${currentCardIndex < 2 ? 'Got it! Next →' : 'Ready to Practice →'}
        </button>
      </div>
    </div>
  `;
  
  // Event listeners
  const flashcard = container.querySelector('#flashcard');
  const gotItBtn = container.querySelector('#got-it-btn');
  const audioBtn = container.querySelector('#audio-btn');
  const audioBtnBack = container.querySelector('#audio-btn-back');
  const backBtn = container.querySelector('#back-btn');
  
  // Flip flashcard on click
  let flipped = false;
  flashcard.addEventListener('click', () => {
    flipped = !flipped;
    const front = flashcard.querySelector('.flashcard-front');
    const back = flashcard.querySelector('.flashcard-back');
    
    if (flipped) {
      front.style.display = 'none';
      back.style.display = 'flex';
    } else {
      front.style.display = 'flex';
      back.style.display = 'none';
    }
  });
  
  // Audio buttons
  audioBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    speakArabic(phrase.ar);
  });
  
  if (audioBtnBack) {
    audioBtnBack.addEventListener('click', (e) => {
      e.stopPropagation();
      speakArabic(phrase.ar);
    });
  }
  
  // "Got it" button
  gotItBtn.addEventListener('click', () => {
    currentCardIndex++;
    
    if (currentCardIndex < 3) {
      // Show next card in cycle
      renderTeachPhase(container, unit);
    } else {
      // All 3 cards shown - move to practice phase
      currentCardIndex = 0;
      lessonPhase = 'practice';
      
      // Build cumulative practice queue
      // Include all previously learned phrases + current cycle
      learnedPhrases.push(...cyclePhrases);
      practiceQueue = [...learnedPhrases];
      incorrectAnswers = [];
      
      renderPracticePhase(container, unit);
    }
  });
  
  // Back button
  backBtn.addEventListener('click', () => {
    if (confirm('Leave lesson? Progress will not be saved.')) {
      import('./router.js').then(({ navigateTo }) => navigateTo('home'));
    }
  });
}

/**
 * PRACTICE PHASE: Cumulative retrieval practice
 * User translates all phrases learned so far (from this cycle + previous cycles)
 * Incorrect answers are re-queued 2 positions later
 */
function renderPracticePhase(container, unit) {
  if (practiceQueue.length === 0) {
    // Practice complete - move to self-assessment
    renderSelfAssessment(container, unit);
    return;
  }
  
  const phrase = practiceQueue[0];
  const totalInQueue = practiceQueue.length + incorrectAnswers.length;
  
  container.innerHTML = `
    <div class="lesson-screen">
      <!-- Header -->
      <div class="lesson-header">
        <button class="btn-back" id="back-btn">← Back</button>
        <div class="lesson-title">
          <h2>${unit.title}</h2>
          <p class="phase-indicator">✍️ Practice - Cycle ${currentCycle + 1}/4</p>
        </div>
      </div>
      
      <!-- Progress -->
      <div class="practice-progress">
        <p>${practiceQueue.length} phrases remaining</p>
      </div>
      
      <!-- Phrase Card -->
      <div class="practice-card">
        <div class="practice-arabic" dir="rtl">
          ${phrase.ar}
          <button class="audio-btn" id="audio-btn">🔊</button>
        </div>
        
        ${AppState.profile.speaker_type === 'beginner' ? `
          <div class="practice-romanization">${phrase.rom}</div>
        ` : ''}
        
        <!-- Input -->
        <div class="practice-input-section">
          <label>Type the English meaning:</label>
          <input 
            type="text" 
            id="answer-input" 
            placeholder="Type here..."
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
          />
          <button class="btn-primary" id="check-btn">Check Answer</button>
        </div>
        
        <!-- Feedback -->
        <div id="feedback" style="display: none;"></div>
      </div>
      
      <!-- Hint -->
      <div class="hint-section">
        <button class="btn-secondary" id="hint-btn">💡 Need a hint?</button>
      </div>
    </div>
  `;
  
  const input = container.querySelector('#answer-input');
  const checkBtn = container.querySelector('#check-btn');
  const feedbackDiv = container.querySelector('#feedback');
  const hintBtn = container.querySelector('#hint-btn');
  const audioBtn = container.querySelector('#audio-btn');
  const backBtn = container.querySelector('#back-btn');
  
  // Auto-focus input
  input.focus();
  
  // Audio
  audioBtn.addEventListener('click', () => speakArabic(phrase.ar));
  
  // Hint
  let hintShown = false;
  hintBtn.addEventListener('click', () => {
    if (!hintShown) {
      const firstLetter = phrase.en.charAt(0);
      const length = phrase.en.length;
      feedbackDiv.innerHTML = `<p class="hint">💡 Hint: Starts with "${firstLetter}" (${length} letters total)</p>`;
      feedbackDiv.style.display = 'block';
      hintShown = true;
    }
  });
  
  // Check answer
  const checkAnswer = () => {
    const userAnswer = input.value.trim().toLowerCase();
    const correctAnswer = phrase.en.toLowerCase();
    
    // Normalize for comparison (remove punctuation, extra spaces)
    const normalize = (str) => str.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    const isCorrect = normalize(userAnswer) === normalize(correctAnswer);
    
    if (isCorrect) {
      // Correct!
      feedbackDiv.innerHTML = `
        <div class="feedback-correct">
          ✅ Correct! "${phrase.en}"
          ${phrase.context ? `<p class="context-reminder">💡 ${phrase.context}</p>` : ''}
        </div>
      `;
      feedbackDiv.style.display = 'block';
      
      // Update mastery
      updatePhraseMastery(AppState.user.email, phrase.ar, true, 0);
      
      // Remove from queue and continue
      practiceQueue.shift();
      
      setTimeout(() => {
        renderPracticePhase(container, unit);
      }, 1500);
      
    } else {
      // Incorrect
      feedbackDiv.innerHTML = `
        <div class="feedback-incorrect">
          ❌ Not quite. The answer is: <strong>"${phrase.en}"</strong>
          ${phrase.context ? `<p class="context-reminder">💡 ${phrase.context}</p>` : ''}
        </div>
      `;
      feedbackDiv.style.display = 'block';
      
      // Update mastery
      updatePhraseMastery(AppState.user.email, phrase.ar, false, 0);
      
      // Re-queue this phrase 2 positions later (error correction)
      const incorrectPhrase = practiceQueue.shift();
      const insertPosition = Math.min(2, practiceQueue.length);
      practiceQueue.splice(insertPosition, 0, incorrectPhrase);
      
      // Track incorrect answer
      incorrectAnswers.push(incorrectPhrase);
      
      setTimeout(() => {
        renderPracticePhase(container, unit);
      }, 2500);
    }
  };
  
  checkBtn.addEventListener('click', checkAnswer);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
  });
  
  // Back button
  backBtn.addEventListener('click', () => {
    if (confirm('Leave lesson? Progress will not be saved.')) {
      import('./router.js').then(({ navigateTo }) => navigateTo('home'));
    }
  });
}

/**
 * SELF-ASSESSMENT: User rates confidence after each cycle
 * This affects future review frequency
 */
function renderSelfAssessment(container, unit) {
  container.innerHTML = `
    <div class="lesson-screen">
      <div class="self-assessment">
        <h2>How confident do you feel?</h2>
        <p>Rate your confidence with the phrases you just learned in Cycle ${currentCycle + 1}.</p>
        
        <div class="confidence-buttons">
          <button class="confidence-btn" data-rating="low">
            😰 Still struggling
          </button>
          <button class="confidence-btn" data-rating="medium">
            🤔 Somewhat confident
          </button>
          <button class="confidence-btn" data-rating="high">
            😊 Very confident
          </button>
        </div>
      </div>
    </div>
  `;
  
  const buttons = container.querySelectorAll('.confidence-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const rating = btn.dataset.rating;
      
      // Save confidence rating for this cycle's phrases
      cyclePhrases.forEach(phrase => {
        // Store in AppState (will be synced to Supabase via auto-sync)
        if (!AppState.phrasesMastery) AppState.phrasesMastery = {};
        if (!AppState.phrasesMastery[phrase.ar]) {
          AppState.phrasesMastery[phrase.ar] = { confidence: rating };
        } else {
          AppState.phrasesMastery[phrase.ar].confidence = rating;
        }
      });
      
      // Move to next cycle or finish lesson
      currentCycle++;
      
      if (currentCycle < 4) {
        // Start next cycle (phrases 3-5, 6-8, or 9-11)
        const startIdx = currentCycle * 3;
        cyclePhrases = unit.phrases.slice(startIdx, startIdx + 3);
        currentCardIndex = 0;
        lessonPhase = 'teach';
        
        showToast(`✅ Cycle ${currentCycle} complete! Starting Cycle ${currentCycle + 1}...`);
        
        setTimeout(() => {
          renderTeachPhase(container, unit);
        }, 1500);
        
      } else {
        // All 4 cycles complete - lesson finished!
        finishLesson(container, unit);
      }
    });
  });
}

/**
 * FINISH LESSON: Mark unit as complete, update progress
 */
async function finishLesson(container, unit) {
  // Update unit progress
  if (!AppState.unitProgress) AppState.unitProgress = {};
  
  AppState.unitProgress[unit.id] = {
    stage: 'mastered',
    mastered: true,
    lastReviewed: new Date().toISOString()
  };
  
  // Save to Supabase
  await save();
  
  // Show completion screen
  container.innerHTML = `
    <div class="lesson-screen">
      <div class="lesson-complete">
        <h1>🎉 Lesson Complete!</h1>
        <h2>${unit.title}</h2>
        <p>You've learned all 12 phrases in this unit.</p>
        
        <div class="completion-stats">
          <div class="stat">
            <span class="stat-number">12</span>
            <span class="stat-label">Phrases Learned</span>
          </div>
          <div class="stat">
            <span class="stat-number">4</span>
            <span class="stat-label">Cycles Completed</span>
          </div>
        </div>
        
        <button class="btn-primary btn-large" id="continue-btn">Continue Learning →</button>
      </div>
    </div>
  `;
  
  const continueBtn = container.querySelector('#continue-btn');
  continueBtn.addEventListener('click', () => {
    import('./router.js').then(({ navigateTo }) => navigateTo('home'));
  });
}

/**
 * Back button handler
 */
document.addEventListener('click', (e) => {
  if (e.target.id === 'back-btn') {
    if (confirm('Leave lesson? Progress will not be saved.')) {
      import('./router.js').then(({ navigateTo }) => navigateTo('home'));
    }
  }
});

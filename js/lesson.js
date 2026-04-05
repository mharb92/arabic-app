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
function attachLessonListeners(container, unit, phrase) {
  const isBeginner = AppState.profile.speaker_type === 'beginner';
  
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
          
          // Update mastery
          const phraseId = `unit${currentUnitIndex + 1}_phrase${currentPhraseIndex}`;
          import('./database.js').then(m => m.updatePhraseMastery(AppState.user.email, phraseId, true));
          
          // Save to vocab prompt
          showSaveToVocabToast(phrase, unit.title);
          
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
          // Update mastery
          const phraseId = `unit${currentUnitIndex + 1}_phrase${currentPhraseIndex}`;
          import('./database.js').then(m => m.updatePhraseMastery(AppState.user.email, phraseId, false));
          
          feedbackDiv.innerHTML = `<span style="color: #DC2626;">✗ Not quite. The answer is: "${phrase.en || phrase.english}"</span>`;
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

// BUILD 3: Save to vocab functionality
async function showSaveToVocabToast(phrase, unitTitle) {
  const phraseId = `${phrase.ar}_${phrase.en}`;
  const exists = await checkVocabDuplicate(phraseId);
  if (exists) return;
  
  const toast = document.createElement('div');
  toast.className = 'save-vocab-toast';
  toast.innerHTML = `
    <p>Save to My Vocab?</p>
    <div class="toast-buttons">
      <button class="btn-yes">Yes</button>
      <button class="btn-no">No</button>
    </div>
  `;
  document.body.appendChild(toast);
  
  toast.querySelector('.btn-yes').addEventListener('click', async () => {
    await saveToMyVocab(phrase, unitTitle);
    toast.remove();
    import('./utils/ui.js').then(m => m.showToast('Added to My Vocab!'));
  });
  
  toast.querySelector('.btn-no').addEventListener('click', () => {
    toast.remove();
  });
  
  setTimeout(() => toast.remove(), 5000);
}

async function checkVocabDuplicate(phraseId) {
  const db = await import('./database.js');
  const { words } = await db.loadPersonalVocab(AppState.user.email);
  return words.some(w => `${w.arabic}_${w.english}` === phraseId);
}

async function saveToMyVocab(phrase, unitTitle) {
  const category = inferCategory(unitTitle);
  const vocabData = {
    arabic: phrase.ar || phrase.arabic,
    romanization: phrase.rom || phrase.romanization || '',
    english: phrase.en || phrase.english,
    source: `Lesson: ${unitTitle}`,
    category: category,
    notes: phrase.context || ''
  };
  
  const db = await import('./database.js');
  await db.savePersonalVocab(AppState.user.email, vocabData);
}

function inferCategory(unitTitle) {
  if (unitTitle.includes('Meeting') || unitTitle.includes('Greetings')) return 'Greetings';
  if (unitTitle.includes('Family')) return 'Family';
  if (unitTitle.includes('Table') || unitTitle.includes('Food')) return 'Food';
  if (unitTitle.includes('Love') || unitTitle.includes('Gratitude')) return 'Emotions';
  if (unitTitle.includes('Connected')) return 'Travel';
  return 'General';
}


export function getCurrentUnitIndex() {
  return currentUnitIndex;
}

/**
 * aya.js - Aya's special course screens
 * Splash, phonics, cultural cards, Marwan notes, course completion
 */

import { AppState, save } from './state.js';
import { AYA_UNITS, PHONICS_DATA, CULTURAL_CARDS, MARWAN_NOTES } from './data/aya-course.js';
import { speakArabic } from './utils/audio.js';
import { daysUntilJune5, getCountdownMessage } from './utils/date.js';

/**
 * Render Aya's first-visit splash (3 screens)
 */
export function renderAyaSplash(container, onComplete) {
  let currentScreen = 0;
  const screens = [
    {
      // Screen 1: Japanese line
      content: '<p class="japanese-text">あやちゃん、アラビア語の勉強を始めましょう</p>',
      duration: 5000
    },
    {
      // Screen 2: Arabic reveal
      content: '<p class="arabic-text" dir="rtl">تَفَضَّلِي</p><p class="subtitle">Please, come in</p>',
      duration: 3000
    },
    {
      // Screen 3: Marwan's letter
      content: `
        <div class="marwan-letter">
          <h2>Welcome, Aya 💚</h2>
          <p>I built this course just for you. It's designed around our trip to Palestine in June - every phrase, every lesson chosen with that visit in mind.</p>
          <p>By the time we arrive, you'll be able to connect with my family in their language, understand the warmth in their greetings, and share in moments that matter.</p>
          <p>Take your time, enjoy the journey, and know that I'm here if you need anything.</p>
          <p class="signature">- Marwan</p>
        </div>
      `,
      duration: null // User clicks to continue
    }
  ];
  
  function showScreen(index) {
    if (index >= screens.length) {
      // Mark splash as seen
      markAyaSplashSeen();
      if (onComplete) onComplete();
      return;
    }
    
    const screen = screens[index];
    container.innerHTML = `
      <div class="aya-splash-screen screen-${index}">
        ${screen.content}
        ${screen.duration === null ? `
          <button class="btn-primary continue-btn" id="continue-btn">يلا نبدأ</button>
        ` : ''}
      </div>
    `;
    
    if (screen.duration !== null) {
      // Auto-advance after duration
      setTimeout(() => {
        currentScreen++;
        showScreen(currentScreen);
      }, screen.duration);
    } else {
      // Wait for user click
      const continueBtn = container.querySelector('#continue-btn');
      if (continueBtn) {
        continueBtn.addEventListener('click', () => {
          currentScreen++;
          showScreen(currentScreen);
        });
      }
    }
  }
  
  showScreen(currentScreen);
}

/**
 * Render Aya's returning splash
 */
export function renderAyaReturnSplash(container, onComplete) {
  const messages = [
    'Welcome back, Aya 💚',
    'Ready for today\'s practice?',
    'おかえり、あやちゃん',
    'Let\'s continue where you left off',
    'Time to learn more Arabic!'
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  container.innerHTML = `
    <div class="aya-return-splash">
      <h2>${randomMessage}</h2>
      <p class="countdown">${getCountdownMessage()}</p>
      <button class="btn-primary" id="continue-btn">Continue</button>
    </div>
  `;
  
  const continueBtn = container.querySelector('#continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (onComplete) onComplete();
    });
  }
}

/**
 * Render phonics screen
 */
export function renderPhonicsScreen(container) {
  container.innerHTML = `
    <div class="phonics-screen">
      <!-- Header -->
      <div class="phonics-header">
        <button class="btn-back" id="back-btn">← Back</button>
        <h2>Arabic Phonics</h2>
      </div>
      
      <!-- Phonics List -->
      <div class="phonics-list">
        ${PHONICS_DATA.map((phonic, index) => `
          <div class="phonics-item" data-index="${index}">
            <div class="phonic-sound">${phonic.sound}</div>
            <div class="phonic-details">
              <div class="phonic-arabic" dir="rtl">${phonic.example.arabic}</div>
              <div class="phonic-romanization">${phonic.example.romanization}</div>
              <div class="phonic-meaning">${phonic.example.meaning}</div>
            </div>
            <button class="audio-btn" data-index="${index}">🔊</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  attachPhonicsListeners(container);
}

/**
 * Attach phonics listeners
 */
function attachPhonicsListeners(container) {
  const backBtn = container.querySelector('#back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('home'));
    });
  }
  
  const audioButtons = container.querySelectorAll('.audio-btn');
  audioButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      const phonic = PHONICS_DATA[index];
      speakArabic(phonic.example.arabic);
    });
  });
}

/**
 * Render cultural card
 */
export function renderCulturalCard(container, cardIndex, onComplete) {
  const card = CULTURAL_CARDS[cardIndex];
  
  if (!card) {
    if (onComplete) onComplete();
    return;
  }
  
  container.innerHTML = `
    <div class="cultural-card">
      <div class="card-content">
        <h2>${card.title}</h2>
        <p class="card-text">${card.content}</p>
        ${card.tip ? `
          <div class="card-tip">
            <strong>💡 Tip:</strong> ${card.tip}
          </div>
        ` : ''}
      </div>
      <button class="btn-primary" id="continue-btn">Continue</button>
    </div>
  `;
  
  const continueBtn = container.querySelector('#continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (onComplete) onComplete();
    });
  }
}

/**
 * Render Marwan's note
 */
export function renderMarwanNote(container, noteIndex, onComplete) {
  const note = MARWAN_NOTES[noteIndex];
  
  if (!note) {
    if (onComplete) onComplete();
    return;
  }
  
  container.innerHTML = `
    <div class="marwan-note">
      <div class="note-content">
        <h2>${note.title}</h2>
        <p class="note-text">${note.content}</p>
        <p class="note-signature">- Marwan 💚</p>
      </div>
      <button class="btn-primary" id="continue-btn">Continue</button>
    </div>
  `;
  
  const continueBtn = container.querySelector('#continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (onComplete) onComplete();
    });
  }
}

/**
 * Render course completion
 */
export function renderCourseCompletion(container) {
  container.innerHTML = `
    <div class="course-completion">
      <div class="completion-animation">
        <h1 class="arabic-title" dir="rtl">نور عيوني</h1>
        <p class="subtitle">Light of my eyes</p>
      </div>
      
      <div class="completion-message">
        <h2>You did it, Aya! 🎉</h2>
        <p>You've completed the course. You're ready for Palestine.</p>
        <p>${daysUntilJune5()} days until we meet the family.</p>
      </div>
      
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
 * Mark Aya's splash as seen
 */
async function markAyaSplashSeen() {
  if (!AppState.profile.ayaMeta) {
    AppState.profile.ayaMeta = {};
  }
  AppState.profile.ayaMeta.splashSeen = true;
  await save();
}

/**
 * Check if Aya's splash has been seen
 */
export function hasSeenAyaSplash() {
  return AppState.profile.ayaMeta?.splashSeen === true;
}

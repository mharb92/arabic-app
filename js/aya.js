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
  container.innerHTML = `
    <div class="aya-splash">
      <div class="aya-splash-content">
        <!-- Arabic reveal -->
        <div class="aya-arabic-reveal">
          <p class="aya-arabic-big" id="aya-arabic" dir="rtl">تَفَضَّلِي</p>
          <p class="aya-roman" id="aya-roman">tafaDDAli</p>
          <p class="aya-english" id="aya-english">welcome</p>
        </div>
        
        <div class="aya-divider" id="aya-div-1"></div>
        
        <!-- Marwan's letter -->
        <div class="aya-letter">
          <p class="aya-line" id="aya-l-1">Hello, my love.</p>
          
          <div class="aya-divider" id="aya-div-2"></div>
          
          <p class="aya-line" id="aya-l-2">I built this for you.</p>
          <p class="aya-line" id="aya-l-3">Not because you had to learn —</p>
          <p class="aya-line" id="aya-l-4">but because you wanted to.</p>
          
          <div class="aya-divider" id="aya-div-3"></div>
          
          <p class="aya-line" id="aya-l-5">This course is built around a single goal:</p>
          <p class="aya-line" id="aya-l-6">walking into my family's home</p>
          <p class="aya-line" id="aya-l-7">and making them fall in love with you</p>
          <p class="aya-line" id="aya-l-8">the way I did.</p>
          
          <div class="aya-divider" id="aya-div-4"></div>
          
          <p class="aya-line" id="aya-l-9">I've set some goals for you,</p>
          <p class="aya-line" id="aya-l-10">but feel free to change them</p>
          <p class="aya-line" id="aya-l-11">whenever you like.</p>
          
          <div class="aya-divider" id="aya-div-5"></div>
          
          <button class="btn-primary aya-begin-btn" id="aya-begin-btn">يلا نبدأ<br><span class="btn-subtitle">yalla nubda / let's begin</span></button>
        </div>
      </div>
    </div>
  `;
  
  // Run animation sequence
  runAyaSplashAnimation();
  
  // Handle button click
  const beginBtn = container.querySelector('#aya-begin-btn');
  if (beginBtn) {
    beginBtn.addEventListener('click', async () => {
      // Mark splash as seen
      markAyaSplashSeen();
      
      // Create Aya's profile and save to Supabase
      await createAyaProfile();
      
      // Continue to app
      if (onComplete) onComplete();
    });
  }
}

/**
 * Create and save Aya's profile to Supabase
 */
async function createAyaProfile() {
  // Set profile data from config
  if (!AppState.profile) AppState.profile = {};
  
  AppState.profile.name = AppState.ayaConfig?.name || AppState.ayaConfig?.config?.name || 'Aya';
  AppState.profile.speakerType = 'beginner'; // Aya's custom course
  AppState.profile.dialect = 'Palestinian';
  AppState.profile.goals = ['Meet the family', 'Basic conversation'];
  
  // Save to Supabase
  await save();
}

function runAyaSplashAnimation() {
  let t = 0;
  const delay = (ms) => { t += ms; return t; };
  
  const showEl = (id) => {
    const el = document.getElementById(id);
    if (el) el.classList.add('shown');
  };
  
  // Arabic
  setTimeout(() => showEl('aya-arabic'), delay(500));
  
  // Roman
  setTimeout(() => showEl('aya-roman'), delay(1500));
  
  // English
  setTimeout(() => showEl('aya-english'), delay(2000));
  
  // Divider 1
  setTimeout(() => showEl('aya-div-1'), delay(1200));
  
  // Hello my love
  setTimeout(() => showEl('aya-l-1'), delay(600));
  
  // Divider 2
  setTimeout(() => showEl('aya-div-2'), delay(900));
  
  // I built this for you
  setTimeout(() => showEl('aya-l-2'), delay(600));
  
  // Not because / but because
  setTimeout(() => showEl('aya-l-3'), delay(800));
  setTimeout(() => showEl('aya-l-4'), delay(700));
  
  // Divider 3
  setTimeout(() => showEl('aya-div-3'), delay(900));
  
  // This course lines
  setTimeout(() => showEl('aya-l-5'), delay(600));
  setTimeout(() => showEl('aya-l-6'), delay(700));
  setTimeout(() => showEl('aya-l-7'), delay(700));
  setTimeout(() => showEl('aya-l-8'), delay(700));
  
  // Divider 4
  setTimeout(() => showEl('aya-div-4'), delay(900));
  
  // I've set some goals
  setTimeout(() => showEl('aya-l-9'), delay(600));
  setTimeout(() => showEl('aya-l-10'), delay(700));
  setTimeout(() => showEl('aya-l-11'), delay(700));
  
  // Divider 5
  setTimeout(() => showEl('aya-div-5'), delay(900));
  
  // Button
  setTimeout(() => showEl('aya-begin-btn'), delay(700));
}

/**
 * Render Aya's returning splash
 */
export function renderAyaReturnSplash(container, onComplete) {
  // Calculate progress
  const completedUnits = Object.keys(AppState.unitProgress || {}).filter(
    key => AppState.unitProgress[key]?.mastered
  ).length;
  const totalUnits = AYA_UNITS.length;
  
  // Get countdown to San Diego
  const daysLeft = daysUntilJune5();
  
  container.innerHTML = `
    <div class="aya-return-splash">
      <div class="aya-arabic-reveal">
        <p class="aya-arabic-big shown" dir="rtl">تَفَضَّلِي</p>
        <p class="aya-roman shown">tafaDDAli</p>
        <p class="aya-english shown">welcome</p>
      </div>
      
      <div class="aya-divider shown"></div>
      
      <h2>Welcome back, Aya.</h2>
      
      <p class="countdown">${daysLeft} days until San Diego 🇵🇸</p>
      
      <p class="progress-text">You've completed ${completedUnits} of ${totalUnits} units</p>
      
      <div class="aya-divider shown"></div>
      
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
  localStorage.setItem('aya_splash_seen', 'true');
}

/**
 * Check if Aya's splash has been seen
 */
export function hasSeenAyaSplash() {
  return localStorage.getItem('aya_splash_seen') === 'true';
}

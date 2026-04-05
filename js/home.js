/**
 * home.js - Main landing screen with tabs
 * Shows: Continue lesson card, phrase of the day, stats, practice options
 */

import { AppState, save } from './state.js';
import { UNITS } from './data/units.js';
import { AYA_UNITS } from './data/aya-course.js';
import { daysUntilJune5, getCountdownMessage } from './utils/date.js';
import { showError, showToast } from './utils/ui.js';

let currentTab = 'home';

/**
 * Render the home screen
 */
export function renderHomeScreen(container) {
  const units = AppState.isAya ? AYA_UNITS : UNITS;
  const progress = AppState.profile.unitProgress || {};
  
  // Find current unit
  let currentUnitIndex = 0;
  for (let i = 0; i < units.length; i++) {
    const unitId = `unit${i + 1}`;
    if (!progress[unitId] || progress[unitId].stage < 3 || !progress[unitId].mastered) {
      currentUnitIndex = i;
      break;
    }
    if (i === units.length - 1) currentUnitIndex = i; // Course complete
  }
  
  const currentUnit = units[currentUnitIndex];
  const currentUnitId = `unit${currentUnitIndex + 1}`;
  const unitProgress = progress[currentUnitId] || { stage: 1, consec: 0, mastered: false };
  
  container.innerHTML = `
    <div class="home-screen">
      <!-- Header -->
      <div class="home-header">
        <h1 style="display: flex; justify-content: space-between; align-items: center; margin: 0;">
          <span>Hello ${AppState.profile.name}</span>
          <span dir="rtl">مرحبا ${AppState.isAya ? 'آية' : AppState.profile.name}</span>
        </h1>
        ${AppState.isAya ? `<p class="countdown">${getCountdownMessage()}</p>` : ''}
      </div>
      
      <!-- Tab Bar -->
      <div class="tab-bar">
        <button class="tab-btn active" data-tab="home">Home</button>
        <button class="tab-btn" data-tab="progress">Progress</button>
        <button class="tab-btn" data-tab="settings">Settings</button>
      </div>
      
      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Home Tab -->
        <div id="home-tab-home" class="tab-pane active">
          ${renderHomeTab(currentUnit, currentUnitId, unitProgress, units)}
        </div>
        
        <!-- Progress Tab -->
        <div id="home-tab-progress" class="tab-pane">
          ${renderProgressTab(units, progress)}
        </div>
        
        <!-- Settings Tab -->
        <div id="home-tab-settings" class="tab-pane">
          ${renderSettingsTab()}
        </div>
      </div>
    </div>
  `;
  
  attachHomeListeners(container);
  currentTab = 'home';
}

/**
 * Render Home tab content
 */
function renderHomeTab(currentUnit, currentUnitId, unitProgress, units) {
  const hasPlacementScore = AppState.profile.placementLevel !== undefined;
  const isBeginner = AppState.profile.speaker_type === 'beginner' || AppState.isAya;
  const needsPlacement = !isBeginner && !hasPlacementScore;
  const canAccessLesson = isBeginner || hasPlacementScore;
  
  return `
    ${canAccessLesson ? `
      <!-- Continue Learning Card (GREEN) -->
      <div class="continue-card card card-green">
        <h3>${unitProgress.mastered ? '🎉 Unit Complete!' : 'Continue Learning'}</h3>
        <p class="unit-title">${currentUnit.title}</p>
        <p class="unit-subtitle">${currentUnit.subtitle || ''}</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${(unitProgress.stage / 3) * 100}%"></div>
        </div>
        <p class="progress-text">Stage ${unitProgress.stage}/3 • ${unitProgress.consec} consecutive correct</p>
        <button class="btn-primary btn-green" id="continue-btn">
          ${unitProgress.mastered ? 'Next Unit' : 'Continue'}
        </button>
      </div>
    ` : ''}
    
    ${needsPlacement ? `
      <!-- Placement Test (GOLD, LARGEST) -->
      <div class="primary-action-card card-gold">
        <div class="primary-action-content">
          <h2>🎯 Take Placement Test</h2>
          <p>Find your starting level with our adaptive placement test</p>
        </div>
        <button class="btn-primary btn-gold btn-large" id="placement-btn">
          Start Placement Test
        </button>
      </div>
    ` : `
      <!-- Today's Practice (GOLD, LARGEST) -->
      <div class="primary-action-card card-gold">
        <div class="primary-action-content">
          <h2>🎯 Today's Practice</h2>
          <p>Reinforce what you've learned</p>
        </div>
        <button class="btn-primary btn-gold btn-large" id="practice-btn">
          Start Practice
        </button>
      </div>
    `}
    
    <!-- Secondary Actions Grid -->
    <div class="secondary-actions">
      <!-- My Vocabulary (PURPLE) -->
      <button class="action-card card-purple" id="vocab-btn">
        <span class="action-icon">📝</span>
        <span class="action-label">My Vocabulary</span>
      </button>
      
      <!-- Focused Practice (DEEP BLUE) -->
      <button class="action-card card-blue" id="focused-btn">
        <span class="action-icon">⚡</span>
        <span class="action-label">Focused Practice</span>
      </button>
      
      <!-- Browse Units (TEAL) -->
      <button class="action-card card-teal" id="units-btn">
        <span class="action-icon">📚</span>
        <span class="action-label">Browse Units</span>
      </button>
      
      ${isBeginner ? `
        <!-- Alphabet/Phonics (TEAL) -->
        <button class="action-card card-teal" id="${AppState.isAya ? 'phonics' : 'alphabet'}-btn">
          <span class="action-icon">🔤</span>
          <span class="action-label">${AppState.isAya ? 'Phonics Review' : 'Arabic Alphabet'}</span>
        </button>
      ` : ''}
    </div>
  `;
}

/**
 * Render Progress tab content
 */
function renderProgressTab(units, progress) {
  const totalPhrases = units.reduce((sum, u) => sum + u.phrases.length, 0);
  const masteredUnits = Object.values(progress).filter(p => p.mastered).length;
  const weakWords = AppState.profile.weakWords || [];
  
  return `
    <div class="progress-content">
      <h2>Your Progress</h2>
      
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${masteredUnits}</div>
          <div class="stat-label">Units Mastered</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${units.length}</div>
          <div class="stat-label">Total Units</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalPhrases}</div>
          <div class="stat-label">Total Phrases</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${weakWords.length}</div>
          <div class="stat-label">Review Needed</div>
        </div>
      </div>
      
      <!-- Unit List -->
      <h3>Units Overview</h3>
      <div class="unit-list">
        ${units.map((unit, i) => {
          const unitId = `unit${i + 1}`;
          const p = progress[unitId] || { stage: 0, consec: 0, mastered: false };
          return `
            <div class="unit-row ${p.mastered ? 'mastered' : ''}">
              <div class="unit-info">
                <div class="unit-number">${i + 1}</div>
                <div class="unit-details">
                  <div class="unit-name">${unit.title}</div>
                  <div class="unit-status">
                    ${p.mastered ? '✅ Mastered' : `Stage ${p.stage}/3`}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Render Settings tab content
 */
function renderSettingsTab() {
  return `
    <div class="settings-content">
      <h2>Settings</h2>
      
      <!-- Profile -->
      <div class="settings-section">
        <h3>Profile</h3>
        <div class="settings-item">
          <label>Name</label>
          <p>${AppState.profile.name}</p>
        </div>
        <div class="settings-item">
          <label>Email</label>
          <p>${AppState.user?.email || 'Guest'}</p>
        </div>
        <div class="settings-item">
          <label>Speaker Type</label>
          <p>${AppState.profile.speaker_type}</p>
        </div>
        ${AppState.profile.dialect ? `
          <div class="settings-item">
            <label>Dialect</label>
            <p>${AppState.profile.dialect}</p>
          </div>
        ` : ''}
      </div>
      
      <!-- Course Info -->
      ${AppState.isAya ? `
        <div class="settings-section">
          <h3>Course Information</h3>
          <p>You're enrolled in Aya's personalized course</p>
          <p>Days until visit: ${daysUntilJune5()}</p>
        </div>
      ` : ''}
      
      <!-- Actions -->
      <div class="settings-section">
        <h3>Account</h3>
        <button class="btn-secondary" id="sign-out-btn">Sign Out</button>
      </div>
    </div>
  `;
}

/**
 * Attach event listeners
 */
function attachHomeListeners(container) {
  // Tab switching
  const tabBtns = container.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab, container);
    });
  });
  
  // Continue button
  const continueBtn = container.querySelector('#continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('lesson'));
    });
  }
  
  // Quick actions
  const practiceBtn = container.querySelector('#practice-btn');
  if (practiceBtn) {
    practiceBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('enrichment'));
    });
  }
  
  const placementBtn = container.querySelector('#placement-btn');
  if (placementBtn) {
    placementBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('placement'));
    });
  }
  
  const unitsBtn = container.querySelector('#units-btn');
  if (unitsBtn) {
    unitsBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('unit-overview'));
    });
  }
  
  const alphabetBtn = container.querySelector('#alphabet-btn');
  if (alphabetBtn) {
    alphabetBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('alphabet'));
    });
  }
  
  const phonicsBtn = container.querySelector('#phonics-btn');
  if (phonicsBtn) {
    phonicsBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('aya-phonics'));
    });
  }
  
  // My Vocabulary
  const vocabBtn = container.querySelector('#vocab-btn');
  if (vocabBtn) {
    vocabBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('my-vocab'));
    });
  }
  
  // Focused Practice
  const focusedBtn = container.querySelector('#focused-btn');
  if (focusedBtn) {
    focusedBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('focused-study'));
    });
  }
  
  // Sign out
  const signOutBtn = container.querySelector('#sign-out-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', handleSignOut);
  }
}

/**
 * Switch between tabs
 */
function switchTab(tab, container) {
  currentTab = tab;
  
  // Update button states
  const tabBtns = container.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    if (btn.dataset.tab === tab) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update tab panes
  const panes = container.querySelectorAll('.tab-pane');
  panes.forEach(pane => {
    if (pane.id === `home-tab-${tab}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });
}

/**
 * Handle sign out
 */
async function handleSignOut() {
  if (confirm('Are you sure you want to sign out?')) {
    // Clear state using proper reset function
    const { reset } = await import('./state.js');
    await reset();
    
    // Navigate to login
    import('./router.js').then(({ navigateTo }) => navigateTo('login'));
  }
}

/**
 * Get random phrase from units
 */
function getRandomPhrase(units) {
  const allPhrases = units.flatMap(u => u.phrases);
  if (allPhrases.length === 0) return 'مرحبا';
  const phrase = allPhrases[Math.floor(Math.random() * allPhrases.length)];
  return phrase.ar || phrase.arabic || 'مرحبا';
}

/**
 * home.js - Main landing screen with adaptive cards
 * Adaptive card system: Different cards for beginners vs heritage speakers
 * Foundation for AI Tutor, Speed Training, and other advanced features
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
  const progress = AppState.unitProgress || {};
  
  // Find current unit
  let currentUnitIndex = 0;
  for (let i = 0; i < units.length; i++) {
    const unitId = units[i].id;
    if (!progress[unitId] || progress[unitId].stage !== 'mastered') {
      currentUnitIndex = i;
      break;
    }
    if (i === units.length - 1) currentUnitIndex = i; // Course complete
  }
  
  const currentUnit = units[currentUnitIndex];
  const unitId = currentUnit.id;
  const unitProgress = progress[unitId] || { stage: 'new', mastered: false };
  
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
          ${renderHomeTab(currentUnit, unitId, unitProgress, units)}
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
  
  attachEventListeners(container, currentUnit, unitId);
}

/**
 * Render Home Tab with Adaptive Card System
 */
function renderHomeTab(currentUnit, unitId, unitProgress, units) {
  const profile = AppState.profile;
  const isBeginner = profile.speaker_type === 'beginner' || AppState.isAya;
  const hasPlacementScore = profile.placementLevel !== undefined;
  const needsPlacement = !isBeginner && !hasPlacementScore;
  const canAccessLesson = isBeginner || hasPlacementScore;
  
  // Get adaptive cards based on user type
  const adaptiveCards = getAdaptiveCards(profile);
  
  return `
    <!-- Primary Action Card (Full Width) -->
    ${canAccessLesson ? renderContinueLearningCard(currentUnit, unitId, unitProgress) : ''}
    ${needsPlacement ? renderPlacementCard() : renderTodaysPracticeCard()}
    
    <!-- Secondary Cards Grid (2x2) -->
    <div class="cards-grid">
      ${adaptiveCards.map(card => renderCard(card)).join('')}
    </div>
  `;
}

/**
 * Get adaptive cards based on user profile
 */
function getAdaptiveCards(profile) {
  const isBeginner = profile.speaker_type === 'beginner' || AppState.isAya;
  
  // Base cards for all users
  const baseCards = [
    {
      id: 'vocab',
      icon: '📝',
      label: 'My Vocabulary',
      color: 'purple',
      route: 'my-vocab'
    },
    {
      id: 'focused',
      icon: '⚡',
      label: 'Focused Study',
      color: 'blue',
      route: 'focused-study'
    }
  ];
  
  // Adaptive third card
  if (isBeginner) {
    baseCards.push({
      id: 'phonics',
      icon: '🔤',
      label: AppState.isAya ? 'Arabic Phonics' : 'Alphabet',
      color: 'teal',
      route: AppState.isAya ? 'aya-phonics' : 'alphabet'
    });
  } else {
    // Heritage/Intermediate/Advanced get Speed Training (placeholder for now)
    baseCards.push({
      id: 'speed',
      icon: '⚡',
      label: 'Speed Training',
      color: 'orange',
      route: 'speed-training',
      comingSoon: true
    });
  }
  
  // Fourth card: AI Tutor placeholder (will be built in Batch 2)
  baseCards.push({
    id: 'ai-tutor',
    icon: '💬',
    label: 'AI Tutor',
    color: 'green',
    route: 'ai-tutor',
    comingSoon: true
  });
  
  return baseCards;
}

/**
 * Render Continue Learning Card
 */
function renderContinueLearningCard(unit, unitId, progress) {
  return `
    <div class="card-primary card-green">
      <h3>${progress.mastered ? '🎉 Unit Complete!' : 'Continue Learning'}</h3>
      <p class="unit-title">${unit.title}</p>
      <p class="unit-subtitle">${unit.subtitle || ''}</p>
      ${!progress.mastered ? `
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${calculateProgress(progress)}%"></div>
        </div>
        <p class="progress-text">${getProgressText(progress)}</p>
      ` : ''}
      <button class="btn-primary btn-green" id="continue-btn">
        ${progress.mastered ? 'Next Unit →' : 'Continue Lesson →'}
      </button>
    </div>
  `;
}

/**
 * Render Placement Test Card
 */
function renderPlacementCard() {
  return `
    <div class="card-primary card-gold">
      <h2>🎯 Take Placement Test</h2>
      <p>Find your starting level with our adaptive placement test</p>
      <button class="btn-primary btn-gold btn-large" id="placement-btn">
        Start Placement Test
      </button>
    </div>
  `;
}

/**
 * Render Today's Practice Card
 */
function renderTodaysPracticeCard() {
  return `
    <div class="card-primary card-gold">
      <h2>🎯 Today's Practice</h2>
      <p>Reinforce what you've learned</p>
      <button class="btn-primary btn-gold btn-large" id="practice-btn">
        Start Practice
      </button>
    </div>
  `;
}

/**
 * Render individual card
 */
function renderCard(card) {
  return `
    <button 
      class="action-card card-${card.color} ${card.comingSoon ? 'coming-soon' : ''}" 
      id="${card.id}-btn"
      ${card.comingSoon ? 'disabled' : ''}
    >
      <span class="action-icon">${card.icon}</span>
      <span class="action-label">${card.label}</span>
      ${card.comingSoon ? '<span class="coming-soon-badge">Soon</span>' : ''}
    </button>
  `;
}

/**
 * Calculate progress percentage
 */
function calculateProgress(progress) {
  if (progress.mastered) return 100;
  // Simplified: assume 4 cycles per lesson
  const stageProgress = progress.stage || 'new';
  if (stageProgress === 'new') return 0;
  if (stageProgress === 'in_progress') return 50;
  if (stageProgress === 'mastered') return 100;
  return 25;
}

/**
 * Get progress text
 */
function getProgressText(progress) {
  if (progress.mastered) return 'Unit complete!';
  const cyclesCompleted = progress.cyclesCompleted || 0;
  return `Cycle ${cyclesCompleted}/4`;
}

/**
 * Render Progress Tab
 */
function renderProgressTab(units, progress) {
  const totalUnits = units.length;
  const completedUnits = Object.values(progress).filter(p => p.mastered).length;
  const percentComplete = Math.round((completedUnits / totalUnits) * 100);
  
  return `
    <div class="progress-tab">
      <h2>Your Progress</h2>
      
      <!-- Overall Progress -->
      <div class="overall-progress">
        <h3>${completedUnits} of ${totalUnits} units complete</h3>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percentComplete}%"></div>
        </div>
        <p>${percentComplete}% complete</p>
      </div>
      
      <!-- Unit List -->
      <div class="units-list">
        ${units.map((unit, i) => {
          const unitProgress = progress[unit.id] || { stage: 'new', mastered: false };
          return `
            <div class="unit-item ${unitProgress.mastered ? 'completed' : ''}">
              <div class="unit-info">
                <h4>${unit.title}</h4>
                <p>${unit.subtitle || ''}</p>
              </div>
              <div class="unit-status">
                ${unitProgress.mastered ? '✅' : unitProgress.stage !== 'new' ? '🔄' : '⭕'}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Render Settings Tab
 */
function renderSettingsTab() {
  const preferences = AppState.preferences || {};
  
  return `
    <div class="settings-tab">
      <h2>Settings</h2>
      
      <!-- User Info -->
      <div class="settings-section">
        <h3>Account</h3>
        <div class="settings-item">
          <span class="label">Name:</span>
          <span class="value">${AppState.profile.name}</span>
        </div>
        <div class="settings-item">
          <span class="label">Email:</span>
          <span class="value">${AppState.user?.email || 'Not logged in'}</span>
        </div>
        <div class="settings-item">
          <span class="label">Level:</span>
          <span class="value">${AppState.profile.speaker_type || 'beginner'}</span>
        </div>
      </div>
      
      <!-- Preferences -->
      <div class="settings-section">
        <h3>Preferences</h3>
        
        <div class="settings-item">
          <label for="harakat-toggle">
            <span>Show Harakat (Vowel Marks)</span>
            <input 
              type="checkbox" 
              id="harakat-toggle" 
              ${preferences.harakat_enabled !== false ? 'checked' : ''}
            />
          </label>
        </div>
        
        <div class="settings-item">
          <label for="audio-autoplay">
            <span>Autoplay Audio</span>
            <input 
              type="checkbox" 
              id="audio-autoplay" 
              ${preferences.audio_autoplay ? 'checked' : ''}
            />
          </label>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="settings-section">
        <h3>Actions</h3>
        <button class="btn-secondary btn-full-width" id="sign-out-btn">
          Sign Out
        </button>
      </div>
    </div>
  `;
}

/**
 * Attach event listeners
 */
function attachEventListeners(container, currentUnit, unitId) {
  // Tab switching
  const tabBtns = container.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(container, tab);
    });
  });
  
  // Continue learning button
  const continueBtn = container.querySelector('#continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('lesson'));
    });
  }
  
  // Placement test button
  const placementBtn = container.querySelector('#placement-btn');
  if (placementBtn) {
    placementBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('placement'));
    });
  }
  
  // Practice button
  const practiceBtn = container.querySelector('#practice-btn');
  if (practiceBtn) {
    practiceBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('flashcards'));
    });
  }
  
  // My Vocabulary button
  const vocabBtn = container.querySelector('#vocab-btn');
  if (vocabBtn) {
    vocabBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('my-vocab'));
    });
  }
  
  // Focused Study button
  const focusedBtn = container.querySelector('#focused-btn');
  if (focusedBtn) {
    focusedBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('focused-study'));
    });
  }
  
  // Phonics button (for Aya)
  const phonicsBtn = container.querySelector('#phonics-btn');
  if (phonicsBtn) {
    phonicsBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('aya-phonics'));
    });
  }
  
  // AI Tutor button (placeholder - coming in Batch 2)
  const aiTutorBtn = container.querySelector('#ai-tutor-btn');
  if (aiTutorBtn && !aiTutorBtn.disabled) {
    aiTutorBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('ai-tutor'));
    });
  }
  
  // Speed Training button (placeholder - coming in Batch 3)
  const speedBtn = container.querySelector('#speed-btn');
  if (speedBtn && !speedBtn.disabled) {
    speedBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('speed-training'));
    });
  }
  
  // Settings: Harakat toggle
  const harakatToggle = container.querySelector('#harakat-toggle');
  if (harakatToggle) {
    harakatToggle.addEventListener('change', async (e) => {
      if (!AppState.preferences) AppState.preferences = {};
      AppState.preferences.harakat_enabled = e.target.checked;
      await save();
      showToast(e.target.checked ? 'Harakat enabled' : 'Harakat disabled');
    });
  }
  
  // Settings: Audio autoplay toggle
  const audioToggle = container.querySelector('#audio-autoplay');
  if (audioToggle) {
    audioToggle.addEventListener('change', async (e) => {
      if (!AppState.preferences) AppState.preferences = {};
      AppState.preferences.audio_autoplay = e.target.checked;
      await save();
      showToast(e.target.checked ? 'Audio autoplay enabled' : 'Audio autoplay disabled');
    });
  }
  
  // Sign out button
  const signOutBtn = container.querySelector('#sign-out-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to sign out?')) {
        import('./state.js').then(async ({ reset }) => {
          await reset();
          import('./router.js').then(({ navigateTo }) => navigateTo('auth'));
        });
      }
    });
  }
}

/**
 * Switch tabs
 */
function switchTab(container, tabName) {
  currentTab = tabName;
  
  // Update tab buttons
  const tabBtns = container.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update tab panes
  const tabPanes = container.querySelectorAll('.tab-pane');
  tabPanes.forEach(pane => {
    if (pane.id === `home-tab-${tabName}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });
}

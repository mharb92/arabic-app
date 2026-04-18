/**
 * home.js - Main landing screen with Hoopoe Design System
 * Adaptive card system with mascot icons, hero section, and fixed bugs
 */

import { AppState, save } from './state.js';
import { UNITS } from './data/units.js';
import { AYA_UNITS } from './data/aya-course.js';
import { getCountdownMessage } from './utils/date.js';
import { showToast } from './utils/ui.js';
import { HOOPOE_ICONS } from './data/hoopoe-icons.js';

let currentTab = 'home';

export function renderHomeScreen(container) {
  const units = AppState.isAya ? AYA_UNITS : UNITS;
  const progress = AppState.unitProgress || {};

  let currentUnitIndex = 0;
  for (let i = 0; i < units.length; i++) {
    const unitId = units[i].id;
    if (!progress[unitId] || progress[unitId].stage !== 'mastered') {
      currentUnitIndex = i;
      break;
    }
    if (i === units.length - 1) currentUnitIndex = i;
  }

  const currentUnit = units[currentUnitIndex];
  const unitId = currentUnit.id;
  const unitProgress = progress[unitId] || { stage: 'new', mastered: false };

  container.innerHTML = `
    <div class="home-screen">
      <div class="tab-bar">
        <button class="tab-btn active" data-tab="home">Home</button>
        <button class="tab-btn" data-tab="progress">Progress</button>
        <button class="tab-btn" data-tab="settings">Settings</button>
      </div>
      <div class="tab-content">
        <div id="home-tab-home" class="tab-pane active">
          ${renderHomeTab(currentUnit, unitId, unitProgress, units)}
        </div>
        <div id="home-tab-progress" class="tab-pane">
          ${renderProgressTab(units, progress)}
        </div>
        <div id="home-tab-settings" class="tab-pane">
          ${renderSettingsTab()}
        </div>
      </div>
    </div>
  `;

  attachEventListeners(container, currentUnit, unitId);
}

function renderHomeTab(currentUnit, unitId, unitProgress, units) {
  const profile = AppState.profile;
  const isBeginner = profile.speaker_type === 'beginner' || AppState.isAya;
  const hasPlacementScore = profile.placementLevel !== undefined;
  const needsPlacement = !isBeginner && !hasPlacementScore;
  const canAccessLesson = isBeginner || hasPlacementScore;
  const adaptiveCards = getAdaptiveCards(profile);
  const firstRow = adaptiveCards.slice(0, 3);
  const secondRow = adaptiveCards.slice(3);

  return `
    ${renderHeroSection()}
    ${canAccessLesson ? renderContinueLearningCard(currentUnit, unitId, unitProgress) : ''}
    ${needsPlacement ? renderPlacementCard() : ''}
    <div class="hoopoe-grid-3">
      ${firstRow.map(card => renderCard(card)).join('')}
    </div>
    ${secondRow.length > 0 ? `
    <div class="hoopoe-grid-2">
      ${secondRow.map(card => renderCard(card)).join('')}
    </div>` : ''}
  `;
}

function renderHeroSection() {
  const displayName = AppState.profile && AppState.profile.name ? AppState.profile.name : '';
  const isAya = AppState.isAya;
  return `
    <div class="home-hero">
      <img class="mascot" src="${HOOPOE_ICONS.mascot}" alt="Hoopoe mascot" />
      ${isAya
        ? '<div class="greeting">&#x645;&#x631;&#x62D;&#x628;&#x627; &#x64A;&#x627; &#x622;&#x64A;&#x629; &#x1F339;</div><div class="countdown">' + getCountdownMessage() + '</div>'
        : '<div class="greeting-en">Welcome back' + (displayName ? ', ' + displayName : '') + '!</div><div class="greeting">أهلاً وسهلاً</div>'
      }
    </div>
  `;
}

function getAdaptiveCards(profile) {
  const isBeginner = profile.speaker_type === 'beginner' || AppState.isAya;
  const cards = [
    { id: 'vocab',   icon: HOOPOE_ICONS.vocab,   label: 'My Vocabulary', cssClass: 'hoopoe-card-feature',                   route: 'my-vocab' },
    { id: 'focused', icon: HOOPOE_ICONS.focus,   label: 'Focused Study', cssClass: 'hoopoe-card-feature',                   route: 'focused-study' },
  ];
  if (isBeginner) {
    cards.push({ id: 'phonics', icon: HOOPOE_ICONS.phonics, label: AppState.isAya ? 'Arabic Phonics' : 'Alphabet', cssClass: 'hoopoe-card-feature', route: AppState.isAya ? 'aya-phonics' : 'alphabet' });
  } else {
    cards.push({ id: 'speed', icon: HOOPOE_ICONS.speed, label: 'Speed Training', cssClass: 'hoopoe-card-feature hoopoe-card-gold', route: 'speed-training', comingSoon: true });
  }
  cards.push({ id: 'ai-tutor', icon: HOOPOE_ICONS.mascot, label: 'AI Tutor', cssClass: 'hoopoe-card-feature hoopoe-card-gold', route: 'ai-tutor', comingSoon: false });
  return cards;
}

function renderCard(card) {
  return `
    <div class="${card.cssClass}" data-route="${card.route}" style="cursor:pointer;position:relative;">
      ${card.comingSoon ? '<span class="badge-soon">SOON</span>' : ''}
      <img class="hoopoe-card-icon" src="${card.icon}" alt="${card.label}" />
      <div class="hoopoe-card-title">${card.label}</div>
    </div>
  `;
}

function renderContinueLearningCard(unit, unitId, progress) {
  return `
    <div class="hoopoe-card-primary">
      <h3 style="position:relative;z-index:1;margin:0 0 6px;font-size:18px;color:white;">
        ${progress.mastered ? '&#x1F389; Unit Complete!' : 'Continue Learning'}
      </h3>
      <p style="position:relative;z-index:1;opacity:0.9;margin:0 0 14px;font-size:15px;color:white;">
        ${unit.title || unit.subtitle || ''}
      </p>
      ${!progress.mastered ? `
        <div style="background:rgba(255,255,255,0.25);height:6px;border-radius:3px;overflow:hidden;position:relative;z-index:1;margin-bottom:14px;">
          <div style="height:100%;background:var(--gold);width:${calculateProgress(progress)}%;border-radius:3px;transition:width 0.4s;"></div>
        </div>
      ` : ''}
      <button class="hoopoe-btn-gold" id="continue-btn">
        ${progress.mastered ? 'Next Unit &#x2192;' : 'Continue Lesson &#x2192;'}
      </button>
    </div>
  `;
}

function renderPlacementCard() {
  return `
    <div class="hoopoe-card-primary">
      <h3 style="position:relative;z-index:1;margin:0 0 6px;font-size:18px;color:white;">Placement Test</h3>
      <p style="position:relative;z-index:1;opacity:0.9;margin:0 0 14px;font-size:15px;color:white;">
        Find your starting level with our adaptive test
      </p>
      <button class="hoopoe-btn-gold" id="placement-btn">
        Start Placement Test &#x2192;
      </button>
    </div>
  `;
}

function calculateProgress(progress) {
  if (progress.mastered) return 100;
  const cyclesCompleted = progress.cyclesCompleted || 0;
  return Math.min(Math.round((cyclesCompleted / 4) * 100), 100);
}

function renderProgressTab(units, progress) {
  const totalUnits = units.length;
  const completedUnits = Object.values(progress).filter(p => p.mastered).length;
  const percentComplete = Math.round((completedUnits / totalUnits) * 100);
  return `
    <div class="progress-tab" style="padding:var(--space-md);">
      <h2>Your Progress</h2>
      <div class="hoopoe-card-feature" style="text-align:left;padding:20px;margin-bottom:var(--space-md);">
        <h3 style="margin:0 0 8px;position:relative;z-index:1;">${completedUnits} of ${totalUnits} units complete</h3>
        <div style="background:rgba(0,0,0,0.1);height:6px;border-radius:3px;overflow:hidden;position:relative;z-index:1;margin-bottom:6px;">
          <div style="height:100%;background:var(--gold);width:${percentComplete}%;border-radius:3px;"></div>
        </div>
        <p style="color:var(--text-soft);font-size:14px;margin:0;position:relative;z-index:1;">${percentComplete}% complete</p>
      </div>
      <div class="units-list">
        ${units.map((unit) => {
          const up = progress[unit.id] || { stage: 'new', mastered: false };
          return `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 4px;border-bottom:1px solid var(--border-light);">
              <div>
                <div style="font-weight:500;font-size:15px;">${unit.title}</div>
                ${unit.subtitle ? '<div style="font-size:13px;color:var(--text-soft);">' + unit.subtitle + '</div>' : ''}
              </div>
              <div style="font-size:20px;">${up.mastered ? '&#x2705;' : up.stage !== 'new' ? '&#x1F504;' : '&#x2B55;'}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderSettingsTab() {
  const preferences = AppState.preferences || {};
  const name = AppState.profile && AppState.profile.name ? AppState.profile.name : '—';
  const email = AppState.user && AppState.user.email ? AppState.user.email : 'Not signed in';
  const level = AppState.profile && AppState.profile.speaker_type ? AppState.profile.speaker_type : 'beginner';
  return `
    <div class="settings-tab" style="padding:var(--space-md);">
      <h2>Settings</h2>
      <div style="background:var(--sand);border-radius:var(--radius-lg);padding:20px;margin-bottom:var(--space-md);">
        <h3 style="margin:0 0 12px;font-size:13px;color:var(--text-soft);text-transform:uppercase;letter-spacing:0.5px;">Account</h3>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-light);">
          <span style="color:var(--text-soft);">Name</span><span style="font-weight:500;">${name}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-light);">
          <span style="color:var(--text-soft);">Email</span><span style="font-weight:500;font-size:13px;">${email}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;">
          <span style="color:var(--text-soft);">Level</span><span style="font-weight:500;text-transform:capitalize;">${level}</span>
        </div>
      </div>
      <div style="background:var(--sand);border-radius:var(--radius-lg);padding:20px;margin-bottom:var(--space-md);">
        <h3 style="margin:0 0 12px;font-size:13px;color:var(--text-soft);text-transform:uppercase;letter-spacing:0.5px;">Preferences</h3>
        <label style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-light);cursor:pointer;">
          <span>Show Harakat</span>
          <input type="checkbox" id="harakat-toggle" ${preferences.harakat_enabled !== false ? 'checked' : ''} />
        </label>
        <label style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;cursor:pointer;">
          <span>Autoplay Audio</span>
          <input type="checkbox" id="audio-autoplay" ${preferences.audio_autoplay ? 'checked' : ''} />
        </label>
      </div>
      <button id="sign-out-btn"
        style="width:100%;padding:14px;border-radius:var(--radius-md);font-size:16px;background:var(--red-light);color:var(--red);border:1.5px solid var(--red);cursor:pointer;font-family:var(--font-body);">
        Sign Out
      </button>
    </div>
  `;
}

function attachEventListeners(container, currentUnit, unitId) {
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(container, btn.dataset.tab));
  });

  const continueBtn = container.querySelector('#continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('lesson'));
    });
  }

  const placementBtn = container.querySelector('#placement-btn');
  if (placementBtn) {
    placementBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('placement'));
    });
  }

  // Feature cards via data-route
  container.querySelectorAll('[data-route]').forEach(card => {
    card.addEventListener('click', () => {
      const route = card.dataset.route;
      if (!route || route === 'speed-training') return;
      import('./router.js').then(({ navigateTo }) => navigateTo(route));
    });
  });

  const harakatToggle = container.querySelector('#harakat-toggle');
  if (harakatToggle) {
    harakatToggle.addEventListener('change', async (e) => {
      if (!AppState.preferences) AppState.preferences = {};
      AppState.preferences.harakat_enabled = e.target.checked;
      await save();
      showToast(e.target.checked ? 'Harakat enabled' : 'Harakat disabled');
    });
  }

  const audioToggle = container.querySelector('#audio-autoplay');
  if (audioToggle) {
    audioToggle.addEventListener('change', async (e) => {
      if (!AppState.preferences) AppState.preferences = {};
      AppState.preferences.audio_autoplay = e.target.checked;
      await save();
      showToast(e.target.checked ? 'Audio autoplay enabled' : 'Audio autoplay disabled');
    });
  }

  const signOutBtn = container.querySelector('#sign-out-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('arabic_app_email');
        localStorage.removeItem('arabic_app_v3');
        localStorage.removeItem('arabic_welcome_seen');
        window.location.reload();
      }
    });
  }
}

function switchTab(container, tabName) {
  currentTab = tabName;
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  container.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === 'home-tab-' + tabName);
  });
}

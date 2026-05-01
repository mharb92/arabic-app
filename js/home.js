/**
 * home.js - Main landing screen with Hoopoe Design System
 * Adaptive card system with mascot icons, hero section, and fixed bugs
 */

import { AppState, save } from './state.js';
import { UNITS } from './data/units.js';
import { AYA_UNITS } from './data/aya-course.js';
import { getCountdownMessage } from './utils/date.js';
import { showToast, showLoading, hideLoading } from './utils/ui.js';
import { HOOPOE_ICONS } from './data/hoopoe-icons.js';
import { loadLatestPhasePlan, countLessonsInPhase } from './database.js';
import { generatePhasePlan } from './generation.js';
import { EDGE_FUNCTION_URL, SUPABASE_ANON_KEY, CLAUDE_MODEL } from './config.js';

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
  const isHeritage = profile.speaker_type === 'heritage';
  const hasPlacementScore = profile.placementLevel !== undefined || profile.placement_profile !== undefined;
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
  const isHeritage = AppState.profile?.speaker_type === 'heritage';
  const pp = AppState.profile?.placement_profile;

  if (isHeritage && pp) {
    // Heritage: show phase plan view (async-loaded)
    return `
      <div class="progress-tab" style="padding:var(--space-md);">
        <h2>Your Progress</h2>
        <div id="phase-plan-container">
          <div style="text-align:center;padding:40px 0;color:var(--text-soft);">Loading your plan...</div>
        </div>
      </div>
    `;
  }

  // Legacy: unit list for Aya/beginners
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

/**
 * Load and render phase plan for heritage speakers (called after DOM render)
 */
async function loadPhasePlanView(container) {
  const planContainer = container.querySelector('#phase-plan-container');
  if (!planContainer) return;

  const email = AppState.user?.email;
  if (!email) {
    planContainer.innerHTML = '<p style="color:var(--text-soft);text-align:center;">Sign in to see your plan.</p>';
    return;
  }

  const plan = await loadLatestPhasePlan(email);
  if (!plan || !plan.weeks) {
    planContainer.innerHTML = `
      <div style="text-align:center;padding:20px;">
        <p style="color:var(--text-soft);margin-bottom:16px;">No learning plan yet. Complete the placement test to generate your plan.</p>
      </div>
    `;
    return;
  }

  // Calculate phase progress
  const phaseId = plan.phase_id || 'phase_1';
  const phaseNumber = plan.phase_number || 1;
  const startDate = plan.start_date ? new Date(plan.start_date) : new Date();
  const dayInPhase = Math.max(1, Math.ceil((Date.now() - startDate.getTime()) / 86400000));
  const currentWeek = Math.min(Math.ceil(dayInPhase / 7), 4);

  const lessonStats = await countLessonsInPhase(email, phaseId);
  const lessonsCompleted = lessonStats || 0;
  const phaseProgress = Math.min(Math.round((dayInPhase / 30) * 100), 100);

  // Skill profile bars
  const pp = AppState.profile.placement_profile;
  const dimensions = [
    { key: 'recognition', label: 'Recognition' },
    { key: 'production', label: 'Production' },
    { key: 'grammar_intuition', label: 'Grammar' },
    { key: 'script_comfort', label: 'Script' },
    { key: 'vocab_breadth', label: 'Vocabulary' },
    { key: 'listening', label: 'Listening' }
  ];

  const skillBars = dimensions.map(d => {
    const score = pp[d.key] || 0;
    const pct = (score / 5) * 100;
    return `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <div style="width:80px;font-size:13px;color:var(--text-soft);">${d.label}</div>
        <div style="flex:1;background:rgba(0,0,0,0.08);height:8px;border-radius:4px;overflow:hidden;">
          <div style="height:100%;background:var(--green);width:${pct}%;border-radius:4px;"></div>
        </div>
        <div style="width:24px;font-size:13px;color:var(--text-soft);text-align:right;">${score}</div>
      </div>
    `;
  }).join('');

  // Weekly breakdown
  const weekCards = (plan.weeks || []).map(w => {
    const weekNum = w.week;
    const isCurrent = weekNum === currentWeek;
    const isPast = weekNum < currentWeek;
    const opacity = (!isPast && !isCurrent) ? 'opacity:0.5;' : '';
    const border = isCurrent ? 'border:2px solid var(--green);' : 'border:1px solid var(--border-light);';

    return `
      <div class="week-card" data-week="${weekNum}" style="background:var(--sand);border-radius:var(--radius-lg);padding:16px;margin-bottom:10px;cursor:pointer;${border}${opacity}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:600;">
            ${isCurrent ? '▶ ' : ''}Week ${weekNum}
          </div>
          <div style="font-size:13px;color:var(--text-soft);">
            ${isPast ? '✅ Complete' : isCurrent ? 'Current' : 'Upcoming'}
          </div>
        </div>
        <div style="font-size:14px;color:var(--text);margin-bottom:4px;">${w.theme || ''}</div>
        <div class="week-details" style="display:none;margin-top:10px;padding-top:10px;border-top:1px solid var(--border-light);">
          ${w.skills && w.skills.length ? `<div style="font-size:13px;color:var(--text-soft);margin-bottom:6px;"><strong>Skills:</strong> ${w.skills.join(', ')}</div>` : ''}
          ${w.target_patterns && w.target_patterns.length ? `<div style="font-size:13px;color:var(--text-soft);margin-bottom:6px;"><strong>Patterns:</strong> ${w.target_patterns.join(', ')}</div>` : ''}
          ${w.heritage_notes ? `<div style="font-size:13px;color:var(--green-m);font-style:italic;">${w.heritage_notes}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  planContainer.innerHTML = `
    <div style="background:var(--sand);border-radius:var(--radius-lg);padding:20px;margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <h3 style="margin:0;font-size:17px;">Phase ${phaseNumber} of 3</h3>
        <span style="font-size:14px;color:var(--text-soft);">Day ${dayInPhase}/30</span>
      </div>
      <div style="background:rgba(0,0,0,0.08);height:6px;border-radius:3px;overflow:hidden;margin-bottom:6px;">
        <div style="height:100%;background:var(--green);width:${phaseProgress}%;border-radius:3px;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--text-soft);">
        <span>${lessonsCompleted} lessons completed</span>
        <span>${plan.day_90_goal || ''}</span>
      </div>
    </div>

    <div style="background:var(--sand);border-radius:var(--radius-lg);padding:20px;margin-bottom:16px;">
      <h3 style="margin:0 0 14px;font-size:15px;">Skill Profile</h3>
      ${skillBars}
    </div>

    <h3 style="margin:0 0 10px;font-size:15px;">Weekly Plan</h3>
    ${weekCards}

    <button id="adjust-plan-btn" style="width:100%;padding:14px;border-radius:var(--radius-md);font-size:15px;background:var(--cream);color:var(--green);border:2px solid var(--green);cursor:pointer;font-family:var(--font-body);margin-top:8px;">
      Adjust My Plan
    </button>
  `;

  // Week card expand/collapse
  planContainer.querySelectorAll('.week-card').forEach(card => {
    card.addEventListener('click', () => {
      const details = card.querySelector('.week-details');
      if (details) {
        const isOpen = details.style.display !== 'none';
        details.style.display = isOpen ? 'none' : 'block';
      }
    });
  });

  // Adjust plan button
  const adjustBtn = planContainer.querySelector('#adjust-plan-btn');
  if (adjustBtn) {
    adjustBtn.addEventListener('click', () => showAdjustPlanFlow(container));
  }
}

/**
 * Show "Adjust My Plan" flow
 */
function showAdjustPlanFlow(container) {
  const progressPane = container.querySelector('#home-tab-progress');
  if (!progressPane) return;

  progressPane.innerHTML = `
    <div style="padding:var(--space-md);">
      <button id="adjust-back-btn" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text);margin-bottom:16px;">← Back to Progress</button>
      <h2 style="margin:0 0 8px;">Adjust Your Plan</h2>
      <p style="font-size:14px;color:var(--text-soft);margin:0 0 20px;">Tell us what you'd like to change and we'll regenerate your learning plan.</p>

      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
        <button class="adjust-option" data-reason="too_easy" style="background:var(--sand);border:2px solid var(--border-light);border-radius:var(--radius-lg);padding:16px;cursor:pointer;text-align:left;font-size:15px;font-family:var(--font-body);color:var(--text);">
          🚀 Too easy — I want more challenge
        </button>
        <button class="adjust-option" data-reason="too_hard" style="background:var(--sand);border:2px solid var(--border-light);border-radius:var(--radius-lg);padding:16px;cursor:pointer;text-align:left;font-size:15px;font-family:var(--font-body);color:var(--text);">
          🐢 Too hard — slow it down
        </button>
        <button class="adjust-option" data-reason="different_focus" style="background:var(--sand);border:2px solid var(--border-light);border-radius:var(--radius-lg);padding:16px;cursor:pointer;text-align:left;font-size:15px;font-family:var(--font-body);color:var(--text);">
          🎯 Different focus
        </button>
        <button class="adjust-option" data-reason="start_fresh" style="background:var(--sand);border:2px solid var(--border-light);border-radius:var(--radius-lg);padding:16px;cursor:pointer;text-align:left;font-size:15px;font-family:var(--font-body);color:var(--text);">
          🔄 Start fresh — regenerate everything
        </button>
      </div>

      <div id="focus-input-area" style="display:none;margin-bottom:20px;">
        <label style="font-size:14px;color:var(--text-soft);margin-bottom:6px;display:block;">What would you like to focus on?</label>
        <input type="text" id="focus-text" placeholder="e.g., more conversation practice, focus on reading..."
          style="width:100%;padding:12px 14px;border:2px solid var(--border);border-radius:var(--radius-md);font-size:15px;background:var(--cream);color:var(--text);font-family:var(--font-body);box-sizing:border-box;" />
      </div>
    </div>
  `;

  let selectedReason = null;

  // Back
  progressPane.querySelector('#adjust-back-btn')?.addEventListener('click', () => {
    const units = AppState.isAya ? AYA_UNITS : UNITS;
    const progress = AppState.unitProgress || {};
    progressPane.innerHTML = renderProgressTab(units, progress);
    loadPhasePlanView(container);
  });

  // Option selection
  progressPane.querySelectorAll('.adjust-option').forEach(btn => {
    btn.addEventListener('click', () => {
      // Deselect all
      progressPane.querySelectorAll('.adjust-option').forEach(b => {
        b.style.borderColor = 'var(--border-light)';
      });
      // Select this one
      btn.style.borderColor = 'var(--green)';
      selectedReason = btn.dataset.reason;

      // Show focus input for "different_focus"
      const focusArea = progressPane.querySelector('#focus-input-area');
      if (focusArea) {
        focusArea.style.display = selectedReason === 'different_focus' ? 'block' : 'none';
      }

      // Show confirm button if not already there
      if (!progressPane.querySelector('#confirm-adjust-btn')) {
        const confirmHtml = `
          <div style="padding:0 var(--space-md) var(--space-md);">
            <div style="background:var(--amber-light, #fff8f0);border:1px solid var(--amber);border-radius:var(--radius-md);padding:14px;margin-bottom:16px;">
              <p style="font-size:14px;color:var(--text);margin:0;line-height:1.4;">
                ⚠️ This will regenerate your remaining lessons. Completed lessons and vocabulary progress are kept.
              </p>
            </div>
            <button id="confirm-adjust-btn" class="btn-primary" style="width:100%;padding:14px;font-size:16px;">
              Regenerate My Plan
            </button>
          </div>
        `;
        progressPane.insertAdjacentHTML('beforeend', confirmHtml);

        progressPane.querySelector('#confirm-adjust-btn')?.addEventListener('click', () => {
          const focusText = progressPane.querySelector('#focus-text')?.value || '';
          executeAdjustPlan(container, selectedReason, focusText);
        });
      }
    });
  });
}

/**
 * Execute plan adjustment — regenerate phase plan
 */
async function executeAdjustPlan(container, reason, focusText) {
  showLoading('Regenerating your learning plan...');

  try {
    const email = AppState.user?.email;
    if (!email) throw new Error('Not signed in');

    const currentPlan = await loadLatestPhasePlan(email);
    const phaseNumber = currentPlan?.phase_number || 1;

    // Build performance context from the adjustment reason
    const reasonMap = {
      too_easy: 'Student reports content is too easy. Increase difficulty, push more production and script reading.',
      too_hard: 'Student reports content is too hard. Reduce difficulty, more repetition, simpler patterns.',
      different_focus: `Student wants a different focus: ${focusText || 'general change'}`,
      start_fresh: 'Student wants to start fresh. Generate a completely new plan.'
    };

    const prevPerformance = {
      completed: 0,
      avgQuizScore: 0,
      weakAreas: [],
      strongAreas: [],
      adjustmentReason: reasonMap[reason] || reason
    };

    const newPlan = await generatePhasePlan(email, phaseNumber, prevPerformance);

    hideLoading();

    if (!newPlan) {
      showToast('Failed to regenerate plan. Please try again.');
      return;
    }

    showToast('✅ Plan regenerated!');

    // Re-render progress tab with new plan
    const units = AppState.isAya ? AYA_UNITS : UNITS;
    const progress = AppState.unitProgress || {};
    const progressPane = container.querySelector('#home-tab-progress');
    if (progressPane) {
      progressPane.innerHTML = renderProgressTab(units, progress);
      loadPhasePlanView(container);
    }
  } catch (err) {
    hideLoading();
    showToast('Failed to regenerate plan. Please try again.');
    console.error('Adjust plan error:', err);
  }
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

  // Load phase plan view if heritage speaker (async, after DOM ready)
  if (AppState.profile?.speaker_type === 'heritage' && AppState.profile?.placement_profile) {
    loadPhasePlanView(container);
  }

  const continueBtn = container.querySelector('#continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      const isHeritage = AppState.profile?.speaker_type === 'heritage';
      const route = isHeritage ? 'lesson-v2' : 'lesson';
      import('./router.js').then(({ navigateTo }) => navigateTo(route));
    });
  }

  const placementBtn = container.querySelector('#placement-btn');
  if (placementBtn) {
    placementBtn.addEventListener('click', () => {
      const isHeritage = AppState.profile?.speaker_type === 'heritage';
      const route = isHeritage ? 'placement-v2' : 'placement';
      import('./router.js').then(({ navigateTo }) => navigateTo(route));
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

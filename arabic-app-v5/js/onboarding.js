/**
 * onboarding.js - 5-step onboarding wizard
 * Button-based goals/dialect selection, Enter key support, "Other" options
 */

import { AppState, save } from './state.js';

let currentStep = 0;
const steps = ['name', 'speaker', 'goals', 'dialect', 'summary'];

export function renderOnboardingScreen(container) {
  currentStep = 0;
  renderStep(container);
}

function renderStep(container) {
  const step = steps[currentStep];

  container.innerHTML = `
    <div class="screen" style="height:100dvh;overflow-y:auto;padding:2rem 1.5rem;">
      <div style="max-width:480px;margin:0 auto;">
        <div style="margin-bottom:1.5rem;font-size:14px;color:var(--text-soft);font-family:var(--font-body);">
          Step ${currentStep + 1} of ${steps.length}
          <div style="margin-top:8px;display:flex;gap:6px;">
            ${steps.map((_, i) => '<div style="flex:1;height:4px;border-radius:2px;background:' + (i <= currentStep ? 'var(--green)' : 'var(--border)') + ';"></div>').join('')}
          </div>
        </div>
        <div id="step-content"></div>
      </div>
    </div>
  `;

  const sc = container.querySelector('#step-content');

  switch (step) {
    case 'name': {
      sc.innerHTML = `
        <h2 style="font-family:var(--font-display);margin-bottom:1rem;">What's your name?</h2>
        <input type="text" id="name-input" placeholder="Your name"
          style="width:100%;padding:14px;margin-bottom:1rem;border:2px solid var(--border);border-radius:var(--radius-md);font-size:16px;background:var(--cream);color:var(--text);box-sizing:border-box;font-family:var(--font-body);" />
        <button class="btn-primary" id="continue-btn" style="width:100%;padding:14px;font-size:16px;">Continue</button>
      `;
      const nameInput = sc.querySelector('#name-input');
      const nameBtn = sc.querySelector('#continue-btn');
      nameInput.addEventListener('keypress', e => { if (e.key === 'Enter') nameBtn.click(); });
      nameBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) { nameInput.focus(); return; }
        if (!AppState.profile) AppState.profile = {};
        AppState.profile.name = name;
        currentStep++;
        renderStep(container);
      });
      setTimeout(() => nameInput.focus(), 50);
      break;
    }

    case 'speaker': {
      sc.innerHTML = `
        <h2 style="font-family:var(--font-display);margin-bottom:0.5rem;">Which describes you best?</h2>
        <p style="color:var(--text-soft);margin-bottom:1rem;">This helps us tailor your learning path.</p>
        <div class="onboarding-options">
          <button class="onboarding-option-btn" data-value="heritage">
            <strong>Heritage Speaker</strong><br>
            <small style="opacity:0.7;">Grew up hearing Arabic but want to improve</small>
          </button>
          <button class="onboarding-option-btn" data-value="beginner">
            <strong>Complete Beginner</strong><br>
            <small style="opacity:0.7;">Starting from scratch</small>
          </button>
          <button class="onboarding-option-btn" data-value="intermediate">
            <strong>Intermediate</strong><br>
            <small style="opacity:0.7;">Know some Arabic, want to go deeper</small>
          </button>
        </div>
      `;
      sc.querySelectorAll('.onboarding-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (!AppState.profile) AppState.profile = {};
          AppState.profile.speaker_type = btn.dataset.value;
          currentStep++;
          renderStep(container);
        });
      });
      break;
    }

    case 'goals': {
      sc.innerHTML = `
        <h2 style="font-family:var(--font-display);margin-bottom:0.5rem;">What are your goals?</h2>
        <p style="color:var(--text-soft);margin-bottom:1rem;">Select all that apply</p>
        <div class="onboarding-options">
          <button class="onboarding-option-btn" data-goal="family">Connect with family</button>
          <button class="onboarding-option-btn" data-goal="travel">Travel to Palestine</button>
          <button class="onboarding-option-btn" data-goal="culture">Learn about culture</button>
          <button class="onboarding-option-btn" data-goal="work">Professional reasons</button>
          <button class="onboarding-option-btn" data-goal="heritage">Connect with heritage</button>
          <button class="onboarding-option-btn" data-goal="other">Other</button>
        </div>
        <div id="custom-goal-input" style="display:none;margin-top:1rem;">
          <textarea placeholder="Tell us about your goals..." rows="3"
            style="width:100%;padding:12px;border:2px solid var(--border);border-radius:var(--radius-md);font-size:15px;resize:none;background:var(--cream);color:var(--text);box-sizing:border-box;font-family:var(--font-body);"></textarea>
        </div>
        <button class="btn-primary" id="continue-btn" style="width:100%;padding:14px;font-size:16px;margin-top:1rem;">Continue</button>
      `;
      sc.querySelectorAll('.onboarding-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          btn.classList.toggle('selected');
          if (btn.dataset.goal === 'other') {
            sc.querySelector('#custom-goal-input').style.display =
              btn.classList.contains('selected') ? 'block' : 'none';
          }
        });
      });
      sc.querySelector('#continue-btn').addEventListener('click', () => {
        const selected = Array.from(sc.querySelectorAll('.onboarding-option-btn.selected'))
          .map(b => b.dataset.goal);
        if (selected.length === 0) return;
        if (!AppState.profile) AppState.profile = {};
        AppState.profile.goals = selected;
        const custom = sc.querySelector('#custom-goal-input textarea');
        if (custom && custom.value.trim()) AppState.profile.customGoals = custom.value.trim();
        currentStep++;
        renderStep(container);
      });
      break;
    }

    case 'dialect': {
      sc.innerHTML = `
        <h2 style="font-family:var(--font-display);margin-bottom:0.5rem;">Which dialect?</h2>
        <p style="color:var(--text-soft);margin-bottom:1rem;">We'll focus your course on this dialect.</p>
        <div class="onboarding-options">
          <button class="onboarding-option-btn" data-dialect="palestinian">Palestinian 🇵🇸</button>
          <button class="onboarding-option-btn" data-dialect="levantine">Levantine (Jordan/Syria/Lebanon)</button>
          <button class="onboarding-option-btn" data-dialect="egyptian">Egyptian</button>
          <button class="onboarding-option-btn" data-dialect="gulf">Gulf</button>
          <button class="onboarding-option-btn" data-dialect="other">Other</button>
        </div>
        <div id="custom-dialect-input" style="display:none;margin-top:1rem;">
          <input type="text" placeholder="Which dialect?" id="custom-dialect-text"
            style="width:100%;padding:14px;border:2px solid var(--border);border-radius:var(--radius-md);font-size:16px;background:var(--cream);color:var(--text);box-sizing:border-box;font-family:var(--font-body);" />
        </div>
        <button class="btn-primary" id="continue-btn" style="width:100%;padding:14px;font-size:16px;margin-top:1rem;">Continue</button>
      `;
      sc.querySelectorAll('.onboarding-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          sc.querySelectorAll('.onboarding-option-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          sc.querySelector('#custom-dialect-input').style.display =
            btn.dataset.dialect === 'other' ? 'block' : 'none';
        });
      });
      const dialectContinue = sc.querySelector('#continue-btn');
      const customText = sc.querySelector('#custom-dialect-text');
      if (customText) {
        customText.addEventListener('keypress', e => { if (e.key === 'Enter') dialectContinue.click(); });
      }
      dialectContinue.addEventListener('click', () => {
        const selected = sc.querySelector('.onboarding-option-btn.selected');
        if (!selected) return;
        if (!AppState.profile) AppState.profile = {};
        if (selected.dataset.dialect === 'other') {
          const custom = sc.querySelector('#custom-dialect-text');
          if (!custom || !custom.value.trim()) return;
          AppState.profile.dialect = custom.value.trim();
        } else {
          AppState.profile.dialect = selected.dataset.dialect;
        }
        currentStep++;
        renderStep(container);
      });
      break;
    }

    case 'summary': {
      const p = AppState.profile || {};
      const speakerLabel = { heritage: 'Heritage Speaker', beginner: 'Complete Beginner', intermediate: 'Intermediate' }[p.speaker_type] || p.speaker_type || '—';
      sc.innerHTML = `
        <h2 style="font-family:var(--font-display);margin-bottom:1rem;">You're all set!</h2>
        <div class="hoopoe-card-feature" style="text-align:left;padding:24px;margin-bottom:1.5rem;">
          <p style="margin:0 0 10px;position:relative;z-index:1;"><strong>Name:</strong> ${p.name || '—'}</p>
          <p style="margin:0 0 10px;position:relative;z-index:1;"><strong>Level:</strong> ${speakerLabel}</p>
          <p style="margin:0 0 10px;position:relative;z-index:1;"><strong>Goals:</strong> ${(p.goals || []).join(', ')}</p>
          <p style="margin:0;position:relative;z-index:1;"><strong>Dialect:</strong> ${p.dialect || 'Palestinian'}</p>
        </div>
        <button class="btn-primary" id="finish-btn" style="width:100%;padding:14px;font-size:16px;">Start Learning &#x2192;</button>
      `;
      sc.querySelector('#finish-btn').addEventListener('click', async () => {
        await save();
        import('./app.js').then(({ onOnboardingComplete }) => {
          if (typeof onOnboardingComplete === 'function') onOnboardingComplete();
        });
      });
      break;
    }
  }
}

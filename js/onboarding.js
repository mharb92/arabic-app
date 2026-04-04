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
    <div class="screen" style="padding:2rem;">
      <div style="max-width:500px;margin:0 auto;">
        <div class="step-progress" style="margin-bottom:2rem;">
          Step ${currentStep + 1} of ${steps.length}
        </div>
        <div id="step-content"></div>
      </div>
    </div>
  `;
  
  const stepContent = container.querySelector('#step-content');
  
  switch (step) {
    case 'name':
      stepContent.innerHTML = `
        <h2>What's your name?</h2>
        <input type="text" id="name-input" class="text-input" placeholder="Your name" style="width:100%;padding:12px;margin:1rem 0;border:1px solid #ddd;border-radius:8px;font-size:16px;" />
        <button class="btn-primary" id="continue-btn">Continue</button>
      `;
      const nameInput = stepContent.querySelector('#name-input');
      stepContent.querySelector('#continue-btn').addEventListener('click', () => {
        AppState.profile.name = nameInput.value.trim();
        currentStep++;
        renderStep(container);
      });
      break;
      
    case 'speaker':
      stepContent.innerHTML = `
        <h2>Which describes you best?</h2>
        <div style="display:flex;flex-direction:column;gap:12px;margin:1rem 0;">
          <button class="choice-btn" data-value="heritage">Heritage Speaker</button>
          <button class="choice-btn" data-value="beginner">Complete Beginner</button>
          <button class="choice-btn" data-value="intermediate">Intermediate</button>
        </div>
      `;
      stepContent.querySelectorAll('.choice-btn').forEach(btn => {
        btn.style.cssText = 'padding:16px;border:1px solid #ddd;border-radius:8px;background:white;cursor:pointer;text-align:left;';
        btn.addEventListener('click', () => {
          AppState.profile.speaker_type = btn.dataset.value;
          currentStep++;
          renderStep(container);
        });
      });
      break;
      
    case 'goals':
      stepContent.innerHTML = `
        <h2>What are your goals?</h2>
        <div style="display:flex;flex-direction:column;gap:12px;margin:1rem 0;">
          <label><input type="checkbox" value="family"> Connect with family</label>
          <label><input type="checkbox" value="travel"> Travel to Palestine</label>
          <label><input type="checkbox" value="culture"> Learn about culture</label>
        </div>
        <button class="btn-primary" id="continue-btn">Continue</button>
      `;
      stepContent.querySelector('#continue-btn').addEventListener('click', () => {
        const checked = stepContent.querySelectorAll('input:checked');
        AppState.profile.goals = Array.from(checked).map(cb => cb.value);
        currentStep++;
        renderStep(container);
      });
      break;
      
    case 'dialect':
      stepContent.innerHTML = `
        <h2>Which dialect?</h2>
        <select id="dialect-select" style="width:100%;padding:12px;margin:1rem 0;border:1px solid #ddd;border-radius:8px;font-size:16px;">
          <option value="palestinian">Palestinian</option>
          <option value="levantine">Levantine</option>
          <option value="egyptian">Egyptian</option>
        </select>
        <button class="btn-primary" id="continue-btn">Continue</button>
      `;
      stepContent.querySelector('#continue-btn').addEventListener('click', () => {
        AppState.profile.dialect = stepContent.querySelector('#dialect-select').value;
        currentStep++;
        renderStep(container);
      });
      break;
      
    case 'summary':
      stepContent.innerHTML = `
        <h2>Ready to start!</h2>
        <p>Name: ${AppState.profile.name}</p>
        <p>Type: ${AppState.profile.speaker_type}</p>
        <button class="btn-primary" id="finish-btn">Start Learning</button>
      `;
      stepContent.querySelector('#finish-btn').addEventListener('click', async () => {
        await save();
        import('./app.js').then(({ onOnboardingComplete }) => onOnboardingComplete());
      });
      break;
  }
}

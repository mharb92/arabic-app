/**
 * onboarding.js
 * Onboarding flow for new users
 * Dependencies: state.js
 */

import { AppState, save } from './state.js';

/**
 * Initialize profile object if it doesn't exist
 */
function initProfile() {
    if (!AppState.profile || Object.keys(AppState.profile).length === 0) {
        AppState.profile = { 
            name: '', 
            speaker_type: '', 
            goals: [], 
            goalsExtra: '', 
            dialect: '', 
            dialectOther: '' 
        };
    }
}

/**
 * Render onboarding container
 * @param {HTMLElement} container - Container to render into
 */
export function renderOnboardingScreen(container) {
    initProfile();
    container.innerHTML = `<div id="onboarding-container" style="max-width:540px; margin:0 auto; padding:2rem 1.25rem;"></div>`;
    showStepName();
}

// --- STEP 1: NAME ---
function showStepName() {
    const container = document.getElementById('onboarding-container');
    container.innerHTML = `
        <div class="step-dots"><div class="sdot active"></div><div class="sdot"></div><div class="sdot"></div><div class="sdot"></div></div>
        <p class="step-tag">Step 1 of 4</p>
        <h2 class="step-title">What's your name?</h2>
        <p class="step-sub">We'll use this to personalise your experience throughout the course.</p>
        
        <input id="inp-name" class="field" type="text" placeholder="Enter your name..." value="${AppState.profile.name}">
        
        <button id="btn-name" class="btn-primary" disabled>continue →</button>
    `;
    
    const nameInput = document.getElementById('inp-name');
    const nameBtn = document.getElementById('btn-name');
    
    nameInput.addEventListener('input', () => {
        nameBtn.disabled = nameInput.value.trim().length === 0;
    });
    
    nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !nameBtn.disabled) {
            saveNameAndNext();
        }
    });
    
    nameBtn.addEventListener('click', saveNameAndNext);
    
    // Initial validation
    nameBtn.disabled = nameInput.value.trim().length === 0;
}

function saveNameAndNext() {
    AppState.profile.name = document.getElementById('inp-name').value.trim();
    showStepSpeaker();
}

// --- STEP 2: SPEAKER TYPE ---
function showStepSpeaker() {
    const container = document.getElementById('onboarding-container');
    container.innerHTML = `
        <div class="step-dots"><div class="sdot done"></div><div class="sdot active"></div><div class="sdot"></div><div class="sdot"></div></div>
        <p class="step-tag">Step 2 of 4</p>
        <h2 class="step-title">How would you describe your Arabic?</h2>
        <p class="step-sub">This shapes your starting point and how we explain things.</p>
        
        <div class="choices" id="c-speaker">
            <button class="ch ${AppState.profile.speaker_type === 'new' ? 'sel' : ''}" data-speaker="new">
                <div class="ch-icon">✦</div>
                <div class="ch-body">
                    <div class="ch-title">Complete beginner</div>
                    <div class="ch-desc">Little to no Arabic.</div>
                </div>
                <div class="ch-tick"></div>
            </button>
            <button class="ch ${AppState.profile.speaker_type === 'heritage' ? 'sel' : ''}" data-speaker="heritage">
                <div class="ch-icon">🌿</div>
                <div class="ch-body">
                    <div class="ch-title">Heritage speaker</div>
                    <div class="ch-desc">It was spoken around me but I lost it.</div>
                </div>
                <div class="ch-tick"></div>
            </button>
            <button class="ch ${AppState.profile.speaker_type === 'intermediate' ? 'sel' : ''}" data-speaker="intermediate">
                <div class="ch-icon">◈</div>
                <div class="ch-body">
                    <div class="ch-title">Intermediate</div>
                    <div class="ch-desc">I can hold basic conversations.</div>
                </div>
                <div class="ch-tick"></div>
            </button>
            <button class="ch ${AppState.profile.speaker_type === 'advanced' ? 'sel' : ''}" data-speaker="advanced">
                <div class="ch-icon">🎓</div>
                <div class="ch-body">
                    <div class="ch-title">Advanced</div>
                    <div class="ch-desc">Fluent but want to sharpen specific skills.</div>
                </div>
                <div class="ch-tick"></div>
            </button>
        </div>
        
        <button id="btn-speaker" class="btn-primary" ${AppState.profile.speaker_type ? '' : 'disabled'}>continue →</button>
        <button class="btn-ghost" id="back-speaker">← back</button>
    `;
    
    // Attach event listeners
    document.querySelectorAll('[data-speaker]').forEach(btn => {
        btn.addEventListener('click', () => {
            AppState.profile.speaker_type = btn.dataset.speaker;
            showStepSpeaker();
        });
    });
    
    document.getElementById('btn-speaker').addEventListener('click', showStepGoals);
    document.getElementById('back-speaker').addEventListener('click', showStepName);
}

// --- STEP 3: GOALS ---
function showStepGoals() {
    const container = document.getElementById('onboarding-container');
    container.innerHTML = `
        <div class="step-dots"><div class="sdot done"></div><div class="sdot done"></div><div class="sdot active"></div><div class="sdot"></div></div>
        <p class="step-tag">Step 3 of 4</p>
        <h2 class="step-title">What's your primary goal?</h2>
        <p class="step-sub">This shapes your vocabulary and scenarios.</p>
        
        <div class="choices" id="c-goals">
            <button class="ch ${AppState.profile.goals.includes('family') ? 'sel' : ''}" data-goal="family">
                <div class="ch-icon">🫂</div>
                <div class="ch-body"><div class="ch-title">Connecting with family</div></div>
                <div class="ch-tick"></div>
            </button>
            <button class="ch ${AppState.profile.goals.includes('travel') ? 'sel' : ''}" data-goal="travel">
                <div class="ch-icon">✈️</div>
                <div class="ch-body"><div class="ch-title">Travel & daily life</div></div>
                <div class="ch-tick"></div>
            </button>
            <button class="ch ${AppState.profile.goals.includes('culture') ? 'sel' : ''}" data-goal="culture">
                <div class="ch-icon">🎭</div>
                <div class="ch-body"><div class="ch-title">Culture, music & media</div></div>
                <div class="ch-tick"></div>
            </button>
            <button class="ch ${AppState.profile.goals.includes('professional') ? 'sel' : ''}" data-goal="professional">
                <div class="ch-icon">💼</div>
                <div class="ch-body"><div class="ch-title">Professional Arabic</div></div>
                <div class="ch-tick"></div>
            </button>
            <button class="ch ${AppState.profile.goals.includes('conversation') ? 'sel' : ''}" data-goal="conversation">
                <div class="ch-icon">💬</div>
                <div class="ch-body"><div class="ch-title">Everyday conversation</div></div>
                <div class="ch-tick"></div>
            </button>
            <button class="ch ${AppState.profile.goals.includes('reading') ? 'sel' : ''}" data-goal="reading">
                <div class="ch-icon">📖</div>
                <div class="ch-body"><div class="ch-title">Reading and writing</div></div>
                <div class="ch-tick"></div>
            </button>
        </div>
        
        <input id="goals-extra" class="field" style="margin-top:0.5rem; font-family:inherit;" type="text" placeholder="Any specific goals? (optional)" value="${AppState.profile.goalsExtra || ''}">
        
        <button id="btn-goals" class="btn-primary" ${AppState.profile.goals.length > 0 ? '' : 'disabled'}>continue →</button>
        <button class="btn-ghost" id="back-goals">← back</button>
    `;
    
    // Attach event listeners
    document.querySelectorAll('[data-goal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const goal = btn.dataset.goal;
            const index = AppState.profile.goals.indexOf(goal);
            if (index > -1) {
                AppState.profile.goals.splice(index, 1);
            } else {
                AppState.profile.goals.push(goal);
            }
            showStepGoals();
        });
    });
    
    document.getElementById('btn-goals').addEventListener('click', () => {
        AppState.profile.goalsExtra = document.getElementById('goals-extra').value.trim();
        showStepDialect();
    });
    
    document.getElementById('back-goals').addEventListener('click', showStepSpeaker);
}

// --- STEP 4: DIALECT ---
function showStepDialect() {
    const container = document.getElementById('onboarding-container');
    const isOther = AppState.profile.dialect === 'other';
    
    container.innerHTML = `
        <div class="step-dots"><div class="sdot done"></div><div class="sdot done"></div><div class="sdot done"></div><div class="sdot active"></div></div>
        <p class="step-tag">Step 4 of 4</p>
        <h2 class="step-title">Which dialect?</h2>
        <p class="step-sub">Your pronunciation will be tuned to this dialect.</p>
        
        <div class="choices" id="c-dialect">
            <button class="ch ${AppState.profile.dialect === 'palestinian' ? 'sel' : ''}" data-dialect="palestinian">
                <div class="ch-icon">🇵🇸</div>
                <div class="ch-body"><div class="ch-title">Palestinian / Levantine</div></div>
                <div class="ch-tick"></div>
            </button>
            <button class="ch ${AppState.profile.dialect === 'egyptian' ? 'sel' : ''}" data-dialect="egyptian">
                <div class="ch-icon">🇪🇬</div>
                <div class="ch-body"><div class="ch-title">Egyptian</div></div>
                <div class="ch-tick"></div>
            </button>
            <button class="ch ${AppState.profile.dialect === 'msa' ? 'sel' : ''}" data-dialect="msa">
                <div class="ch-icon">📚</div>
                <div class="ch-body"><div class="ch-title">Modern Standard Arabic</div></div>
                <div class="ch-tick"></div>
            </button>
            <button class="ch ${isOther ? 'sel' : ''}" data-dialect="other">
                <div class="ch-icon">🌍</div>
                <div class="ch-body"><div class="ch-title">Other / Mixed</div></div>
                <div class="ch-tick"></div>
            </button>
        </div>
        
        <div id="dialect-other-container" style="display: ${isOther ? 'block' : 'none'}; margin-bottom:1.25rem;">
            <input id="dialect-extra" class="field" style="margin-bottom:0; font-family:inherit;" type="text" placeholder="Which dialect? (e.g. Gulf, Moroccan...)" value="${AppState.profile.dialectOther || ''}">
        </div>
        
        <button id="btn-dialect" class="btn-primary" disabled>finish →</button>
        <button class="btn-ghost" id="back-dialect">← back</button>
    `;
    
    // Attach event listeners
    document.querySelectorAll('[data-dialect]').forEach(btn => {
        btn.addEventListener('click', () => {
            AppState.profile.dialect = btn.dataset.dialect;
            showStepDialect();
        });
    });
    
    const dialectExtra = document.getElementById('dialect-extra');
    const dialectBtn = document.getElementById('btn-dialect');
    
    if (dialectExtra) {
        dialectExtra.addEventListener('input', validateDialectExtra);
    }
    
    dialectBtn.addEventListener('click', saveDialectAndNext);
    document.getElementById('back-dialect').addEventListener('click', showStepGoals);
    
    validateDialectExtra();
}

function validateDialectExtra() {
    const btn = document.getElementById('btn-dialect');
    if (!AppState.profile.dialect) {
        btn.disabled = true;
        return;
    }
    
    if (AppState.profile.dialect === 'other') {
        const val = document.getElementById('dialect-extra')?.value.trim() || '';
        btn.disabled = val.length === 0;
    } else {
        btn.disabled = false;
    }
}

function saveDialectAndNext() {
    if (AppState.profile.dialect === 'other') {
        AppState.profile.dialectOther = document.getElementById('dialect-extra').value.trim();
    } else {
        AppState.profile.dialectOther = '';
    }
    showStepSummary();
}

// --- SUMMARY ---
function showStepSummary() {
    const container = document.getElementById('onboarding-container');
    
    let displayGoals = AppState.profile.goals.join(', ');
    if (AppState.profile.goalsExtra) {
        displayGoals += (displayGoals ? ', ' : '') + `"${AppState.profile.goalsExtra}"`;
    }
    if (!displayGoals) displayGoals = 'None selected';
    
    const displayDialect = AppState.profile.dialect === 'other' ? AppState.profile.dialectOther : AppState.profile.dialect;
    
    container.innerHTML = `
        <h2 class="step-title" style="margin-top:1rem;">Welcome, ${AppState.profile.name}.</h2>
        <h1 style="font-size:32px; color:var(--green); margin-bottom:1.5rem;">مرحباً</h1>
        
        <div class="sum-card">
            <div class="sum-row"><span class="sum-k">Name</span><span class="sum-v">${AppState.profile.name}</span></div>
            <div class="sum-row"><span class="sum-k">Background</span><span class="sum-v" style="text-transform:capitalize;">${AppState.profile.speaker_type}</span></div>
            <div class="sum-row"><span class="sum-k">Goals</span><span class="sum-v" style="text-transform:capitalize;">${displayGoals}</span></div>
            <div class="sum-row"><span class="sum-k">Dialect</span><span class="sum-v" style="text-transform:capitalize;">${displayDialect}</span></div>
        </div>

        <button class="btn-primary" id="finish-btn">Continue to Placement Test →</button>
        <button class="btn-ghost" id="edit-btn">← edit answers</button>
    `;
    
    document.getElementById('finish-btn').addEventListener('click', finishOnboarding);
    document.getElementById('edit-btn').addEventListener('click', showStepDialect);
}

async function finishOnboarding() {
    // Save profile
    await save();
    
    // Navigate to placement test
    import('./router.js').then(({ navigateTo }) => {
        navigateTo('placement');
    });
}

import { AppState, setUser, load } from './state.js';
import { checkSpecialCourse } from './database.js';
import { saveLocal, loadLocal } from './storage.js';

export async function initAuth() {
  const storedEmail = loadLocal('arabic_app_email');
  if (!storedEmail) return { loggedIn: false };
  
  setUser({ id: storedEmail, email: storedEmail });
  await load();
  
  return { loggedIn: true };
}

export function renderLoginScreen(container) {
  container.innerHTML = `
    <div class="screen" style="justify-content:center;align-items:center;padding:2rem;">
      <div style="max-width:400px;width:100%;text-align:center;">
        <h1 style="margin-bottom:2rem;">مرحبا</h1>
        <input type="email" id="email-input" placeholder="Enter your email" 
               style="width:100%;padding:12px;margin-bottom:1rem;border:1px solid #ddd;border-radius:8px;font-size:16px;" />
        <button id="login-btn" class="btn-primary">Continue</button>
      </div>
    </div>
  `;
  
  const emailInput = container.querySelector('#email-input');
  const loginBtn = container.querySelector('#login-btn');
  
  loginBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email) return alert('Please enter your email');
    
    saveLocal('arabic_app_email', email);
    setUser({ id: email, email });
    
    const { config } = await checkSpecialCourse(email);
    if (config) {
      AppState.isAya = true;
      AppState.ayaConfig = config;
    }
    
    await load();
    
    import('./app.js').then(({ onAuthSuccess }) => onAuthSuccess());
  });
  
  emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });
}

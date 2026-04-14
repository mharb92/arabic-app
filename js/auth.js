import { AppState, setUser, load } from './state.js';
import { checkSpecialCourse } from './database.js';
import { saveLocal, loadLocal } from './storage.js';

export async function initAuth() {
  const storedEmail = loadLocal('arabic_app_email');
  if (!storedEmail) return { loggedIn: false };
  
  // Just set user — load() already called by app.js
  setUser({ id: storedEmail, email: storedEmail });
  
  return { loggedIn: true };
}

export function renderLoginScreen(container) {
  container.innerHTML = `
    <div class="login-screen">
      <div class="login-content">
        <h1 class="login-greeting">مرحبا</h1>
        <p class="login-subtitle">Welcome to your<br>Arabic learning journey</p>
        
        <div class="login-divider"></div>
        
        <input 
          type="email" 
          id="email-input" 
          class="input-field login-input" 
          placeholder="your@email.com"
          autocomplete="email"
        />
        
        <button id="login-btn" class="btn-primary" style="width: 100%;">Continue</button>
        
        <a href="#" class="login-guest" id="guest-link">Or continue as guest</a>
      </div>
    </div>
  `;
  
  const emailInput = container.querySelector('#email-input');
  const loginBtn = container.querySelector('#login-btn');
  const guestLink = container.querySelector('#guest-link');
  
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
  
  guestLink.addEventListener('click', (e) => {
    e.preventDefault();
    saveLocal('arabic_app_email', 'guest@app.com');
    setUser({ id: 'guest', email: 'guest@app.com' });
    AppState.isGuest = true;
    import('./app.js').then(({ onAuthSuccess }) => onAuthSuccess());
  });
  
  emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });
  
  // Auto-focus input
  setTimeout(() => emailInput.focus(), 100);
}

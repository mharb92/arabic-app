/**
 * auth.js
 * Authentication screen and login logic
 * Dependencies: state.js, database.js, config.js, ui.js
 */

import { AppState, setUser, save } from './state.js';
import { checkSpecialCourse } from './database.js';
import { AYA_EMAILS } from './config.js';
import { showError } from './utils/ui.js';

/**
 * Renders the Login Screen
 * @param {HTMLElement} container - Container to render into
 */
export function renderAuthScreen(container) {
    container.innerHTML = `
        <div style="max-width:400px; margin:0 auto; padding:4rem 1.5rem; text-align:center;">
            <div style="font-size:40px; margin-bottom:1rem;">🌙</div>
            <h1 style="font-family:'Lora',serif; font-size:28px; color:#1a6b50; margin-bottom:0.5rem;">Marhaba</h1>
            <p style="color:#6b6760; margin-bottom:3rem;">Sign in to continue your journey.</p>

            <form id="login-form" style="text-align:left; margin-bottom:1.5rem;">
                <label style="font-size:12px; font-weight:700; color:#9b9890; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:8px; display:block;">Email Address</label>
                <input id="auth-email" type="email" class="field" placeholder="name@example.com" required 
                    style="margin-bottom:12px; width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; font-family:inherit;">
                
                <button type="submit" class="btn-primary" 
                    style="width:100%; padding:14px; background:#1a6b50; color:#fff; border:none; border-radius:40px; font-weight:600; cursor:pointer;">
                    Login
                </button>
            </form>
            
            <button id="guest-btn" 
                style="width:100%; padding:14px; background:none; border:1px solid rgba(0,0,0,0.1); border-radius:40px; color:#6b6760; font-size:14px; font-weight:600; cursor:pointer; margin-bottom:2rem;">
                Continue as Guest
            </button>
            
            <div style="border-top:1px solid #eee; padding-top:2rem;">
                <p style="font-size:13px; color:#9b9890;">Don't have an account?</p>
                <button id="signup-btn" 
                    style="background:none; border:none; color:#1a6b50; font-weight:700; cursor:pointer; margin-top:8px;">Sign Up →</button>
            </div>
        </div>
    `;
    
    // Attach event listeners
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('guest-btn').addEventListener('click', loginAsGuest);
    document.getElementById('signup-btn').addEventListener('click', () => {
        // Import navigateTo dynamically to avoid circular dependency
        import('./router.js').then(({ navigateTo }) => navigateTo('onboarding'));
    });
}

/**
 * Handle login logic - checks for Aya's course, sets user, saves state
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('auth-email').value.trim().toLowerCase();
    if (!emailInput) {
        showError('Please enter an email address');
        return;
    }
    
    // Set user in state
    const user = { id: emailInput, email: emailInput };
    setUser(user);
    
    // Check if this is Aya
    const { config } = await checkSpecialCourse(emailInput);
    
    if (config) {
        // AYA'S COURSE
        AppState.isAya = true;
        AppState.ayaConfig = config;
        AppState.profile = { name: 'Aya', email: emailInput };
        
        // Save to database and localStorage
        await save();
        
        // Check if Aya has seen splash
        const hasSeenSplash = localStorage.getItem('hasSeenAyaSplash');
        
        const { navigateTo } = await import('./router.js');
        if (hasSeenSplash === 'true') {
            navigateTo('home');
        } else {
            navigateTo('aya-splash');
        }
    } else {
        // STANDARD TRACK
        AppState.isAya = false;
        AppState.profile = { name: '', email: emailInput };
        
        // Save state
        await save();
        
        // Check if user has completed placement test
        const { navigateTo } = await import('./router.js');
        if (AppState.hasCompletedPlacement) {
            navigateTo('home');
        } else {
            navigateTo('onboarding');
        }
    }
}

/**
 * Login as guest (localStorage only, no database)
 */
async function loginAsGuest() {
    const user = { id: 'guest', email: 'guest@app.com' };
    setUser(user);
    
    AppState.isGuest = true;
    AppState.isAya = false;
    AppState.profile = { name: 'Guest' };
    
    // Save to localStorage only
    await save();
    
    const { navigateTo } = await import('./router.js');
    
    if (AppState.hasCompletedPlacement) {
        navigateTo('home');
    } else {
        navigateTo('onboarding');
    }
}

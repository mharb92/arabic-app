/**
 * app.js - Application entry point
 * Initializes the app, handles auth flow, and sets up routing
 */

import { AppState, load } from './state.js';
import { initAuth, renderLoginScreen } from './auth.js';
import { renderOnboardingScreen } from './onboarding.js';
import { initRouter, navigateTo, handleAyaRouting } from './router.js';
import { hasSeenAyaSplash } from './aya.js';

let appContainer = null;

/**
 * Initialize the application
 */
export async function initApp(container) {
  appContainer = container;
  
  // Load state from localStorage
  await load();
  
  // Initialize router
  initRouter(container);
  
  // Show splash screen first if never seen
  if (!hasSeenWelcome()) {
    await showWelcomeScreen();
    markWelcomeSeen();
  }
  
  // Check auth status
  const authStatus = await initAuth();
  
  if (!authStatus.loggedIn) {
    // Not logged in - show login screen
    renderLoginScreen(container);
  } else {
    // Logged in - check onboarding status
    handlePostAuth();
  }
}

/**
 * Handle post-authentication flow
 */
function handlePostAuth() {
  // Check if Aya's course FIRST - she has custom onboarding
  if (AppState.isAya) {
    const route = handleAyaRouting();
    navigateTo(route);
    return;
  }
  
  // For regular users, check if onboarding is complete
  if (!isOnboardingComplete()) {
    renderOnboardingScreen(appContainer);
    return;
  }
  
  // Regular user with complete onboarding - go to home
  navigateTo('home');
}

/**
 * Check if onboarding is complete
 */
function isOnboardingComplete() {
  const profile = AppState.profile;
  
  // Required fields for onboarding completion
  return profile && 
         profile.name && 
         profile.speaker_type && 
         profile.goals && 
         profile.goals.length > 0;
}

/**
 * Check if welcome screen has been seen
 */
function hasSeenWelcome() {
  return localStorage.getItem('arabic_welcome_seen') === 'true';
}

/**
 * Mark welcome screen as seen
 */
function markWelcomeSeen() {
  localStorage.setItem('arabic_welcome_seen', 'true');
}

/**
 * Show welcome/splash screen (first visit only)
 */
async function showWelcomeScreen() {
  return new Promise((resolve) => {
    appContainer.innerHTML = `
      <div class="welcome-screen">
        <div class="welcome-content">
          <div class="welcome-logo">
            <div class="logo-icon">🌿</div>
            <h1>Arabic Mastery</h1>
          </div>
          
          <div class="welcome-tagline">
            <p>Your personal journey to Palestinian Arabic</p>
          </div>
          
          <div class="welcome-animation">
            <!-- Animation or illustration could go here -->
          </div>
        </div>
      </div>
    `;
    
    // Auto-advance after 2 seconds
    setTimeout(() => {
      resolve();
    }, 2000);
  });
}

/**
 * Export for auth success callback
 */
export function onAuthSuccess() {
  handlePostAuth();
}

/**
 * Export for onboarding completion callback
 */
export function onOnboardingComplete() {
  // After onboarding, check Aya routing or go to home
  if (AppState.isAya) {
    const route = handleAyaRouting();
    navigateTo(route);
  } else {
    // Check if user should take placement test
    if (AppState.profile.placementLevel === undefined && 
        (AppState.profile.speaker_type === 'heritage' || AppState.profile.speaker_type === 'intermediate')) {
      // Suggest placement test but don't force it
      navigateTo('home');
    } else {
      navigateTo('home');
    }
  }
}

/**
 * Handle app errors
 */
export function handleAppError(error) {
  console.error('App error:', error);
  
  appContainer.innerHTML = `
    <div class="error-screen">
      <div class="error-content">
        <h2>Something went wrong</h2>
        <p>We encountered an unexpected error.</p>
        <p class="error-message">${error.message || 'Unknown error'}</p>
        <button class="btn-primary" id="reload-btn">Reload App</button>
      </div>
    </div>
  `;
  
  const reloadBtn = appContainer.querySelector('#reload-btn');
  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => {
      window.location.reload();
    });
  }
}

/**
 * Setup global error handler
 */
window.addEventListener('error', (event) => {
  handleAppError(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  handleAppError(event.reason);
});

// ============================================================================
// AUTO-INITIALIZATION (BUG FIX)
// ============================================================================

/**
 * Initialize app when DOM is ready
 * This fixes the bug where initApp was defined but never called
 */
document.addEventListener('DOMContentLoaded', () => {
  const appRoot = document.getElementById('app-root');
  if (appRoot) {
    initApp(appRoot);
  } else {
    console.error('FATAL: #app-root element not found in DOM');
  }
});

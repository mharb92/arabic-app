/**
 * router.js - Navigation and routing system
 * Manages page transitions and route handling
 */

import { AppState } from './state.js';
import { renderHomeScreen } from './home.js';
import { renderLessonScreen } from './lesson.js';
import { renderQuizScreen } from './quiz.js';
import { renderFlashcardsScreen } from './flashcards.js';
import { renderVocabScreen } from './vocab.js';
import { renderAlphabetScreen } from './alphabet-screen.js';
import { renderPlacementScreen } from './placement-screen.js';
import { renderAyaSplash, renderAyaReturnSplash, renderPhonicsScreen, renderCulturalCard, renderMarwanNote, renderCourseCompletion, hasSeenAyaSplash } from './aya.js';
import { renderFocusedStudyScreen } from './focused-study.js';
import { renderMyVocabScreen } from './my-vocab.js';
import { renderPushPromptScreen } from './push.js';

let currentRoute = null;
let appContainer = null;

/**
 * Initialize router
 */
export function initRouter(container) {
  appContainer = container;
}

/**
 * Navigate to a route
 */
export function navigateTo(route, params = {}) {
  if (!appContainer) {
    console.error('Router not initialized. Call initRouter(container) first.');
    return;
  }
  
  currentRoute = route;
  
  // Clear container
  appContainer.innerHTML = '';
  
  // Route to appropriate screen
  switch (route) {
    case 'home':
      renderHomeScreen(appContainer);
      break;
      
    case 'lesson':
      renderLessonScreen(appContainer);
      break;
      
    case 'quiz':
      renderQuizScreen(appContainer);
      break;
      
    case 'flashcards':
      renderFlashcardsScreen(appContainer);
      break;
      
    case 'vocab':
      renderVocabScreen(appContainer);
      break;
      
    case 'alphabet':
      renderAlphabetScreen(appContainer);
      break;
      
    case 'placement':
      renderPlacementScreen(appContainer);
      break;
      
    case 'focused-study':
      renderFocusedStudyScreen(appContainer);
      break;
      
    case 'my-vocab':
      renderMyVocabScreen(appContainer);
      break;
      
    // Aya's routes
    case 'aya-splash':
      renderAyaSplash(appContainer, () => {
        navigateTo('home');
      });
      break;
      
    case 'aya-return':
      renderAyaReturnSplash(appContainer, () => {
        navigateTo('home');
      });
      break;
      
    case 'aya-phonics':
      renderPhonicsScreen(appContainer);
      break;
      
    case 'aya-cultural':
      renderCulturalCard(appContainer, params.cardIndex || 0, () => {
        navigateTo('home');
      });
      break;
      
    case 'aya-note':
      renderMarwanNote(appContainer, params.noteIndex || 0, () => {
        navigateTo('home');
      });
      break;
      
    case 'aya-complete':
      renderCourseCompletion(appContainer);
      break;
      
    // Push notification setup
    case 'push-prompt':
      renderPushPromptScreen(appContainer, () => {
        navigateTo('home');
      });
      break;
      
    // Special routes (these will be handled by app.js)
    case 'welcome':
    case 'login':
    case 'onboarding':
      console.log(`Route '${route}' should be handled by app.js`);
      break;
      
    // Unit overview and enrichment (placeholder)
    case 'unit-overview':
      renderPlaceholder(appContainer, 'Unit Overview', 'Browse all available units');
      break;
      
    case 'enrichment':
      renderPlaceholder(appContainer, 'Today\'s Practice', 'Daily practice exercises');
      break;
      
    default:
      renderNotFound(appContainer, route);
      break;
  }
}

/**
 * Get current route
 */
export function getCurrentRoute() {
  return currentRoute;
}

/**
 * Render placeholder for unimplemented routes
 */
function renderPlaceholder(container, title, description) {
  container.innerHTML = `
    <div class="placeholder-screen">
      <div class="placeholder-content">
        <h2>${title}</h2>
        <p>${description}</p>
        <p class="placeholder-note">This feature will be added in a future update.</p>
        <button class="btn-primary" id="back-btn">Back to Home</button>
      </div>
    </div>
  `;
  
  const backBtn = container.querySelector('#back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      navigateTo('home');
    });
  }
}

/**
 * Render 404 not found
 */
function renderNotFound(container, route) {
  container.innerHTML = `
    <div class="not-found-screen">
      <div class="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The route "${route}" does not exist.</p>
        <button class="btn-primary" id="home-btn">Go Home</button>
      </div>
    </div>
  `;
  
  const homeBtn = container.querySelector('#home-btn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      navigateTo('home');
    });
  }
}

/**
 * Handle Aya-specific routing logic
 */
export function handleAyaRouting() {
  if (!AppState.isAya) {
    return 'home';
  }
  
  // Check if first visit
  if (!hasSeenAyaSplash()) {
    return 'aya-splash';
  }
  
  // Returning visit - show return splash or go straight to home
  // You can customize this logic based on AppState.profile.ayaMeta
  return 'aya-return';
}

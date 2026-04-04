/**
 * state.js
 * Global state management + persistence orchestration
 * This is where ALL state lives and ALL state changes flow through
 * Dependencies: database.js, storage.js
 */

import { 
  initSupabase,
  saveProfile as dbSaveProfile, 
  loadProfile as dbLoadProfile,
  saveUnitProgress as dbSaveUnitProgress,
  loadUnitProgress as dbLoadUnitProgress,
  saveWeakWords as dbSaveWeakWords,
  loadWeakWords as dbLoadWeakWords,
  checkSpecialCourse,
  loadCheckpoints as dbLoadCheckpoints,
  loadFocusedSessions as dbLoadFocusedSessions,
  loadPersonalVocab as dbLoadPersonalVocab
} from './database.js';

import { saveLocal, loadLocal, clearLocal } from './storage.js';

/**
 * Global Application State
 * This is the single source of truth for all app state
 */
export const AppState = {
  // User session
  user: null,              // {id, email} or null
  isGuest: false,
  
  // Profile data
  profile: {},             // {name, speaker_type, goals, dialect, ...}
  
  // Aya's course
  isAya: false,
  ayaConfig: null,
  
  // Progress tracking
  unitProgress: {},        // {unitId: {stage, consec, mastered, ...}}
  weakWords: [],           // Array of phrase IDs
  checkpoints: [],         // Array of checkpoint objects
  
  // Stage B: Focused Study
  focusedSessions: [],     // Array of session objects
  
  // Stage C: My Vocabulary
  personalVocab: [],       // Array of custom words
  
  // App state
  currentPage: 'loading',
  hasCompletedPlacement: false
};

/**
 * Load state from database + localStorage
 * Called on app initialization
 */
export async function load() {
  // Initialize Supabase
  initSupabase();
  
  // Check for stored email
  const storedEmail = loadLocal('arabic_app_email');
  
  if (!storedEmail) {
    // No stored session - user needs to log in
    AppState.user = null;
    AppState.isGuest = false;
    return;
  }
  
  // Check if this is a guest session
  if (storedEmail === 'guest@app.com') {
    AppState.isGuest = true;
    AppState.user = { id: 'guest', email: storedEmail };
    
    // Load from localStorage only
    const localState = loadLocal('arabic_app_v3', {});
    AppState.profile = localState.profile || {};
    AppState.unitProgress = localState.unitProgress || {};
    AppState.weakWords = localState.weakWords || [];
    AppState.hasCompletedPlacement = localState.hasCompletedPlacement || false;
    return;
  }
  
  // Regular user - load from Supabase
  const userId = storedEmail; // Using email as user ID
  AppState.user = { id: userId, email: storedEmail };
  
  // Check for Aya's course
  const { config } = await checkSpecialCourse(storedEmail);
  if (config) {
    AppState.isAya = true;
    AppState.ayaConfig = config;
  }
  
  // Load profile
  const { profile } = await dbLoadProfile(userId);
  if (profile) {
    AppState.profile = profile;
  }
  
  // Load unit progress
  const { progress } = await dbLoadUnitProgress(userId);
  if (progress && progress.length > 0) {
    // Convert array to object keyed by unit_id
    AppState.unitProgress = {};
    progress.forEach(item => {
      AppState.unitProgress[item.unit_id] = item;
    });
  }
  
  // Load weak words
  const { weakWords } = await dbLoadWeakWords(userId);
  AppState.weakWords = weakWords;
  
  // Load checkpoints
  const { checkpoints } = await dbLoadCheckpoints(userId);
  AppState.checkpoints = checkpoints;
  
  // Load focused sessions (Stage B)
  const { sessions } = await dbLoadFocusedSessions(userId);
  AppState.focusedSessions = sessions;
  
  // Load personal vocab (Stage C)
  const { words } = await dbLoadPersonalVocab(userId);
  AppState.personalVocab = words;
  
  // Load placement status from localStorage (cached)
  const placementScores = loadLocal('arabic_pscores');
  if (placementScores) {
    AppState.hasCompletedPlacement = true;
  }
}

/**
 * Save state to database + localStorage
 * Called after any state change
 */
export async function save() {
  // Always save to localStorage (for caching + guest mode)
  saveLocal('arabic_app_v3', {
    profile: AppState.profile,
    unitProgress: AppState.unitProgress,
    weakWords: AppState.weakWords,
    hasCompletedPlacement: AppState.hasCompletedPlacement
  });
  
  // If guest, don't save to Supabase
  if (AppState.isGuest || !AppState.user) {
    return;
  }
  
  // Save to Supabase
  const userId = AppState.user.id;
  
  // Save profile
  if (AppState.profile && Object.keys(AppState.profile).length > 0) {
    await dbSaveProfile(userId, AppState.profile);
  }
  
  // Save unit progress (each unit separately)
  for (const [unitId, progress] of Object.entries(AppState.unitProgress)) {
    await dbSaveUnitProgress(userId, unitId, progress);
  }
  
  // Save weak words
  if (AppState.weakWords && AppState.weakWords.length > 0) {
    await dbSaveWeakWords(userId, AppState.weakWords);
  }
}

/**
 * Reset all state (for logout)
 */
export async function reset() {
  AppState.user = null;
  AppState.isGuest = false;
  AppState.profile = {};
  AppState.isAya = false;
  AppState.ayaConfig = null;
  AppState.unitProgress = {};
  AppState.weakWords = [];
  AppState.checkpoints = [];
  AppState.focusedSessions = [];
  AppState.personalVocab = [];
  AppState.currentPage = 'auth';
  AppState.hasCompletedPlacement = false;
  
  // Clear localStorage
  clearLocal('arabic_app_v3');
  clearLocal('arabic_app_email');
  clearLocal('arabic_pscores');
  clearLocal('arabic_placement_state');
}

/**
 * Getters and setters for common operations
 */

export function getUser() {
  return AppState.user;
}

export function setUser(user) {
  AppState.user = user;
  if (user && user.email) {
    saveLocal('arabic_app_email', user.email);
  }
}

export function isAya() {
  return AppState.isAya;
}

export function hasCompletedPlacement() {
  return AppState.hasCompletedPlacement;
}

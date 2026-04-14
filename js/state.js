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
  loadPersonalVocab as dbLoadPersonalVocab,
  loadDynamicUnits as dbLoadDynamicUnits,
  // NEW: All comprehensive persistence functions
  savePlacementResults,
  loadPlacementResults,
  saveAITutorHistory,
  loadAITutorHistory,
  saveUserPreferences,
  loadUserPreferences,
  saveUserStats,
  loadUserStats,
  saveProductionProgress,
  loadProductionProgress,
  saveInterleavingConfig,
  loadInterleavingConfig
} from './database.js';

import { saveLocal, loadLocal, clearLocal } from './storage.js';
import { UNITS } from './data/units.js';
import { AYA_UNITS } from './data/aya-course.js';

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
  phrasesMastery: {},      // {phraseId: {attempts, correct, mastery, ...}}
  
  // Stage B: Focused Study
  focusedSessions: [],     // Array of session objects
  
  // Stage C: My Vocabulary
  personalVocab: [],       // Array of custom words
  
  // NEW: Comprehensive persistence
  placementResults: null,  // Placement test data
  aiTutorHistory: [],      // AI conversation messages
  preferences: {},         // User UI/UX preferences
  stats: {},               // Learning streaks, study time, achievements
  productionProgress: null,// Current output stage (recognition/multiple/etc)
  interleavingConfig: null,// Interleaving settings and thresholds
  
  // App state
  currentPage: 'loading',
  hasCompletedPlacement: false,
  
  // Dynamic units (generated for heritage/standard users)
  dynamicUnits: []
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
    AppState.dynamicUnits = localState.dynamicUnits || [];
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
  
  // NEW: Load comprehensive persistence data
  const { results: placementData } = await loadPlacementResults(userId);
  if (placementData) {
    AppState.placementResults = placementData;
    AppState.hasCompletedPlacement = true;
  }
  
  const { messages } = await loadAITutorHistory(userId);
  AppState.aiTutorHistory = messages || [];
  
  const { preferences } = await loadUserPreferences(userId);
  AppState.preferences = preferences || {};
  
  const { stats } = await loadUserStats(userId);
  AppState.stats = stats || {};
  
  const { progress: productionData } = await loadProductionProgress(userId);
  AppState.productionProgress = productionData || { current_stage: 'recognition', lessons_in_stage: 0 };
  
  const { config: interleavingData } = await loadInterleavingConfig(userId);
  AppState.interleavingConfig = interleavingData || { enabled: false, threshold_lessons: 5, threshold_mastery: 0.65 };
  
  // Load dynamic units (for heritage/standard users)
  const { units: dynUnits } = await dbLoadDynamicUnits(userId);
  AppState.dynamicUnits = dynUnits || [];
  
  // Cache to localStorage for offline access
  saveLocal('arabic_app_v3', {
    profile: AppState.profile,
    unitProgress: AppState.unitProgress,
    weakWords: AppState.weakWords,
    hasCompletedPlacement: AppState.hasCompletedPlacement,
    placementResults: AppState.placementResults,
    aiTutorHistory: AppState.aiTutorHistory,
    preferences: AppState.preferences,
    stats: AppState.stats,
    productionProgress: AppState.productionProgress,
    interleavingConfig: AppState.interleavingConfig,
    dynamicUnits: AppState.dynamicUnits
  });
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
    hasCompletedPlacement: AppState.hasCompletedPlacement,
    placementResults: AppState.placementResults,
    aiTutorHistory: AppState.aiTutorHistory,
    preferences: AppState.preferences,
    stats: AppState.stats,
    productionProgress: AppState.productionProgress,
    interleavingConfig: AppState.interleavingConfig,
    dynamicUnits: AppState.dynamicUnits
  });
  
  // If guest, don't save to Supabase
  if (AppState.isGuest || !AppState.user) {
    return;
  }
  
  // Save to Supabase (comprehensive persistence)
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
  
  // NEW: Save all comprehensive persistence data
  if (AppState.placementResults) {
    await savePlacementResults(userId, AppState.placementResults);
  }
  
  if (AppState.aiTutorHistory && AppState.aiTutorHistory.length > 0) {
    await saveAITutorHistory(userId, AppState.aiTutorHistory);
  }
  
  if (AppState.preferences && Object.keys(AppState.preferences).length > 0) {
    await saveUserPreferences(userId, AppState.preferences);
  }
  
  if (AppState.stats && Object.keys(AppState.stats).length > 0) {
    await saveUserStats(userId, AppState.stats);
  }
  
  if (AppState.productionProgress) {
    await saveProductionProgress(userId, AppState.productionProgress);
  }
  
  if (AppState.interleavingConfig) {
    await saveInterleavingConfig(userId, AppState.interleavingConfig);
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
  
  // NEW: Reset all new state properties
  AppState.placementResults = null;
  AppState.aiTutorHistory = [];
  AppState.preferences = {};
  AppState.stats = {};
  AppState.productionProgress = null;
  AppState.interleavingConfig = null;
  AppState.phrasesMastery = {};
  AppState.dynamicUnits = [];
  
  // Clear localStorage
  clearLocal('arabic_app_v3');
  clearLocal('arabic_app_email');
  clearLocal('arabic_pscores');
  clearLocal('arabic_placement_state');
  clearLocal('ai_tutor_history');
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

// ============================================================================
// AUTO-SYNC SYSTEM
// ============================================================================

let autoSaveTimer = null;

/**
 * Start automatic syncing to Supabase every 30 seconds
 */
export function startAutoSync() {
  if (autoSaveTimer) return; // Already running
  
  autoSaveTimer = setInterval(async () => {
    if (AppState.user && !AppState.isGuest) {
      await save();
      console.log('[AutoSync] State synced to Supabase');
    }
  }, 30000); // 30 seconds
  
  console.log('[AutoSync] Started - syncing every 30 seconds');
}

/**
 * Stop automatic syncing
 */
export function stopAutoSync() {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
    console.log('[AutoSync] Stopped');
  }
}

/**
 * Initialize auto-sync when DOM is ready
 * Called from app.js
 */
export function initAutoSync() {
  // Start auto-sync
  startAutoSync();
  
  // Save on page unload (best-effort)
  window.addEventListener('beforeunload', async () => {
    if (AppState.user && !AppState.isGuest) {
      // Use sendBeacon for reliable save on page close
      const stateSnapshot = {
        profile: AppState.profile,
        unitProgress: AppState.unitProgress,
        weakWords: AppState.weakWords,
        placementResults: AppState.placementResults,
        preferences: AppState.preferences,
        stats: AppState.stats,
        productionProgress: AppState.productionProgress,
        interleavingConfig: AppState.interleavingConfig
      };
      
      // Save to localStorage immediately (synchronous)
      saveLocal('arabic_app_v3', stateSnapshot);
    }
  });
}

// ============================================================================
// UNIT RESOLVER
// ============================================================================

/**
 * Get all available units for the current user
 * - Aya: static AYA_UNITS
 * - Beginner: static UNITS
 * - Heritage/Intermediate/Advanced: dynamic units from Supabase
 * @returns {Array} array of unit objects
 */
export function getAllUnits() {
  if (AppState.isAya) return AYA_UNITS;
  
  const speakerType = AppState.profile?.speaker_type;
  if (speakerType === 'beginner') return UNITS;
  
  // Heritage/intermediate/advanced: use dynamic units
  if (AppState.dynamicUnits && AppState.dynamicUnits.length > 0) {
    return AppState.dynamicUnits;
  }
  
  // No dynamic units yet — return empty (home screen will show placement prompt)
  return [];
}

/**
 * Check if user needs to generate units (heritage/standard with no dynamic units)
 */
export function needsUnitGeneration() {
  if (AppState.isAya) return false;
  const speakerType = AppState.profile?.speaker_type;
  if (speakerType === 'beginner') return false;
  
  // Heritage/intermediate need units generated after placement
  const hasPlacement = AppState.profile?.placementLevel !== undefined || 
                       AppState.profile?.placement_level !== undefined ||
                       AppState.hasCompletedPlacement;
  const hasUnits = AppState.dynamicUnits && AppState.dynamicUnits.length > 0;
  
  return hasPlacement && !hasUnits;
}

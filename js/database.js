/**
 * database.js - Complete Supabase database operations
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

let supabase = null;

export function initSupabase() {
  if (!supabase && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
}

export async function saveProfile(userId, profileData) {
  const sb = initSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('profiles').upsert({ email: userId, ...profileData }, { onConflict: 'email' }).select().single();
  if (error) { console.error('Save profile error:', error); return null; }
  return data;
}

export async function loadProfile(userId) {
  const sb = initSupabase();
  if (!sb) return { profile: null };
  const { data, error } = await sb.from('profiles').select('*').eq('email', userId).maybeSingle();
  if (error) { console.error('Load profile error:', error); return { profile: null }; }
  return { profile: data };
}

export async function saveUnitProgress(userId, unitId, progressData) {
  const sb = initSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('unit_progress').upsert({ email: userId, unit_id: unitId, ...progressData }, { onConflict: 'email,unit_id' }).select().single();
  if (error) { console.error('Save unit progress error:', error); return null; }
  return data;
}

export async function loadUnitProgress(userId) {
  const sb = initSupabase();
  if (!sb) return { progress: [] };
  const { data, error } = await sb.from('unit_progress').select('*').eq('email', userId);
  if (error) { console.error('Load unit progress error:', error); return { progress: [] }; }
  return { progress: data || [] };
}

export async function saveWeakWords(userId, weakWords) {
  const sb = initSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('weak_words').upsert({ email: userId, words: weakWords }, { onConflict: 'email' }).select().single();
  if (error) { console.error('Save weak words error:', error); return null; }
  return data;
}

export async function loadWeakWords(userId) {
  const sb = initSupabase();
  if (!sb) return { weakWords: [] };
  const { data, error } = await sb.from('weak_words').select('words').eq('email', userId).maybeSingle();
  if (error) { console.error('Load weak words error:', error); return { weakWords: [] }; }
  return { weakWords: data?.words || [] };
}

export async function checkSpecialCourse(email) {
  const sb = initSupabase();
  if (!sb) return { config: null };
  const { data, error } = await sb.from('special_courses').select('*').eq('email', email).maybeSingle();
  if (error) return { config: null };
  return { config: data };
}

export async function loadCheckpoints(userId) {
  const sb = initSupabase();
  if (!sb) return { checkpoints: [] };
  const { data, error } = await sb.from('checkpoints').select('*').eq('email', userId).order('created_at', { ascending: false });
  if (error) { console.error('Load checkpoints error:', error); return { checkpoints: [] }; }
  return { checkpoints: data || [] };
}

export async function saveFocusedSession(email, sessionData) {
  const sb = initSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('focused_sessions').insert({ email, ...sessionData }).select().single();
  if (error) { console.error('Save focused session error:', error); return null; }
  return data;
}

export async function loadFocusedSessions(userId) {
  const sb = initSupabase();
  if (!sb) return { sessions: [] };
  const { data, error } = await sb.from('focused_sessions').select('*').eq('email', userId).order('completed_at', { ascending: false });
  if (error) { console.error('Load focused sessions error:', error); return { sessions: [] }; }
  return { sessions: data || [] };
}

export async function savePersonalVocab(email, vocabData) {
  const sb = initSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('personal_vocab').insert({ email, ...vocabData }).select().single();
  if (error) { console.error('Save personal vocab error:', error); return null; }
  return data;
}

export async function loadPersonalVocab(userId) {
  const sb = initSupabase();
  if (!sb) return { words: [] };
  const { data, error } = await sb.from('personal_vocab').select('*').eq('email', userId).order('created_at', { ascending: false });
  if (error) { console.error('Load personal vocab error:', error); return { words: [] }; }
  return { words: data || [] };
}

export async function deletePersonalVocab(email, vocabId) {
  const sb = initSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('personal_vocab').delete().eq('id', vocabId).eq('email', email).select().single();
  if (error) { console.error('Delete personal vocab error:', error); return null; }
  return data;
}

export async function toggleVocabPoolOptIn(email, optIn) {
  const sb = initSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('profiles').update({ vocab_pool_opt_in: optIn }).eq('email', email).select().single();
  if (error) { console.error('Toggle vocab pool error:', error); return null; }
  return data;
}

export async function savePushSubscription(email, subscriptionData) {
  const sb = initSupabase();
  if (!sb) return null;
  const { data, error} = await sb.from('push_subscriptions').upsert({ email, ...subscriptionData }, { onConflict: 'email' }).select().single();
  if (error) { console.error('Save push subscription error:', error); return null; }
  return data;
}

// Mastery Score Functions
export async function loadPhrasesMastery(email) {
  const sb = initSupabase();
  if (!sb) return { mastery: {} };
  const { data, error } = await sb.from('phrases_mastery').select('*').eq('email', email);
  if (error) { console.error('Load mastery error:', error); return { mastery: {} }; }
  
  // Convert array to object keyed by phrase_id
  const masteryObj = {};
  (data || []).forEach(item => {
    masteryObj[item.phrase_id] = item;
  });
  return { mastery: masteryObj };
}

export async function savePhrasesMastery(email, phraseId, masteryData) {
  const sb = initSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('phrases_mastery')
    .upsert({ email, phrase_id: phraseId, ...masteryData }, { onConflict: 'email,phrase_id' })
    .select().single();
  if (error) { console.error('Save mastery error:', error); return null; }
  return data;
}

export async function updatePhraseMastery(email, phraseId, isCorrect) {
  const sb = initSupabase();
  if (!sb) return null;
  
  // Load existing mastery
  const { data: existing } = await sb.from('phrases_mastery').select('*').eq('email', email).eq('phrase_id', phraseId).maybeSingle();
  
  let attempts = (existing?.attempts || 0) + 1;
  let correct = (existing?.correct || 0) + (isCorrect ? 1 : 0);
  let recentHistory = existing?.recent_history || [];
  
  // Add to recent history (max 5)
  recentHistory.push(isCorrect);
  if (recentHistory.length > 5) recentHistory.shift();
  
  // Calculate mastery
  const baseMastery = (correct / attempts) * 100;
  const recentCorrect = recentHistory.filter(x => x === true).length;
  const recentMastery = (recentCorrect / recentHistory.length) * 100;
  
  // Time decay
  const lastReviewed = existing?.last_reviewed ? new Date(existing.last_reviewed) : new Date();
  const daysSince = Math.floor((new Date() - lastReviewed) / (1000 * 60 * 60 * 24));
  const decayPenalty = Math.min(20, Math.floor(daysSince / 7));
  
  const mastery = Math.max(0, Math.min(100, Math.round((baseMastery * 0.4) + (recentMastery * 0.6) - decayPenalty)));
  
  // Update streak
  const streak = isCorrect ? (existing?.streak || 0) + 1 : 0;
  
  // Upsert
  const { data, error } = await sb.from('phrases_mastery').upsert({
    email,
    phrase_id: phraseId,
    attempts,
    correct,
    mastery,
    recent_history: recentHistory,
    last_reviewed: new Date().toISOString(),
    streak
  }, { onConflict: 'email,phrase_id' }).select().single();
  
  if (error) { console.error('Update mastery error:', error); return null; }
  return data;
}

export async function getMasteryBand(mastery) {
  if (mastery >= 96) return { label: 'Mastered', emoji: '\uD83C\uDFC6', class: 'mastered' };
  if (mastery >= 81) return { label: 'Strong', emoji: '\uD83D\uDCAA', class: 'strong' };
  if (mastery >= 50) return { label: 'Familiar', emoji: '\uD83D\uDC4D', class: 'familiar' };
  return { label: 'Weak', emoji: '\u26A0\uFE0F', class: 'weak' };
}

// ============================================================================
// NEW TABLES - Placement, AI Tutor, Preferences, Stats, Production, Interleaving
// ============================================================================

// PLACEMENT TEST RESULTS
export async function savePlacementResults(userId, results) {
  const sb = initSupabase();
  if (!sb || !results) return null;
  
  const { data, error } = await sb
    .from('placement_test_results')
    .upsert({
      email: userId,
      level: results.level,
      score: results.score,
      test_data: results.testData,
      completed_at: results.completedAt || new Date().toISOString()
    }, { onConflict: 'email' })
    .select()
    .single();
  
  if (error) { console.error('Save placement error:', error); return null; }
  return data;
}

export async function loadPlacementResults(userId) {
  const sb = initSupabase();
  if (!sb) return { results: null };
  
  const { data, error } = await sb
    .from('placement_test_results')
    .select('*')
    .eq('email', userId)
    .maybeSingle();
  
  if (error) { console.error('Load placement error:', error); return { results: null }; }
  return { results: data };
}

// AI TUTOR SESSIONS
export async function saveAITutorHistory(userId, messages) {
  const sb = initSupabase();
  if (!sb || !messages || messages.length === 0) return null;
  
  const { data, error} = await sb
    .from('ai_tutor_sessions')
    .upsert({
      email: userId,
      messages: messages,
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' })
    .select()
    .single();
  
  if (error) { console.error('Save AI tutor error:', error); return null; }
  return data;
}

export async function loadAITutorHistory(userId) {
  const sb = initSupabase();
  if (!sb) return { messages: [] };
  
  const { data, error } = await sb
    .from('ai_tutor_sessions')
    .select('*')
    .eq('email', userId)
    .maybeSingle();
  
  if (error) { console.error('Load AI tutor error:', error); return { messages: [] }; }
  return { messages: data ? data.messages : [] };
}

// USER PREFERENCES
export async function saveUserPreferences(userId, preferences) {
  const sb = initSupabase();
  if (!sb || !preferences) return null;
  
  const { data, error } = await sb
    .from('user_preferences')
    .upsert({
      email: userId,
      ...preferences,
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' })
    .select()
    .single();
  
  if (error) { console.error('Save preferences error:', error); return null; }
  return data;
}

export async function loadUserPreferences(userId) {
  const sb = initSupabase();
  if (!sb) return { preferences: {} };
  
  const { data, error } = await sb
    .from('user_preferences')
    .select('*')
    .eq('email', userId)
    .maybeSingle();
  
  if (error) { console.error('Load preferences error:', error); return { preferences: {} }; }
  return { preferences: data || {} };
}

// USER STATS
export async function saveUserStats(userId, stats) {
  const sb = initSupabase();
  if (!sb || !stats) return null;
  
  const { data, error } = await sb
    .from('user_stats')
    .upsert({
      email: userId,
      ...stats,
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' })
    .select()
    .single();
  
  if (error) { console.error('Save stats error:', error); return null; }
  return data;
}

export async function loadUserStats(userId) {
  const sb = initSupabase();
  if (!sb) return { stats: {} };
  
  const { data, error } = await sb
    .from('user_stats')
    .select('*')
    .eq('email', userId)
    .maybeSingle();
  
  if (error) { console.error('Load stats error:', error); return { stats: {} }; }
  return { stats: data || {} };
}

// PRODUCTION PROGRESS
export async function saveProductionProgress(userId, progress) {
  const sb = initSupabase();
  if (!sb || !progress) return null;
  
  const { data, error } = await sb
    .from('production_progress')
    .upsert({
      email: userId,
      ...progress,
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' })
    .select()
    .single();
  
  if (error) { console.error('Save production progress error:', error); return null; }
  return data;
}

export async function loadProductionProgress(userId) {
  const sb = initSupabase();
  if (!sb) return { progress: null };
  
  const { data, error } = await sb
    .from('production_progress')
    .select('*')
    .eq('email', userId)
    .maybeSingle();
  
  if (error) { console.error('Load production progress error:', error); return { progress: null }; }
  return { progress: data };
}

// INTERLEAVING CONFIG
export async function saveInterleavingConfig(userId, config) {
  const sb = initSupabase();
  if (!sb || !config) return null;
  
  const { data, error } = await sb
    .from('interleaving_config')
    .upsert({
      email: userId,
      ...config,
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' })
    .select()
    .single();
  
  if (error) { console.error('Save interleaving config error:', error); return null; }
  return data;
}

export async function loadInterleavingConfig(userId) {
  const sb = initSupabase();
  if (!sb) return { config: null };
  
  const { data, error } = await sb
    .from('interleaving_config')
    .select('*')
    .eq('email', userId)
    .maybeSingle();
  
  if (error) { console.error('Load interleaving config error:', error); return { config: null }; }
  return { config: data };
}

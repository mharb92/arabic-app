/**
 * database.js
 * All Supabase operations - this is the ONLY file that calls supabase.from()
 * Dependencies: config.js
 */

import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

let supabase = null;

/**
 * Initialize Supabase client
 */
export function initSupabase() {
  if (!supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabase;
}

/**
 * Profile Operations
 */
export async function saveProfile(userId, profile) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ user_id: userId, ...profile });
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function loadProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) return { profile: null, error: error.message };
    return { profile: data, error: null };
  } catch (err) {
    return { profile: null, error: err.message };
  }
}

/**
 * Unit Progress Operations
 */
export async function saveUnitProgress(userId, unitId, progress) {
  try {
    const { data, error } = await supabase
      .from('unit_progress')
      .upsert({ 
        user_id: userId, 
        unit_id: unitId, 
        ...progress,
        updated_at: new Date().toISOString()
      });
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function loadUnitProgress(userId) {
  try {
    const { data, error } = await supabase
      .from('unit_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (error) return { progress: [], error: error.message };
    return { progress: data || [], error: null };
  } catch (err) {
    return { progress: [], error: err.message };
  }
}

/**
 * Weak Words Operations
 */
export async function saveWeakWords(userId, weakWords) {
  try {
    const { data, error } = await supabase
      .from('weak_words')
      .upsert({ 
        user_id: userId, 
        words: weakWords,
        updated_at: new Date().toISOString()
      });
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function loadWeakWords(userId) {
  try {
    const { data, error } = await supabase
      .from('weak_words')
      .select('words')
      .eq('user_id', userId)
      .single();
    
    if (error) return { weakWords: [], error: error.message };
    return { weakWords: data?.words || [], error: null };
  } catch (err) {
    return { weakWords: [], error: err.message };
  }
}

/**
 * Special Course Operations (Aya)
 */
export async function checkSpecialCourse(email) {
  try {
    const { data, error } = await supabase
      .from('special_courses')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error) return { config: null, error: error.message };
    return { config: data, error: null };
  } catch (err) {
    return { config: null, error: err.message };
  }
}

/**
 * Push Subscription Operations
 */
export async function savePushSubscription(userId, subscription, preferredTime, timezone) {
  try {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({ 
        user_id: userId,
        subscription: subscription,
        preferred_time: preferredTime,
        timezone: timezone,
        updated_at: new Date().toISOString()
      });
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Checkpoint Operations
 */
export async function saveCheckpoint(userId, checkpoint) {
  try {
    const { data, error } = await supabase
      .from('checkpoints')
      .insert({ 
        user_id: userId,
        ...checkpoint,
        created_at: new Date().toISOString()
      });
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function loadCheckpoints(userId) {
  try {
    const { data, error } = await supabase
      .from('checkpoints')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) return { checkpoints: [], error: error.message };
    return { checkpoints: data || [], error: null };
  } catch (err) {
    return { checkpoints: [], error: err.message };
  }
}

/**
 * Focused Session Operations (Stage B)
 */
export async function saveFocusedSession(userId, contextId, score) {
  try {
    const { data, error } = await supabase
      .from('focused_sessions')
      .insert({ 
        user_id: userId,
        context_id: contextId,
        score: score,
        completed_at: new Date().toISOString()
      });
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function loadFocusedSessions(userId) {
  try {
    const { data, error } = await supabase
      .from('focused_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
    
    if (error) return { sessions: [], error: error.message };
    return { sessions: data || [], error: null };
  } catch (err) {
    return { sessions: [], error: err.message };
  }
}

/**
 * Personal Vocabulary Operations (Stage C)
 */
export async function savePersonalVocab(userId, words) {
  try {
    const { data, error } = await supabase
      .from('personal_vocab')
      .upsert({ 
        user_id: userId,
        words: words,
        updated_at: new Date().toISOString()
      });
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function loadPersonalVocab(userId) {
  try {
    const { data, error } = await supabase
      .from('personal_vocab')
      .select('words')
      .eq('user_id', userId)
      .single();
    
    if (error) return { words: [], error: error.message };
    return { words: data?.words || [], error: null };
  } catch (err) {
    return { words: [], error: err.message };
  }
}

export async function toggleVocabPoolOptIn(userId, optedIn) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ vocab_pool_opt_in: optedIn })
      .eq('user_id', userId);
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

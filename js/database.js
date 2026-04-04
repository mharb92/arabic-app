/**
 * database.js - All Supabase database operations
 * Handles profiles, progress, vocab, focused sessions, and push subscriptions
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

let supabase = null;

/**
 * Initialize Supabase client
 */
export function initSupabase() {
  if (!supabase && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
}

/**
 * Save profile to Supabase
 */
export async function saveProfile(email, profileData) {
  const sb = initSupabase();
  if (!sb) return null;
  
  const { data, error } = await sb
    .from('profiles')
    .upsert({ email, ...profileData }, { onConflict: 'email' })
    .select()
    .single();
    
  if (error) {
    console.error('Save profile error:', error);
    return null;
  }
  
  return data;
}

/**
 * Load profile from Supabase
 */
export async function loadProfile(email) {
  const sb = initSupabase();
  if (!sb) return null;
  
  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
    
  if (error) {
    console.error('Load profile error:', error);
    return null;
  }
  
  return data;
}

/**
 * Save unit progress
 */
export async function saveUnitProgress(email, unitId, progressData) {
  const sb = initSupabase();
  if (!sb) return null;
  
  const { data, error } = await sb
    .from('unit_progress')
    .upsert({ email, unit_id: unitId, ...progressData }, { onConflict: 'email,unit_id' })
    .select()
    .single();
    
  if (error) {
    console.error('Save unit progress error:', error);
    return null;
  }
  
  return data;
}

/**
 * Load unit progress
 */
export async function loadUnitProgress(email) {
  const sb = initSupabase();
  if (!sb) return [];
  
  const { data, error } = await sb
    .from('unit_progress')
    .select('*')
    .eq('email', email);
    
  if (error) {
    console.error('Load unit progress error:', error);
    return [];
  }
  
  return data;
}

/**
 * Save weak words
 */
export async function saveWeakWords(email, weakWords) {
  const sb = initSupabase();
  if (!sb) return null;
  
  const { data, error } = await sb
    .from('weak_words')
    .upsert({ email, words: weakWords }, { onConflict: 'email' })
    .select()
    .single();
    
  if (error) {
    console.error('Save weak words error:', error);
    return null;
  }
  
  return data;
}

/**
 * Check if user has special course (Aya)
 */
export async function checkSpecialCourse(email) {
  const sb = initSupabase();
  if (!sb) return null;
  
  const { data, error } = await sb
    .from('special_courses')
    .select('*')
    .eq('email', email)
    .single();
    
  if (error) {
    return null;
  }
  
  return data;
}

/**
 * Save focused session (Stage B)
 */
export async function saveFocusedSession(email, sessionData) {
  const sb = initSupabase();
  if (!sb) return null;
  
  const { data, error } = await sb
    .from('focused_sessions')
    .insert({ email, ...sessionData })
    .select()
    .single();
    
  if (error) {
    console.error('Save focused session error:', error);
    return null;
  }
  
  return data;
}

/**
 * Load focused sessions (Stage B)
 */
export async function loadFocusedSessions(email) {
  const sb = initSupabase();
  if (!sb) return [];
  
  const { data, error } = await sb
    .from('focused_sessions')
    .select('*')
    .eq('email', email)
    .order('completed_at', { ascending: false });
    
  if (error) {
    console.error('Load focused sessions error:', error);
    return [];
  }
  
  return data;
}

/**
 * Save personal vocabulary (Stage C)
 */
export async function savePersonalVocab(email, vocabData) {
  const sb = initSupabase();
  if (!sb) return null;
  
  const { data, error } = await sb
    .from('personal_vocab')
    .insert({ email, ...vocabData })
    .select()
    .single();
    
  if (error) {
    console.error('Save personal vocab error:', error);
    return null;
  }
  
  return data;
}

/**
 * Load personal vocabulary (Stage C)
 */
export async function loadPersonalVocab(email) {
  const sb = initSupabase();
  if (!sb) return [];
  
  const { data, error } = await sb
    .from('personal_vocab')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Load personal vocab error:', error);
    return [];
  }
  
  return data;
}

/**
 * Delete personal vocabulary item (Stage C)
 */
export async function deletePersonalVocab(email, vocabId) {
  const sb = initSupabase();
  if (!sb) return null;
  
  const { data, error } = await sb
    .from('personal_vocab')
    .delete()
    .eq('id', vocabId)
    .eq('email', email)
    .select()
    .single();
    
  if (error) {
    console.error('Delete personal vocab error:', error);
    return null;
  }
  
  return data;
}

/**
 * Toggle vocabulary pool opt-in (Stage C)
 */
export async function toggleVocabPoolOptIn(email, optIn) {
  const sb = initSupabase();
  if (!sb) return null;
  
  const { data, error } = await sb
    .from('profiles')
    .update({ vocab_pool_opt_in: optIn })
    .eq('email', email)
    .select()
    .single();
    
  if (error) {
    console.error('Toggle vocab pool error:', error);
    return null;
  }
  
  return data;
}

/**
 * Save push subscription
 */
export async function savePushSubscription(email, subscriptionData) {
  const sb = initSupabase();
  if (!sb) return null;
  
  const { data, error } = await sb
    .from('push_subscriptions')
    .upsert({ email, ...subscriptionData }, { onConflict: 'email' })
    .select()
    .single();
    
  if (error) {
    console.error('Save push subscription error:', error);
    return null;
  }
  
  return data;
}

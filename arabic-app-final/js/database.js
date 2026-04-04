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
  const { data, error } = await sb.from('profiles').select('*').eq('email', userId).single();
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
  const { data, error } = await sb.from('weak_words').select('words').eq('email', userId).single();
  if (error) { console.error('Load weak words error:', error); return { weakWords: [] }; }
  return { weakWords: data?.words || [] };
}

export async function checkSpecialCourse(email) {
  const sb = initSupabase();
  if (!sb) return { config: null };
  const { data, error } = await sb.from('special_courses').select('*').eq('email', email).single();
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
  const { data, error } = await sb.from('push_subscriptions').upsert({ email, ...subscriptionData }, { onConflict: 'email' }).select().single();
  if (error) { console.error('Save push subscription error:', error); return null; }
  return data;
}

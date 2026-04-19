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

/**
 * Upsert multiple vocab words (deduplicates on user_email + arabic + english)
 * Used by lesson.js, focused-study.js, and placement-screen.js for auto-population
 */
export async function upsertPersonalVocab(email, vocabEntries) {
  const sb = initSupabase();
  if (!sb || !email || !vocabEntries || !vocabEntries.length) return null;

  const rows = vocabEntries.map(entry => ({
    email: email,
    arabic: entry.arabic,
    transliteration: entry.transliteration || entry.romanization || '',
    english: entry.english,
    mastery_score: entry.mastery_score !== undefined ? entry.mastery_score : 0,
    is_dialect: entry.is_dialect !== undefined ? entry.is_dialect : true,
    is_msa: entry.is_msa || false,
    source: entry.source || 'lesson'
  }));

  const { data, error } = await sb
    .from('personal_vocab')
    .upsert(rows, { onConflict: 'email,arabic,english', ignoreDuplicates: true });

  if (error) console.error('Upsert vocab error:', error);
  return data;
}

/**
 * Load phrase mastery scores for flashcard system
 */
export async function loadPhrasesMastery(email) {
  const sb = initSupabase();
  if (!sb || !email) return { mastery: {} };

  const { data, error } = await sb
    .from('personal_vocab')
    .select('arabic, mastery_score')
    .eq('email', email);

  if (error) { console.error('Load mastery error:', error); return { mastery: {} }; }

  const mastery = {};
  (data || []).forEach(row => {
    mastery[row.arabic] = { mastery: row.mastery_score || 0 };
  });
  return { mastery };
}

/**
 * Update mastery score for a single vocab entry
 */
export async function updatePhraseMastery(email, arabic, english, masteryScore) {
  const sb = initSupabase();
  if (!sb || !email) return null;

  const { data, error } = await sb
    .from('personal_vocab')
    .update({ mastery_score: masteryScore, updated_at: new Date().toISOString() })
    .eq('email', email)
    .eq('arabic', arabic)
    .select()
    .maybeSingle();

  if (error) console.error('Update mastery error:', error);
  return data;
}
// ============================================================================
// DICTIONARY, PHASE PLANS, LESSON PROGRESS — v2 Lesson Redesign
// ============================================================================

// DICTIONARY QUERIES

/**
 * Query dictionary for vocabulary pool (B++ approach)
 * Primary categories: full dump. Related categories: rank-filtered.
 * @param {string[]} primaryCategories - full dump for these categories
 * @param {string[]} relatedCategories - rank-filtered for these categories
 * @param {number} rankThreshold - max rank for related categories
 * @returns {Array} dictionary entries
 */
export async function queryDictionary(primaryCategories, relatedCategories, rankThreshold) {
  const sb = initSupabase();
  if (!sb) return [];

  const cols = 'id,rank,arabic,romanization,english,pos,category,root,conjugation,gender,dialect_tag,notes';
  let entries = [];

  // Primary: full dump
  if (primaryCategories && primaryCategories.length > 0) {
    const { data, error } = await sb
      .from('dictionary')
      .select(cols)
      .in('category', primaryCategories)
      .order('rank', { ascending: true });
    if (error) console.error('Dictionary primary query error:', error);
    else entries = entries.concat(data || []);
  }

  // Related: rank-filtered
  if (relatedCategories && relatedCategories.length > 0) {
    const { data, error } = await sb
      .from('dictionary')
      .select(cols)
      .in('category', relatedCategories)
      .lte('rank', rankThreshold || 500)
      .order('rank', { ascending: true })
      .limit(30);
    if (error) console.error('Dictionary related query error:', error);
    else entries = entries.concat(data || []);
  }

  // Deduplicate by id
  const seen = new Set();
  return entries.filter(e => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
}

/**
 * Get all unique category names from dictionary
 * Used by Focused Study "General Topics" mode
 */
export async function getDictionaryCategories() {
  const sb = initSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from('dictionary')
    .select('category')
    .order('category', { ascending: true });

  if (error) { console.error('Dictionary categories error:', error); return []; }
  return [...new Set((data || []).map(r => r.category))];
}

/**
 * Query dictionary by a single category (for Focused Study)
 */
export async function queryDictionaryByCategory(category) {
  const sb = initSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from('dictionary')
    .select('id,rank,arabic,romanization,english,pos,category,root,conjugation,gender,dialect_tag,notes')
    .eq('category', category)
    .order('rank', { ascending: true });

  if (error) { console.error('Dictionary category query error:', error); return []; }
  return data || [];
}

// PHASE PLANS

export async function savePhasePlan(email, plan) {
  const sb = initSupabase();
  if (!sb || !email || !plan) return null;

  const row = {
    phase_id: plan.phase_id,
    phase_number: plan.phase_number || parseInt(plan.phase_id?.replace('phase_', '')) || 1,
    user_email: email,
    start_date: plan.start_date || new Date().toISOString().split('T')[0],
    end_date: plan.end_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    day_90_goal: plan.day_90_goal || null,
    content_ratios: plan.content_ratios,
    weeks: plan.weeks,
    revised: plan.revised || false,
    revision_history: plan.revision_history || [],
    generated_at: plan.generated_at || new Date().toISOString()
  };

  const { data, error } = await sb
    .from('phase_plans')
    .upsert(row, { onConflict: 'user_email,phase_id' })
    .select()
    .single();

  if (error) { console.error('Save phase plan error:', error); return null; }
  return data;
}

export async function loadPhasePlan(email, phaseNumber) {
  const sb = initSupabase();
  if (!sb || !email) return null;

  const { data, error } = await sb
    .from('phase_plans')
    .select('*')
    .eq('user_email', email)
    .eq('phase_number', phaseNumber)
    .maybeSingle();

  if (error) { console.error('Load phase plan error:', error); return null; }
  return data;
}

export async function loadLatestPhasePlan(email) {
  const sb = initSupabase();
  if (!sb || !email) return null;

  const { data, error } = await sb
    .from('phase_plans')
    .select('*')
    .eq('user_email', email)
    .order('phase_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) { console.error('Load latest phase plan error:', error); return null; }
  return data;
}

// LESSON PROGRESS

export async function saveLessonProgress(email, progress) {
  const sb = initSupabase();
  if (!sb || !email || !progress) return null;

  const row = {
    lesson_id: progress.lesson_id,
    user_email: email,
    phase_id: progress.phase_id || null,
    week: progress.week || null,
    day_in_phase: progress.day_in_phase || null,
    theme: progress.theme || null,
    estimated_minutes: progress.estimated_minutes || null,
    is_remedial: progress.is_remedial || false,
    remedial_context: progress.remedial_context || null,
    lesson_content: progress.lesson_content || null,
    status: progress.status || 'not_started',
    current_block_index: progress.current_block_index || 0,
    block_results: progress.block_results || {},
    quiz_result: progress.quiz_result || null,
    started_at: progress.started_at || null,
    completed_at: progress.completed_at || null
  };

  const { data, error } = await sb
    .from('lesson_progress')
    .upsert(row, { onConflict: 'user_email,lesson_id' })
    .select()
    .single();

  if (error) { console.error('Save lesson progress error:', error); return null; }
  return data;
}

export async function loadLessonProgress(email, lessonId) {
  const sb = initSupabase();
  if (!sb || !email) return null;

  const { data, error } = await sb
    .from('lesson_progress')
    .select('*')
    .eq('user_email', email)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (error) { console.error('Load lesson progress error:', error); return null; }
  return data;
}

/**
 * Load the most recent unfinished lesson, or null if all done
 */
export async function loadCurrentLesson(email) {
  const sb = initSupabase();
  if (!sb || !email) return null;

  const { data, error } = await sb
    .from('lesson_progress')
    .select('*')
    .eq('user_email', email)
    .in('status', ['not_started', 'in_progress'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) { console.error('Load current lesson error:', error); return null; }
  return data;
}

/**
 * Count completed + mastered lessons for a phase
 */
export async function countLessonsInPhase(email, phaseId) {
  const sb = initSupabase();
  if (!sb || !email) return { total: 0, completed: 0, mastered: 0 };

  const { data, error } = await sb
    .from('lesson_progress')
    .select('status')
    .eq('user_email', email)
    .eq('phase_id', phaseId);

  if (error) { console.error('Count lessons error:', error); return { total: 0, completed: 0, mastered: 0 }; }
  const rows = data || [];
  return {
    total: rows.length,
    completed: rows.filter(r => r.status === 'completed' || r.status === 'mastered').length,
    mastered: rows.filter(r => r.status === 'mastered').length
  };
}

/**
 * Load last completed lesson's quiz result (for remedial detection)
 */
export async function loadLastQuizResult(email, phaseId) {
  const sb = initSupabase();
  if (!sb || !email) return null;

  const { data, error } = await sb
    .from('lesson_progress')
    .select('lesson_id, quiz_result, status')
    .eq('user_email', email)
    .eq('phase_id', phaseId)
    .not('quiz_result', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) { console.error('Load last quiz error:', error); return null; }
  return data;
}

// MASTERY — last_reviewed update

/**
 * Update mastery score AND last_reviewed timestamp
 */
export async function updateMasteryWithReview(email, arabic, english, correct, source) {
  const sb = initSupabase();
  if (!sb || !email) return null;

  // Calculate delta based on source
  let delta;
  if (source === 'ai_tutor') delta = correct ? 5 : 0;
  else delta = correct ? 15 : -10;

  // First load current score
  const { data: current } = await sb
    .from('personal_vocab')
    .select('mastery_score')
    .eq('email', email)
    .eq('arabic', arabic)
    .maybeSingle();

  const currentScore = current?.mastery_score || 0;
  const newScore = Math.max(0, Math.min(100, currentScore + delta));

  const { data, error } = await sb
    .from('personal_vocab')
    .update({
      mastery_score: newScore,
      last_reviewed: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('email', email)
    .eq('arabic', arabic)
    .select()
    .maybeSingle();

  if (error) console.error('Update mastery error:', error);
  return data;
}

/**
 * Load vocab with effective mastery (time decay applied)
 * Returns words grouped by mastery level for generation prompts
 */
export async function loadMasteryForGeneration(email) {
  const sb = initSupabase();
  if (!sb || !email) return { mastered: [], reinforcing: [], weak: [] };

  const { data, error } = await sb
    .from('personal_vocab')
    .select('arabic, english, mastery_score, last_reviewed')
    .eq('email', email);

  if (error) { console.error('Load mastery for gen error:', error); return { mastered: [], reinforcing: [], weak: [] }; }

  const now = Date.now();
  const mastered = [];
  const reinforcing = [];
  const weak = [];

  for (const row of (data || [])) {
    const daysSince = row.last_reviewed
      ? (now - new Date(row.last_reviewed).getTime()) / 86400000
      : 30;
    const effective = Math.max(0, (row.mastery_score || 0) - (daysSince * 2));

    const entry = { arabic: row.arabic, english: row.english, effective };
    if (effective > 80) mastered.push(entry);
    else if (effective >= 30) reinforcing.push(entry);
    else weak.push(entry);
  }

  return { mastered, reinforcing, weak };
}

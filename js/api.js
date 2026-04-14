/**
 * api.js - API utility functions
 * Legacy compatibility stub — main Claude calls go through Supabase Edge Function
 */

import { EDGE_FUNCTION_URL, SUPABASE_ANON_KEY, CLAUDE_MODEL, MAX_TOKENS } from './config.js';

/**
 * Call Claude API via Edge Function
 */
export async function callClaude(systemPrompt, userMessage, maxTokens = MAX_TOKENS) {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  return data.content?.[0]?.text || data.response || '';
}

/**
 * Evaluate placement answer (legacy)
 */
export async function evaluatePlacement(question, userAnswer) {
  const prompt = `Is "${userAnswer}" a correct or close translation of the Arabic "${question.prompt || question.arabic}"? 
  The expected answer is "${question.answer || question.english}".
  Reply with just "correct" or "incorrect".`;
  const result = await callClaude('You are a concise Arabic language evaluator.', prompt, 50);
  return result.toLowerCase().includes('correct');
}

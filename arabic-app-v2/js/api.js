/**
 * api.js
 * All Claude API calls via Supabase Edge Function proxy
 * CRITICAL: Never includes API key - always goes through Edge Function
 * Dependencies: config.js
 */

import { API_ENDPOINT, API_MODEL } from './config.js';

/**
 * Generic Claude API call
 * @param {Array} messages - Array of message objects {role, content}
 * @param {String} systemPrompt - System prompt for Claude
 * @param {Number} maxTokens - Max tokens for response
 * @returns {Object} Claude's response or error
 */
export async function callClaude(messages, systemPrompt = '', maxTokens = 1000) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: API_MODEL,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return { response: data, error: null };
  } catch (err) {
    return { response: null, error: err.message };
  }
}

/**
 * Generate a dynamic unit based on user level and goals
 * @param {String} level - User's assessed level (beginner, intermediate, advanced)
 * @param {Array} goals - Array of user's learning goals
 * @returns {Object} Generated unit with phrases
 */
export async function generateUnit(level, goals) {
  const systemPrompt = `You are an expert Palestinian Arabic teacher. Generate a focused unit of 10-15 phrases.
Level: ${level}
Goals: ${goals.join(', ')}

Return ONLY valid JSON with this structure:
{
  "title": "Unit title",
  "phrases": [
    {"en": "English", "ar": "Arabic script", "ro": "romanization", "note": "cultural context"}
  ]
}`;

  const messages = [
    { role: 'user', content: 'Generate the unit now.' }
  ];

  const { response, error } = await callClaude(messages, systemPrompt, 1500);
  
  if (error) return { unit: null, error };
  
  try {
    // Extract JSON from response
    const text = response.content?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return { unit: null, error: 'No JSON found in response' };
    }
    
    const unit = JSON.parse(jsonMatch[0]);
    return { unit, error: null };
  } catch (err) {
    return { unit: null, error: 'Failed to parse generated unit' };
  }
}

/**
 * Evaluate a placement test answer
 * @param {Object} question - The placement question
 * @param {String} userAnswer - User's answer
 * @returns {Object} {correct: boolean, feedback: string}
 */
export async function evaluatePlacement(question, userAnswer) {
  const systemPrompt = `You are evaluating Arabic language proficiency.
Question type: ${question.type}
Expected answer: ${question.correct}

Evaluate if the user's answer is correct. Return ONLY valid JSON:
{"correct": true/false, "feedback": "brief explanation"}`;

  const messages = [
    { 
      role: 'user', 
      content: `Question: ${question.question}\nUser answered: ${userAnswer}` 
    }
  ];

  const { response, error } = await callClaude(messages, systemPrompt, 300);
  
  if (error) return { correct: false, feedback: 'Evaluation failed' };
  
  try {
    const text = response.content?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return { correct: false, feedback: 'Could not evaluate' };
    }
    
    const result = JSON.parse(jsonMatch[0]);
    return result;
  } catch (err) {
    return { correct: false, feedback: 'Evaluation error' };
  }
}

/**
 * Generate a checkpoint conversation (Day 30/60/90)
 * @param {String} userId - User ID
 * @param {Array} unitsSoFar - Units completed so far
 * @param {Number} weekNumber - Which checkpoint (30/60/90 days)
 * @returns {Object} Generated checkpoint conversation
 */
export async function generateCheckpoint(userId, unitsSoFar, weekNumber) {
  const systemPrompt = `You are a supportive Arabic teacher conducting a ${weekNumber}-day check-in.
The student has completed ${unitsSoFar.length} units.

Have a warm, encouraging conversation asking:
1. How they're feeling about their progress
2. What's been challenging
3. What they're most proud of
4. Adjust difficulty if needed

Keep it conversational and supportive.`;

  const messages = [
    { 
      role: 'user', 
      content: `Start the ${weekNumber}-day checkpoint conversation.` 
    }
  ];

  const { response, error } = await callClaude(messages, systemPrompt, 800);
  
  if (error) return { conversation: null, error };
  
  const text = response.content?.[0]?.text || 'How has your Arabic journey been so far?';
  return { conversation: text, error: null };
}

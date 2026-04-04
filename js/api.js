import { EDGE_FUNCTION_URL, CLAUDE_MODEL, MAX_TOKENS } from './config.js';
export async function callClaude(messages, systemPrompt = '') {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: MAX_TOKENS, system: systemPrompt, messages })
  });
  if (!response.ok) throw new Error(`API call failed: ${response.status}`);
  const data = await response.json();
  return data.content[0].text;
}
export async function evaluatePlacement(answers, goals) {
  const messages = [{ role: 'user', content: `Evaluate placement test results for goals: ${goals}` }];
  const result = await callClaude(messages, 'You are an Arabic language placement evaluator.');
  return { feedback: result };
}

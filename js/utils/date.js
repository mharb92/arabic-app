/**
 * utils/date.js
 * Date utilities for Aya's June 5 countdown
 * Dependencies: config.js
 */

import { JUNE_5_2026 } from '../config.js';

/**
 * Calculate days until June 5, 2026
 * @returns {Number} Days remaining (negative if date has passed)
 */
export function daysUntilJune5() {
  const now = new Date();
  const target = new Date(JUNE_5_2026);
  
  // Reset to midnight for accurate day count
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Check if June 5 has passed
 * @returns {Boolean} True if date has passed
 */
export function hasJune5Passed() {
  return daysUntilJune5() < 0;
}

/**
 * Format countdown message for Aya
 * @returns {String} Formatted message
 */
export function getCountdownMessage() {
  const days = daysUntilJune5();
  
  if (days < 0) {
    return 'Hope the visit went beautifully! 💚';
  }
  
  if (days === 0) {
    return 'Today\'s the day! يَلَّا! 🎉';
  }
  
  if (days === 1) {
    return 'One more day! You\'re ready. 💚';
  }
  
  return `${days} days until you meet the family 💚`;
}

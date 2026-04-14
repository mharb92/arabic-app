import { JUNE_5_2026 } from '../config.js';
export function daysUntilJune5() {
  const today = new Date();
  const diff = JUNE_5_2026 - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
export function getCountdownMessage() {
  const days = daysUntilJune5();
  if (days < 0) return 'The visit has passed!';
  if (days === 0) return 'Today is the day! 💚';
  if (days === 1) return 'Tomorrow! 💚';
  if (days <= 7) return `${days} days until you meet the family 💚`;
  if (days <= 30) return `${days} days until Palestine`;
  return `${days} days to prepare`;
}

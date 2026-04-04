/**
 * utils/rtl.js
 * RTL (Right-to-Left) utilities for Arabic text
 * NO dependencies
 */

/**
 * Detect if text contains Arabic characters
 * @param {String} text - Text to check
 * @returns {Boolean} True if text contains Arabic
 */
export function containsArabic(text) {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text);
}

/**
 * Set input direction based on content
 * Call this on input/textarea elements as user types
 * @param {HTMLElement} element - Input or textarea element
 */
export function handleInputDirection(element) {
  if (!element) return;
  
  const text = element.value;
  
  if (containsArabic(text)) {
    element.dir = 'rtl';
    element.style.textAlign = 'right';
  } else {
    element.dir = 'ltr';
    element.style.textAlign = 'left';
  }
}

/**
 * Auto-detect and set direction for an element
 * Useful for displaying user-generated content
 * @param {HTMLElement} element - Element to set direction
 * @param {String} text - Text content
 */
export function setTextDirection(element, text) {
  if (!element) return;
  
  if (containsArabic(text)) {
    element.dir = 'rtl';
  } else {
    element.dir = 'ltr';
  }
}

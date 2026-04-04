/**
 * storage.js
 * localStorage wrapper for guest mode and caching
 * NO dependencies
 */

/**
 * Save data to localStorage
 * @param {String} key - Storage key
 * @param {Any} value - Value to store (will be JSON stringified)
 */
export function saveLocal(key, value) {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (err) {
    // Handle quota exceeded or private browsing
    console.warn(`localStorage save failed for ${key}:`, err.message);
  }
}

/**
 * Load data from localStorage
 * @param {String} key - Storage key
 * @param {Any} defaultValue - Default value if key doesn't exist
 * @returns {Any} Parsed value or defaultValue
 */
export function loadLocal(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`localStorage load failed for ${key}:`, err.message);
    return defaultValue;
  }
}

/**
 * Clear data from localStorage
 * @param {String} key - Storage key to remove
 */
export function clearLocal(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`localStorage clear failed for ${key}:`, err.message);
  }
}

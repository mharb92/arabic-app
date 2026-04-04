/**
 * storage.js - localStorage wrapper
 */

export function saveLocal(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('localStorage save error:', error);
    return false;
  }
}

export function loadLocal(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('localStorage load error:', error);
    return defaultValue;
  }
}

export function clearLocal(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('localStorage clear error:', error);
    return false;
  }
}

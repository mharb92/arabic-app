/**
 * utils/audio.js
 * Audio utilities - currently uses Web Speech API
 * Can be swapped out for ElevenLabs or other providers later
 * NO dependencies
 */

/**
 * Speak Arabic text using Web Speech API
 * @param {String} text - Arabic text to speak
 * @param {Number} rate - Speech rate (0.1 to 2.0, default 0.75 for clarity)
 */
export function speakArabic(text, rate = 0.75) {
  if (!window.speechSynthesis) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-SA'; // Arabic (Saudi) - closest to Palestinian
  utterance.rate = rate;
  utterance.pitch = 1.0;
  
  window.speechSynthesis.speak(utterance);
}

/**
 * Stop any ongoing speech
 */
export function stopSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if speech synthesis is available
 * @returns {Boolean} True if available
 */
export function isSpeechAvailable() {
  return 'speechSynthesis' in window;
}

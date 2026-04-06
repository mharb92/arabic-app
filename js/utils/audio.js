/**
 * audio.js - Arabic TTS with ElevenLabs + Web Speech fallback
 * Imports keys from config.js, uses in-memory cache (fixes blob URL bug)
 */

import { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID } from '../config.js';

// In-memory audio cache (session-scoped, not persisted — fixes the blob URL stale cache bug)
const audioCache = new Map();

/**
 * Speak Arabic text. Tries ElevenLabs first, falls back to Web Speech API.
 */
export async function speakArabic(text, useElevenLabs = true) {
  if (!text || typeof text !== 'string') return;

  // Check in-memory cache (blob, not URL string)
  const cached = audioCache.get(text);
  if (cached) {
    playBlob(cached);
    return;
  }

  // Try ElevenLabs
  if (useElevenLabs && ELEVENLABS_API_KEY) {
    try {
      const response = await fetch(
        'https://api.elevenlabs.io/v1/text-to-speech/' + ELEVENLABS_VOICE_ID,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: { stability: 0.5, similarity_boost: 0.75 }
          })
        }
      );

      if (!response.ok) {
        console.warn('ElevenLabs ' + response.status + ', using Web Speech fallback');
        webSpeechSpeak(text);
        return;
      }

      const blob = await response.blob();
      audioCache.set(text, blob);   // cache the blob, not a blob URL
      playBlob(blob);
      return;
    } catch (err) {
      console.warn('ElevenLabs error, using Web Speech fallback:', err.message);
    }
  }

  webSpeechSpeak(text);
}

function playBlob(blob) {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.onended = () => URL.revokeObjectURL(url);
  audio.onerror = () => URL.revokeObjectURL(url);
  audio.play().catch(e => {
    console.warn('Audio playback error:', e.message);
    URL.revokeObjectURL(url);
  });
}

function webSpeechSpeak(text) {
  if (!window.speechSynthesis) {
    console.warn('Speech synthesis not supported');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-SA';
  utterance.rate = 0.75;
  window.speechSynthesis.speak(utterance);
}

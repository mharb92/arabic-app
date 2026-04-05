/**
 * audio.js - Audio playback utility
 * ElevenLabs TTS with localStorage caching + Web Speech fallback
 */

const ELEVENLABS_API_KEY = 'sk_8dd17de9180b9fb1f3fb06fab8055324567445299cd0910b';
const ELEVENLABS_VOICE_ID = 'IYnFszSKzmym2OstwHS0';
const AUDIO_CACHE_KEY = 'elevenlabs_audio_cache';

/**
 * Speak Arabic text using ElevenLabs (with caching) or Web Speech fallback
 */
export async function speakArabic(text, forceElevenLabs = true) {
  // Check cache first
  const cached = getFromCache(text);
  if (cached) {
    playAudio(cached);
    return;
  }
  
  // Try ElevenLabs
  if (forceElevenLabs && ELEVENLABS_API_KEY) {
    try {
      const audioUrl = await elevenLabsSpeak(text);
      saveToCache(text, audioUrl);
      playAudio(audioUrl);
      return;
    } catch (error) {
      console.error('ElevenLabs error, falling back to Web Speech:', error);
    }
  }
  
  // Fallback: Web Speech API
  webSpeechSpeak(text);
}

/**
 * Generate speech using ElevenLabs API
 */
async function elevenLabsSpeak(text) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
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
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    }
  );
  
  if (!response.ok) {
    throw new Error(`ElevenLabs API failed: ${response.status}`);
  }
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/**
 * Get audio from localStorage cache
 */
function getFromCache(text) {
  try {
    const cache = JSON.parse(localStorage.getItem(AUDIO_CACHE_KEY) || '{}');
    return cache[text] || null;
  } catch (e) {
    return null;
  }
}

/**
 * Save audio URL to localStorage cache
 */
function saveToCache(text, audioUrl) {
  try {
    const cache = JSON.parse(localStorage.getItem(AUDIO_CACHE_KEY) || '{}');
    cache[text] = audioUrl;
    localStorage.setItem(AUDIO_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Could not cache audio:', e);
  }
}

/**
 * Play audio from URL
 */
function playAudio(url) {
  const audio = new Audio(url);
  audio.play().catch(e => console.error('Audio playback error:', e));
}

/**
 * Fallback: Web Speech API
 */
function webSpeechSpeak(text) {
  if (!window.speechSynthesis) {
    console.warn('Speech synthesis not supported');
    return;
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-SA';
  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
}

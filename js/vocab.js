/**
 * vocab.js - Vocabulary browser
 * Browse and search all learned phrases
 */

import { AppState, save, getAllUnits } from './state.js';
import { speakArabic } from './utils/audio.js';

let searchQuery = '';
let filteredPhrases = [];

/**
 * Render vocabulary browser
 */
export function renderVocabScreen(container) {
  const units = getAllUnits();
  const allPhrases = getAllPhrases(units);
  
  filteredPhrases = searchQuery ? 
    allPhrases.filter(p => matchesSearch(p, searchQuery)) : 
    allPhrases;
  
  container.innerHTML = `
    <div class="vocab-screen">
      <!-- Header -->
      <div class="vocab-header">
        <button class="btn-back" id="back-btn">← Back</button>
        <h2>Vocabulary</h2>
      </div>
      
      <!-- Search -->
      <div class="vocab-search">
        <input 
          type="text" 
          id="search-input" 
          class="search-input" 
          placeholder="Search phrases..."
          value="${searchQuery}"
        />
      </div>
      
      <!-- Stats -->
      <div class="vocab-stats">
        <p>Showing ${filteredPhrases.length} of ${allPhrases.length} phrases</p>
      </div>
      
      <!-- Phrase List -->
      <div class="vocab-list">
        ${filteredPhrases.length === 0 ? `
          <div class="empty-state">
            <p>No phrases found</p>
          </div>
        ` : filteredPhrases.map((phrase, index) => `
          <div class="vocab-item" data-index="${index}">
            <div class="vocab-arabic" dir="rtl">
              ${phrase.ar || phrase.arabic}
            </div>
            <div class="vocab-english">
              ${phrase.en || phrase.english}
            </div>
            <button class="vocab-audio" data-index="${index}">🔊</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  attachVocabListeners(container);
}

/**
 * Attach event listeners
 */
function attachVocabListeners(container) {
  // Back button
  const backBtn = container.querySelector('#back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('home'));
    });
  }
  
  // Search input
  const searchInput = container.querySelector('#search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderVocabScreen(container);
    });
  }
  
  // Audio buttons
  const audioButtons = container.querySelectorAll('.vocab-audio');
  audioButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      const phrase = filteredPhrases[index];
      if (phrase) {
        speakArabic(phrase.ar || phrase.arabic);
      }
    });
  });
}

/**
 * Get all phrases from units
 */
function getAllPhrases(units) {
  const phrases = [];
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    for (let j = 0; j < unit.phrases.length; j++) {
      phrases.push({
        ...unit.phrases[j],
        unitIndex: i,
        phraseIndex: j
      });
    }
  }
  return phrases;
}

/**
 * Check if phrase matches search query
 */
function matchesSearch(phrase, query) {
  const q = query.toLowerCase();
  const arabic = (phrase.ar || phrase.arabic || '').toLowerCase();
  const english = (phrase.en || phrase.english || '').toLowerCase();
  const romanization = (phrase.rom || phrase.romanization || '').toLowerCase();
  
  return arabic.includes(q) || 
         english.includes(q) || 
         romanization.includes(q);
}

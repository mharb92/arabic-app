/**
 * alphabet-screen.js - Arabic alphabet learning
 * Named with -screen suffix to avoid collision with data/alphabet.js
 */

import { AppState } from './state.js';
import { ALPHABET_DATA } from './data/alphabet.js';
import { speakArabic } from './utils/audio.js';

let selectedLetter = null;

/**
 * Render alphabet screen
 */
export function renderAlphabetScreen(container) {
  container.innerHTML = `
    <div class="alphabet-screen">
      <!-- Header -->
      <div class="alphabet-header">
        <button class="btn-back" id="back-btn">← Back</button>
        <h2>Arabic Alphabet</h2>
      </div>
      
      <!-- Letter Grid -->
      <div class="alphabet-grid">
        ${ALPHABET_DATA.map((letter, index) => `
          <button class="alphabet-letter" data-index="${index}">
            <div class="letter-arabic" dir="rtl">${letter.letter}</div>
            <div class="letter-name">${letter.name}</div>
          </button>
        `).join('')}
      </div>
      
      <!-- Letter Detail (shown when letter selected) -->
      <div id="letter-detail" class="letter-detail" style="display: none;">
        <!-- Populated when letter is clicked -->
      </div>
    </div>
  `;
  
  attachAlphabetListeners(container);
}

/**
 * Attach event listeners
 */
function attachAlphabetListeners(container) {
  // Back button
  const backBtn = container.querySelector('#back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('home'));
    });
  }
  
  // Letter buttons
  const letterButtons = container.querySelectorAll('.alphabet-letter');
  letterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      showLetterDetail(container, index);
    });
  });
}

/**
 * Show letter detail panel
 */
function showLetterDetail(container, index) {
  const letter = ALPHABET_DATA[index];
  selectedLetter = letter;
  
  const detailPanel = container.querySelector('#letter-detail');
  if (!detailPanel) return;
  
  detailPanel.innerHTML = `
    <div class="detail-content">
      <!-- Large Letter -->
      <div class="detail-letter" dir="rtl">
        ${letter.letter}
        <button class="audio-btn" id="letter-audio">🔊</button>
      </div>
      
      <!-- Letter Info -->
      <div class="detail-info">
        <h3>${letter.name}</h3>
        ${letter.transliteration ? `
          <p class="transliteration">${letter.transliteration}</p>
        ` : ''}
      </div>
      
      <!-- Forms -->
      ${letter.forms ? `
        <div class="letter-forms">
          <h4>Letter Forms</h4>
          <div class="forms-grid">
            ${letter.forms.isolated ? `
              <div class="form-item">
                <div class="form-label">Isolated</div>
                <div class="form-letter" dir="rtl">${letter.forms.isolated}</div>
              </div>
            ` : ''}
            ${letter.forms.initial ? `
              <div class="form-item">
                <div class="form-label">Initial</div>
                <div class="form-letter" dir="rtl">${letter.forms.initial}</div>
              </div>
            ` : ''}
            ${letter.forms.medial ? `
              <div class="form-item">
                <div class="form-label">Medial</div>
                <div class="form-letter" dir="rtl">${letter.forms.medial}</div>
              </div>
            ` : ''}
            ${letter.forms.final ? `
              <div class="form-item">
                <div class="form-label">Final</div>
                <div class="form-letter" dir="rtl">${letter.forms.final}</div>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}
      
      <!-- Example -->
      ${letter.example ? `
        <div class="letter-example">
          <h4>Example</h4>
          <div class="example-word" dir="rtl">
            ${letter.example.arabic}
            <button class="audio-btn" id="example-audio">🔊</button>
          </div>
          <div class="example-meaning">${letter.example.meaning}</div>
        </div>
      ` : ''}
      
      <!-- Close Button -->
      <button class="btn-secondary" id="close-detail">Close</button>
    </div>
  `;
  
  detailPanel.style.display = 'block';
  
  // Attach detail listeners
  const letterAudioBtn = detailPanel.querySelector('#letter-audio');
  if (letterAudioBtn) {
    letterAudioBtn.addEventListener('click', () => {
      speakArabic(letter.letter);
    });
  }
  
  const exampleAudioBtn = detailPanel.querySelector('#example-audio');
  if (exampleAudioBtn && letter.example) {
    exampleAudioBtn.addEventListener('click', () => {
      speakArabic(letter.example.arabic);
    });
  }
  
  const closeBtn = detailPanel.querySelector('#close-detail');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      detailPanel.style.display = 'none';
      selectedLetter = null;
    });
  }
}

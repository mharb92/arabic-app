/**
 * flashcards.js - Spaced repetition flashcard system with Hoopoe design
 * Hoopoe flashcard styling, flip button, audio button
 */

import { AppState, save, getAllUnits } from './state.js';
import { speakArabic } from './utils/audio.js';
import { showToast } from './utils/ui.js';

let flashcardDeck = [];
let currentCardIndex = 0;
let isFlipped = false;
let studyMode = 'weak_to_strong';

export function renderFlashcardsScreen(container) {
  const units = getAllUnits();

  // Build deck from current unit phrases
  flashcardDeck = buildSimpleDeck(units);

  currentCardIndex = 0;
  isFlipped = false;

  if (flashcardDeck.length === 0) {
    renderEmpty(container);
    return;
  }

  renderModeSelector(container);
}

function buildSimpleDeck(units) {
  const progress = AppState.unitProgress || {};
  let currentUnitIndex = 0;
  for (let i = 0; i < units.length; i++) {
    const unitId = units[i].id;
    if (!progress[unitId] || !progress[unitId].mastered) {
      currentUnitIndex = i;
      break;
    }
  }
  return units[currentUnitIndex].phrases.slice(0, 20).map((p, i) => ({
    ...p,
    phraseId: 'unit' + (currentUnitIndex + 1) + '_phrase' + i
  }));
}

function renderModeSelector(container) {
  container.innerHTML = `
    <div style="min-height:100dvh;background:var(--cream);display:flex;flex-direction:column;">
      <div style="padding:16px 20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border-light);">
        <button id="back-btn" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text);">&#x2190;</button>
        <h2 style="margin:0;font-family:var(--font-display);font-size:20px;">Flashcards</h2>
      </div>
      <div style="padding:20px;flex:1;overflow-y:auto;">
        <p style="color:var(--text-soft);margin-bottom:20px;">Choose your study mode</p>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <button class="mode-btn" data-mode="weak_to_strong" style="padding:20px;border:2px solid var(--green);border-radius:var(--radius-lg);background:var(--green-light);cursor:pointer;text-align:left;position:relative;">
            <div style="font-weight:600;font-size:16px;color:var(--green-dark);">&#x1F4AA; Weak &#x2192; Strong</div>
            <div style="font-size:14px;color:var(--text-soft);margin-top:4px;">Prioritize struggling words first</div>
            <span style="position:absolute;top:10px;right:12px;background:var(--green);color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;text-transform:uppercase;">Recommended</span>
          </button>
          <button class="mode-btn" data-mode="all" style="padding:20px;border:2px solid var(--border);border-radius:var(--radius-lg);background:var(--cream);cursor:pointer;text-align:left;">
            <div style="font-weight:600;font-size:16px;">&#x1F4DA; All Words</div>
            <div style="font-size:14px;color:var(--text-soft);margin-top:4px;">Full review of all phrases</div>
          </button>
          <button class="mode-btn" data-mode="weak_only" style="padding:20px;border:2px solid var(--border);border-radius:var(--radius-lg);background:var(--cream);cursor:pointer;text-align:left;">
            <div style="font-weight:600;font-size:16px;">&#x26A0;&#xFE0F; Weak Words Only</div>
            <div style="font-size:14px;color:var(--text-soft);margin-top:4px;">Focus on phrases below 50% mastery</div>
          </button>
        </div>
      </div>
    </div>
  `;
  container.querySelector('#back-btn').addEventListener('click', () => {
    import('./router.js').then(({ navigateTo }) => navigateTo('home'));
  });
  container.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      studyMode = btn.dataset.mode;
      renderCard(container);
    });
  });
}

function renderEmpty(container) {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100dvh;padding:32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:16px;">&#x1F4DA;</div>
      <h2>No cards to review</h2>
      <p style="color:var(--text-soft);">Complete some lessons to build your flashcard deck!</p>
      <button class="btn-primary" id="home-btn" style="margin-top:24px;padding:14px 32px;">Back to Home</button>
    </div>
  `;
  container.querySelector('#home-btn').addEventListener('click', () => {
    import('./router.js').then(({ navigateTo }) => navigateTo('home'));
  });
}

function renderCard(container) {
  if (!flashcardDeck || flashcardDeck.length === 0) { renderEmpty(container); return; }

  const card = flashcardDeck[currentCardIndex];
  const arabic = card.ar || card.arabic || '';
  const english = card.en || card.english || '';
  const roman = card.rom || card.roman || card.transliteration || card.romanization || '';
  const progress = ((currentCardIndex + 1) / flashcardDeck.length) * 100;

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100dvh;background:var(--cream);">
      <!-- Header -->
      <div style="padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light);">
        <button id="back-btn" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text);">&#x2190;</button>
        <span style="font-family:var(--font-display);font-size:16px;color:var(--text-soft);">
          ${currentCardIndex + 1} / ${flashcardDeck.length}
        </span>
        <div></div>
      </div>

      <!-- Progress bar -->
      <div style="height:4px;background:var(--border);overflow:hidden;">
        <div style="height:100%;background:var(--gold);width:${progress}%;transition:width 0.3s;"></div>
      </div>

      <!-- Card area -->
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;">
        <div class="hoopoe-flashcard" style="width:min(90vw, 400px);">
          ${!isFlipped ? `
            <!-- Front: Arabic + transliteration -->
            <div class="arabic" style="font-family:var(--font-arabic);font-size:36px;direction:rtl;text-align:center;margin-bottom:12px;position:relative;z-index:1;">${arabic}</div>
            ${roman ? '<div class="transliteration" style="position:relative;z-index:1;">' + roman + '</div>' : ''}
            <div style="margin-top:20px;color:var(--text-soft);font-size:13px;position:relative;z-index:1;">Tap flip to reveal meaning</div>
          ` : `
            <!-- Back: English meaning -->
            <div class="english" style="font-size:22px;font-weight:500;margin-bottom:12px;position:relative;z-index:1;">${english}</div>
            <div style="font-family:var(--font-arabic);font-size:22px;direction:rtl;color:var(--text-soft);position:relative;z-index:1;">${arabic}</div>
          `}

          <!-- Audio button (bottom left) -->
          <button class="flashcard-audio-btn" id="audio-btn" title="Play audio">&#x1F50A;</button>

          <!-- Flip button (bottom right) -->
          <button class="flashcard-flip-btn" id="flip-btn" title="${isFlipped ? 'Show Arabic' : 'Show English'}">
            ${isFlipped ? '&#x21A9;' : '&#x21AA;'}
          </button>
        </div>

        <!-- Difficulty buttons (only when flipped) -->
        ${isFlipped ? `
          <div style="display:flex;gap:12px;margin-top:24px;width:min(90vw, 400px);">
            <button id="hard-btn" style="flex:1;padding:14px;border-radius:var(--radius-md);border:2px solid var(--red);background:var(--red-light);color:var(--red);font-size:16px;cursor:pointer;font-family:var(--font-body);">&#x1F4AA; Hard</button>
            <button id="easy-btn" style="flex:1;padding:14px;border-radius:var(--radius-md);border:2px solid var(--green);background:var(--green-light);color:var(--green-dark);font-size:16px;cursor:pointer;font-family:var(--font-body);">&#x2705; Easy</button>
          </div>
        ` : `
          <div style="display:flex;gap:12px;margin-top:24px;width:min(90vw, 400px);">
            ${currentCardIndex > 0 ? '<button id="prev-btn" style="flex:0 0 auto;padding:14px 20px;border-radius:var(--radius-md);border:2px solid var(--border);background:var(--cream);cursor:pointer;font-family:var(--font-body);">&#x2190; Prev</button>' : ''}
            <button id="next-btn" style="flex:1;padding:14px;border-radius:var(--radius-md);background:var(--gradient-primary);color:white;border:none;font-size:16px;cursor:pointer;font-family:var(--font-body);">Next &#x2192;</button>
          </div>
        `}
      </div>
    </div>
  `;

  // Listeners
  container.querySelector('#back-btn').addEventListener('click', () => {
    import('./router.js').then(({ navigateTo }) => navigateTo('home'));
  });

  container.querySelector('#audio-btn').addEventListener('click', () => {
    speakArabic(arabic);
  });

  container.querySelector('#flip-btn').addEventListener('click', () => {
    isFlipped = !isFlipped;
    renderCard(container);
  });

  const easyBtn = container.querySelector('#easy-btn');
  if (easyBtn) {
    easyBtn.addEventListener('click', () => { advanceCard(container); });
  }

  const hardBtn = container.querySelector('#hard-btn');
  if (hardBtn) {
    hardBtn.addEventListener('click', () => { advanceCard(container); });
  }

  const nextBtn = container.querySelector('#next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => { advanceCard(container); });
  }

  const prevBtn = container.querySelector('#prev-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentCardIndex > 0) { currentCardIndex--; isFlipped = false; renderCard(container); }
    });
  }
}

function advanceCard(container) {
  if (currentCardIndex < flashcardDeck.length - 1) {
    currentCardIndex++;
    isFlipped = false;
    renderCard(container);
  } else {
    showToast('Great work! Session complete. &#x1F389;');
    import('./router.js').then(({ navigateTo }) => navigateTo('home'));
  }
}

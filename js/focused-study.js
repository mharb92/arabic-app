/**
 * focused-study.js - Contextual study with custom topics
 * Pre-defined contexts + AI-generated custom topic sessions
 */

import { AppState, save } from './state.js';
import { FOCUSED_CONTEXTS } from './data/focused-contexts.js';
import { saveFocusedSession, loadFocusedSessions } from './database.js';
import { speakArabic } from './utils/audio.js';
import { showError, showToast, showLoading, hideLoading } from './utils/ui.js';

let currentContext = null;
let currentPhraseIndex = 0;

/**
 * Render focused study home (context selection + custom input)
 */
export function renderFocusedStudyScreen(container) {
  container.innerHTML = `
    <div class="focused-study-screen">
      <!-- Header -->
      <div class="focused-header">
        <button class="btn-back" id="back-btn">← Back</button>
        <h2>Focused Study</h2>
      </div>
      
      <!-- Description -->
      <div class="focused-description">
        <p>Practice phrases for specific situations and contexts</p>
      </div>
      
      <!-- Custom Topic Input -->
      <div class="custom-topic-section">
        <h3>Custom Topic</h3>
        <p class="custom-topic-hint">Describe any situation and we'll generate relevant phrases</p>
        <div class="custom-topic-input-wrapper">
          <input 
            type="text" 
            id="custom-topic-input" 
            placeholder="e.g., ordering coffee, asking for directions..."
            autocomplete="off"
          />
          <button class="btn-primary" id="generate-custom-btn">Generate →</button>
        </div>
      </div>
      
      <!-- Divider -->
      <div class="section-divider">
        <span>or choose a pre-made context</span>
      </div>
      
      <!-- Context Grid -->
      <div class="context-grid">
        ${FOCUSED_CONTEXTS.map((context, index) => `
          <button class="context-card" data-index="${index}">
            <div class="context-icon">${context.icon}</div>
            <div class="context-name">${context.name}</div>
            <div class="context-count">${context.phrases.length} phrases</div>
          </button>
        `).join('')}
      </div>
    </div>
  `;
  
  attachFocusedStudyListeners(container);
}

/**
 * Attach focused study listeners
 */
function attachFocusedStudyListeners(container) {
  const backBtn = container.querySelector('#back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('home'));
    });
  }
  
  // Custom topic generation
  const customInput = container.querySelector('#custom-topic-input');
  const generateBtn = container.querySelector('#generate-custom-btn');
  
  if (generateBtn && customInput) {
    const generateCustom = () => {
      const topic = customInput.value.trim();
      if (topic.length < 3) {
        showToast('Please enter a topic (at least 3 characters)');
        return;
      }
      generateCustomContext(container, topic);
    };
    
    generateBtn.addEventListener('click', generateCustom);
    customInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') generateCustom();
    });
  }
  
  // Pre-defined context cards
  const contextCards = container.querySelectorAll('.context-card');
  contextCards.forEach(card => {
    card.addEventListener('click', () => {
      const index = parseInt(card.dataset.index);
      startContextSession(container, index);
    });
  });
}

/**
 * Generate custom context using Claude API
 */
async function generateCustomContext(container, topic) {
  showLoading(`Generating phrases for "${topic}"...`);
  
  try {
    // Call Supabase Edge Function (which proxies to Claude API)
    const response = await fetch('https://xkhulybdrxdzakarivvi.supabase.co/functions/v1/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.supabaseAnonKey}`
      },
      body: JSON.stringify({
        prompt: `Generate 8 useful Palestinian Arabic phrases for the topic: "${topic}". 
        
Return ONLY a JSON array (no markdown, no explanation) with this exact structure:
[
  {"ar": "Arabic text", "rom": "romanization", "en": "English translation", "context": "when to use this"},
  ...
]

Make phrases natural, conversational, and specifically useful for "${topic}". Use Palestinian Arabic dialect.`,
        max_tokens: 1500
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate custom context');
    }
    
    const data = await response.json();
    
    // Parse Claude's response
    let phrases;
    try {
      // Claude might wrap in markdown code blocks, so clean it
      const cleaned = data.response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      phrases = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      throw new Error('Failed to parse generated phrases');
    }
    
    if (!Array.isArray(phrases) || phrases.length === 0) {
      throw new Error('No phrases generated');
    }
    
    hideLoading();
    
    // Create custom context object
    currentContext = {
      name: topic.charAt(0).toUpperCase() + topic.slice(1),
      icon: '✨',
      phrases: phrases,
      isCustom: true
    };
    currentPhraseIndex = 0;
    
    // Save to session history
    await saveFocusedSession(AppState.user.email, {
      contextName: currentContext.name,
      isCustom: true,
      phrasesCount: phrases.length,
      timestamp: new Date().toISOString()
    });
    
    renderContextSession(container);
    
  } catch (error) {
    hideLoading();
    showError('Failed to generate custom context. Please try again.');
    console.error('Generate custom context error:', error);
  }
}

/**
 * Start a pre-defined context session
 */
function startContextSession(container, contextIndex) {
  currentContext = FOCUSED_CONTEXTS[contextIndex];
  currentPhraseIndex = 0;
  
  // Save session
  saveFocusedSession(AppState.user.email, {
    contextName: currentContext.name,
    isCustom: false,
    phrasesCount: currentContext.phrases.length,
    timestamp: new Date().toISOString()
  });
  
  renderContextSession(container);
}

/**
 * Render context session (flashcard style)
 */
function renderContextSession(container) {
  const phrase = currentContext.phrases[currentPhraseIndex];
  const progress = ((currentPhraseIndex + 1) / currentContext.phrases.length) * 100;
  
  container.innerHTML = `
    <div class="focused-session-screen">
      <!-- Header -->
      <div class="session-header">
        <button class="btn-back" id="back-to-contexts">← Back</button>
        <div class="session-title">
          <h3>${currentContext.icon} ${currentContext.name}</h3>
          <p>Phrase ${currentPhraseIndex + 1} of ${currentContext.phrases.length}</p>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      
      <!-- Flashcard -->
      <div class="focused-flashcard" id="flashcard">
        <div class="flashcard-front">
          <div class="flashcard-label">Arabic</div>
          <div class="flashcard-arabic" dir="rtl">${phrase.ar || phrase.arabic}</div>
          <button class="audio-btn-large" id="audio-btn">🔊 Listen</button>
        </div>
        
        <div class="flashcard-back" style="display: none;">
          <div class="flashcard-label">Meaning</div>
          <div class="flashcard-english">${phrase.en || phrase.english}</div>
          ${AppState.profile.speaker_type === 'beginner' ? `
            <div class="flashcard-romanization">${phrase.rom || phrase.romanization}</div>
          ` : ''}
          ${phrase.context ? `
            <div class="flashcard-context">
              <strong>💡 Context:</strong> ${phrase.context}
            </div>
          ` : ''}
          <button class="audio-btn-large" id="audio-btn-back">🔊 Listen Again</button>
        </div>
      </div>
      
      <!-- Instructions -->
      <div class="flashcard-instructions">
        <p>👆 Tap the card to flip</p>
      </div>
      
      <!-- Navigation -->
      <div class="session-navigation">
        ${currentPhraseIndex > 0 ? `
          <button class="btn-secondary" id="prev-btn">← Previous</button>
        ` : '<div></div>'}
        
        ${currentPhraseIndex < currentContext.phrases.length - 1 ? `
          <button class="btn-primary" id="next-btn">Next →</button>
        ` : `
          <button class="btn-primary" id="finish-btn">Finish ✓</button>
        `}
      </div>
    </div>
  `;
  
  attachSessionListeners(container);
}

/**
 * Attach session listeners
 */
function attachSessionListeners(container) {
  const phrase = currentContext.phrases[currentPhraseIndex];
  
  // Back button
  const backBtn = container.querySelector('#back-to-contexts');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      renderFocusedStudyScreen(container);
    });
  }
  
  // Flashcard flip
  const flashcard = container.querySelector('#flashcard');
  let flipped = false;
  if (flashcard) {
    flashcard.addEventListener('click', () => {
      flipped = !flipped;
      const front = flashcard.querySelector('.flashcard-front');
      const back = flashcard.querySelector('.flashcard-back');
      
      if (flipped) {
        front.style.display = 'none';
        back.style.display = 'flex';
      } else {
        front.style.display = 'flex';
        back.style.display = 'none';
      }
    });
  }
  
  // Audio buttons
  const audioBtn = container.querySelector('#audio-btn');
  const audioBtnBack = container.querySelector('#audio-btn-back');
  
  if (audioBtn) {
    audioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      speakArabic(phrase.ar || phrase.arabic);
    });
  }
  
  if (audioBtnBack) {
    audioBtnBack.addEventListener('click', (e) => {
      e.stopPropagation();
      speakArabic(phrase.ar || phrase.arabic);
    });
  }
  
  // Navigation
  const prevBtn = container.querySelector('#prev-btn');
  const nextBtn = container.querySelector('#next-btn');
  const finishBtn = container.querySelector('#finish-btn');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentPhraseIndex--;
      renderContextSession(container);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentPhraseIndex++;
      renderContextSession(container);
    });
  }
  
  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      showToast(`✅ Completed: ${currentContext.name}`);
      renderFocusedStudyScreen(container);
    });
  }
}

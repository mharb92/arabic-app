/**
 * focused-study.js - Contextual study with custom topics
 * Pre-defined contexts + AI-generated custom topic sessions
 */

import { AppState, save, getAllUnits } from './state.js';
import { FOCUSED_CONTEXTS } from './data/focused-contexts.js';
import { saveFocusedSession, loadFocusedSessions, upsertPersonalVocab } from './database.js';
import { speakArabic } from './utils/audio.js';
import { showError, showToast, showLoading, hideLoading } from './utils/ui.js';
import { EDGE_FUNCTION_URL, SUPABASE_ANON_KEY, CLAUDE_MODEL } from './config.js';

let currentContext = null;
let currentPhraseIndex = 0;

/**
 * Render focused study home (context selection + custom input)
 */
export function renderFocusedStudyScreen(container) {
  const units = getAllUnits();
  const progress = AppState.unitProgress || {};
  let currentUnitIndex = 0;
  for (let i = 0; i < units.length; i++) {
    if (!progress[units[i].id] || !progress[units[i].id].mastered) {
      currentUnitIndex = i;
      break;
    }
  }
  const currentUnit = units[currentUnitIndex];

  container.innerHTML = `
    <div class="focused-study-screen" style="min-height:100dvh;background:var(--cream);display:flex;flex-direction:column;">
      <!-- Header -->
      <div style="padding:16px 20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border-light);">
        <button id="back-btn" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text);">&#x2190;</button>
        <h2 style="margin:0;font-family:var(--font-display);font-size:20px;">Focused Study</h2>
      </div>

      <div style="padding:16px 20px;flex:1;overflow-y:auto;">
        <!-- Today's Practice card -->
        <div class="today-practice-card" id="todays-practice-btn">
          <div style="display:flex;align-items:center;gap:14px;position:relative;z-index:1;">
            <div style="font-size:36px;">&#x2600;&#xFE0F;</div>
            <div>
              <div style="font-family:var(--font-display);font-size:17px;font-weight:600;margin-bottom:2px;">Today's Practice</div>
              <div style="font-size:14px;color:var(--text-soft);">${currentUnit.title} — ${currentUnit.phrases ? currentUnit.phrases.length : 0} phrases</div>
            </div>
            <div style="margin-left:auto;font-size:22px;color:var(--green);">&#x276F;</div>
          </div>
        </div>

        <!-- Custom Topic -->
        <div style="margin-bottom:20px;">
          <h3 style="font-family:var(--font-display);font-size:16px;margin-bottom:8px;">Custom Topic</h3>
          <p style="font-size:14px;color:var(--text-soft);margin-bottom:10px;">Describe any situation and we'll generate relevant phrases</p>
          <div style="display:flex;gap:8px;">
            <input
              type="text"
              id="custom-topic-input"
              placeholder="e.g., ordering coffee, asking for directions..."
              autocomplete="off"
              style="flex:1;padding:12px 14px;border:2px solid var(--border);border-radius:var(--radius-md);font-size:15px;background:var(--cream);color:var(--text);font-family:var(--font-body);"
            />
            <button class="btn-primary" id="generate-custom-btn" style="padding:12px 16px;white-space:nowrap;font-size:15px;">Generate</button>
          </div>
        </div>

        <!-- Divider -->
        <div style="display:flex;align-items:center;gap:12px;margin:16px 0;">
          <div style="flex:1;height:1px;background:var(--border);"></div>
          <span style="font-size:13px;color:var(--text-soft);">or choose a topic</span>
          <div style="flex:1;height:1px;background:var(--border);"></div>
        </div>

        <!-- Context Grid -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
          ${FOCUSED_CONTEXTS.map((context, index) => `
            <div class="hoopoe-card-feature context-card" data-index="${index}" style="cursor:pointer;padding:16px 8px;">
              <div style="font-size:28px;margin-bottom:6px;position:relative;z-index:1;">${context.icon}</div>
              <div style="font-size:13px;font-weight:500;color:var(--text);position:relative;z-index:1;">${context.name}</div>
              <div style="font-size:11px;color:var(--text-soft);margin-top:2px;position:relative;z-index:1;">${context.phrases.length} phrases</div>
            </div>
          `).join('')}
        </div>
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

  // Today's Practice
  const todayBtn = container.querySelector('#todays-practice-btn');
  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      const units = getAllUnits();
      const progress = AppState.unitProgress || {};
      let idx = 0;
      for (let i = 0; i < units.length; i++) {
        if (!progress[units[i].id] || !progress[units[i].id].mastered) { idx = i; break; }
      }
      const unit = units[idx];
      const ctx = { name: "Today's Practice", icon: '☀️', phrases: unit.phrases || [], topic: unit.title };
      startPracticeSession(container, ctx);
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
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1500,
        system: 'You are a Palestinian Arabic language expert. Return ONLY valid JSON arrays with no markdown or explanation.',
        messages: [{ role: 'user', content: `Generate 8 useful Palestinian Arabic phrases for the topic: "${topic}". 
        
Return ONLY a JSON array (no markdown, no explanation) with this exact structure:
[
  {"ar": "Arabic text", "rom": "romanization", "en": "English translation", "context": "when to use this"},
  ...
]

Make phrases natural, conversational, and specifically useful for "${topic}". Use Palestinian Arabic dialect.` }]
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
      const cleaned = (data.content?.[0]?.text || data.response || '')
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

    // Create custom context object and start session (auto-saves vocab + session)
    const customContext = {
      name: topic.charAt(0).toUpperCase() + topic.slice(1),
      icon: '✨',
      phrases: phrases,
      isCustom: true
    };
    startPracticeSession(container, customContext);

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
  startPracticeSession(container, FOCUSED_CONTEXTS[contextIndex]);
}

/**
 * Shared entry point for all session types (Today's Practice, custom, pre-built)
 */
function startPracticeSession(container, context) {
  currentContext = context;
  currentPhraseIndex = 0;

  // Auto-save phrases to My Vocab
  if (AppState.user && AppState.user.email && context.phrases && context.phrases.length > 0) {
    const entries = context.phrases.map(p => ({
      arabic: p.ar || p.arabic || '',
      romanization: p.rom || p.roman || p.romanization || '',
      english: p.en || p.english || '',
      mastery_score: 0,
      is_dialect: true,
      source: 'focused_' + (context.name || 'study').toLowerCase().replace(/\s+/g, '_')
    })).filter(e => e.arabic && e.english);
    if (entries.length > 0) {
      upsertPersonalVocab(AppState.user.email, entries).catch(e =>
        console.warn('Auto-save focused vocab failed (non-critical):', e.message)
      );
    }
  }

  // Save session
  if (AppState.user && AppState.user.email) {
    saveFocusedSession(AppState.user.email, {
      context: context.name + (context.isCustom ? ' (custom)' : ''),
      phrases_practiced: context.phrases.length,
      correct_count: 0,
      completed_at: new Date().toISOString()
    }).catch(() => {});
  }

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

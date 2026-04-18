/**
 * ai-tutor.js - AI Tutor with floating button, quick modal, and dedicated page
 * Dynamic system prompts based on user profile, learned phrases, and weak areas
 * Chat history shared between modal and page, persisted to Supabase
 */

import { AppState, save } from './state.js';
import { saveAITutorHistory, loadAITutorHistory } from './database.js';
import { speakArabic } from './utils/audio.js';
import { showError, showToast, showLoading, hideLoading } from './utils/ui.js';
import { SUPABASE_ANON_KEY, EDGE_FUNCTION_URL, CLAUDE_MODEL } from './config.js';

// Chat state
let chatHistory = []; // Array of {role: 'user' | 'assistant', content: string, timestamp: string}
let isModalOpen = false;

/**
 * Initialize AI Tutor (called from app.js)
 * Adds floating button to all screens
 */
export function initAITutor() {
  // Load chat history from AppState (already loaded in state.js)
  chatHistory = AppState.aiTutorHistory || [];
  
  // Add floating button to body
  addFloatingButton();
}

/**
 * Add floating button (always visible)
 */
function addFloatingButton() {
  const existingBtn = document.getElementById('ai-tutor-float-btn');
  if (existingBtn) return; // Already exists
  
  const floatingBtn = document.createElement('button');
  floatingBtn.id = 'ai-tutor-float-btn';
  floatingBtn.className = 'ai-tutor-floating-btn';
  floatingBtn.innerHTML = '💬';
  floatingBtn.setAttribute('aria-label', 'Open AI Tutor');
  
  floatingBtn.addEventListener('click', () => {
    openQuickTutor();
  });
  
  document.body.appendChild(floatingBtn);
}

/**
 * Open quick tutor modal (60vh overlay)
 */
function openQuickTutor() {
  if (isModalOpen) return;
  isModalOpen = true;
  
  const modalHtml = `
    <div class="modal-overlay ai-tutor-modal-overlay" id="ai-tutor-modal">
      <div class="modal-content ai-tutor-modal-content">
        <!-- Header -->
        <div class="ai-tutor-modal-header">
          <h3>💬 AI Tutor</h3>
          <div class="ai-tutor-header-actions">
            <button class="btn-link" id="view-full-chat">View Full Chat →</button>
            <button class="btn-close" id="close-tutor-modal">✕</button>
          </div>
        </div>
        
        <!-- Chat Messages -->
        <div class="ai-tutor-messages" id="ai-tutor-messages">
          ${chatHistory.length === 0 ? `
            <div class="ai-tutor-welcome">
              <p>👋 Hi! I'm your Arabic tutor. Ask me anything!</p>
              <div class="ai-tutor-suggestions">
                <button class="suggestion-btn" data-msg="What's the difference between شكراً and تسلم?">
                  What's the difference between شكراً and تسلم?
                </button>
                <button class="suggestion-btn" data-msg="How do I practice pronunciation?">
                  How do I practice pronunciation?
                </button>
                <button class="suggestion-btn" data-msg="Explain the Palestinian dialect">
                  Explain the Palestinian dialect
                </button>
              </div>
            </div>
          ` : renderChatMessages()}
        </div>
        
        <!-- Input -->
        <div class="ai-tutor-input-wrapper">
          <input 
            type="text" 
            id="ai-tutor-input" 
            placeholder="Ask me anything..."
            autocomplete="off"
          />
          <button class="btn-primary" id="send-tutor-msg">Send</button>
        </div>
      </div>
    </div>
  `;
  
  const modalDiv = document.createElement('div');
  modalDiv.innerHTML = modalHtml;
  document.body.appendChild(modalDiv.firstElementChild);
  
  attachModalListeners();
  
  // Focus input
  const input = document.getElementById('ai-tutor-input');
  if (input) input.focus();
  
  // Scroll to bottom
  scrollToBottom();
}

/**
 * Render chat messages
 */
function renderChatMessages() {
  if (!chatHistory || chatHistory.length === 0) return '';
  
  return chatHistory.map(msg => {
    // Skip messages without content
    if (!msg || !msg.content) return '';
    
    return `
      <div class="chat-message chat-message-${msg.role || 'user'}">
        <div class="message-content">
          ${msg.content}
          ${msg.role === 'assistant' ? extractArabicButtons(msg.content) : ''}
        </div>
        <div class="message-timestamp">${formatTimestamp(msg.timestamp)}</div>
      </div>
    `;
  }).filter(Boolean).join('');
}

/**
 * Extract Arabic text and add audio buttons
 */
function extractArabicButtons(content) {
  // Handle undefined or null content
  if (!content || typeof content !== 'string') return '';
  
  // Regex to find Arabic text
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g;
  const matches = content.match(arabicRegex);
  
  if (!matches || matches.length === 0) return '';
  
  return `
    <div class="arabic-audio-buttons">
      ${matches.slice(0, 3).map(text => `
        <button class="arabic-audio-btn" data-text="${text}">
          🔊 ${text}
        </button>
      `).join('')}
    </div>
  `;
}

/**
 * Format timestamp
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Attach modal listeners
 */
function attachModalListeners() {
  const modal = document.getElementById('ai-tutor-modal');
  const closeBtn = document.getElementById('close-tutor-modal');
  const viewFullBtn = document.getElementById('view-full-chat');
  const sendBtn = document.getElementById('send-tutor-msg');
  const input = document.getElementById('ai-tutor-input');
  
  // Close modal
  if (closeBtn) {
    closeBtn.addEventListener('click', closeTutorModal);
  }
  
  // Close on overlay click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeTutorModal();
    });
  }
  
  // View full chat (navigate to dedicated page)
  if (viewFullBtn) {
    viewFullBtn.addEventListener('click', () => {
      closeTutorModal();
      import('./router.js').then(({ navigateTo }) => navigateTo('ai-tutor'));
    });
  }
  
  // Send message
  const sendMessage = () => {
    const message = input.value.trim();
    if (message.length === 0) return;
    
    input.value = '';
    handleUserMessage(message);
  };
  
  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }
  
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }
  
  // Suggestion buttons
  const suggestionBtns = document.querySelectorAll('.suggestion-btn');
  suggestionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.dataset.msg;
      if (input) input.value = msg;
      sendMessage();
    });
  });
  
  // Arabic audio buttons
  attachArabicAudioListeners();
}

/**
 * Attach Arabic audio listeners (for dynamically added buttons)
 */
function attachArabicAudioListeners() {
  const arabicBtns = document.querySelectorAll('.arabic-audio-btn');
  arabicBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = btn.dataset.text;
      speakArabic(text);
    });
  });
}

/**
 * Close tutor modal
 */
function closeTutorModal() {
  const modal = document.getElementById('ai-tutor-modal');
  if (modal) {
    modal.remove();
    isModalOpen = false;
  }
}

/**
 * Handle user message
 */
async function handleUserMessage(message) {
  // Add user message to history
  const userMsg = {
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  };
  chatHistory.push(userMsg);
  
  // Update UI
  updateChatUI();
  
  // Show typing indicator
  showTypingIndicator();
  
  // Build system prompt
  const systemPrompt = buildDynamicSystemPrompt();
  
  // Call Claude API
  try {
    const response = await callClaudeAPI(systemPrompt, message);
    
    // Remove typing indicator
    hideTypingIndicator();
    
    // Add assistant response to history
    const assistantMsg = {
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    };
    chatHistory.push(assistantMsg);
    
    // Update UI
    updateChatUI();
    
    // Save chat history to Supabase
    AppState.aiTutorHistory = chatHistory;
    await saveAITutorHistory(AppState.user.email, chatHistory);
    
  } catch (error) {
    hideTypingIndicator();
    showError('Failed to get response. Please try again.');
    console.error('AI Tutor error:', error);
  }
}

/**
 * Build dynamic system prompt based on user context
 */
function buildDynamicSystemPrompt() {
  const profile = AppState.profile;
  const isAya = AppState.isAya;
  const learnedPhrases = getLearnedPhrases();
  const weakAreas = getWeakAreas();
  
  let prompt = `You are an expert Arabic language tutor specializing in Palestinian Arabic dialect.

**Student Profile:**
- Name: ${profile.name}
- Level: ${profile.speaker_type || 'beginner'}
- Learning Goals: ${profile.goals || 'conversational fluency'}
${isAya ? '- Special Context: Student is preparing to meet her partner\'s Palestinian family in June 2026' : ''}

**Learned Phrases (recent):**
${learnedPhrases.length > 0 ? learnedPhrases.slice(0, 30).map(p => `- ${p.ar} (${p.en})`).join('\n') : 'None yet'}

${weakAreas.length > 0 ? `**Weak Areas (needs practice):**
${weakAreas.slice(0, 10).map(p => `- ${p.ar} (${p.en})`).join('\n')}` : ''}

**Your Teaching Style:**
- Be encouraging and supportive
- Use simple, clear explanations
- Provide Palestinian Arabic examples
- Offer cultural context when relevant
- Use Arabic script when helpful (student sees romanization automatically if beginner)
- Keep responses concise and actionable
${isAya ? '- Focus on phrases useful for family interactions' : ''}

**Important:**
- When writing Arabic, use Arabic script
- Don't overwhelm with too much information at once
- Celebrate progress and correct gently
- Relate new concepts to what the student already knows`;

  return prompt;
}

/**
 * Get learned phrases
 */
function getLearnedPhrases() {
  // Get phrases from unit progress
  const phrases = [];
  // This is a simplified version - in full implementation, extract from completed units
  return phrases;
}

/**
 * Get weak areas
 */
function getWeakAreas() {
  // Get phrases with low mastery scores
  const weak = [];
  if (AppState.phrasesMastery) {
    Object.entries(AppState.phrasesMastery).forEach(([phrase, data]) => {
      if (data.mastery < 50) {
        weak.push({ ar: phrase, en: data.en || '' });
      }
    });
  }
  return weak;
}

/**
 * Call Claude API via Supabase Edge Function
 */
async function callClaudeAPI(systemPrompt, userMessage) {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  });
  
  if (!response.ok) {
    throw new Error('Claude API request failed');
  }
  
  const data = await response.json();
  return data.content?.[0]?.text || data.response || '';
}

/**
 * Update chat UI
 */
function updateChatUI() {
  const messagesContainer = document.getElementById('ai-tutor-messages');
  if (!messagesContainer) return;
  
  messagesContainer.innerHTML = renderChatMessages();
  attachArabicAudioListeners();
  scrollToBottom();
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
  const messagesContainer = document.getElementById('ai-tutor-messages');
  if (!messagesContainer) return;
  
  const typingDiv = document.createElement('div');
  typingDiv.id = 'typing-indicator';
  typingDiv.className = 'chat-message chat-message-assistant';
  typingDiv.innerHTML = `
    <div class="message-content typing-dots">
      <span></span><span></span><span></span>
    </div>
  `;
  messagesContainer.appendChild(typingDiv);
  scrollToBottom();
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
  const typingDiv = document.getElementById('typing-indicator');
  if (typingDiv) typingDiv.remove();
}

/**
 * Scroll to bottom of chat
 */
function scrollToBottom() {
  const messagesContainer = document.getElementById('ai-tutor-messages');
  if (messagesContainer) {
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
  }
}

/**
 * Render AI Tutor dedicated page
 */
export function renderAITutorPage(container) {
  chatHistory = AppState.aiTutorHistory || [];
  
  container.innerHTML = `
    <div class="ai-tutor-page">
      <!-- Header -->
      <div class="ai-tutor-page-header">
        <button class="btn-back" id="back-btn">← Back</button>
        <h2>💬 AI Tutor</h2>
        <button class="btn-secondary btn-small" id="clear-history-btn">Clear History</button>
      </div>
      
      <!-- Chat Messages -->
      <div class="ai-tutor-messages-full" id="ai-tutor-messages-full">
        ${chatHistory.length === 0 ? `
          <div class="ai-tutor-welcome">
            <h3>👋 Welcome to your AI Tutor!</h3>
            <p>I'm here to help you learn Palestinian Arabic. Ask me anything!</p>
            <div class="ai-tutor-suggestions">
              <button class="suggestion-btn" data-msg="What should I focus on learning next?">
                What should I focus on learning next?
              </button>
              <button class="suggestion-btn" data-msg="Quiz me on my weak phrases">
                Quiz me on my weak phrases
              </button>
              <button class="suggestion-btn" data-msg="Tell me about Palestinian culture">
                Tell me about Palestinian culture
              </button>
            </div>
          </div>
        ` : renderChatMessages()}
      </div>
      
      <!-- Input -->
      <div class="ai-tutor-input-wrapper-full">
        <input 
          type="text" 
          id="ai-tutor-input-full" 
          placeholder="Ask me anything..."
          autocomplete="off"
        />
        <button class="btn-primary" id="send-tutor-msg-full">Send</button>
      </div>
    </div>
  `;
  
  attachPageListeners(container);
  scrollToBottomFull();
}

/**
 * Attach page listeners
 */
function attachPageListeners(container) {
  const backBtn = container.querySelector('#back-btn');
  const clearBtn = container.querySelector('#clear-history-btn');
  const sendBtn = container.querySelector('#send-tutor-msg-full');
  const input = container.querySelector('#ai-tutor-input-full');
  
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('home'));
    });
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      if (confirm('Clear all chat history?')) {
        chatHistory = [];
        AppState.aiTutorHistory = [];
        await saveAITutorHistory(AppState.user.email, []);
        renderAITutorPage(container);
        showToast('Chat history cleared');
      }
    });
  }
  
  const sendMessage = () => {
    const message = input.value.trim();
    if (message.length === 0) return;
    
    input.value = '';
    handleUserMessagePage(container, message);
  };
  
  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }
  
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
    input.focus();
  }
  
  // Suggestion buttons
  const suggestionBtns = container.querySelectorAll('.suggestion-btn');
  suggestionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.dataset.msg;
      if (input) input.value = msg;
      sendMessage();
    });
  });
  
  // Arabic audio buttons
  attachArabicAudioListeners();
}

/**
 * Handle user message on page
 */
async function handleUserMessagePage(container, message) {
  // Add user message
  chatHistory.push({
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  });
  
  updatePageUI(container);
  showTypingIndicatorFull();
  
  const systemPrompt = buildDynamicSystemPrompt();
  
  try {
    const response = await callClaudeAPI(systemPrompt, message);
    
    hideTypingIndicatorFull();
    
    chatHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    });
    
    updatePageUI(container);
    
    AppState.aiTutorHistory = chatHistory;
    await saveAITutorHistory(AppState.user.email, chatHistory);
    
  } catch (error) {
    hideTypingIndicatorFull();
    showError('Failed to get response. Please try again.');
    console.error('AI Tutor error:', error);
  }
}

/**
 * Update page UI
 */
function updatePageUI(container) {
  const messagesContainer = container.querySelector('#ai-tutor-messages-full');
  if (!messagesContainer) return;
  
  messagesContainer.innerHTML = renderChatMessages();
  attachArabicAudioListeners();
  scrollToBottomFull();
}

/**
 * Typing indicators for full page
 */
function showTypingIndicatorFull() {
  const messagesContainer = document.getElementById('ai-tutor-messages-full');
  if (!messagesContainer) return;
  
  const typingDiv = document.createElement('div');
  typingDiv.id = 'typing-indicator-full';
  typingDiv.className = 'chat-message chat-message-assistant';
  typingDiv.innerHTML = `
    <div class="message-content typing-dots">
      <span></span><span></span><span></span>
    </div>
  `;
  messagesContainer.appendChild(typingDiv);
  scrollToBottomFull();
}

function hideTypingIndicatorFull() {
  const typingDiv = document.getElementById('typing-indicator-full');
  if (typingDiv) typingDiv.remove();
}

function scrollToBottomFull() {
  const messagesContainer = document.getElementById('ai-tutor-messages-full');
  if (messagesContainer) {
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
  }
}

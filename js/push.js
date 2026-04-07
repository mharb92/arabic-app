/**
 * push.js - Push notification setup
 * Registers service worker, requests permission, saves subscription
 */

import { AppState, save } from './state.js';
import { savePushSubscription } from './database.js';
import { VAPID_PUBLIC_KEY } from './config.js';
import { showError, showToast, showLoading, hideLoading } from './utils/ui.js';

/**
 * Render push prompt screen
 */
export function renderPushPromptScreen(container, onComplete) {
  container.innerHTML = `
    <div class="push-prompt-screen">
      <div class="push-content">
        <h2>Stay on Track</h2>
        <p>Get a gentle daily reminder to practice your Arabic.</p>
        
        <div class="push-benefits">
          <div class="benefit-item">
            <span class="benefit-icon">🕐</span>
            <span>Choose your preferred time</span>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">🌍</span>
            <span>Auto-adjusts when you travel</span>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">💚</span>
            <span>Personalized messages</span>
          </div>
        </div>
        
        <p class="push-note">You can disable this anytime in Settings</p>
        
        <div class="push-actions">
          <button class="btn-secondary" id="skip-btn">Not Now</button>
          <button class="btn-primary" id="enable-btn">Enable Notifications</button>
        </div>
      </div>
    </div>
  `;
  
  attachPushPromptListeners(container, onComplete);
}

/**
 * Attach push prompt listeners
 */
function attachPushPromptListeners(container, onComplete) {
  const skipBtn = container.querySelector('#skip-btn');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      if (onComplete) onComplete();
    });
  }
  
  const enableBtn = container.querySelector('#enable-btn');
  if (enableBtn) {
    enableBtn.addEventListener('click', () => {
      showTimePickerScreen(container, onComplete);
    });
  }
}

/**
 * Show time picker screen
 */
function showTimePickerScreen(container, onComplete) {
  container.innerHTML = `
    <div class="time-picker-screen">
      <h2>When should we remind you?</h2>
      
      <div class="time-options">
        <button class="time-option" data-time="08:00">
          <span class="time-icon">🌅</span>
          <span class="time-label">Morning</span>
          <span class="time-value">8:00 AM</span>
        </button>
        
        <button class="time-option" data-time="12:30">
          <span class="time-icon">☀️</span>
          <span class="time-label">Midday</span>
          <span class="time-value">12:30 PM</span>
        </button>
        
        <button class="time-option" data-time="20:00">
          <span class="time-icon">🌙</span>
          <span class="time-label">Evening</span>
          <span class="time-value">8:00 PM</span>
        </button>
        
        <button class="time-option" id="custom-time">
          <span class="time-icon">⏰</span>
          <span class="time-label">Custom</span>
          <span class="time-value">Choose time</span>
        </button>
      </div>
      
      <button class="btn-secondary" id="back-btn">← Back</button>
    </div>
  `;
  
  attachTimePickerListeners(container, onComplete);
}

/**
 * Attach time picker listeners
 */
function attachTimePickerListeners(container, onComplete) {
  const backBtn = container.querySelector('#back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      renderPushPromptScreen(container, onComplete);
    });
  }
  
  const timeOptions = container.querySelectorAll('.time-option[data-time]');
  timeOptions.forEach(btn => {
    btn.addEventListener('click', async () => {
      const time = btn.dataset.time;
      await setupPushNotifications(time, onComplete);
    });
  });
  
  const customTimeBtn = container.querySelector('#custom-time');
  if (customTimeBtn) {
    customTimeBtn.addEventListener('click', () => {
      showCustomTimeInput(container, onComplete);
    });
  }
}

/**
 * Show custom time input
 */
function showCustomTimeInput(container, onComplete) {
  container.innerHTML = `
    <div class="custom-time-screen">
      <h2>Choose Your Time</h2>
      
      <div class="time-input-group">
        <label>Preferred Time</label>
        <input type="time" id="custom-time-input" class="time-input" value="12:00" />
      </div>
      
      <div class="custom-actions">
        <button class="btn-secondary" id="cancel-btn">Cancel</button>
        <button class="btn-primary" id="confirm-btn">Confirm</button>
      </div>
    </div>
  `;
  
  const cancelBtn = container.querySelector('#cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      showTimePickerScreen(container, onComplete);
    });
  }
  
  const confirmBtn = container.querySelector('#confirm-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      const timeInput = container.querySelector('#custom-time-input');
      const time = timeInput.value;
      await setupPushNotifications(time, onComplete);
    });
  }
}

/**
 * Setup push notifications
 */
async function setupPushNotifications(preferredTime, onComplete) {
  showLoading('Setting up notifications...');
  
  try {
    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      hideLoading();
      showError('Notification permission denied');
      if (onComplete) onComplete();
      return;
    }
    
    // Register service worker
    const registration = await registerServiceWorker();
    
    if (!registration) {
      hideLoading();
      showError('Failed to register service worker');
      if (onComplete) onComplete();
      return;
    }
    
    // Subscribe to push
    const subscription = await subscribeToPush(registration);
    
    if (!subscription) {
      hideLoading();
      showError('Failed to subscribe to push notifications');
      if (onComplete) onComplete();
      return;
    }
    
    // Save subscription to database
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    await savePushSubscription(AppState.user.email, {
      subscription: JSON.stringify(subscription),
      preferredTime: preferredTime,
      timezone: timezone
    });
    
    // Update state
    AppState.profile.pushEnabled = true;
    AppState.profile.pushTime = preferredTime;
    await save();
    
    hideLoading();
    showToast('Notifications enabled!');
    
    if (onComplete) onComplete();
    
  } catch (error) {
    hideLoading();
    showError('Failed to setup notifications');
    console.error('Push setup error:', error);
    if (onComplete) onComplete();
  }
}

/**
 * Register service worker
 */
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.error('Service workers not supported');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/arabic-app/sw.js');
    await navigator.serviceWorker.ready;
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

/**
 * Subscribe to push notifications
 */
async function subscribeToPush(registration) {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}

/**
 * Convert VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Render push settings (for Settings tab)
 */
export function renderPushSettings(container) {
  const pushEnabled = AppState.profile.pushEnabled || false;
  const pushTime = AppState.profile.pushTime || '12:00';
  
  container.innerHTML = `
    <div class="push-settings">
      <h3>Notifications</h3>
      
      ${pushEnabled ? `
        <div class="push-status enabled">
          <p>✓ Notifications enabled</p>
          <p class="push-time">Daily reminder at ${pushTime}</p>
        </div>
        
        <button class="btn-secondary" id="disable-push-btn">Disable Notifications</button>
      ` : `
        <div class="push-status disabled">
          <p>Notifications are disabled</p>
        </div>
        
        <button class="btn-primary" id="enable-push-btn">Enable Notifications</button>
      `}
    </div>
  `;
  
  const enableBtn = container.querySelector('#enable-push-btn');
  if (enableBtn) {
    enableBtn.addEventListener('click', () => {
      renderPushPromptScreen(container, () => {
        // Refresh settings view after setup
        renderPushSettings(container);
      });
    });
  }
  
  const disableBtn = container.querySelector('#disable-push-btn');
  if (disableBtn) {
    disableBtn.addEventListener('click', async () => {
      if (confirm('Disable push notifications?')) {
        AppState.profile.pushEnabled = false;
        await save();
        showToast('Notifications disabled');
        renderPushSettings(container);
      }
    });
  }
}

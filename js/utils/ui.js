/**
 * utils/ui.js
 * UI utilities for errors, toasts, loading states
 * NO dependencies
 */

/**
 * Show error message to user
 * @param {String} message - Error message to display
 * @param {Number} duration - How long to show (ms), default 5000
 */
export function showError(message, duration = 5000) {
  const errorDiv = document.getElementById('global-error');
  if (!errorDiv) {
    console.error('Error div not found:', message);
    return;
  }
  
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  
  // Auto-hide after duration
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, duration);
}

/**
 * Show toast notification
 * @param {String} message - Toast message
 * @param {String} type - Type: 'success', 'info', 'warning', 'error'
 * @param {Number} duration - How long to show (ms), default 3000
 */
export function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 1rem 1.5rem;
    border-radius: 8px;
    background: ${type === 'success' ? '#1a6b50' : type === 'error' ? '#a32d2d' : '#555'};
    color: white;
    font-size: 0.9rem;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Fade in
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);
  
  // Fade out and remove
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
}

/**
 * Show loading spinner
 */
export function showLoading() {
  const spinner = document.getElementById('global-spinner');
  if (spinner) {
    spinner.style.display = 'flex';
  }
}

/**
 * Hide loading spinner
 */
export function hideLoading() {
  const spinner = document.getElementById('global-spinner');
  if (spinner) {
    spinner.style.display = 'none';
  }
}

/**
 * Disable all buttons (prevent double-clicks during saves)
 */
export function disableButtons() {
  document.querySelectorAll('button').forEach(btn => {
    btn.disabled = true;
  });
}

/**
 * Enable all buttons
 */
export function enableButtons() {
  document.querySelectorAll('button').forEach(btn => {
    btn.disabled = false;
  });
}

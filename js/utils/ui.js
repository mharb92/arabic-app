export function showError(message) {
  const errorDiv = document.getElementById('global-error') || createErrorContainer();
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
  errorDiv.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#b8422d;color:white;padding:12px 24px;border-radius:8px;z-index:9999;';
  setTimeout(() => errorDiv.classList.add('hidden'), 5000);
}
export function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1a6b50;color:white;padding:12px 24px;border-radius:8px;z-index:9999;';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
export function showLoading(message = 'Loading...') {
  let loader = document.getElementById('global-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9998;';
    loader.innerHTML = `<div style="background:white;padding:24px;border-radius:12px;text-align:center;"><div style="width:40px;height:40px;border:4px solid #e8e5de;border-top-color:#1a6b50;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;"></div><p>${message}</p></div>`;
    document.body.appendChild(loader);
  }
  loader.style.display = 'flex';
}
export function hideLoading() {
  const loader = document.getElementById('global-loader');
  if (loader) loader.style.display = 'none';
}
function createErrorContainer() {
  const div = document.createElement('div');
  div.id = 'global-error';
  div.classList.add('hidden');
  document.body.appendChild(div);
  return div;
}

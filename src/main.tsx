import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Lightweight auto-refresh when a new version is deployed
async function checkVersionAndReload() {
  try {
    const res = await fetch('/version.json', { cache: 'no-store' });
    if (!res.ok) return;
    const { version } = await res.json();
    const key = 'app_version';
    const previous = localStorage.getItem(key);
    if (previous && previous !== version) {
      // New deployment detected -> notify app to prompt the user
      window.dispatchEvent(new CustomEvent('app:update-available'));
      return;
    }
    localStorage.setItem(key, version);
  } catch {}
}

// Run on load and then periodically
checkVersionAndReload();
setInterval(checkVersionAndReload, 60_000);

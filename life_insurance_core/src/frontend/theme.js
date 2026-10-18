/**
 * Kinsure+ Project-Wide Theme System
 * Default: Light Screen Background with Dark Font Color
 */
(function initThemeSystem() {
  const THEME_STORAGE_KEY = 'kinsure_theme';

  function getSavedTheme() {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) {
      document.body.setAttribute('data-theme', theme);
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    // Update any theme toggle buttons in the UI
    const themeIcon = document.getElementById('themeIcon');
    const themeLabel = document.getElementById('themeLabel');
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
    if (themeLabel) {
      themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
    }
  }

  // Apply immediately upon execution
  const activeTheme = getSavedTheme();
  document.documentElement.setAttribute('data-theme', activeTheme);

  // Attach interactive button click once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getSavedTheme());
    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const current = getSavedTheme();
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    }
  });

  window.setKinsureTheme = applyTheme;
  window.getKinsureTheme = getSavedTheme;
})();

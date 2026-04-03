export type Theme = 'dark' | 'sepia';

const STORAGE_KEY = 'mazgin-theme';
const DEFAULT_THEME: Theme = 'dark';

function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;

  if (theme === 'sepia') {
    document.documentElement.setAttribute('data-theme', 'sepia');
    return;
  }

  document.documentElement.removeAttribute('data-theme');
}

export function getTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'sepia' ? 'sepia' : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function setTheme(theme: Theme): void {
  applyTheme(theme);

  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore storage write errors (e.g. strict privacy mode).
  }
}

export function toggleTheme(): Theme {
  const next = getTheme() === 'dark' ? 'sepia' : 'dark';
  setTheme(next);
  return next;
}

// Inline-Script-Inhalt für layout.tsx (verhindert Flackern beim Laden)
export const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('mazgin-theme');
    if (t === 'sepia') {
      document.documentElement.setAttribute('data-theme', 'sepia');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  } catch (e) {
    document.documentElement.removeAttribute('data-theme');
  }
})();
`.trim();

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'mazgin-theme';
const DEFAULT_THEME: Theme = 'dark';
const THEME_CHANGE_EVENT = 'mazgin:theme-change';
const LEGACY_LIGHT_THEME = 'sepia';

function isLightThemeValue(value: string | null): boolean {
  return value === 'light' || value === LEGACY_LIGHT_THEME;
}

function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;

  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    return;
  }

  document.documentElement.removeAttribute('data-theme');
}

function readThemeFromDom(): Theme | null {
  if (typeof document === 'undefined') return null;
  const theme = document.documentElement.getAttribute('data-theme');

  if (isLightThemeValue(theme)) return 'light';
  // Dark mode is represented by a missing data-theme attribute.
  if (theme === null || theme === '' || theme === 'dark') return 'dark';

  return null;
}

export function getTheme(): Theme {
  const domTheme = readThemeFromDom();
  if (domTheme) return domTheme;

  if (typeof window === 'undefined') return DEFAULT_THEME;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLightThemeValue(stored) ? 'light' : DEFAULT_THEME;
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

  try {
    window.dispatchEvent(new CustomEvent<Theme>(THEME_CHANGE_EVENT, { detail: theme }));
  } catch {
    // Ignore event dispatch errors.
  }
}

export function toggleTheme(currentTheme?: Theme): Theme {
  const next = (currentTheme ?? getTheme()) === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

export function onThemeChange(listener: (theme: Theme) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleThemeChange = (event: Event) => {
    const detail = (event as CustomEvent<Theme>).detail;
    listener(detail ?? getTheme());
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    listener(getTheme());
  };

  window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange as EventListener);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange as EventListener);
    window.removeEventListener('storage', handleStorage);
  };
}

// Inline-Script-Inhalt für layout.tsx (verhindert Flackern beim Laden)
export const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('mazgin-theme');
    if (t === 'light' || t === 'sepia') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  } catch (e) {
    document.documentElement.removeAttribute('data-theme');
  }
})();
`.trim();

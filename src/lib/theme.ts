/**
 * Minimal, dependency-free dark/light theme system.
 *
 * Why not next-themes: it injects its anti-FOUC <script> from a client component,
 * which triggers a false-positive React 19 warning on Next.js 16.2+ ("Encountered a
 * script tag while rendering React component"). next-themes is also unmaintained.
 * We inject the same blocking script via useServerInsertedHTML (server-only), so it
 * runs before paint with no FOUC and no warning. See ThemeProvider.
 */
export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "evotech-theme";
export const DEFAULT_THEME: Theme = "dark";

/** Runs in the browser before first paint to set the theme class (prevents FOUC). */
export const themeInitScript = `(function(){try{var k='${THEME_STORAGE_KEY}';var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark'){t='${DEFAULT_THEME}';}var d=document.documentElement;d.classList.remove('light','dark');d.classList.add(t);d.style.colorScheme=t;}catch(e){}})();`;

export function getTheme(): Theme {
  if (typeof document === "undefined") return DEFAULT_THEME;
  return document.documentElement.classList.contains("light")
    ? "light"
    : "dark";
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  // Suppress color transitions during the swap to avoid a flashy animation.
  const style = document.createElement("style");
  style.textContent =
    "*,*::before,*::after{transition:none!important;animation:none!important}";
  document.head.appendChild(style);

  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore (private mode / storage disabled)
  }

  // Re-enable transitions after the new theme has painted.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => style.remove()),
  );
}

export function toggleTheme(): void {
  applyTheme(getTheme() === "dark" ? "light" : "dark");
}

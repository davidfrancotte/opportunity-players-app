export type AppTheme = "light" | "dark";
export const appearanceKey = "op-mobile-appearance";
export const themeColors = { light: "#f5f7f4", dark: "#101214" };
export function normalizeTheme(value: unknown): AppTheme {
  return value === "light" ? "light" : "dark";
}

// Runs before the page paints; contains only a display preference, never profile data.
export const appearanceBootstrap = `(() => {
  let theme = 'dark';
  try { if (localStorage.getItem('${appearanceKey}') === 'light') theme = 'light'; } catch {}
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
})();`;

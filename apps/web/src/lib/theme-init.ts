// Runs before first paint: flags JS availability (used to pre-hide reveal
// targets without breaking no-JS rendering) and applies the stored theme.
export const themeInitialization = `
document.documentElement.classList.add('js');
try {
  const storedTheme = localStorage.getItem('codebridge-theme');
  document.documentElement.dataset.theme =
    storedTheme === 'light' || storedTheme === 'dark'
      ? storedTheme
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
} catch {
  document.documentElement.dataset.theme =
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}`;

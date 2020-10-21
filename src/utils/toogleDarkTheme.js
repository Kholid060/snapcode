export default function () {
  const isDark = Boolean(localStorage.getItem('dark'));
  const root = document.body;

  root.setAttribute('data-theme', isDark ? 'dark' : 'light');

  localStorage.setItem('dark', !isDark);
}

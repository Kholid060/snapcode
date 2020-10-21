export default function () {
  const isDark = JSON.parse(localStorage.getItem('dark'));
  const root = document.body;
  
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');

  localStorage.setItem('dark', !isDark);
  console.log(isDark, localStorage.getItem('dark'));

  return isDark;
}

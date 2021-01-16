import { ref } from 'vue';

const currentTheme = ref('dark');

export default function (params = {}) {
  const options = {
	  root: document.body,
	  toggleTheme: ['dark', 'light'], 
	  ...params,
  };

  function setTheme(theme) {
    options.root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    currentTheme.value = theme;
  }
  function toggle() {
    const currentThemeIndex = options.toggleTheme.indexOf(currentTheme.value);

    if (currentThemeIndex === -1) return;

    const theme = options.toggleTheme[currentThemeIndex === 0 ? 1 : 0];
    
    setTheme(theme);
  }

  return {
    toggle,
    setTheme,
    currentTheme,
  };
}

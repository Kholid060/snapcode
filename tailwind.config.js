const customTheme = require('comps-ui/dist/theme');
const switchTheme = require('switch-theme');

module.exports = {
  purge: false,
  theme: {
  	extend: {
      backgroundOpacity: {
        90: '0.9',
        10: '0.1',
      },
      container: {
        center: true,
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
        },
      },
    },
  },
  variants: {
  	visibility: ['responsive', 'hover', 'focus', 'group-hover'],
  },
  plugins: [switchTheme(customTheme)],
};

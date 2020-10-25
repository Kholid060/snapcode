const customTheme = require('comps-ui/dist/theme');
const switchTheme = require('switch-theme');

module.exports = {
  theme: {
  	extend: {
      backgroundOpacity: {
        90: '0.9',
        10: '0.1',
      },
    },
  },
  variants: {
  	visibility: ['responsive', 'hover', 'focus', 'group-hover'],
  },
  plugins: [switchTheme(customTheme)],
};

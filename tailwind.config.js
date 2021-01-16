const switchTheme = require('switch-theme');
const theme = require('./src/lib/theme');

module.exports = {
  purge: false,
  theme: {
  	extend: {
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
  plugins: [switchTheme(theme)],
};

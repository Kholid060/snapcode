module.exports = {
  plugins: {
    tailwindcss: {},
    'vue-cli-plugin-tailwind/purgecss': {
      whitelist: ['dark-theme', 'tooltip-ui', 'active', 'router-link-active'],
      whitelistPatterns: [/CodeMirror/, /simplebar/, /(cm|cm-s)/, /vue-popover-theme/, /mdi-icon/],
      whitelistPatternsChildren: [/svg/],
    },
  },
};

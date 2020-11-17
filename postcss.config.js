/* eslint-disable */

const purgecss = require('@fullhuman/postcss-purgecss')({
  content: [
    './src/**/*.html',
    './src/**/*.vue',
    './src/**/*.jsx',
    './node_modules/comps-ui/dist/*.js',
  ],
  defaultExtractor: (content) => {
    const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
    const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];

    return broadMatches.concat(innerMatches);
  },
  safelist: {
    standard: [/CodeMirror/],
    deep: [
      /-(leave|enter|appear)(|-(to|from|active))$/, 
      /^(?!(|.*?:)cursor-move).+-move$/, 
      /^router-link(|-exact)-active$/, 
      /data-v-.*/,
    ],
    greedy: [
      /tippy-*/,
      /CodeMirror|cm/,
    ],
  },
});

module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  	...process.env.NODE_ENV === 'production'
      ? [purgecss]
      : [],
  ],
};

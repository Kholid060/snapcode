import config from '@snippy/eslint-config/vue.js';

export default [
  {
    ignores: ['src-tauri/**/*', '**/*.d.ts'],
  },
  ...config,
];

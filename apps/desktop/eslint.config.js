import config from '@snippy/eslint-config/vue.js';
import autoImport from './.eslintrc-auto-import.json';

export default [
  {
    globals: autoImport.globals,
    ignores: ['src-tauri/**/*', '**/*.d.ts'],
  },
  ...config,
];

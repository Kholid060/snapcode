import base from './base.js';
import eslintPluginVue from 'eslint-plugin-vue';
import js from '@eslint/js';
import ts from 'typescript-eslint';

export default ts.config(
  ...base,
  js.configs.recommended,
  ...ts.configs.recommended,
  ...eslintPluginVue.configs['flat/essential'],
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      'vue/max-attributes-per-line': 'off',
      'vue/html-self-closing': 'off',
      'vue/require-default-prop': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          'args': 'all',
          'argsIgnorePattern': '^_',
          'caughtErrors': 'all',
          'caughtErrorsIgnorePattern': '^_',
          'destructuredArrayIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
          'ignoreRestSiblings': true
        }
      ],
      'tailwindcss/no-custom-classname': 'off'
    },
  }
);

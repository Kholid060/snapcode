import stylistic from '@stylistic/eslint-plugin';

export default [
  stylistic.configs.customize({
    indent: 2,
    semi: true,
    quotes: 'single',
    braceStyle: '1tbs',
    arrowParens: true,
  }),
];
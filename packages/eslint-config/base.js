import prettierPlugin from 'eslint-plugin-prettier/recommended';

export default [
  prettierPlugin,
  {
    rules: {
      'prettier/prettier': [
        'error',
        {
          'endOfLine': 'auto'
        }
      ]
    }
  }
];
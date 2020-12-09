module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-tabs': 0,
    'no-mixed-spaces-and-tabs': 0,
    'no-trailing-spaces': 0,
    'vue/valid-v-model': 0,
    'max-len': 0,
    'linebreak-style': 0,
  },
};

const path = require('path');

module.exports = {
  devServer: {
    host: 'localhost',
  },
  configureWebpack: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'src/'),
        vue$: path.resolve('./node_modules/vue/dist/vue.runtime.esm-bundler'),
      },
    },
  },
};

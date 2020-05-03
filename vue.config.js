const path = require('path');

module.exports = {
  devServer: {
    host: 'localhost',
  },
  configureWebpack: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'src/'),
      },
    },
  },
};

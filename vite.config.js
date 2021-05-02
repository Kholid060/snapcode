import vue from '@vitejs/plugin-vue';
import eslint from '@rollup/plugin-eslint';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * @type {import('vite').UserConfig}
 */
export default {
  plugins: [
    vue(),
    VitePWA({
      manifest: {
        // content of manifest
      },
      workbox: {
        // workbox options for generateSW
      },
    }),
    {
      ...eslint({
        include: ['./src/**/*.vue', './src/**/*.js'],
      }),
      enforce: 'pre',
    },
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
};

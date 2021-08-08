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
      registerType: 'autoUpdate',
      manifest: {
        name: 'Snapcode',
        short_name: 'Snapcode',
        theme_color: '#3291FF',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: new RegExp('https://cdnjs.cloudflare.com/ajax/libs/codemirror'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'codemirror-scripts',
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
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

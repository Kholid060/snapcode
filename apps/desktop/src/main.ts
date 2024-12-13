import { createApp } from 'vue';
import './assets/css/style.css';
import { createPinia } from 'pinia';
import { attachConsole } from '@tauri-apps/plugin-log';
import { logger } from './services/logger.service';
import { getLogMessage } from './utils/helper';
import { migrate } from './db/migrate';
import AppAsync from './AppAsync.vue';
import documentService from './services/document.service';

(async () => {
  try {
    if (import.meta.env.DEV) {
      await attachConsole();
    }

    await Promise.all([migrate(), documentService.init()]);

    createApp(AppAsync).use(createPinia()).mount('#app');
  } catch (error) {
    logger.error(getLogMessage('init-app', error));
    throw error;
  }
})();

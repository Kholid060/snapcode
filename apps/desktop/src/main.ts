import { createApp } from 'vue';
import App from './App.vue';
import './assets/css/style.css';
import { createPinia } from 'pinia';
import { attachConsole } from '@tauri-apps/plugin-log';
import { logger } from './services/logger.service';
import { getLogMessage } from './utils/helper';
import { migrate } from './db/migrate';
import { store } from './services/store.service';
import { APP_DEFAULT_GLOBAL_SHORTCUT } from './utils/const/app.const';
import { globalShortcut } from './services/global-shortcut.service';
import { appCommand } from './services/app-command.service';

async function attachGlobalShortcuts() {
  const [searchShortcut, newSnippetShortcut] = await Promise.all([
    store.xGet(
      store.xKeys.shortcutSearchWindow,
      APP_DEFAULT_GLOBAL_SHORTCUT.searchWindow,
    ),
    store.xGet(
      store.xKeys.shortcutNewSnippet,
      APP_DEFAULT_GLOBAL_SHORTCUT.newSnippetWindow,
    ),
  ]);
  await globalShortcut.register(searchShortcut, async ({ state }) => {
    if (state !== 'Pressed') return;

    try {
      await appCommand.invoke('open_popup_window', undefined);
    } catch (error) {
      logger.error(getLogMessage('shortcut-search', error));
    }
  });
  await globalShortcut.register(newSnippetShortcut, ({ state }) => {
    if (state !== 'Pressed') return;

    console.log('handle new snippet');
  });
}

(async () => {
  try {
    if (import.meta.env.DEV) {
      await attachConsole();
    }

    await attachGlobalShortcuts();
    await migrate();

    createApp(App).use(createPinia()).mount('#app');
  } catch (error) {
    logger.error(getLogMessage('init-app', error));
    throw error;
  }
})();

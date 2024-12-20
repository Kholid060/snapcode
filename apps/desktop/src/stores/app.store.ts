import { check } from '@tauri-apps/plugin-updater';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';
import { defineStore } from 'pinia';
import { store } from '@/services/store.service';
import { AppSettings } from '@/interface/app.interface';
import documentService from '@/services/document.service';

interface UpdateState {
  latestVersion: string;
  downloadProgress: number;
  status: 'latest' | 'updating' | 'need-restart';
}

const APP_DEFAULT_SETTINGS: AppSettings = {
  deleteToTrash: true,
};

export const useAppStore = defineStore('app-store', () => {
  const appInitiated = shallowRef(false);
  const updateState = shallowReactive<UpdateState>({
    status: 'latest',
    latestVersion: '',
    downloadProgress: 0,
  });
  const settings = shallowReactive<AppSettings>({ ...APP_DEFAULT_SETTINGS });

  function updateSettings<T extends keyof AppSettings>(
    key: T,
    value: AppSettings[T],
  ) {
    settings[key] = value;
  }
  async function checkUpdate() {
    try {
      const update = await check();
      if (!update) return false;

      updateState.latestVersion = update.version;

      let downloaded = 0;
      let contentLength = 0;
      update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            updateState.status = 'updating';
            updateState.downloadProgress = 0;
            contentLength = event.data.contentLength ?? 0;
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            updateState.downloadProgress = (downloaded / contentLength) * 100;
            break;
          case 'Finished':
            updateState.status = 'need-restart';
            break;
        }
      });

      return true;
    } catch (error) {
      logger.error(getLogMessage('app:check-update', error));
      throw error;
    }
  }

  async function init() {
    const [autoCheckUpdate, appSettings] = await Promise.all([
      store.xGet('autoUpdate', true),
      documentService.stores.settings.xGet('general', APP_DEFAULT_SETTINGS),
    ]);
    if (autoCheckUpdate && !import.meta.env.DEV) {
      await checkUpdate().catch(() => {});
    }

    Object.assign(settings, appSettings);
  }

  return {
    init,
    settings,
    checkUpdate,
    updateState,
    appInitiated,
    updateSettings,
  };
});

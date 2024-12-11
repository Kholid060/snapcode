import { check } from '@tauri-apps/plugin-updater';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';
import { defineStore } from 'pinia';
import { store } from '@/services/store.service';

interface UpdateState {
  latestVersion: string;
  downloadProgress: number;
  status: 'latest' | 'updating' | 'need-restart';
}

export const useAppStore = defineStore('app-store', () => {
  const updateState = shallowReactive<UpdateState>({
    status: 'latest',
    latestVersion: '',
    downloadProgress: 0,
  });

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
    const autoCheckUpdate = await store.xGet(store.xKeys.autoUpdate, true);
    if (autoCheckUpdate) await checkUpdate();
  }

  return {
    init,
    checkUpdate,
    updateState,
  };
});

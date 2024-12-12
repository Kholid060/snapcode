import { getHotkeyLabel } from '@/composables/hotkey.composable';
import { appCommand } from '@/services/app-command.service';
import { logger } from '@/services/logger.service';
import { store } from '@/services/store.service';
import {
  APP_DEFAULT_GLOBAL_SHORTCUT,
  APP_DEFAULT_HOTKEY,
  AppHotkeys,
} from '@/utils/const/app.const';
import { getLogMessage } from '@/utils/helper';
import { defineStore } from 'pinia';

type HotkeysData = Record<AppHotkeys, string>;

const DEFAULT_HOTKEYS: HotkeysData = {
  ...APP_DEFAULT_GLOBAL_SHORTCUT,
  ...APP_DEFAULT_HOTKEY,
};

export const useHotkeysStore = defineStore('hotkeys', () => {
  let initiated = false;

  const hotkeys = shallowReactive<HotkeysData>(DEFAULT_HOTKEYS);

  async function init() {
    try {
      if (initiated) return;

      const customHotkeys = await store.xGet(store.xKeys.hotkeys);
      if (customHotkeys) {
        Object.assign(hotkeys, { ...DEFAULT_HOTKEYS, ...customHotkeys });
      }

      appCommand.invoke('update_popup_window_tray_menu', {
        shortcut: hotkeys.quickAccessWindow,
      });

      initiated = true;
    } catch (error) {
      logger.error(getLogMessage('store:hotkeys-init', error));
    }
  }
  function isMatch(name: AppHotkeys, keys: string) {
    const shortcut = hotkeys[name];
    if (!shortcut) return false;

    return shortcut === keys;
  }
  function getLabel(name: AppHotkeys) {
    return getHotkeyLabel(hotkeys[name]);
  }
  async function updateHotkey(name: AppHotkeys, shortcut: string) {
    if (!(name in hotkeys)) {
      throw new Error(`"${name}" is invalid hotkey`);
    }

    await store.xSet(store.xKeys.hotkeys, { ...hotkeys, [name]: shortcut });
    hotkeys[name] = shortcut;
  }

  return {
    init,
    hotkeys,
    isMatch,
    getLabel,
    updateHotkey,
  };
});

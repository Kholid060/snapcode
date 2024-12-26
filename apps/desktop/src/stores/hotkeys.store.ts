import { getHotkeyLabel } from '@/composables/hotkey.composable';
import { appCommand } from '@/services/app-command.service';
import documentService from '@/services/document.service';
import { logger } from '@/services/logger.service';
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
  const initiated = shallowRef(false);
  const hotkeys = shallowReactive<HotkeysData>(DEFAULT_HOTKEYS);

  async function init() {
    try {
      if (initiated.value) return;

      const customHotkeys =
        await documentService.stores.settings.xGet('hotkeys');
      if (customHotkeys) {
        Object.assign(hotkeys, { ...DEFAULT_HOTKEYS, ...customHotkeys });
      }

      appCommand.invoke('update_popup_window_tray_menu', {
        shortcut: hotkeys.quickAccessWindow,
      });

      initiated.value = true;
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

    await documentService.stores.settings.xSet('hotkeys', {
      ...hotkeys,
      [name]: shortcut,
    });
    hotkeys[name] = shortcut;
  }

  return {
    init,
    hotkeys,
    isMatch,
    getLabel,
    initiated,
    updateHotkey,
  };
});

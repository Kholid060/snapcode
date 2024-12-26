import hotkeys, { HotkeysEvent } from 'hotkeys-js';
import { platform } from '@tauri-apps/plugin-os';
import { unrefElement } from '@vueuse/core';
import {
  APP_DEFAULT_GLOBAL_SHORTCUT,
  AppHotkeys,
} from '@/utils/const/app.const';
import globalShortcut from '@/services/global-shortcut.service';
import { useHotkeysStore } from '@/stores/hotkeys.store';
import { ShortcutHandler } from '@tauri-apps/plugin-global-shortcut';
import {
  KEYBOARD_SHIFT_KEY,
  KeyboardShiftKey,
} from '@/utils/const/keyboard.const';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';

type KeyHandler = (
  keyboardEvent: KeyboardEvent,
  hotkeysEvent: HotkeysEvent & { hotkeyId?: AppHotkeys },
) => void | boolean;
type AppHotkeysUnion = (string & {}) | AppHotkeys;

interface KeyOption {
  scope?: string;
  single?: boolean;
  capture?: boolean;
  element?: MaybeRef<HTMLElement | null>;
  key: AppHotkeysUnion | AppHotkeysUnion[];
}
interface HotkeyItem {
  key: string;
  hotkeyId?: AppHotkeys;
}
interface ParsedHotkey {
  key: string;
  parsedKeys: Map<string, HotkeyItem>;
}

const IS_MAC = platform() === 'macos';

function parseKey(key: HotkeyItem | HotkeyItem[]) {
  const result: ParsedHotkey = {
    key: '',
    parsedKeys: new Map(),
  };

  (Array.isArray(key) ? key : [key]).forEach((item) => {
    let hasMod = false;

    const replacedKey = item.key.replace(/mod/g, () => {
      hasMod = true;
      return IS_MAC ? 'command' : 'ctrl';
    });

    if (hasMod || item.hotkeyId) result.parsedKeys.set(replacedKey, item);
    result.key += `${replacedKey},`;
  });

  if (result.key.endsWith(',')) {
    result.key = result.key.slice(0, -1);
  }

  return result;
}

export function getHotkeyLabel(keys: AppHotkeysUnion) {
  return keys.replace(/mod|CommandOrControl/g, () => (IS_MAC ? '⌘' : 'ctrl'));
}

hotkeys.filter = function ({ target }) {
  return !(target as HTMLElement).classList.contains('no-hotkeys');
};

export function useHotkey(
  option: AppHotkeysUnion | AppHotkeysUnion[] | KeyOption,
  handlerFn: KeyHandler,
) {
  const hotkeysStore = useHotkeysStore();

  function getKey(keys: string | string[]) {
    const findKey = (key: string) => {
      const isShortcutId = key in hotkeysStore.hotkeys;

      return {
        hotkeyId: isShortcutId ? key : undefined,
        key: isShortcutId ? hotkeysStore.hotkeys[key as AppHotkeys] : key,
      } as HotkeyItem;
    };

    return Array.isArray(keys) ? keys.map(findKey) : findKey(keys);
  }

  watchEffect((onCleanUp) => {
    let parsedHotkey: ParsedHotkey;

    const handler: KeyHandler = (event, hkEvent) => {
      if (parsedHotkey.parsedKeys.has(hkEvent.key)) {
        const hotkeyData = parsedHotkey.parsedKeys.get(hkEvent.key);
        handlerFn(event, {
          ...hkEvent,
          ...(hotkeyData ?? {}),
        });
        return;
      }

      handlerFn(event, hkEvent);
    };

    if (typeof option === 'string' || Array.isArray(option)) {
      parsedHotkey = parseKey(getKey(option));
      hotkeys(parsedHotkey.key, handler);
    } else {
      parsedHotkey = parseKey(getKey(option.key));
      hotkeys(
        parsedHotkey.key,
        {
          ...option,
          element: unrefElement(option.element),
        },
        handler,
      );
    }

    onCleanUp(() => {
      hotkeys.unbind(parsedHotkey.key, handler);
    });
  });
}

export function useGlobalHotkey(
  name: keyof typeof APP_DEFAULT_GLOBAL_SHORTCUT,
  handler: ShortcutHandler,
  options?: { onKeyChanged?: (keys: string) => unknown },
) {
  let firstRender = true;

  const hotkeysStore = useHotkeysStore();

  watchEffect(async (onCleanUp) => {
    try {
      if (!hotkeysStore.initiated) return;

      const shortcut = hotkeysStore.hotkeys[name];
      if (!shortcut) throw new Error(`"${name}" invalid global shortcut`);

      await globalShortcut.register(shortcut, handler);

      if (!firstRender && options?.onKeyChanged)
        options?.onKeyChanged(shortcut);
      firstRender = false;

      onCleanUp(() => {
        globalShortcut.unregister(shortcut);
      });
    } catch (error) {
      logger.error(getLogMessage('hotkeys:register-global', error));
    }
  });
}

export function useHotkeyRecorder(
  onRecorded: (keys: string) => unknown,
  onCancel?: () => void,
) {
  let isShortcutGlobal = false;

  const isRecording = shallowRef(false);

  function keyboardEventHandler(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
    const { key, altKey, ctrlKey, metaKey, shiftKey } = event;
    if (
      (!altKey && !ctrlKey && !metaKey && !shiftKey) ||
      event.getModifierState(event.key)
    ) {
      if (key === 'Escape') {
        stopRecording();
        onCancel?.();
      }
      return;
    }

    const mods: string[] = [];
    if (ctrlKey) mods.push(isShortcutGlobal ? 'CommandOrControl' : 'ctrl');
    if (shiftKey) mods.push(isShortcutGlobal ? 'Shift' : 'shift');
    if (altKey) mods.push(isShortcutGlobal ? 'Alt' : 'alt');
    if (metaKey) mods.push(isShortcutGlobal ? 'Meta' : 'meta');

    const keyboardKey = shiftKey
      ? (KEYBOARD_SHIFT_KEY[key as KeyboardShiftKey] ?? key)
      : key;
    onRecorded(mods.join('+') + `+${keyboardKey}`);
  }
  function stopRecording() {
    isRecording.value = false;
    isShortcutGlobal = false;

    window.removeEventListener('keydown', keyboardEventHandler, {
      capture: true,
    });
  }
  function startRecording(isGlobal?: boolean) {
    if (isRecording.value) return;

    isRecording.value = true;
    isShortcutGlobal = isGlobal ?? false;
    window.addEventListener('keydown', keyboardEventHandler, { capture: true });
  }

  onUnmounted(stopRecording);

  return {
    isRecording,
    stopRecording,
    startRecording,
    isGlobal: isShortcutGlobal,
  };
}

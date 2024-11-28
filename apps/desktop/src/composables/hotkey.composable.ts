import hotkeys, { KeyHandler } from 'hotkeys-js';
import { platform } from '@tauri-apps/plugin-os';

interface KeyOption {
  scope: string;
  key: string | string[];
}
interface ParsedHotkey {
  key: string;
  parsedKeys: Map<string, string>;
}

const IS_MAC = platform() === 'macos';

function parseKey(key: string | string[]) {
  const result: ParsedHotkey = {
    key: '',
    parsedKeys: new Map(),
  };

  (Array.isArray(key) ? key : [key]).forEach((item) => {
    let hasMod = false;

    const replacedKey = item.replace(/mod/g, () => {
      hasMod = true;
      return IS_MAC ? 'command' : 'ctrl';
    });

    if (hasMod) result.parsedKeys.set(replacedKey, item);
    result.key += `${replacedKey},`;
  });

  if (result.key.endsWith(',')) {
    result.key = result.key.slice(0, -1);
  }

  return result;
}

export function useHotkey(
  option: string | string[] | KeyOption,
  handlerFn: KeyHandler,
) {
  let parsedHotkey: ParsedHotkey;

  const handler: KeyHandler = (event, hkEvent) => {
    if (parsedHotkey.parsedKeys.has(hkEvent.key)) {
      handlerFn(event, {
        ...hkEvent,
        key: parsedHotkey.parsedKeys.get(hkEvent.key)!,
      });
      return;
    }

    handlerFn(event, hkEvent);
  };

  if (typeof option === 'string' || Array.isArray(option)) {
    parsedHotkey = parseKey(option);
    hotkeys(parsedHotkey.key, handler);
  } else {
    parsedHotkey = parseKey(option.key);
    hotkeys(parsedHotkey.key, option.scope, handler);
  }

  onUnmounted(() => {
    hotkeys.unbind(parsedHotkey.key, handler);
  });
}

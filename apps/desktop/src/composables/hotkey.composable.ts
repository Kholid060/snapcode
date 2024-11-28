import hotkeys, { KeyHandler } from 'hotkeys-js';

interface KeyOption {
  key: string;
  scope: string;
}

export function useHotkey(option: string | KeyOption, handler: KeyHandler) {
  let key: string;

  if (typeof option === 'string') {
    key = option;
    hotkeys(option, handler);
  } else {
    key = option.key;
    hotkeys(option.key, option.scope, handler);
  }

  onUnmounted(() => {
    hotkeys.unbind(key, handler);
  });
}

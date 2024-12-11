export const APP_DEFAULT_HOTKEY = {
  newSnippet: 'mod+n',
  openSettings: 'mod+,',
  newFolder: 'mod+shift+n',
  searchMenu: 'mod+shift+f',
  snippetsMenu: 'mod+shift+e',
  bookmarksMenu: 'mod+shift+b',
} as const;

export const APP_DEFAULT_GLOBAL_SHORTCUT = {
  quickAccessWindow: 'CommandOrControl+Shift+K',
} as const;

export type AppHotkeys =
  | keyof typeof APP_DEFAULT_HOTKEY
  | keyof typeof APP_DEFAULT_GLOBAL_SHORTCUT;

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

export const APP_EDITOR_FONTS = {
  'fira-code': {
    id: 'fira-code',
    name: 'Fira Code',
    fonts: [
      { name: 'FiraCode-Medium.woff2', weight: 600 },
      { name: 'FiraCode-Regular.woff2', weight: 400 },
      { name: 'FiraCode-SemiBold.woff2', weight: 700 },
    ],
  },
  'monaspace-neon': {
    id: 'monaspace-neon',
    name: 'Monaspace Neon',
    fonts: [
      { name: 'MonaspaceNeon-Medium.woff', weight: 600 },
      { name: 'MonaspaceNeon-Regular.woff', weight: 400 },
      { name: 'MonaspaceNeon-SemiBold.woff', weight: 700 },
    ],
  },
  'jetbrains-mono': {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    fonts: [
      { name: 'jetbrains-mono-v20-latin-600.woff2', weight: 600 },
      { name: 'jetbrains-mono-v20-latin-700.woff2', weight: 700 },
      { name: 'jetbrains-mono-v20-latin-regular.woff2', weight: 400 },
    ],
  },
  'roboto-mono': {
    id: 'roboto-mono',
    name: 'Roboto Mono',
    fonts: [
      { name: 'roboto-mono-v23-latin-600.woff2', weight: 600 },
      { name: 'roboto-mono-v23-latin-700.woff2', weight: 700 },
      { name: 'roboto-mono-v23-latin-regular.woff2', weight: 400 },
    ],
  },
} as const;
export type AppEditorFonts = keyof typeof APP_EDITOR_FONTS;

export const APP_DOCUMENT_PATH_SEPARATOR = '/';

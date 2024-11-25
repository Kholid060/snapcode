import { LazyStore } from '@tauri-apps/plugin-store';

export const STORE_KEYS = {
  editorActiveDirs: 'editor:active-dirs',
  editorActiveFile: 'editor:active-file',
  noDeletePrompt: 'editor:no-delete-prompt',
  editorActiveFolders: 'editor:active-folders',
} as const;

export const store = new LazyStore('settings.json');

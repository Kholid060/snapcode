import { AppBookmarksState } from '@/interface/app.interface';
import { EditorSidebarState } from '@/interface/editor.interface';
import { AppHotkeys } from '@/utils/const/app.const';
import { LazyStore } from '@tauri-apps/plugin-store';

export const STORE_KEYS = {
  hotkeys: 'app:hotkeys',
  bookmarkState: 'bookmark-state',
  autoUpdate: 'settings:auto-update',
  noDeletePrompt: 'editor:no-delete-prompt',
  editorSidebarState: 'editor:sidebar-state',
  shortcutNewSnippet: 'shortcut:new-snippet',
  recentSnippets: 'quick-access:recent-snippets',
} as const;

export interface AppStoreState {
  [STORE_KEYS.autoUpdate]: boolean;
  [STORE_KEYS.noDeletePrompt]: boolean;
  [STORE_KEYS.recentSnippets]: string[];
  [STORE_KEYS.shortcutNewSnippet]: string;
  [STORE_KEYS.bookmarkState]: AppBookmarksState;
  [STORE_KEYS.hotkeys]: Record<AppHotkeys, string>;
  [STORE_KEYS.editorSidebarState]: EditorSidebarState;
}

class Store extends LazyStore {
  xKeys = STORE_KEYS;

  xGet<T extends keyof AppStoreState>(
    key: T,
    def: AppStoreState[T],
  ): Promise<AppStoreState[T]>;
  xGet<T extends keyof AppStoreState>(
    key: T,
    def?: AppStoreState[T],
  ): Promise<AppStoreState[T] | undefined>;
  async xGet<T extends keyof AppStoreState>(key: T, def?: AppStoreState[T]) {
    return (await this.get(key)) ?? def;
  }

  xSet<T extends keyof AppStoreState>(key: T, value: AppStoreState[T]) {
    return this.set(key, value);
  }
}

export const store = new Store('settings.json');

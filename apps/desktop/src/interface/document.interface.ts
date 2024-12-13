import { AppHotkeys } from '@/utils/const/app.const';
import { EditorSettings, EditorSidebarState } from './editor.interface';
import { AppBookmarksState } from './app.interface';
import { SnippetMetadata } from './snippet.interface';

export interface DocumentStoreBookmarksItem {
  path: string;
  createdAt: number;
}

export interface DocumentStoreBookmarks {
  state: AppBookmarksState;
  items: DocumentStoreBookmarksItem[];
}

export interface DocumentStoreSettings {
  editor: EditorSettings;
  noPromptDelete: boolean;
  hotkeys: Record<AppHotkeys, string>;
}

export interface DocumentStoreState {
  recentSnippets: string[];
  editor: EditorSidebarState;
}

export type DocumentStoreMetadata = Record<string, SnippetMetadata>;

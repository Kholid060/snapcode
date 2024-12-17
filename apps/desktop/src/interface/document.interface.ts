import { AppHotkeys } from '@/utils/const/app.const';
import { EditorSettings, EditorSidebarState } from './editor.interface';
import { AppBookmarksState, AppSettings } from './app.interface';
import { SnippetMetadata } from './snippet.interface';

export interface DocumentStoreBookmarksItem {
  path: string;
  createdAt: number;
  type: 'file' | 'folder';
}

export interface DocumentStoreBookmarks {
  state: AppBookmarksState;
  items: DocumentStoreBookmarksItem[];
}

export interface DocumentStoreSettings {
  general: AppSettings;
  editor: EditorSettings;
  noPromptDelete: boolean;
  hotkeys: Record<AppHotkeys, string>;
}

export interface DocumentStoreState {
  recentSnippets: string[];
  editor: EditorSidebarState;
}

export type DocumentStoreMetadata = Record<string, SnippetMetadata>;

export type DocumentFlatTreeBase = Record<string, DocumentFlatTreeItem[]>;

export type DocumentFlatTree = Record<
  '__root' | (string & {}),
  DocumentFlatTreeItem[]
>;

export interface DocumentFlatTreeItem {
  ext: string;
  path: string;
  name: string;
  mtime: number;
  isDir: boolean;
  metadata?: SnippetMetadata;
}

export interface DocumenFlatTreeData {
  flatTree: DocumentFlatTree;
  metadata: Record<string, DocumentFlatTreeItem>;
}

export interface DocumentCreatedFolder {
  name: string;
  path: string;
}

export interface DocumentCreatedSnippet extends DocumentCreatedFolder {
  ext: string;
  stored?: SnippetMetadata;
}

export type DocumentOldNewVal = [oldValue: string, newValue: string];

export interface DocumentFolderEntry {
  path: string;
  name: string;
}

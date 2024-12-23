import { AppHotkeys } from '@/utils/const/app.const';
import { EditorSettings, EditorSidebarState } from './editor.interface';
import { AppBookmarksState, AppSettings } from './app.interface';
import {
  SnippetMetadata,
  SnippetNewPayloadMetadata,
} from './snippet.interface';
import { FolderNewPayloadMetadata } from './folder.interface';

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

export interface DocumentStoreData {
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
  id: string;
  isDir: boolean;
  parentId: string;
}
export interface DocumentFlatTreeMetadataItem {
  id: string;
  ext: string;
  path: string;
  name: string;
  mtime: number;
  isDir: boolean;
  metadata?: SnippetMetadata;
}
export type DocumentFlatTreeMetadata = Record<
  string,
  DocumentFlatTreeMetadataItem
>;

export interface DocumenFlatTreeData {
  flatTree: DocumentFlatTree;
  metadata: DocumentFlatTreeMetadata;
}

export interface DocumentCreatedFolder {
  name: string;
  path: string;
  metadata?: FolderNewPayloadMetadata;
}

export interface DocumentCreatedSnippet {
  ext: string;
  name: string;
  path: string;
  stored?: SnippetMetadata;
  metadata?: SnippetNewPayloadMetadata;
}

export type DocumentOldNewVal = [oldValue: string, newValue: string];

export interface DocumentFolderEntry {
  path: string;
  name: string;
}

export interface DocumentSearchEntry {
  path: string;
  name: string;
  contents: [number, string][];
}

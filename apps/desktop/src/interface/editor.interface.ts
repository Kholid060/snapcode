import { AppEditorFonts } from '@/utils/const/app.const';
import {
  DocumentFlatTreeItem,
  DocumentSharedSnippet,
} from './document.interface';

export type EditorSidebarItems = 'snippets' | 'bookmarks' | 'search' | 'shared';

export interface EditorSidebarState {
  showSidebar: boolean;
  activeFileId: string;
  activeFolderIds: string[];
  activeMenu: EditorSidebarItems;
}

export interface EditorSidebarCtxMenuBase<T, D> {
  type: T;
  data: D;
  event: PointerEvent;
}

export type EditorSidebarSnippetsCtxMenu = EditorSidebarCtxMenuBase<
  'snippets',
  {
    isTopOfSelected: boolean;
    type: 'folder' | 'snippet';
    item: DocumentFlatTreeItem;
  }
>;

export type EditorSidebarSharedSnippetsCtxMenu = EditorSidebarCtxMenuBase<
  'shared-snippets',
  {
    item: DocumentSharedSnippet;
  }
>;

export type EditorSidebarBookmarksCtxMenu = EditorSidebarCtxMenuBase<
  'bookmarks',
  {
    name: string;
    path: string;
    selectedItems: string[];
    isTopOfSelected: boolean;
    type: 'folder' | 'snippet';
  }
>;

export type EditorSidebarContextMenuItems =
  | EditorSidebarSnippetsCtxMenu
  | EditorSidebarBookmarksCtxMenu
  | EditorSidebarSharedSnippetsCtxMenu;

export interface EditorSettings {
  fontSize: number;
  indentSize: number;
  customFont: string;
  fontLigatures: boolean;
  showLineNumbers: boolean;
  fontFamily: AppEditorFonts | 'custom';
}

export type EditorShareModal = 'github-gist';

export type EditorSettingItems =
  | 'general'
  | 'editor'
  | 'hotkeys'
  | 'integration:github-gist';

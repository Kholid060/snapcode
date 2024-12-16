import { SnippetId } from './snippet.interface';
import { FolderId } from './folder.interface';
import { AppEditorFonts } from '@/utils/const/app.const';

export type EditorSidebarItems = 'snippets' | 'bookmarks' | 'search';

export interface EditorSidebarState {
  showSidebar: boolean;
  activeFileId: SnippetId;
  activeFolderIds: FolderId[];
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
    name: string;
    path: string;
    isTopOfSelected: boolean;
    type: 'folder' | 'snippet';
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
  | EditorSidebarBookmarksCtxMenu;

export interface EditorSettings {
  fontSize: number;
  indentSize: number;
  customFont: string;
  fontLigatures: boolean;
  showLineNumbers: boolean;
  fontFamily: AppEditorFonts | 'custom';
}

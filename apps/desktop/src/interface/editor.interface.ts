import { TreeDataItem } from '@/utils/tree-data-utils';
import { SnippetId } from './snippet.interface';
import { FolderId } from './folder.interface';

export type EditorSidebarItems = 'snippets' | 'bookmarks' | 'search';

export interface EditorSidebarState {
  show: boolean;
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
    id: SnippetId;
    isTopOfSelected: boolean;
    type: 'folder' | 'snippet';
  }
>;

export type EditorSidebarBookmarksCtxMenu = EditorSidebarCtxMenuBase<
  'bookmarks',
  {
    id: string;
    isTopOfSelected: boolean;
    type: 'folder' | 'snippet';
    selectedItems: TreeDataItem[];
  }
>;

export type EditorSidebarContextMenuItems =
  | EditorSidebarSnippetsCtxMenu
  | EditorSidebarBookmarksCtxMenu;

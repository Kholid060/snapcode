import { TreeDataItem } from '@/utils/tree-data-utils';

export type EditorSidebarItems = 'snippets' | 'bookmarks' | 'search';

export interface EditorSidebarState {
  show: boolean;
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
    id: string;
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

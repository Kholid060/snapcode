export type EditorSidebarItems = 'snippets' | 'bookmarks' | 'search';

export interface EditorSidebarState {
  show: boolean;
  activeFileId: string;
  activeFolderIds: string[];
  activeMenu: EditorSidebarItems;
}

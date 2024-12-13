export type AppBookmarkSort =
  | 'name-asc'
  | 'name-desc'
  | 'created-asc'
  | 'created-desc'
  | 'updated-asc'
  | 'updated-desc';

export interface AppBookmarksState {
  sortBy: AppBookmarkSort;
}

export type AppPopupMenuItems = 'search' | 'new-snippet' | 'bookmarks';

export type AppWindowLabel = 'main' | 'popup';

export interface AppDocumentState {
  baseDir: string;
  snippetsDir: string;
  metadataDir: string;
}

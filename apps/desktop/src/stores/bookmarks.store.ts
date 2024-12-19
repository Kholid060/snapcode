import { defineStore } from 'pinia';
import { DocumentStoreBookmarksItem } from '@/interface/document.interface';
import documentService from '@/services/document.service';
import { getNameFromPath, joinDocumentPath } from '@/utils/document-utils';
import { AppBookmarksState } from '@/interface/app.interface';

export const useBookmarksStore = defineStore('bookmarks', () => {
  const data = ref<DocumentStoreBookmarksItem[]>([]);
  const state = shallowReactive<AppBookmarksState>({
    sortBy: 'created-desc',
  });

  async function setBookmark(
    bookmark: Omit<DocumentStoreBookmarksItem, 'createdAt'>,
    isBookmarked: boolean,
  ) {
    const index = data.value.findIndex((item) => item.path === bookmark.path);
    let save = false;

    if (isBookmarked) {
      if (index === -1) {
        data.value.push({ ...bookmark, createdAt: Date.now() });
        save = true;
      }
    } else if (index !== -1) {
      data.value.splice(index, 1);
      save = true;
    }

    if (!save) return;

    await documentService.stores.bookmarks.xSet('items', data.value);
  }
  async function removeBookmarks(paths: string[]) {
    const pathsSet = new Set(paths);
    const filteredBookmars = data.value.filter(
      (bookmark) => !pathsSet.has(bookmark.path),
    );
    if (filteredBookmars.length === data.value.length) return;

    await documentService.stores.bookmarks.xSet('items', data.value);
    data.value = filteredBookmars;
  }
  async function renameBookmark({
    isDir,
    oldPath,
    newPath,
  }: {
    oldPath: string;
    newPath: string;
    isDir: boolean;
  }) {
    let isChanged = false;
    const updatedBookmarks = data.value.map((bookmark) => {
      const isMatch = isDir
        ? bookmark.path.startsWith(oldPath)
        : bookmark.path === oldPath;
      console.log(isMatch, { bookmark, oldPath, newPath });
      if (!isMatch) return bookmark;

      isChanged = true;
      const updatedPath =
        isDir && oldPath !== bookmark.path
          ? joinDocumentPath(newPath, getNameFromPath(oldPath))
          : newPath;
      return {
        ...bookmark,
        path: updatedPath,
      };
    });

    if (isChanged) {
      data.value = updatedBookmarks;
      await documentService.stores.bookmarks.xSet('items', data.value);
    }
  }
  async function updateState<T extends keyof AppBookmarksState>(
    key: T,
    value: AppBookmarksState[T],
  ) {
    state[key] = value;
    await documentService.stores.bookmarks.xSet('state', state);
  }

  function isBookmarked(path: string) {
    return data.value.some((item) => item.path === path);
  }

  async function init() {
    const [bookmarks, storedState] = await Promise.all([
      documentService.stores.bookmarks.xGet('items', []),
      documentService.stores.bookmarks.xGet('state', { sortBy: 'name-asc' }),
    ]);
    data.value = bookmarks;
    Object.assign(state, storedState);
  }

  return {
    init,
    data,
    state,
    updateState,
    setBookmark,
    isBookmarked,
    renameBookmark,
    removeBookmarks,
  };
});

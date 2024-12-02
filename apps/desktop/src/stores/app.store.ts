import { AppBookmarksState } from '@/interface/app.interface';
import { store } from '@/services/store.service';
import { watchDebounced } from '@vueuse/core';
import { defineStore } from 'pinia';

const DEFAULT_BOOKMARK_STATE: AppBookmarksState = {
  sortBy: 'name-asc',
} as const;

export const useAppStore = defineStore('app-store', () => {
  const bookmarkState = reactive<AppBookmarksState>({
    ...DEFAULT_BOOKMARK_STATE,
  });

  function updateBookmarkState<T extends keyof AppBookmarksState>(
    key: T,
    value: AppBookmarksState[T],
  ) {
    bookmarkState[key] = value;
  }

  async function init() {
    const storedBookmarkState = await store.xGet(store.xKeys.bookmarkState, {
      ...DEFAULT_BOOKMARK_STATE,
    });
    Object.assign(bookmarkState, storedBookmarkState);
  }

  watchDebounced(
    bookmarkState,
    () => {
      store.xSet(store.xKeys.bookmarkState, bookmarkState);
    },
    { debounce: 500 },
  );

  return {
    init,
    bookmarkState,
    updateBookmarkState,
  };
});

<template>
  <PopupSnippetCombobox :items="bookmarks" />
</template>
<script setup lang="ts">
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';
import PopupSnippetCombobox from './PopupSnippetCombobox.vue';
import type { AppBookmarksState } from '@/interface/app.interface';
import documentService from '@/services/document.service';
import type { DocumentStoreBookmarksItem } from '@/interface/document.interface';
import { bookmarksSorter } from '@/utils/bookmarks-util';
import { getDocumentParentDir } from '@/utils/document-utils';

interface BookmarkSnippetItem extends DocumentStoreBookmarksItem {
  name: string;
}

const bookmarks = shallowRef<BookmarkSnippetItem[]>([]);
const bookmarkState = shallowRef<AppBookmarksState>({
  sortBy: 'name-asc',
});

async function fetchBookmarks() {
  try {
    const bookmarkData = Object.fromEntries(
      await documentService.stores.bookmarks.entries(),
    );
    if (bookmarkData.state) {
      bookmarkState.value = bookmarkData.state as AppBookmarksState;
    }
    if (bookmarkData.items) {
      const mappedItem: BookmarkSnippetItem[] = (
        bookmarkData.items as DocumentStoreBookmarksItem[]
      ).map((item) => ({
        ...item,
        name: getDocumentParentDir(item.path).filename,
      }));
      bookmarks.value = bookmarksSorter(mappedItem, bookmarkState.value);
    }
  } catch (error) {
    logger.error(getLogMessage('quick-access:bookmarks', error));
  }
}

onBeforeMount(() => {
  fetchBookmarks();
});
</script>

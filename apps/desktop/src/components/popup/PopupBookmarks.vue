<template>
  <PopupSnippetCombobox :items="snippets" />
</template>
<script setup lang="ts">
import { getAllSnippets } from '@/db/services/snippet.db-service';
import type { SnippetListItem } from '@/interface/snippet.interface';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';
import PopupSnippetCombobox from './PopupSnippetCombobox.vue';
import type { AppBookmarksState } from '@/interface/app.interface';
import { store } from '@/services/store.service';

const snippets = shallowRef<SnippetListItem[]>([]);
const bookmarkState = shallowRef<AppBookmarksState>({
  sortBy: 'name-asc',
});

async function fetchBookmarks() {
  try {
    snippets.value = await getAllSnippets({
      filter(fields, operators) {
        return operators.eq(fields.isBookmark, true);
      },
      orderBy(fields, operators) {
        switch (bookmarkState.value.sortBy) {
          case 'created-asc':
            return operators.asc(fields.createdAt);
          case 'created-desc':
            return operators.desc(fields.createdAt);
          case 'updated-asc':
            return operators.asc(fields.updatedAt);
          case 'updated-desc':
            return operators.desc(fields.updatedAt);
          case 'name-desc':
            return operators.desc(fields.name);
          case 'name-asc':
          default:
            return operators.asc(fields.name);
        }
      },
    });
  } catch (error) {
    logger.error(getLogMessage('quick-access:bookmarks', error));
  }
}

onBeforeMount(async () => {
  try {
    bookmarkState.value = await store.xGet(store.xKeys.bookmarkState, {
      sortBy: 'name-asc',
    });
    await fetchBookmarks();
  } catch (error) {
    logger.error(getLogMessage('quick-access:bookmarks-mount', error));
  }
});
</script>

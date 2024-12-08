<template>
  <PopupSnippetCombobox :items="snippets" />
</template>
<script setup lang="ts">
import { getAllSnippets } from '@/db/services/snippet.db-service';
import type { SnippetListItem } from '@/interface/snippet.interface';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';
import PopupSnippetCombobox from './PopupSnippetCombobox.vue';

const snippets = shallowRef<SnippetListItem[]>([]);

async function fetchBookmarks() {
  try {
    snippets.value = await getAllSnippets({
      filter(fields, operators) {
        return operators.eq(fields.isBookmark, true);
      },
    });
    console.log(snippets);
  } catch (error) {
    logger.error(getLogMessage('quick-access:bookmarks', error));
  }
}

onBeforeMount(() => {
  fetchBookmarks();
});
</script>

<template>
  <PopupSnippetCombobox
    :items="searchEmpty ? recentSnippets : snippets"
    model-value=""
    :is-loading="isLoading"
    class="pb-4"
    :include-close-action="searchEmpty"
    close-action-label="Remove from recent"
    :group-heading="searchEmpty ? 'Recent snippets' : ''"
    @snippet:sent="addToRecent"
    @snippet:close="removeFromRecent($event.path)"
    @update:search-term="fetchSnippets"
    :item-contains-html="!searchEmpty"
    :filter-function="(value) => value"
  >
  </PopupSnippetCombobox>
</template>
<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import { useToast } from '@snippy/ui';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';
import PopupSnippetCombobox from './PopupSnippetCombobox.vue';
import documentService from '@/services/document.service';
import type { DocumentSearchEntry } from '@/interface/document.interface';
import { getNameFromPath } from '@/utils/document-utils';

const { toast } = useToast();

const isLoading = shallowRef(false);
const searchEmpty = shallowRef(true);
const snippets = shallowRef<DocumentSearchEntry[]>([]);
const recentSnippets = shallowRef<DocumentSearchEntry[]>([]);

const fetchSnippets = useDebounceFn((search: string) => {
  if (!search) {
    snippets.value = [];
    searchEmpty.value = true;
    return;
  }
  if (isLoading.value) return;

  isLoading.value = true;
  searchEmpty.value = false;

  documentService
    .search(search)
    .then((value) => {
      snippets.value = value;
    })
    .catch((error) => {
      toast({
        variant: 'destructive',
        title: 'An error occured',
        description: typeof error === 'string' ? error : '',
      });
      logger.error(getLogMessage('search-snippets', error));
    })
    .finally(() => {
      isLoading.value = false;
    });
}, 200);

async function addToRecent(snippetPath: string) {
  try {
    const recentIndex = recentSnippets.value.findIndex(
      (snippet) => snippet.path === snippetPath,
    );
    if (recentIndex !== -1) {
      if (recentSnippets.value.length === 1) return;

      const snippet = recentSnippets.value.splice(recentIndex, 1);
      recentSnippets.value.unshift(...snippet);
    } else {
      recentSnippets.value.unshift({
        contents: [],
        path: snippetPath,
        name: getNameFromPath(snippetPath),
      });
    }

    if (recentSnippets.value.length > 6) {
      recentSnippets.value.pop();
    }

    await documentService.stores.data.xSet(
      'recentSnippets',
      recentSnippets.value.map((item) => item.path),
    );
    triggerRef(recentSnippets);
  } catch (error) {
    logger.error(getLogMessage('quick-access:add-recent', error));
  }
}
function removeFromRecent(path: string) {
  const items = recentSnippets.value.filter((item) => item.path !== path);
  if (items.length === recentSnippets.value.length) return;

  recentSnippets.value = items;
  documentService.stores.data.xSet(
    'recentSnippets',
    items.map((item) => item.path),
  );
}
async function fetchRecentSnippets() {
  try {
    const snippetPaths = await documentService.stores.data.xGet(
      'recentSnippets',
      [],
    );
    if (snippetPaths.length === 0) return;

    recentSnippets.value = snippetPaths.map((path) => ({
      path,
      contents: [],
      name: getNameFromPath(path),
    }));
  } catch (error) {
    logger.error(getLogMessage('quick-access:recent-snippets', error));
  }
}

onMounted(fetchRecentSnippets);
</script>
<style>
[data-radix-vue-combobox-item] {
  &:hover .action,
  &[data-highlighted] .action {
    visibility: visible;
  }
}
</style>

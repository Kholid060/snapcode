<template>
  <PopupSnippetCombobox
    :items="
      (searchEmpty ? recentSnippets : snippets) as SnippetSearchListItem[]
    "
    model-value=""
    :is-loading="isLoading"
    :group-heading="searchEmpty ? 'Recent snippets' : ''"
    @snippet:sended="addToRecent"
    @update:search-term="fetchSnippets"
    :item-contains-html="!searchEmpty"
    :filter-function="(value) => value"
  />
</template>
<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import type {
  SnippetListItem,
  SnippetSearchListItem,
} from '@/interface/snippet.interface';
import { useToast } from '@snippy/ui';
import {
  getAllSnippets,
  querySnippets,
} from '@/db/services/snippet.db-service';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';
import { store } from '@/services/store.service';
import PopupSnippetCombobox from './PopupSnippetCombobox.vue';

const { toast } = useToast();

const isLoading = shallowRef(true);
const searchEmpty = shallowRef(true);
const recentSnippets = shallowRef<SnippetListItem[]>([]);
const snippets = shallowRef<SnippetSearchListItem[]>([]);

const fetchSnippets = useDebounceFn((search: string) => {
  if (!search) {
    snippets.value = [];
    searchEmpty.value = true;
    return;
  }

  isLoading.value = true;
  searchEmpty.value = false;

  querySnippets(search)
    .then((value) => {
      snippets.value = value;
    })
    .catch((error) => {
      toast({
        variant: 'destructive',
        title: 'An error occured',
      });
      logger.error(getLogMessage('search-snippets', error));
    })
    .finally(() => {
      isLoading.value = false;
    });
}, 200);

function getSnippetByIds(ids: string[]) {
  return getAllSnippets({
    filter(fields, operators) {
      return operators.inArray(fields.id, ids);
    },
  });
}
async function addToRecent(snippetId: string) {
  try {
    const recentIndex = recentSnippets.value.findIndex(
      (snippet) => snippet.id === snippetId,
    );
    if (recentIndex !== -1) {
      if (recentSnippets.value.length === 1) return;

      const snippet = recentSnippets.value.splice(recentIndex, 1);
      recentSnippets.value.unshift(...snippet);
    } else {
      const [snippet] = await getSnippetByIds([snippetId]);
      if (!snippet) return;

      recentSnippets.value.unshift(snippet);
    }

    if (recentSnippets.value.length > 6) {
      recentSnippets.value.pop();
    }

    await store.xSet(
      store.xKeys.recentSnippets,
      recentSnippets.value.map((item) => item.id),
    );
    triggerRef(recentSnippets);
  } catch (error) {
    logger.error(getLogMessage('quick-access:add-recent', error));
  }
}
async function fetchRecentSnippets() {
  try {
    const snippetIds = await store.xGet(store.xKeys.recentSnippets, []);
    if (snippetIds.length === 0) return;

    const snippets = await getSnippetByIds(snippetIds);
    if (snippets.length !== snippetIds.length) {
      const filteredSnippetIds = snippetIds.filter((id) =>
        snippets.some((snippet) => snippet.id === id),
      );
      await store.xSet(store.xKeys.recentSnippets, filteredSnippetIds);
    }

    recentSnippets.value = snippets;
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

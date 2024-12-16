<template>
  <Command
    model-value=""
    @update:search-term="search = $event"
    :filter-function="(value) => value"
  >
    <div class="search-input relative p-4 pb-3">
      <UiComboboxSearch auto-focus />
    </div>
    <CommandList class="max-h-none px-4 pt-1">
      <AppSearchOptionsDescription v-if="!searchDebounce" />
      <CommandEmpty
        v-else-if="searchDebounce && !isLoading"
        class="text-muted-foreground"
      >
        No results found.
      </CommandEmpty>
      <CommandItem
        v-for="item in result"
        :key="item.id"
        :value="item.id"
        class="border-border/50 mb-px block"
        @select.prevent="editorStore.state.updateState('activeFileId', item.id)"
      >
        <p v-html="sanitizeSnippetHTML(item.name)"></p>
        <p
          v-if="item.content"
          v-html="sanitizeSnippetHTML(item.content)"
          class="text-muted-foreground mt-1 max-h-[120px] overflow-hidden overflow-ellipsis whitespace-pre-wrap border-t pt-1 text-xs"
        ></p>
      </CommandItem>
    </CommandList>
  </Command>
</template>
<script setup lang="ts">
import { querySnippets } from '@/db/services/snippet.db-service';
import type { SnippetSearchListItem } from '@/interface/snippet.interface';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
  toast,
} from '@snippy/ui';
import { debouncedRef } from '@vueuse/core';
import UiComboboxSearch from '@/components/ui/UiComboboxSearch.vue';
import AppSearchOptionsDescription from '@/components/app/AppSearchOptionsDescription.vue';
import { sanitizeSnippetHTML } from '@/utils/snippet-utils';
import { useEditorStore } from '@/stores/editor.store';

const editorStore = useEditorStore();

const search = shallowRef('');
const result = shallowRef<SnippetSearchListItem[]>([]);
const isLoading = shallowRef(false);
const searchDebounce = debouncedRef(search, 300);

watchEffect(() => {
  isLoading.value = true;

  querySnippets(searchDebounce.value)
    .then((value) => {
      result.value = value;
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
});
</script>

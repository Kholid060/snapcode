<template>
  <Command
    model-value=""
    @update:search-term="onSearchChanged"
    :filter-function="(value) => value"
  >
    <div class="search-input relative p-4 pb-3">
      <UiComboboxSearch auto-focus />
    </div>
    <CommandList class="max-h-none px-4 pb-4 pt-1">
      <CommandItem
        v-for="item in result"
        :key="item.path"
        :value="item.path"
        class="border-border/50 mb-px block text-sm"
        :title="item.path"
        @select.prevent="
          editorStore.state.updateState('activeFileId', item.path)
        "
      >
        <p v-html="sanitizeSnippetHTML(item.name)" class="truncate"></p>
        <p class="text-muted-foreground line-clamp-2 text-xs leading-tight">
          /{{ item.path }}
        </p>
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
import { Command, CommandItem, CommandList, useToast } from '@snippy/ui';
import { useDebounceFn } from '@vueuse/core';
import UiComboboxSearch from '@/components/ui/UiComboboxSearch.vue';
import { sanitizeSnippetHTML } from '@/utils/snippet-utils';
import { useEditorStore } from '@/stores/editor.store';
import documentService from '@/services/document.service';
import type { DocumentSearchEntry } from '@/interface/document.interface';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';

const { toast } = useToast();
const editorStore = useEditorStore();

const result = shallowRef<DocumentSearchEntry[]>([]);
const isLoading = shallowRef(false);

const onSearchChanged = useDebounceFn((searchTerm: string) => {
  if (!searchTerm.trim()) {
    result.value = [];
    return;
  }

  isLoading.value = true;
  documentService
    .search(searchTerm)
    .then((val) => (result.value = val))
    .catch((error) => {
      toast({
        variant: 'destructive',
        title: 'An error occured',
        description: typeof error === 'string' ? error : '',
      });
      logger.error(getLogMessage('sidebar-search', error));
    })
    .finally(() => {
      isLoading.value = false;
    });
}, 250);
</script>

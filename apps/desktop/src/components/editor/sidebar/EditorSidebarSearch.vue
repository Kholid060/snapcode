<template>
  <Command
    model-value=""
    class="flex h-full w-full flex-col overflow-hidden"
    @update:search-term="onSearchChanged"
    :filter-function="(value) => value"
  >
    <div class="search-input relative p-4 pb-3">
      <CommandInput
        default-theme
        container-class="relative"
        ref="search-input"
        placeholder="Search..."
        role="input"
        class="focus:ring-ring focus:ring-offset-background cmx-search-input h-9 w-full rounded-md border bg-inherit px-10 text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        <template #icon>
          <Search01Icon
            class="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2"
          />
        </template>
        <template #append>
          <button
            tabindex="-1"
            clear-icon=""
            class="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2"
            @click="clearSearch"
          >
            <CancelCircleIcon class="text-muted-foreground size-5" />
          </button>
        </template>
      </CommandInput>
    </div>
    <CommandList class="max-h-none px-4 pb-4 pt-1">
      <CommandItem
        v-for="item in result"
        :key="item.path"
        :value="item.path"
        class="border-border/50 mb-px block text-sm"
        :title="item.path"
        @select.prevent="handleSelect(item.path)"
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
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  useToast,
} from '@snippy/ui';
import { unrefElement, useDebounceFn } from '@vueuse/core';
import { sanitizeSnippetHTML } from '@/utils/snippet-utils';
import { useEditorStore } from '@/stores/editor.store';
import documentService from '@/services/document.service';
import type { DocumentSearchEntry } from '@/interface/document.interface';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';
import { CancelCircleIcon, Search01Icon } from 'hugeicons-vue';

const { toast } = useToast();
const editorStore = useEditorStore();

const searchInput = useTemplateRef<HTMLInputElement>('search-input');

const result = shallowRef<DocumentSearchEntry[]>([]);
const isLoading = shallowRef(false);

function handleSelect(path: string) {
  const itemId = editorStore.document.findItemByPath(path)?.id;
  if (!itemId) {
    toast({
      variant: 'destructive',
      title: 'Item not found',
    });
    return;
  }

  editorStore.state.updateState('activeFileId', itemId);
}
function clearSearch() {
  const container = unrefElement(searchInput);
  if (!container) return;

  const inputEl = container.querySelector('input');
  if (!inputEl) return;

  inputEl.value = '';
  inputEl.dispatchEvent(new InputEvent('input'));
}

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

onActivated(() => {
  unrefElement(searchInput.value)?.focus();
});
onMounted(() => {
  unrefElement(searchInput.value)?.focus();
});
</script>

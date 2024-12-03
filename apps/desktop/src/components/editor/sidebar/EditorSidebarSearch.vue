<template>
  <Command
    model-value=""
    @update:search-term="search = $event"
    :filter-function="(value) => value"
  >
    <div class="p-4 pb-3">
      <ComboboxAnchor class="relative">
        <Search01Icon
          class="text-muted-foreground pointer-events-none absolute left-2 top-1/2 size-5 -translate-y-1/2"
        />
        <ComboboxInput
          class="focus:ring-ring focus:ring-offset-background h-9 w-full rounded-md border bg-inherit pl-9 text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2"
          ref="search-input"
          type="search"
          placeholder="Search..."
        />
      </ComboboxAnchor>
    </div>
    <CommandList class="px-4 pt-1">
      <ul v-if="!searchDebounce" class="text-sm">
        <li class="text-muted-foreground mb-1 text-xs">Search options</li>
        <li>
          cnt:
          <span class="text-muted-foreground">match the snippet content</span>
        </li>
      </ul>
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
        @select.prevent="
          editorStore.state.setSidebarState('activeFileId', item.id)
        "
      >
        <p v-html="getSafeHtml(item.name)"></p>
        <p
          v-if="item.content"
          v-html="getSafeHtml(item.content)"
          class="text-muted-foreground mt-1 border-t pt-1 text-xs"
        ></p>
      </CommandItem>
    </CommandList>
  </Command>
</template>
<script setup lang="ts">
import sanitizeHtml from 'sanitize-html';
import { ComboboxInput, ComboboxAnchor } from 'radix-vue';
import { querySnippets } from '@/db/services/snippet.db-service';
import type { SnippetSearchListItem } from '@/interface/snippet.interface';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
  useToast,
} from '@snippy/ui';
import { unrefElement, debouncedRef } from '@vueuse/core';
import { Search01Icon } from 'hugeicons-vue';
import { useEditorStore } from '@/stores/editor.store';

const searchInput = useTemplateRef<HTMLElement>('search-input');

const { toast } = useToast();
const editorStore = useEditorStore();

const result = shallowRef<SnippetSearchListItem[]>([]);
const isLoading = shallowRef(false);
const search = shallowRef('');
const searchDebounce = debouncedRef(search, 300);

function getSafeHtml(str: string) {
  return sanitizeHtml(str, {
    allowedTags: ['span'],
    allowedAttributes: { span: ['search-result'] },
  });
}

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

onMounted(() => {
  unrefElement(searchInput)?.focus();
});
</script>
<style lang="css">
span[search-result] {
  @apply bg-primary/40 text-foreground rounded;
}
</style>

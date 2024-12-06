<template>
  <PopupInputPlaceholder
    v-if="inputSnippet"
    :snippet="inputSnippet"
    @close="inputSnippet = null"
  />
  <AppSearchSnippets
    v-else
    class="popup-search rounded-none"
    @select-item="handleSelectItem"
  >
    <template #search="{ search }">
      <div class="search-input relative mt-1.5 flex gap-1.5 px-4 pb-3">
        <ComboboxAnchor class="relative grow">
          <Search01Icon
            class="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2"
          />
          <ComboboxInput
            class="focus:ring-ring focus:ring-offset-background h-9 w-full rounded-md border bg-inherit px-10 text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2"
            ref="search-input"
            placeholder="Search..."
          />
          <CancelCircleIcon
            v-if="search"
            @click="clearSearch"
            class="text-muted-foreground absolute right-3 top-1/2 size-5 -translate-y-1/2"
          />
        </ComboboxAnchor>
      </div>
    </template>
  </AppSearchSnippets>
</template>
<script setup lang="ts">
import { unrefElement } from '@vueuse/core';
import AppSearchSnippets from '../app/AppSearchSnippets.vue';
import type {
  SnippetSearchListItem,
  SnippetWithPlaceholder,
} from '@/interface/snippet.interface';
import { ComboboxAnchor, ComboboxInput } from 'radix-vue';
import { appCommand } from '@/services/app-command.service';
import { CancelCircleIcon, Search01Icon } from 'hugeicons-vue';
import PopupInputPlaceholder from './PopupInputPlaceholder.vue';

const searchInput = useTemplateRef<HTMLInputElement>('search-input');

const inputSnippet = shallowRef<
  (SnippetWithPlaceholder & SnippetSearchListItem) | null
>(null);

async function handleSelectItem(item: SnippetSearchListItem) {
  try {
    const result = await appCommand.invoke('get_snippet_with_placeholder', {
      snippetId: item.id,
    });
    console.log(result);
    if (result.placeholders.length === 0) {
      // paste
      return;
    }

    inputSnippet.value = {
      ...item,
      ...result,
    };
  } catch (error) {
    console.error(error);
  }
}
function clearSearch() {
  const inputEl = unrefElement(searchInput);
  if (inputEl) {
    inputEl.value = '';
    inputEl.dispatchEvent(new InputEvent('input'));
  }
}

onMounted(() => {
  unrefElement(searchInput.value)?.focus();
});
</script>

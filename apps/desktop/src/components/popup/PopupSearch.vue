<template>
  <AppSearchSnippets
    class="popup-search rounded-none"
    @select-item="handleSelectItem"
  />
</template>
<script setup lang="ts">
import { unrefElement } from '@vueuse/core';
import AppSearchSnippets from '../app/AppSearchSnippets.vue';
import type {
  SnippetSearchListItem,
  SnippetWithPlaceholder,
} from '@/interface/snippet.interface';
import { appCommand } from '@/services/app-command.service';

const inputRef = useTemplateRef<HTMLInputElement>('input-ref');

const inputSnippet = shallowRef<
  (SnippetWithPlaceholder & SnippetSearchListItem) | null
>(null);

async function handleSelectItem(item: SnippetSearchListItem) {
  try {
    const result = await appCommand.invoke('get_snippet_with_placeholder', {
      snippetId: item.id,
    });
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

onMounted(() => {
  unrefElement(inputRef.value)?.focus();
});
</script>
<style>
.popup-search .search-input {
  padding-top: theme('padding.2');
}
</style>

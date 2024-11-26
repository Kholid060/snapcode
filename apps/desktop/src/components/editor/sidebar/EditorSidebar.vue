<template>
  <aside
    class="bg-olive-2 flex h-screen w-64 flex-col border-r"
    @drag.prevent
    @dragover.prevent
  >
    <div class="relative h-14 flex-shrink-0 border-b">
      <SearchIcon
        class="text-muted-foreground absolute left-4 top-1/2 size-5 -translate-y-1/2"
      />
      <input
        v-model="search"
        type="search"
        placeholder="Search..."
        class="h-full w-full bg-transparent pl-12 pr-4 focus:outline-none"
      />
    </div>
    <EditorSidebarSearch v-if="debouncedSearch.length > 0" />
    <EditorSidebarSnippets :hide="debouncedSearch.length > 0" />
  </aside>
</template>
<script setup lang="ts">
import SearchIcon from '~icons/hugeicons/search-01';
import EditorSidebarSnippets from './EditorSidebarSnippets.vue';
import { refDebounced } from '@vueuse/core';
import EditorSidebarSearch from './EditorSidebarSearch.vue';

const search = shallowRef('');
const debouncedSearch = refDebounced(search, 500);
</script>

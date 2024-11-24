<template>
  <aside class="border-r w-64 bg-olive-2">
    <div class="h-14 border-b relative">
      <SearchIcon class="absolute size-5 text-muted-foreground left-4 top-1/2 -translate-y-1/2" />
      <input
        v-model="search"
        type="search"
        placeholder="Search..."
        class="bg-transparent h-full w-full pr-4 pl-12 focus:outline-none"
      >
      <EditorSidebarSearch v-if="debouncedSearch.length > 0" />
      <div v-show="debouncedSearch.length === 0">
        <EditorSidebarSnippets />
      </div>
    </div>
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

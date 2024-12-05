<template>
  <AppSearchSnippets
    @select-item="editorStore.state.setSidebarState('activeFileId', $event.id)"
  />
</template>
<script setup lang="ts">
import { useEditorStore } from '@/stores/editor.store';
import AppSearchSnippets from '@/components/app/AppSearchSnippets.vue';

const editorStore = useEditorStore();
</script>

<template>
  <EditorSidebar
    v-if="editorStore.state.sidebarState.show"
    class="flex-shrink-0"
  />
  <div class="min-w-0 grow">
    <EditorContentHeader />
    <EditorContentCM v-if="editorStore.data.activeSnippet" />
  </div>
</template>
<script setup lang="ts">
import EditorContentCM from './content/EditorContentCM.vue';
import EditorContentHeader from './content/EditorContentHeader.vue';
import EditorSidebar from './sidebar/EditorSidebar.vue';
import { useEditorStore } from '@/stores/editor.store';
import { useTauriWindowEvent } from '@/composables/tauri.composable';

const editorStore = useEditorStore();

useTauriWindowEvent('snippet:open', (event) => {
  editorStore.state.setSidebarState('activeFileId', event.payload);
});
useTauriWindowEvent('snippet:created', (event) => {
  editorStore.data.registerSnippets([event.payload]);
});
</script>

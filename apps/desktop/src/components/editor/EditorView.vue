<template>
  <EditorSidebar
    v-if="editorStore.state.state.showSidebar"
    class="flex-shrink-0"
  />
  <div class="min-w-0 grow">
    <EditorContentHeader />
    <!-- <EditorContentCM v-if="editorStore.activeSnippet" /> -->
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
  editorStore.state.updateState('activeFileId', event.payload);
});
</script>

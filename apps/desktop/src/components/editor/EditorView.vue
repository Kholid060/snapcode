<template>
  <main class="flex h-screen">
    <div v-if="editorState.status === 'error'">
      <p>Error!</p>
    </div>
    <template v-else-if="editorState.status === 'idle'">
      <EditorSidebar />
      <div class="flex-1">
        <!-- <RouterView /> -->
      </div>
    </template>
  </main>
</template>
<script setup lang="ts">
import EditorSidebar from './sidebar/EditorSidebar.vue';
import { useEditorStore } from '@/stores/editor.store';

const editorStore = useEditorStore();

const editorState = shallowReactive<{
  status: 'loading' | 'idle' | 'error';
  errorMessage: string;
}>({
  errorMessage: '',
  status: 'loading',
});

editorStore
  .init()
  .then(() => {
    editorState.status = 'idle';
  })
  .catch((error) => {
    editorState.status = 'error';
    editorState.errorMessage = error.message;
  });
</script>

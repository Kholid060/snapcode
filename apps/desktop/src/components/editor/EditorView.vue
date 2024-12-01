<template>
  <div v-if="editorState.status === 'error'">
    <p>Error!</p>
    <p>{{ editorState.errorMessage }}</p>
  </div>
  <template v-else-if="editorState.status === 'idle'">
    <EditorSidebar
      v-if="editorStore.state.sidebarState.show"
      class="flex-shrink-0"
    />
    <div class="min-w-0 grow">
      <EditorContentHeader />
      <EditorContentCM v-if="editorStore.data.activeSnippet" />
    </div>
  </template>
</template>
<script setup lang="ts">
import EditorContentCM from './content/EditorContentCM.vue';
import EditorContentHeader from './content/EditorContentHeader.vue';
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

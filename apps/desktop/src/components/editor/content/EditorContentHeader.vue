<template>
  <div class="h-14 border-b">
    <template v-if="activeFile">
      <p>{{ activeFile.name }}</p>
    </template>
  </div>
</template>
<script setup lang="ts">
import { useEditorStore } from '@/stores/editor.store';

const editorStore = useEditorStore();

const activeFile = computed(() => editorStore.data.activeSnippet);
</script>

<template>
  <EditorSidebar
    v-if="editorStore.state.state.showSidebar"
    class="flex-shrink-0"
  />
  <div class="min-w-0 grow">
    <EditorContentHeader />
    <EditorContentCM v-if="editorStore.activeSnippet" />
  </div>
  <ShareSnippet />
</template>
<script setup lang="ts">
import EditorContentCM from './content/EditorContentCM.vue';
import EditorContentHeader from './content/EditorContentHeader.vue';
import EditorSidebar from './sidebar/EditorSidebar.vue';
import { useEditorStore } from '@/stores/editor.store';
import { useTauriWindowEvent } from '@/composables/tauri.composable';
import { getDocumentParentDir } from '@/utils/document-utils';
import { TREE_ROOT_KEY } from '@/utils/tree-data-utils';
import ShareSnippet from './share/ShareSnippet.vue';

const editorStore = useEditorStore();

useTauriWindowEvent('snippet:open', (event) => {
  const item = editorStore.document.findItemMetadataByPath(event.payload);
  if (!item) return;

  editorStore.state.updateState('activeFileId', item.id);
});
useTauriWindowEvent('snippet:created', (event) => {
  const parsedPath = getDocumentParentDir(event.payload.path);
  const parent = parsedPath.parentDir
    ? editorStore.document.findItemMetadataByPath(parsedPath.parentDir, true)
        ?.id || TREE_ROOT_KEY
    : TREE_ROOT_KEY;

  editorStore.document.registerItems({
    snippets: [{ ...event.payload, metadata: { parentId: parent } }],
  });
});
</script>

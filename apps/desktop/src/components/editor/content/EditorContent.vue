<template>
  <EditorContentHeader />
  <EditorContentCM
    v-if="editorStore.data.activeSnippet"
    @change="handleContentChange"
    :content="content"
  />
</template>
<script lang="ts" setup>
import { useEditorStore } from '@/stores/editor.store';
import EditorContentHeader from './EditorContentHeader.vue';
import EditorContentCM from './EditorContentCM.vue';
import {
  getSnippetContent,
  updateSnippet,
} from '@/db/services/snippet.db-service';
import { useDebounceFn } from '@vueuse/core';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';

const editorStore = useEditorStore();

const content = shallowRef('');

const handleContentChange = useDebounceFn(async (value: string) => {
  try {
    await updateSnippet(editorStore.state.activeFileId, { content: value });
  } catch (error) {
    logger.error(getLogMessage('save-snippet-content', error));
  }
}, 500);

watchEffect(async () => {
  if (!editorStore.state.activeFileId) return;

  try {
    const result = await getSnippetContent(editorStore.state.activeFileId);
    content.value = result?.content ?? '';
  } catch (error) {
    logger.error(getLogMessage('get-snippet-content', error));
  }
});
</script>

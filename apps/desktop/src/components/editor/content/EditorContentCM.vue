<template>
  <div
    class="codemirror w-full cursor-auto"
    ref="container-ref"
    style="height: calc(100vh - 5rem)"
  ></div>
  <EditorContentFooter :language-label="langLabel" :cursor-pos="cursorPos" />
</template>
<script setup lang="ts">
import type { CMEditorView, ViewUpdate } from '@snippy/codemirror';
import { Compartment, EditorState } from '@codemirror/state';
import {
  loadCodemirror,
  getLanguageByName,
  onUpdateExtension,
  snippetPlaceholder,
  indentWithTabExtension,
} from '@snippy/codemirror';
import { useEditorStore } from '@/stores/editor.store';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';
import { getSnippetContent } from '@/db/services/snippet.db-service';
import { useDebounceFn } from '@vueuse/core';
import EditorContentFooter from './EditorContentFooter.vue';
import { getSnippetLangFromName } from '@/utils/snippet-utils';

let isReplaceValue = false;
const languageComp = new Compartment();

const editorStore = useEditorStore();

const containerRef = useTemplateRef('container-ref');

const langLabel = shallowRef('');
const cmView = shallowRef<CMEditorView>();

const cursorPos = shallowReactive({
  col: 0,
  line: 0,
});

function updateCursorPos(update: ViewUpdate) {
  const head = update.state.selection.main.head;
  const cursor = update.state.doc.lineAt(head);

  Object.assign(cursorPos, {
    line: cursor.number,
    col: head - cursor.from,
  });
}
async function loadLanguage() {
  if (!cmView.value) return;

  const snippet = editorStore.data.activeSnippet;

  const language = snippet.lang
    ? getLanguageByName(editorStore.data.activeSnippet.lang!)
    : await getSnippetLangFromName(snippet.name ?? '');
  const langExt = language ? await language.load() : null;
  cmView.value.dispatch({
    effects: languageComp.reconfigure(langExt ?? []),
  });
  langLabel.value = language ? language.name : 'Plain Text';
}

const handleContentChange = useDebounceFn(async (value: string) => {
  try {
    await editorStore.data.updateSnippet(
      editorStore.state.sidebarState.activeFileId,
      {
        content: value,
      },
    );
  } catch (error) {
    logger.error(getLogMessage('save-snippet-content', error));
  }
}, 1000);

watchEffect(async () => {
  const snippetId = editorStore.state.sidebarState.activeFileId;
  if (!snippetId || !cmView.value) return;

  try {
    const result = await getSnippetContent(snippetId);
    if (result) {
      const newState = EditorState.create({
        doc: result.content ?? '',
      });
      cmView.value.replaceContent(newState);

      await loadLanguage();
    }
  } catch (error) {
    logger.error(getLogMessage('get-snippet-content', error));
  }
});
watch(() => editorStore.data.activeSnippet.lang, loadLanguage);

onMounted(() => {
  const updateListenerExt = onUpdateExtension((update) => {
    updateCursorPos(update);

    if (update.docChanged && !isReplaceValue) {
      handleContentChange(update.state.doc.toString());
    }
  });

  cmView.value = loadCodemirror({
    doc: '',
    parent: containerRef.value!,
    extensions: [
      updateListenerExt,
      snippetPlaceholder(),
      languageComp.of([]),
      indentWithTabExtension,
    ],
  });
  loadLanguage();
});
onUnmounted(() => {
  cmView.value?.destroy();
});
</script>
<style src="@/assets/css/editor.css"></style>

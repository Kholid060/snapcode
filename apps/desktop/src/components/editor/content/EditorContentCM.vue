<template>
  <div
    class="codemirror w-full cursor-auto"
    ref="container-ref"
    style="
      height: calc(100vh - 5rem);
      --editor-font-size: 14px;
      --editor-font-family: 'JetBrains Mono';
    "
  ></div>
  <EditorContentFooter
    v-if="!isNotTextFile"
    :language-label="langLabel"
    :cursor-pos="cursorPos"
  />
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
  lineNumbers,
} from '@snippy/codemirror';
import { useEditorStore } from '@/stores/editor.store';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';
import { useDebounceFn } from '@vueuse/core';
import EditorContentFooter from './EditorContentFooter.vue';
import { getSnippetLangFromName } from '@/utils/snippet-utils';
import { indentUnit } from '@codemirror/language';
import documentService from '@/services/document.service';
import { loadEditorFontSettings } from '@/utils/editor-util';
import { useToast } from '@snippy/ui';

let isReplaceValue = false;
const compartments = {
  tabSize: new Compartment(),
  language: new Compartment(),
  readOnly: new Compartment(),
  lineNumbers: new Compartment(),
};

const { toast } = useToast();
const editorStore = useEditorStore();

const containerRef = useTemplateRef('container-ref');

const langLabel = shallowRef('');
const cmView = shallowRef<CMEditorView>();
const isNotTextFile = shallowRef(false);

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
  const snippet = editorStore.activeSnippet;
  if (!cmView.value || !snippet) return;

  const language = snippet.metadata?.lang
    ? getLanguageByName(snippet.metadata.lang)
    : await getSnippetLangFromName(snippet.name ?? '');
  const langExt = language ? await language.load() : null;
  cmView.value.dispatch({
    effects: compartments.language.reconfigure(langExt ?? []),
  });
  langLabel.value = language ? language.name : 'Plain Text';
}
function loadSettings() {
  const settings = editorStore.settings.data;
  const containerEl = containerRef.value;

  if (containerEl) {
    loadEditorFontSettings(containerEl, settings);
  }

  cmView.value?.dispatch({
    effects: [
      compartments.tabSize.reconfigure(
        indentUnit.of(' '.repeat(settings.indentSize)),
      ),
      compartments.lineNumbers.reconfigure(
        settings.showLineNumbers ? lineNumbers() : [],
      ),
    ],
  });
}
async function getContent() {
  if (!editorStore.activeSnippet?.path) return '';

  try {
    return await documentService.getFileContent(editorStore.activeSnippet.path);
  } catch (error) {
    if (typeof error === 'string') {
      toast({
        variant: 'destructive',
        title:
          error === 'not-text-file' ? 'This file is not a text file' : error,
      });

      if (error.includes('not found') || error === 'not-text-file') {
        editorStore.state.updateState('activeFileId', '');
        return;
      }
    }

    editorStore.state.updateState('activeFileId', '');
    logger.error(getLogMessage('get-snippet-content', error));

    return '';
  }
}

const handleContentChange = useDebounceFn(async (value: string) => {
  try {
    await editorStore.document.updateSnippetContents(
      editorStore.state.state.activeFileId,
      value,
    );
  } catch (error) {
    logger.error(getLogMessage('save-snippet-content', error));
  }
}, 1000);

watch(
  () => editorStore.activeSnippet?.path,
  async (path) => {
    if (!path || !cmView.value) return;

    const content = await getContent();
    const newState = EditorState.create({
      doc: content ?? '',
    });
    cmView.value.replaceContent(newState);
    cmView.value.dispatch({
      effects: compartments.readOnly.reconfigure(
        EditorState.readOnly.of(false),
      ),
    });

    isNotTextFile.value = false;

    await loadLanguage();
  },
);
watch(() => editorStore.activeSnippet?.metadata?.lang, loadLanguage);

watch(editorStore.settings.data, loadSettings);

defineExpose({
  cmView,
});

onMounted(async () => {
  const content = await getContent();

  const updateListenerExt = onUpdateExtension((update) => {
    if (isNotTextFile.value) return;

    updateCursorPos(update);

    if (update.docChanged && !isReplaceValue) {
      handleContentChange(update.state.doc.toString());
    }
  });

  const settings = editorStore.settings.data;
  cmView.value = loadCodemirror(
    {
      doc: content,
      parent: containerRef.value!,
      extensions: [
        updateListenerExt,
        snippetPlaceholder(),
        indentWithTabExtension,
        compartments.readOnly.of([]),
        compartments.language.of([]),
        compartments.lineNumbers.of(
          settings.showLineNumbers ? lineNumbers() : [],
        ),
        compartments.tabSize.of(indentUnit.of(' '.repeat(settings.indentSize))),
      ],
    },
    { lineNumbers: false },
  );
  loadSettings();
  loadLanguage();
});
onUnmounted(() => {
  cmView.value?.destroy();
});
</script>
<style src="@/assets/css/editor.css"></style>

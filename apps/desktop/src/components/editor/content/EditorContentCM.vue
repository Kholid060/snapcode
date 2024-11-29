<template>
  <div
    class="codemirror w-full"
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
  getLanguageByExt,
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

const snippetExt = computed(() => editorStore.data.activeSnippet.ext ?? '');

function updateCursorPos(update: ViewUpdate) {
  const head = update.state.selection.main.head;
  const cursor = update.state.doc.lineAt(head);

  Object.assign(cursorPos, {
    line: cursor.number,
    col: head - cursor.from,
  });
}
async function loadLanguageExt() {
  if (!cmView.value) return;

  const language = getLanguageByExt(snippetExt.value ?? '');
  const langExt = (await language?.load()) ?? [];
  cmView.value.dispatch({
    effects: languageComp.reconfigure(langExt),
  });
  langLabel.value = language ? language.name : 'Plain Text';
}

const handleContentChange = useDebounceFn(async (value: string) => {
  try {
    await editorStore.data.updateSnippet(editorStore.state.activeFileId, {
      content: value,
    });
  } catch (error) {
    logger.error(getLogMessage('save-snippet-content', error));
  }
}, 1000);

watchEffect(async () => {
  const snippetId = editorStore.state.activeFileId;
  if (!snippetId || !cmView.value) return;

  try {
    const result = await getSnippetContent(snippetId);
    if (result) {
      const newState = EditorState.create({
        doc: result.content ?? '',
      });
      cmView.value.replaceContent(newState);

      await loadLanguageExt();
    }
  } catch (error) {
    logger.error(getLogMessage('get-snippet-content', error));
  }
});
watch(snippetExt, loadLanguageExt);

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
  loadLanguageExt();
});
onUnmounted(() => {
  cmView.value?.destroy();
});
</script>
<style lang="postcss">
@import '@snippy/codemirror/src/theme.css';

.codemirror {
  .cm-scroller {
    padding: theme('padding.1');
    padding-left: 0;
    padding-bottom: 0;
  }

  .cm-gutters {
    user-select: none;
    padding-left: theme('padding.1');
  }

  .cm-search.cm-panel {
    padding-left: theme('padding.2');
    padding-right: theme('padding.2');
    border-top: 1px solid theme('colors.border');
    background-color: theme('backgroundColor.background');

    input,
    button {
      border-radius: theme('borderRadius.md');
    }

    .cm-button {
      border: none;
      background-image: none;
      background-color: theme('colors.secondary.DEFAULT');

      &:hover {
        background-color: theme('colors.secondary.hover');
      }
    }
  }

  .cm-snippet-placeholders {
    padding: 1px theme('padding[0.5]');
    border-radius: theme('borderRadius.sm');
    background-color: hsl(var(--primary) / 0.15);
    color: theme('colors.primary.DEFAULT') !important;

    * {
      color: theme('colors.primary.DEFAULT') !important;
    }
  }
}
</style>

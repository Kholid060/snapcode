<template>
  <div
    class="codemirror px-1 pt-1"
    ref="container-ref"
    style="height: calc(100vh - 5rem)"
  ></div>
  <div class="flex h-6 items-center border-t px-4">
    <div class="grow"></div>
    <p class="text-muted-foreground cursor-default text-right text-xs">
      Ln {{ cursorPos.line }}, Col {{ cursorPos.col }}
    </p>
  </div>
</template>
<script setup lang="ts">
import type { EditorView, ViewUpdate } from '@snippy/codemirror';
import { Compartment } from '@codemirror/state';
import {
  loadCodemirror,
  loadLanguageByExt,
  onUpdateExtension,
} from '@snippy/codemirror';
import { useEditorStore } from '@/stores/editor.store';

const props = defineProps<{
  content: string;
}>();
const emit = defineEmits<{
  change: [content: string];
}>();

let isReplaceValue = false;
const language = new Compartment();

const editorStore = useEditorStore();

const containerRef = useTemplateRef('container-ref');

const cmView = shallowRef<EditorView>();
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

watchEffect(async () => {
  const ext = editorStore.data.activeSnippet?.ext;
  if (!cmView.value || !ext) return;

  const langExt = (await loadLanguageByExt(ext)) ?? [];
  cmView.value?.dispatch({
    effects: language.reconfigure(langExt),
  });
});
watch(
  () => props.content,
  () => {
    const view = cmView.value;
    if (!view) return;

    isReplaceValue = true;
    view.dispatch({
      changes: {
        from: 0,
        insert: props.content,
        to: view.state.doc.length,
      },
    });
    setTimeout(() => {
      isReplaceValue = false;
    });
  },
);

onMounted(() => {
  const updateListenerExt = onUpdateExtension((update) => {
    updateCursorPos(update);

    if (update.docChanged && !isReplaceValue) {
      emit('change', update.state.doc.toString());
    }
  });

  cmView.value = loadCodemirror({
    doc: props.content,
    parent: containerRef.value!,
    extensions: [updateListenerExt, language.of([])],
  });
});
onUnmounted(() => {
  cmView.value?.destroy();
});
</script>
<style>
@import '@snippy/codemirror/src/theme.css';
</style>

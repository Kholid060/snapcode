<template>
  <div
    class="codemirror px-1 pt-1"
    ref="container-ref"
    style="height: calc(100vh - 5rem)"
  ></div>
  <div class="flex h-6 items-center border-t px-4">
    <Popover v-model:open="langSelectorState.open">
      <PopoverTrigger as-child>
        <button
          role="combobox"
          class="text-muted-foreground hover:bg-secondary rounded p-0.5 text-xs"
        >
          {{ langSelectorState.label }}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" class="w-48 p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              <CommandItem
                value="txt"
                @select="updateSnippetExt('txt')"
                :class="{
                  'text-lime-10 hover:!text-lime-10': snippetExt === 'txt',
                }"
              >
                <span class="grow">Plain Text</span>
                <CheckIcon class="ml-2 size-4" v-if="snippetExt === 'txt'" />
              </CommandItem>
              <CommandItem
                v-for="language in filteredLangs"
                :key="language.name"
                :value="language.name"
                @select="updateSnippetExt(language.extensions[0])"
                :class="{
                  'text-lime-10 hover:!text-lime-10':
                    language.extensions.includes(snippetExt),
                }"
              >
                <span class="grow">{{ language.name }}</span>
                <CheckIcon
                  class="ml-2 size-4"
                  v-if="language.extensions.includes(snippetExt)"
                />
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    <div class="grow"></div>
    <p class="text-muted-foreground cursor-default text-right text-xs">
      Ln {{ cursorPos.line }}, Col {{ cursorPos.col }}
    </p>
  </div>
</template>
<script setup lang="ts">
import type { EditorView, ViewUpdate } from '@snippy/codemirror';
import { CheckIcon } from 'lucide-vue-next';
import { Compartment } from '@codemirror/state';
import {
  loadCodemirror,
  getLanguageByExt,
  onUpdateExtension,
  snippetPlaceholder,
  languages,
} from '@snippy/codemirror';
import { useEditorStore } from '@/stores/editor.store';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@snippy/ui';

const props = defineProps<{
  content: string;
}>();
const emit = defineEmits<{
  change: [content: string];
}>();

let isReplaceValue = false;
const languageComp = new Compartment();
const filteredLangs = languages
  .filter((lang) => lang.extensions.length > 0)
  .sort((a, z) => a.name.localeCompare(z.name));

const editorStore = useEditorStore();

const containerRef = useTemplateRef('container-ref');

const cmView = shallowRef<EditorView>();

const langSelectorState = shallowReactive({
  label: '',
  open: false,
});
const cursorPos = shallowReactive({
  col: 0,
  line: 0,
});

const snippetExt = computed(() => editorStore.data.activeSnippet?.ext ?? '');

function updateCursorPos(update: ViewUpdate) {
  const head = update.state.selection.main.head;
  const cursor = update.state.doc.lineAt(head);

  Object.assign(cursorPos, {
    line: cursor.number,
    col: head - cursor.from,
  });
}
async function updateSnippetExt(ext: string) {
  langSelectorState.open = false;
  await editorStore.data.updateSnippet(editorStore.data.activeSnippet.id!, {
    ext,
  });
}

watchEffect(async () => {
  if (!cmView.value || !snippetExt.value) return;

  const language = getLanguageByExt(snippetExt.value);
  const langExt = (await language?.load()) ?? [];
  cmView.value?.dispatch({
    effects: languageComp.reconfigure(langExt),
  });

  langSelectorState.label = language ? language.name : 'Plain Text';
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
    extensions: [updateListenerExt, languageComp.of([]), snippetPlaceholder()],
  });
});
onUnmounted(() => {
  cmView.value?.destroy();
});
</script>
<style>
@import '@snippy/codemirror/src/theme.css';
</style>

<template>
  <div
    class="codemirror w-full"
    ref="container-ref"
    style="height: calc(100vh - 5rem)"
  ></div>
  <div class="flex h-6 items-center border-t px-2">
    <Popover v-model:open="langSelectorState.open">
      <PopoverTrigger as-child>
        <button
          role="combobox"
          class="text-muted-foreground hover:bg-secondary min-w-12 rounded p-0.5 text-left text-xs"
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
                <Tick02Icon class="ml-2 size-4" v-if="snippetExt === 'txt'" />
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
                <Tick02Icon
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
    <p class="text-muted-foreground min-w-20 cursor-default text-right text-xs">
      Ln {{ cursorPos.line }}, Col {{ cursorPos.col }}
    </p>
  </div>
</template>
<script setup lang="ts">
import type { CMEditorView, ViewUpdate } from '@snippy/codemirror';
import { Tick02Icon } from 'hugeicons-vue';
import { Compartment, EditorState } from '@codemirror/state';
import {
  loadCodemirror,
  getLanguageByExt,
  onUpdateExtension,
  snippetPlaceholder,
  languages,
  indentWithTabExtension,
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
  useToast,
} from '@snippy/ui';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';
import { getSnippetContent } from '@/db/services/snippet.db-service';
import { useDebounceFn } from '@vueuse/core';

let isReplaceValue = false;
const languageComp = new Compartment();
const filteredLangs = languages
  .filter((lang) => lang.extensions.length > 0)
  .sort((a, z) => a.name.localeCompare(z.name));

const { toast } = useToast();
const editorStore = useEditorStore();

const containerRef = useTemplateRef('container-ref');

const cmView = shallowRef<CMEditorView>();

const langSelectorState = shallowReactive({
  label: '',
  open: false,
});
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
async function updateSnippetExt(ext: string) {
  try {
    langSelectorState.open = false;
    await editorStore.data.updateSnippet(editorStore.data.activeSnippet.id!, {
      ext,
    });
  } catch (error) {
    logger.error(getLogMessage('editor-update-ext', error));
    toast({
      variant: 'destructive',
      title: `Error updating snippet`,
    });
  }
}
async function loadLanguageExt() {
  if (!cmView.value) return;

  const language = getLanguageByExt(snippetExt.value ?? '');
  const langExt = (await language?.load()) ?? [];
  cmView.value.dispatch({
    effects: languageComp.reconfigure(langExt),
  });
  langSelectorState.label = language ? language.name : 'Plain Text';
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

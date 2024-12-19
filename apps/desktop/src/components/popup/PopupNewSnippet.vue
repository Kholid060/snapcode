<template>
  <div class="px-4 pt-1.5">
    <Input
      v-model="newSnippet.name"
      class="h-9 bg-inherit"
      ref="name-input"
      placeholder="unnamed.txt"
    />
  </div>
  <div
    class="codemirror grow cursor-auto overflow-auto px-3 pt-1"
    ref="editor-container"
    style="
      height: calc(100vh - 5rem);
      --editor-font-size: 14px;
      --editor-font-family: 'JetBrains Mono';
    "
  ></div>
  <div class="flex items-center gap-2 px-4 py-2">
    <Popover v-model:open="newSnippet.showFolder" v-slot="{ open }">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          :role="!open ? 'button' : 'combobox'"
          size="sm"
          class="grow justify-between overflow-hidden bg-inherit text-sm"
        >
          <p class="truncate">{{ newSnippet.folder.name }}</p>
          <ArrowDown01Icon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search folder..." />
          <CommandEmpty>No folder found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              <CommandItem
                v-for="folder in folders"
                :key="folder.path"
                :value="folder.path || TREE_ROOT_KEY"
                @select="
                  newSnippet.showFolder = false;
                  newSnippet.folder = folder;
                "
              >
                <Tick02Icon
                  :class="[
                    'mr-2 h-4 w-4 flex-shrink-0',
                    newSnippet.folder.path === folder.path
                      ? 'opacity-100'
                      : 'opacity-0',
                  ]"
                />
                <p class="line-clamp-2 grow">{{ folder.path || '(root)' }}</p>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    <Button class="gap-0 text-sm" @click="createSnippet" size="sm">
      Create
      <Kbd variant="primary-top" class="ml-1 capitalize">
        {{ getHotkeyLabel('mod') }}
      </Kbd>
      <Kbd variant="primary-top" class="ml-px"> ↵ </Kbd>
    </Button>
  </div>
</template>
<script setup lang="ts">
import { getSnippetLangFromName } from '@/utils/snippet-utils';
import type { CMEditorView } from '@snippy/codemirror';
import { Compartment } from '@codemirror/state';
import { loadCodemirrorMinimal, placeholder } from '@snippy/codemirror';
import { debounce } from '@snippy/shared';
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Input,
  Kbd,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useToast,
} from '@snippy/ui';
import { unrefElement } from '@vueuse/core';
import { ArrowDown01Icon, Tick02Icon } from 'hugeicons-vue';
import { getHotkeyLabel, useHotkey } from '@/composables/hotkey.composable';
import type { SnippetNewPayload } from '@/interface/snippet.interface';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';
import { useTauriUtils } from '@/composables/tauri.composable';
import { getCurrentWindow } from '@tauri-apps/api/window';
import {
  joinDocumentPath,
  sanitizeDocumentFileName,
} from '@/utils/document-utils';
import { appCommand } from '@/services/app-command.service';
import type { DocumentFolderEntry } from '@/interface/document.interface';
import type { EditorSettings } from '@/interface/editor.interface';
import documentService from '@/services/document.service';
import { EDITOR_DEFAULT_SETTINGS } from '@/utils/const/editor.const';
import { TREE_ROOT_KEY } from '@/utils/tree-data-utils';

let lastFetch = 0;

const MAX_CACHE_TTL_MS = 2.5 * 60 * 1000;
const ROOT_FOLDER: DocumentFolderEntry = {
  path: '',
  name: '(root)',
};
const languageComp = new Compartment();

const { toast } = useToast();
const { emitEventTo } = useTauriUtils();

const nameInput = useTemplateRef<HTMLInputElement>('name-input');
const editorContainer = useTemplateRef<HTMLDivElement>('editor-container');

const editorSettings = shallowReactive<EditorSettings>({
  ...EDITOR_DEFAULT_SETTINGS,
});
const newSnippet = shallowReactive<{
  name: string;
  showFolder: boolean;
  folder: DocumentFolderEntry;
}>({
  name: '',
  showFolder: false,
  folder: { ...ROOT_FOLDER },
});
const folders = shallowRef<DocumentFolderEntry[]>([]);
const editorView = shallowRef<CMEditorView | null>(null);

function clearState() {
  newSnippet.name = '';
  newSnippet.folder = ROOT_FOLDER;

  editorView.value?.replaceContent({});
}
async function createSnippet() {
  try {
    const name = sanitizeDocumentFileName(newSnippet.name) || 'unnamed.txt';
    const payload: SnippetNewPayload = {
      contents: editorView.value?.state.doc.toString() ?? '',
      path: joinDocumentPath(newSnippet.folder.path, name),
    };

    const [snippet] = await documentService.createSnippets([payload]);
    if (!snippet) return;

    await emitEventTo('main', 'snippet:created', snippet);
    clearState();

    getCurrentWindow().hide();
  } catch (error) {
    toast({
      title: 'Error creating snippet',
    });
    logger.error(getLogMessage('quick-access:new-snippet', error));
  }
}
function fetchData() {
  appCommand.invoke('get_all_document_folders', undefined).then((entries) => {
    folders.value = [ROOT_FOLDER, ...entries].sort(
      (a, z) => a.path.split('/').length - z.path.split('/').length,
    );
    lastFetch = Date.now();
  });
  documentService.stores.state.xGet('editor').then((value) => {
    if (!value) return;
    Object.assign(editorSettings, value);
  });
}

watch(
  () => newSnippet.name,
  debounce(async (name) => {
    if (!editorView.value) return;

    const language = await getSnippetLangFromName(name);
    const langExt = await language?.load();
    editorView.value.dispatch({
      effects: languageComp.reconfigure(langExt ?? []),
    });
  }, 500),
  { immediate: true },
);

useHotkey(['mod+enter', 'alt+enter'], () => {
  createSnippet();
});

onActivated(() => {
  if (Date.now() - lastFetch < MAX_CACHE_TTL_MS) return;
  fetchData();
});
onMounted(() => {
  unrefElement(nameInput)?.focus();

  fetchData();
  editorView.value = loadCodemirrorMinimal({
    parent: editorContainer.value!,
    extensions: [placeholder('Text here...'), languageComp.of([])],
  });
});
onBeforeUnmount(() => {
  editorView.value?.destroy();
});
</script>
<style src="@/assets/css/editor.css"></style>

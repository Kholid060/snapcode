<template>
  <div class="px-4 pt-1.5">
    <Input
      v-model="newSnippet.name"
      class="bg-inherit"
      ref="name-input"
      placeholder="unnamed.txt"
    />
  </div>
  <div
    ref="editor-container"
    class="codemirror grow overflow-auto px-2 pt-1"
  ></div>
  <div class="flex items-center gap-2 px-4 py-2">
    <Popover>
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          role="combobox"
          class="grow justify-between bg-inherit text-sm"
        >
          {{ newSnippet.folder.name }}
          <ArrowDown01Icon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="p-0" align="start">
        <Command v-model="newSnippet.folder">
          <CommandInput placeholder="Search folder..." />
          <CommandEmpty>No folder found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              <CommandItem
                v-for="folder in folders"
                :key="folder.id"
                :value="folder"
              >
                <Tick02Icon
                  :class="[
                    'mr-2 h-4 w-4',
                    newSnippet.folder.id === folder.id
                      ? 'opacity-100'
                      : 'opacity-0',
                  ]"
                />
                {{ folder.name }}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    <Button class="gap-0 text-sm" @click="createSnippet">
      Create
      <Kbd variant="primary-top" class="ml-1 capitalize">
        {{ getHotkeyLabel('mod') }}
      </Kbd>
      <Kbd variant="primary-top" class="ml-px"> ↵ </Kbd>
    </Button>
  </div>
</template>
<script setup lang="ts">
import { getAllFolders } from '@/db/services/folder.db-service';
import type { FolderListItem } from '@/interface/folder.interface';
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
import { createNewSnippets } from '@/db/services/snippet.db-service';
import { useTauriUtils } from '@/composables/tauri.composable';
import { getCurrentWindow } from '@tauri-apps/api/window';

const languageComp = new Compartment();

const { toast } = useToast();
const { emitEventTo } = useTauriUtils();

const nameInput = useTemplateRef<HTMLInputElement>('name-input');
const editorContainer = useTemplateRef<HTMLDivElement>('editor-container');

const rootFolder: FolderListItem = {
  id: '',
  name: '(root)',
  parentId: null,
  isBookmark: false,
  updatedAt: new Date(),
  createdAt: new Date(),
};

const newSnippet = shallowReactive<{
  name: string;
  folder: FolderListItem;
}>({
  name: '',
  folder: rootFolder,
});
const folders = shallowRef<FolderListItem[]>([]);
const editorView = shallowRef<CMEditorView | null>(null);

function clearState() {
  newSnippet.name = '';
  newSnippet.folder = rootFolder;

  editorView.value?.replaceContent({});
}
async function createSnippet() {
  try {
    const payload: SnippetNewPayload = {
      name: newSnippet.name || 'unnamed.txt',
      folderId: newSnippet.folder.id || null,
      content: editorView.value?.state.doc.toString() ?? '',
    };

    const [snippet] = await createNewSnippets([payload]);
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

onMounted(() => {
  unrefElement(nameInput)?.focus();

  getAllFolders().then((value) => (folders.value = [rootFolder, ...value]));
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

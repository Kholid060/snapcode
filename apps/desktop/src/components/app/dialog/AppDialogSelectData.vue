<template>
  <Dialog default-open>
    <DialogContent class="max-w-2xl overflow-hidden p-0 shadow-lg">
      <Command
        default-open
        v-model:search-term="search"
        class="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        @update:open="!$event && $emit('close', { canceled: true, data: null })"
      >
        <CommandInput
          :placeholder="options.title ?? 'Search folders...'"
          @keydown.enter="
            !($event as KeyboardEvent).defaultPrevented && createFolder()
          "
        />
        <CommandList class="min-h-64 p-1.5">
          <CommandEmpty
            v-if="options.type === 'folder'"
            class="bg-accent text-muted-foreground relative block w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none"
            as="button"
            @click="createFolder"
          >
            Create "<span class="text-foreground font-semibold">{{
              search
            }}</span
            >" folder
          </CommandEmpty>
          <CommandEmpty v-else> No result </CommandEmpty>
          <CommandItem
            v-for="folder in items"
            :key="folder.id"
            :value="folder.path || TREE_ROOT_KEY"
            :title="folder.path"
            class="line-clamp-2 block truncate leading-tight"
            @click="
              $emit('close', {
                canceled: false,
                data: { id: folder.id, path: folder.path },
              })
            "
          >
            {{ folder.id === TREE_ROOT_KEY ? '(root)' : folder.path }}
          </CommandItem>
        </CommandList>
      </Command>
    </DialogContent>
  </Dialog>
</template>
<script setup lang="ts">
import type {
  AppDialogSelectDataOptions,
  AppDialogSelectDataResult,
} from '@/providers/app-dialog.provider';
import { logger } from '@/services/logger.service';
import { useEditorStore } from '@/stores/editor.store';
import { sanitizeDocumentFileName } from '@/utils/document-utils';
import { getLogMessage } from '@/utils/helper';
import { TREE_ROOT_KEY } from '@/utils/tree-data-utils';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  useToast,
} from '@snippy/ui';
import { nanoid } from 'nanoid/non-secure';

const props = withDefaults(
  defineProps<{ options?: AppDialogSelectDataOptions }>(),
  {
    options: () => ({ type: 'folder' }),
  },
);
const emit = defineEmits<{
  close: [value: AppDialogSelectDataResult];
}>();

const { toast } = useToast();
const editorStore = useEditorStore();

const search = shallowRef('');

const items = computed(() =>
  Object.values(editorStore.document.treeMetadata)
    .filter((item) =>
      props.options.type === 'folder' ? item.isDir : !item.isDir,
    )
    .sort((a, z) => a.path.split('/').length - z.path.split('/').length),
);

async function createFolder() {
  try {
    if (props.options.type !== 'folder') return;

    const folderId = nanoid(5);
    const [folder] = await editorStore.document.addFolders([
      {
        metadata: { id: folderId },
        path: sanitizeDocumentFileName(search.value),
      },
    ]);
    emit('close', {
      canceled: false,
      data: { id: folderId, path: folder.path },
    });
  } catch (error) {
    logger.error(getLogMessage('dialog-select-folder:create-folder', error));
    toast({
      variant: 'destructive',
      title: 'An error occured when creating folder',
    });
  }
}
</script>

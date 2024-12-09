<template>
  <Dialog default-open>
    <DialogContent class="overflow-hidden p-0 shadow-lg">
      <Command
        default-open
        v-model:search-term="search"
        class="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        @update:open="
          !$event && $emit('close', { canceled: true, folderId: null })
        "
      >
        <CommandInput
          :placeholder="options.title ?? 'Search folders...'"
          @keydown.enter="
            !($event as KeyboardEvent).defaultPrevented && createFolder()
          "
        />
        <CommandList class="p-1.5">
          <CommandEmpty
            class="bg-accent text-muted-foreground relative block w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none"
            as="button"
            @click="createFolder"
          >
            Create "<span class="text-foreground font-semibold">{{
              search
            }}</span
            >" folder
          </CommandEmpty>
          <CommandItem
            value="__"
            @click="$emit('close', { canceled: false, folderId: null })"
          >
            (root)
          </CommandItem>
          <CommandItem
            v-for="folder in editorStore.data.folders"
            :key="folder.id"
            :value="folder.id"
            @click="$emit('close', { canceled: false, folderId: folder.id })"
          >
            {{ folder.name }}
          </CommandItem>
        </CommandList>
      </Command>
    </DialogContent>
  </Dialog>
</template>
<script setup lang="ts">
import type {
  AppDialogSelectFolderOptions,
  AppDialogSelectFolderResult,
} from '@/providers/app-dialog.provider';
import { logger } from '@/services/logger.service';
import { useEditorStore } from '@/stores/editor.store';
import { getLogMessage } from '@/utils/helper';
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

withDefaults(defineProps<{ options?: AppDialogSelectFolderOptions }>(), {
  options: () => ({}),
});
const emit = defineEmits<{
  close: [value: AppDialogSelectFolderResult];
}>();

const { toast } = useToast();
const editorStore = useEditorStore();

const search = shallowRef('');

async function createFolder() {
  try {
    const [folder] = await editorStore.data.addFolders([
      { name: search.value },
    ]);
    emit('close', { canceled: false, folderId: folder.id });
  } catch (error) {
    logger.error(getLogMessage('dialog-select-folder:create-folder', error));
    toast({
      variant: 'destructive',
      title: 'An error occured when creating folder',
    });
  }
}
</script>

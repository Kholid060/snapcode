<template>
  <CommandDialog
    default-open
    @update:open="!$event && $emit('close', { canceled: true, folderId: null })"
  >
    <CommandInput :placeholder="options.title ?? 'Search folders...'" />
    <CommandList class="p-1.5">
      <CommandEmpty>No results found.</CommandEmpty>
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
  </CommandDialog>
</template>
<script setup lang="ts">
import type {
  AppDialogSelectFolderOptions,
  AppDialogSelectFolderResult,
} from '@/providers/app-dialog.provider';
import { useEditorStore } from '@/stores/editor.store';
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@snippy/ui';

const editorStore = useEditorStore();

withDefaults(defineProps<{ options?: AppDialogSelectFolderOptions }>(), {
  options: () => ({}),
});
defineEmits<{
  close: [value: AppDialogSelectFolderResult];
}>();
</script>

<template>
  <slot />
  <CommandDialog
    v-for="item in items"
    :key="item.id"
    default-open
    @update:open="
      !$event && selectItem(item.id, { canceled: true, folderId: null })
    "
  >
    <CommandInput :placeholder="item.title ?? 'Search folders...'" />
    <CommandList class="p-1.5">
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandItem
        value="__"
        @click="selectItem(item.id, { canceled: false, folderId: null })"
      >
        (root)
      </CommandItem>
      <CommandItem
        v-for="folder in editorStore.data.folders"
        :key="folder.id"
        :value="folder.id"
        @click="selectItem(item.id, { canceled: false, folderId: folder.id })"
      >
        {{ folder.name }}
      </CommandItem>
    </CommandList>
  </CommandDialog>
</template>
<script setup lang="ts">
import type {
  AppSelectFolderOptions,
  AppSelectFolderProvider,
  AppSelectFolderResult,
} from '@/providers/app-select-folder.provider';
import { APP_SELECT_FOLDER_PROVIDER_KEY } from '@/providers/app-select-folder.provider';
import { useEditorStore } from '@/stores/editor.store';
import { promiseWithResolver, type PromiseWithResolver } from '@snippy/shared';
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@snippy/ui';

interface AppSelectFolderItem extends AppSelectFolderOptions {
  id: number;
  resolver: PromiseWithResolver<AppSelectFolderResult>;
}

let id = 0;

const editorStore = useEditorStore();

const items = ref<AppSelectFolderItem[]>([]);

function selectItem(dialogId: number, result: AppSelectFolderResult) {
  let dialogIndex = 0;
  const dialogData = items.value.find((item, index) => {
    if (item.id === dialogId) {
      dialogIndex = index;
      return true;
    }

    return false;
  });
  if (!dialogData) return;

  dialogData.resolver.resolve(result);
  items.value.splice(dialogIndex, 1);
}

provide<AppSelectFolderProvider>(APP_SELECT_FOLDER_PROVIDER_KEY, {
  async selectFolder(options) {
    const resolver = promiseWithResolver<AppSelectFolderResult>();

    items.value.push({
      ...(options ?? {}),
      resolver,
      id: ++id,
    });

    return resolver.promise;
  },
});
</script>

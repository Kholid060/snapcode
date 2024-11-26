<template>
  <TreeRoot
    v-slot="{ flattenItems }"
    class="text-muted-foreground select-none list-none text-sm"
    :items="editorStore.data.treeData.__root"
    :get-key="(item) => item.id"
    :get-children="getChildren"
    multiple
    selection-behavior="replace"
    v-model:expanded="activeDirs"
  >
    <EditorTreeItem
      v-for="item in flattenItems"
      :key="item._id + item.index"
      :item="item"
    />
    <EditorTreeRootItemPlaceholder />
  </TreeRoot>
</template>

<script setup lang="ts">
import { TreeRoot } from 'radix-vue';
import { debouncedWatch } from '@vueuse/core';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useEditorStore } from '@/stores/editor.store';
import EditorTreeItem from './EditorTreeItem.vue';
import { type TreeDataItem } from '@/utils/tree-data-utils';
import { store, STORE_KEYS } from '@/services/store.service';
import { logger } from '@/services/logger.service';
import { useToast } from '@snippy/ui';
import { getLogMessage } from '@/utils/helper';
import EditorTreeRootItemPlaceholder from './EditorTreeRootItemPlaceholder.vue';

const { toast } = useToast();
const editorStore = useEditorStore();

const activeDirs = ref<string[]>([]);

function getChildren(item: TreeDataItem) {
  return item.isFolder ? (editorStore.data.treeData[item.id] ?? []) : undefined;
}

watchEffect((onCleanup) => {
  const dndFunction = combine(
    monitorForElements({
      async onDrop(args) {
        const previous = args.source;
        const [target] = args.location.current.dropTargets;
        if (!target || !previous) return;

        let parentOrFolderId: string | null = target.data.isFolder
          ? (target.data.id as string)
          : (target.data.parentId as string);
        if (!parentOrFolderId) parentOrFolderId = null;

        if (previous.data.parentId === parentOrFolderId) return;

        try {
          if (previous.data.isFolder) {
            await editorStore.data.updateFolder(previous.data.id as string, {
              parentId: parentOrFolderId,
            });
          } else {
            await editorStore.data.updateSnippet(previous.data.id as string, {
              folderId: parentOrFolderId,
            });
          }
        } catch (error) {
          console.error(error);
          logger.error(getLogMessage('sidebar-create-folder-ctx-menu', error));
          toast({
            variant: 'destructive',
            title: `Error moving ${previous.data.isFolder ? 'folder' : 'snippet'}`,
          });
        }
      },
    }),
  );

  onCleanup(() => {
    dndFunction();
  });
});

debouncedWatch(
  activeDirs,
  () => {
    store.set(STORE_KEYS.editorActiveDirs, activeDirs.value);
  },
  { debounce: 250, deep: true },
);

onMounted(() => {
  store.get<string[]>(STORE_KEYS.editorActiveDirs).then((value) => {
    activeDirs.value = value ?? [];
  });
});
</script>

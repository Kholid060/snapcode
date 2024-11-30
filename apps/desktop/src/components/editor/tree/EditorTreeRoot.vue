<template>
  <TreeRoot
    v-slot="{ flattenItems }"
    ref="tree-root"
    class="text-muted-foreground select-none list-none text-sm"
    :items="editorStore.data.treeData.__root"
    :get-key="(item) => item.id"
    :get-children="getChildren"
    multiple
    selection-behavior="replace"
    v-model:expanded="editorStore.state.activeFolderIds"
    v-model="selectedItems"
  >
    <div ref="items-container">
      <EditorTreeItem
        v-for="item in flattenItems"
        :key="item._id + item.index"
        :item="item"
        @select="handleSelect($event, item, flattenItems)"
      />
      <EditorTreeRootItemPlaceholder />
    </div>
  </TreeRoot>
</template>

<script setup lang="ts">
import type { FlattenedItem, TreeItemSelectEvent } from 'radix-vue';
import { TreeRoot } from 'radix-vue';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useEditorStore } from '@/stores/editor.store';
import EditorTreeItem from './EditorTreeItem.vue';
import { type TreeDataItem } from '@/utils/tree-data-utils';
import { logger } from '@/services/logger.service';
import { useToast } from '@snippy/ui';
import { getLogMessage } from '@/utils/helper';
import EditorTreeRootItemPlaceholder from './EditorTreeRootItemPlaceholder.vue';
import { onClickOutside } from '@vueuse/core';
import { useHotkey } from '@/composables/hotkey.composable';
import { store, STORE_KEYS } from '@/services/store.service';
import { useAppDialog } from '@/providers/app-dialog.provider';

const props = defineProps<{
  isHidden?: boolean;
}>();

const { toast } = useToast();
const appDialog = useAppDialog();
const editorStore = useEditorStore();

const itemsContainerRef = useTemplateRef('items-container');
const treeRootRef = useTemplateRef<HTMLElement>('tree-root');

const selectedItems = ref<TreeDataItem[]>([]);

function getChildren(item: TreeDataItem) {
  return item.isFolder ? (editorStore.data.treeData[item.id] ?? []) : undefined;
}
function selectItemsByMouse(
  event: TreeItemSelectEvent<TreeDataItem>,
  item: FlattenedItem<TreeDataItem>,
  items: FlattenedItem<TreeDataItem>[],
) {
  const { originalEvent } = event.detail;
  if (originalEvent.ctrlKey || originalEvent.metaKey) {
    const itemIndex = selectedItems.value.indexOf(item.value);
    if (itemIndex === -1) selectedItems.value.push(item.value);
    else selectedItems.value.splice(itemIndex, 1);
    event.preventDefault();
  }

  const [firstValue] = selectedItems.value;
  if (!originalEvent.shiftKey || !firstValue) return;

  const firstIndex = items.findIndex(
    (treeItem) => treeItem.value === firstValue,
  );
  const itemIndex = items.indexOf(item);
  if (firstIndex === -1 || itemIndex === -1 || firstIndex === itemIndex) return;

  const isAfter = firstIndex > itemIndex;

  const newSelectedItems = items
    .slice(
      Math.min(firstIndex, itemIndex),
      Math.max(firstIndex, itemIndex) + (isAfter ? 0 : 1),
    )
    .map((treeItem) => treeItem.value);
  if (isAfter) newSelectedItems.unshift(items[firstIndex].value);

  selectedItems.value = newSelectedItems;
  event.preventDefault();
}
function handleSelect(
  event: TreeItemSelectEvent<TreeDataItem>,
  item: FlattenedItem<TreeDataItem>,
  items: FlattenedItem<TreeDataItem>[],
) {
  if (event.detail.originalEvent instanceof PointerEvent) {
    selectItemsByMouse(event, item, items);
  }

  if (!item.value.isFolder && !event.defaultPrevented) {
    editorStore.state.setActiveFile(item._id);
  }
}
async function deleteSelectedItems() {
  try {
    const dontShowDialog = await store.get(STORE_KEYS.noDeletePrompt);
    let dontAskPrompt = false;

    if (!dontShowDialog) {
      const { isConfirmed, dontAskValue } = await appDialog.confirm({
        title: 'Delete snippets/folders?',
        body: `Are you sure you want to delete "${selectedItems.value.length} items"? This will be permanently deleted and it cannot be undone.`,
        okBtnLabel: 'Delete',
        okBtnVariant: 'destructive',
        showDontAsk: true,
      });
      if (!isConfirmed) return;

      dontAskPrompt = dontAskValue;
    }

    await editorStore.data.deleteItems(selectedItems.value);
    selectedItems.value = [];

    if (dontAskPrompt) {
      await store.set(STORE_KEYS.noDeletePrompt, true);
    }
  } catch (error) {
    console.error(error);
    logger.error(getLogMessage('sidebar-delete-ctx-menu', error));
    toast({
      variant: 'destructive',
      title: `Error deleting items`,
    });
  }
}

onClickOutside(itemsContainerRef, () => {
  selectedItems.value = [];
});

useHotkey(
  {
    key: 'delete',
    element: treeRootRef,
  },
  () => {
    if (props.isHidden) return;
    deleteSelectedItems();
  },
);

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
</script>

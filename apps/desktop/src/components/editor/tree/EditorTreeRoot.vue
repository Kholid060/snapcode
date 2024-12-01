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
    v-model:expanded="editorStore.state.sidebarState.activeFolderIds"
    v-model="selectedItems"
  >
    <div ref="items-container" class="space-y-px">
      <EditorTreeItem
        v-for="item in flattenItems"
        :key="item._id + item.index"
        :item="item"
        @select="handleSelect($event, item, flattenItems)"
        @contextmenu.prevent="
          sidebarProvider.handleContextMenu({
            id: item._id,
            event: $event,
            type: item.value.isFolder ? 'folder' : 'snippet',
            isTopOfSelected:
              selectedItems.length > 1 && selectedItems.includes(item.value),
          })
        "
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
import { useEditorSidebarProvider } from '@/providers/editor.provider';
import { debounce } from '@snippy/shared';

const { toast } = useToast();
const editorStore = useEditorStore();
const sidebarProvider = useEditorSidebarProvider();

const itemsContainerRef = useTemplateRef('items-container');
const treeRootRef = useTemplateRef<HTMLElement>('tree-root');

const selectedItems = computed({
  get() {
    return sidebarProvider.selectedItems.value;
  },
  set(value) {
    sidebarProvider.selectedItems.value = value;
  },
});

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
    const itemIndex = sidebarProvider.selectedItems.value.indexOf(item.value);
    if (itemIndex === -1) sidebarProvider.selectedItems.value.push(item.value);
    else sidebarProvider.selectedItems.value.splice(itemIndex, 1);
    event.preventDefault();
  }

  const [firstValue] = sidebarProvider.selectedItems.value;
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

  sidebarProvider.selectedItems.value = newSelectedItems;
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
    editorStore.state.setSidebarState('activeFileId', item._id);
  }
}

onClickOutside(itemsContainerRef, () =>
  // race when click delete in context menu
  debounce(() => {
    sidebarProvider.selectedItems.value = [];
  }, 200),
);

useHotkey(
  {
    key: 'delete',
    element: treeRootRef,
  },
  () => {
    sidebarProvider.deleteSelectedItems();
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

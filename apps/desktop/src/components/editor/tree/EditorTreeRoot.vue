<template>
  <TreeRoot
    v-slot="{ flattenItems }"
    class="text-muted-foreground select-none list-none text-sm"
    multiple
    :items="items"
    :get-key="(item) => item.id"
    :get-children="getChildren"
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
          $emit('item:context-menu', { event: $event, item })
        "
      />
      <EditorTreeRootItemPlaceholder />
    </div>
  </TreeRoot>
</template>

<script setup lang="ts">
import type {
  FlattenedItem,
  TreeRootProps,
  TreeItemSelectEvent,
} from 'radix-vue';
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
import { debounce } from '@snippy/shared';

defineProps<
  {
    items: TreeDataItem[];
    getChildren: (item: TreeDataItem) => TreeDataItem[] | undefined;
  } & Pick<TreeRootProps, 'expanded' | 'modelValue'>
>();
const emit = defineEmits<{
  'item:context-menu': [
    { event: PointerEvent; item: FlattenedItem<TreeDataItem> },
  ];
  'item:select': [event: TreeItemSelectEvent<TreeDataItem>];
}>();

let isHidden = false;

const { toast } = useToast();
const editorStore = useEditorStore();

const itemsContainerRef = useTemplateRef('items-container');

const selectedItems = defineModel<TreeDataItem[]>({
  default: () => [],
});

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

  if (!event.defaultPrevented) {
    emit('item:select', event);
  }

  if (!item.value.isFolder && !event.defaultPrevented) {
    editorStore.state.setSidebarState('activeFileId', item._id);
  }
}

onClickOutside(
  itemsContainerRef,
  // race when click delete in context menu
  debounce(() => {
    if (isHidden) return;

    selectedItems.value = [];
  }, 50),
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

onActivated(() => {
  setTimeout(() => {
    isHidden = false;
  }, 100);
});
onDeactivated(() => {
  console.log('deactive');
  isHidden = true;
});
</script>

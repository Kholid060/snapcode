<template>
  <TreeRoot
    v-slot="{ flattenItems }"
    class="text-muted-foreground select-none list-none text-sm"
    multiple
    :items="items"
    :get-key="(item) => (item.isDir ? FOLDER_TREE_ITEM_PREFIX : '') + item.path"
    :get-children="getChildren"
    selection-behavior="replace"
    v-model:expanded="editorStore.state.state.activeFolderIds"
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
import { logger } from '@/services/logger.service';
import { useToast } from '@snippy/ui';
import { getLogMessage } from '@/utils/helper';
import EditorTreeRootItemPlaceholder from './EditorTreeRootItemPlaceholder.vue';
import { onClickOutside } from '@vueuse/core';
import { debounce } from '@snippy/shared';
import type { DocumentFlatTreeItem } from '@/interface/document.interface';
import { getDocumentParentDir, joinDocumentPath } from '@/utils/document-utils';
import { FOLDER_TREE_ITEM_PREFIX } from '@/utils/const/editor.const';

defineProps<
  {
    items: DocumentFlatTreeItem[];
    getChildren: (
      item: DocumentFlatTreeItem,
    ) => DocumentFlatTreeItem[] | undefined;
  } & Pick<TreeRootProps, 'expanded' | 'modelValue'>
>();
const emit = defineEmits<{
  'item:context-menu': [
    { event: PointerEvent; item: FlattenedItem<DocumentFlatTreeItem> },
  ];
  'item:select': [event: TreeItemSelectEvent<DocumentFlatTreeItem>];
}>();

let isHidden = false;

const { toast } = useToast();
const editorStore = useEditorStore();

const itemsContainerRef = useTemplateRef('items-container');

const selectedItems = defineModel<DocumentFlatTreeItem[]>({
  default: () => [],
});

function selectItemsByMouse(
  event: TreeItemSelectEvent<DocumentFlatTreeItem>,
  item: FlattenedItem<DocumentFlatTreeItem>,
  items: FlattenedItem<DocumentFlatTreeItem>[],
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
  event: TreeItemSelectEvent<DocumentFlatTreeItem>,
  item: FlattenedItem<DocumentFlatTreeItem>,
  items: FlattenedItem<DocumentFlatTreeItem>[],
) {
  if (event.detail.originalEvent instanceof PointerEvent) {
    selectItemsByMouse(event, item, items);
  }

  if (!event.defaultPrevented) {
    emit('item:select', event);
  }

  if (!item.value.isDir && !event.defaultPrevented) {
    editorStore.state.updateState('activeFileId', item._id);
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
      onDragStart() {
        // only support move one item for now
        selectedItems.value = [];
      },
      async onDrop(args) {
        const previous = args.source.data as unknown as DocumentFlatTreeItem;
        const target = args.location.current.dropTargets[0]
          ?.data as unknown as DocumentFlatTreeItem;
        if (!target || !previous) return;

        try {
          const prevPath = getDocumentParentDir(previous.path, previous.name);
          const targetPath = getDocumentParentDir(target.path, target.name);
          if (
            (prevPath.parentDir === targetPath.parentDir && !target.isDir) ||
            prevPath.parentDir === target.path
          )
            return;

          const newPath = joinDocumentPath(
            target.isDir ? target.path : targetPath.parentDir,
            prevPath.filename,
          );
          await editorStore.document.moveItem(previous.path, newPath);
        } catch (error) {
          logger.error(getLogMessage('sidebar-create-folder-ctx-menu', error));
          toast({
            variant: 'destructive',
            title: `Error moving ${previous.isDir ? 'folder' : 'snippet'}`,
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
  isHidden = true;
});
</script>

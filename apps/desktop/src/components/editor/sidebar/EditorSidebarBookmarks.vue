<template>
  <div class="flex items-center px-4 pt-4">
    <p class="text-muted-foreground grow cursor-default text-sm font-semibold">
      Bookmarks
    </p>
    <Select
      :model-value="bookmarksStore.state.sortBy"
      @update:model-value="
        bookmarksStore.updateState('sortBy', $event as AppBookmarkSort)
      "
    >
      <SelectTrigger as-child>
        <Button
          variant="ghost"
          class="text-muted-foreground h-6 gap-1 px-1 text-xs"
        >
          <Sorting05Icon class="size-[18px]" />
          Sort
        </Button>
      </SelectTrigger>
      <SelectContent side="bottom">
        <SelectItem v-for="item in sortItems" :key="item.id" :value="item.id">
          {{ item.label }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
  <TreeRoot
    v-model="selectedItems"
    :get-key="(item) => item.path"
    selection-behavior="replace"
    multiple
    class="mt-3 grow overflow-auto px-2 pb-4 pt-0.5"
    :items="sortedItems"
    v-slot="{ flattenItems }"
  >
    <div ref="items-container" class="space-y-px">
      <TreeItem
        v-for="item in flattenItems"
        :key="item._id"
        v-bind="item.bind"
        @contextmenu.stop.prevent="handleContextMenu({ event: $event, item })"
        class="data-[selected]:bg-primary/20 data-[selected]:text-foreground focus-visible:ring-primary relative z-10 min-h-7 w-full overflow-hidden rounded border-none py-1.5 pl-2 text-sm outline-none focus-visible:ring-2"
        @select="handleSelect($event, item, flattenItems)"
        :class="
          editorStore.activeSnippet?.path === item.value.path
            ? 'bg-accent/70 text-foreground'
            : 'hover:bg-accent/70'
        "
        :title="item.value.path"
      >
        <div class="flex items-center gap-1">
          <component
            :is="item.value.type === 'folder' ? Folder01Icon : File01Icon"
            class="text-muted-foreground size-4 flex-shrink-0"
          />
          <p class="truncate">{{ item.value.name }}</p>
        </div>
        <p
          v-if="item.value.path !== item.value.name"
          class="text-muted-foreground line-clamp-2 pl-5 text-xs leading-tight"
        >
          {{ item.value.path }}
        </p>
      </TreeItem>
    </div>
  </TreeRoot>
</template>
<script lang="ts" setup>
import { TreeRoot, TreeItem } from 'radix-vue';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  useToast,
} from '@snippy/ui';
import type { FlattenedItem, TreeItemSelectEvent } from 'radix-vue';
import { SelectTrigger } from 'radix-vue';
import type { AppBookmarkSort } from '@/interface/app.interface';
import { useEditorStore } from '@/stores/editor.store';
import { Sorting05Icon } from 'hugeicons-vue';
import { useEditorSidebarProvider } from '@/providers/editor.provider';
import type {
  DocumentFlatTreeItem,
  DocumentStoreBookmarksItem,
} from '@/interface/document.interface';
import { Folder01Icon, File01Icon } from 'hugeicons-vue';
import { useBookmarksStore } from '@/stores/bookmarks.store';
import { bookmarksSorter } from '@/utils/bookmarks-util';
import { getNameFromPath } from '@/utils/document-utils';
import { selectTreeItemsByMouse, TREE_ROOT_KEY } from '@/utils/tree-data-utils';
import { debounce } from '@snippy/shared';
import { onClickOutside } from '@vueuse/core';

interface BookmarkItem extends DocumentStoreBookmarksItem {
  name: string;
}

const sortItems: { label: string; id: AppBookmarkSort }[] = [
  { id: 'name-asc', label: 'Name (A-Z)' },
  { id: 'name-desc', label: 'Name (Z-A)' },
  { id: 'created-desc', label: 'Created date (new to old)' },
  { id: 'created-asc', label: 'Created date (old to new)' },
];

const itemsContainerRef = useTemplateRef('items-container');

const { toast } = useToast();
const editorStore = useEditorStore();
const bookmarksStore = useBookmarksStore();
const sidebarProvider = useEditorSidebarProvider();

const selectedItems = ref<DocumentStoreBookmarksItem[]>([]);

const mappedItems = computed<BookmarkItem[]>(() =>
  bookmarksStore.data.map((item) => ({
    ...item,
    name: getNameFromPath(item.path),
  })),
);
const sortedItems = computed(() =>
  bookmarksSorter(mappedItems.value.slice(), bookmarksStore.state),
);

function handleSelect(
  event: TreeItemSelectEvent<BookmarkItem>,
  item: FlattenedItem<BookmarkItem>,
  items: FlattenedItem<BookmarkItem>[],
) {
  if (event.detail.originalEvent instanceof PointerEvent) {
    selectedItems.value = selectTreeItemsByMouse({
      item,
      event,
      items,
      itemKey: 'path',
      selectedItems: selectedItems.value,
    });
    if (event.defaultPrevented) return;
  }

  const value = event.detail.value!;

  if (value.type === 'file') {
    const treeItem = editorStore.document.findItemByPath(value.path);
    if (!treeItem) {
      toast({
        variant: 'destructive',
        title: 'Item not found',
      });
      return;
    }

    editorStore.state.updateState('activeFileId', treeItem.id);
    return;
  }

  const findFolderPath = (
    id: string,
    ids: string[] = [],
  ): null | { paths: string[]; item: DocumentFlatTreeItem } => {
    const childs = editorStore.document.treeData[id];
    if (!childs) return null;

    for (const child of childs) {
      if (!child.isDir) continue;

      const metadata = editorStore.document.treeMetadata[child.id];
      if (!metadata) continue;

      const result =
        metadata.path === value.path
          ? { item: child, paths: [...ids, child.id] }
          : findFolderPath(child.id, [...ids, child.id]);
      if (result) return result;
    }

    return null;
  };
  const folder = findFolderPath(TREE_ROOT_KEY);

  if (!folder) {
    toast({
      variant: 'destructive',
      title: 'Item not found',
    });
    return;
  }

  editorStore.state.updateState('activeFolderIds', [
    ...new Set([...editorStore.state.state.activeFolderIds, ...folder.paths]),
  ]);

  sidebarProvider.setSelectedItems([folder.item]);
  editorStore.state.updateState('activeMenu', 'snippets');
}
function handleContextMenu({
  event,
  item,
}: {
  event: PointerEvent;
  item: FlattenedItem<BookmarkItem>;
}) {
  sidebarProvider.handleContextMenu({
    data: {
      selectedItems: selectedItems.value.map((item) => item.path),
      name: item.value.name,
      path: item.value.path,
      type: item.value.type === 'folder' ? 'folder' : 'snippet',
      isTopOfSelected:
        selectedItems.value.length > 1 &&
        selectedItems.value.includes(item.value),
    },
    event,
    type: 'bookmarks',
  });
}

onClickOutside(
  itemsContainerRef,
  // race when click delete in context menu
  debounce(() => {
    selectedItems.value = [];
  }, 50),
);
</script>

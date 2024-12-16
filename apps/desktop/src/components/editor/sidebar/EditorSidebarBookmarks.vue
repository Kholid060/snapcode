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
  <EditorTreeRoot
    v-model="selectedItems"
    class="mt-3 grow overflow-auto px-2 pb-4"
    :items="sortedItems"
    :get-children="() => undefined"
    @item:select="handleSelectItem"
    @item:context-menu="handleContextMenu"
  />
</template>
<script lang="ts" setup>
import { Button, Select, SelectContent, SelectItem } from '@snippy/ui';
import type { FlattenedItem, TreeItemSelectEvent } from 'radix-vue';
import { SelectTrigger } from 'radix-vue';
import type { AppBookmarkSort } from '@/interface/app.interface';
import { useEditorStore } from '@/stores/editor.store';
import { Sorting05Icon } from 'hugeicons-vue';
import EditorTreeRoot from '../tree/EditorTreeRoot.vue';
import { useEditorSidebarProvider } from '@/providers/editor.provider';
import type { DocumentFlatTreeItem } from '@/interface/document.interface';
import { useBookmarksStore } from '@/stores/bookmarks.store';
import { APP_DOCUMENT_PATH_SEPARATOR } from '@/utils/const/app.const';
import { FOLDER_TREE_ITEM_PREFIX } from '@/utils/const/editor.const';

interface BookmarkItem extends DocumentFlatTreeItem {
  createdAt: number;
}

const sortItems: { label: string; id: AppBookmarkSort }[] = [
  { id: 'name-asc', label: 'Name (A-Z)' },
  { id: 'name-desc', label: 'Name (Z-A)' },
  { id: 'created-desc', label: 'Created date (new to old)' },
  { id: 'created-asc', label: 'Created date (old to new)' },
  { id: 'updated-desc', label: 'Updated date (new to old)' },
  { id: 'updated-asc', label: 'Updated date (old to new)' },
];

const editorStore = useEditorStore();
const bookmarksStore = useBookmarksStore();
const sidebarProvider = useEditorSidebarProvider();

const selectedItems = ref<DocumentFlatTreeItem[]>([]);

const mappedItems = computed<BookmarkItem[]>(() =>
  bookmarksStore.data.reduce<BookmarkItem[]>((acc, bookmark) => {
    const item = editorStore.document.getItemByPath(bookmark.path);
    if (item) acc.push({ ...item, createdAt: bookmark.createdAt });

    return acc;
  }, []),
);
const sortedItems = computed(() => {
  const { isDate, sortAsc, sortKey } = getSortData();
  return mappedItems.value.slice().sort((a, z) => {
    const aData = a[sortKey];
    const zData = z[sortKey];

    const val = isDate
      ? (aData as number) - (zData as number)
      : (aData as string).localeCompare(zData as string);
    return sortAsc ? val : val * -1;
  });
});

function handleContextMenu({
  event,
  item,
}: {
  event: PointerEvent;
  item: FlattenedItem<DocumentFlatTreeItem>;
}) {
  sidebarProvider.handleContextMenu({
    data: {
      selectedItems: mappedItems.value.map((item) => item.path),
      name: item.value.name,
      path: item.value.path,
      type: item.value.isDir ? 'folder' : 'snippet',
      isTopOfSelected:
        selectedItems.value.length > 1 &&
        selectedItems.value.includes(item.value),
    },
    event,
    type: 'bookmarks',
  });
}
function handleSelectItem(event: TreeItemSelectEvent<DocumentFlatTreeItem>) {
  const value = event.detail.value!;
  console.log(value);
  if (!value.isDir) return;

  const expandedFolders = new Set(editorStore.state.state.activeFolderIds);
  expandedFolders.add(value.path);

  for (let index = 0; index < value.path.length; index += 1) {
    const char = value.path[index];
    if (char === APP_DOCUMENT_PATH_SEPARATOR) {
      expandedFolders.add(
        `${FOLDER_TREE_ITEM_PREFIX}${value.path.slice(0, index)}`,
      );
    }
  }

  console.log(expandedFolders);
  editorStore.state.updateState('activeFolderIds', [...expandedFolders]);

  sidebarProvider.setSelectedItems([value]);
  editorStore.state.updateState('activeMenu', 'snippets');
}
function getSortData() {
  let sortAsc = false;
  let sortKey: 'mtime' | 'createdAt' | 'name';

  switch (bookmarksStore.state.sortBy) {
    case 'created-asc':
      sortKey = 'createdAt';
      sortAsc = true;
      break;
    case 'created-desc':
      sortKey = 'createdAt';
      sortAsc = false;
      break;
    case 'name-asc':
      sortKey = 'name';
      sortAsc = true;
      break;
    case 'name-desc':
      sortKey = 'name';
      sortAsc = false;
      break;
    case 'updated-asc':
      sortKey = 'mtime';
      sortAsc = true;
      break;
    case 'updated-desc':
      sortKey = 'mtime';
      sortAsc = false;
      break;
    default:
      throw new Error('Invalid sort key');
  }

  const isDate = !sortKey.startsWith('name');

  return {
    isDate,
    sortAsc,
    sortKey,
  };
}
</script>

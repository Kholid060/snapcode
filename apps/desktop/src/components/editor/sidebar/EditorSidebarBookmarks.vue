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
import type {
  DocumentFlatTreeItem,
  DocumentStoreBookmarksItem,
} from '@/interface/document.interface';
import { useBookmarksStore } from '@/stores/bookmarks.store';
import { APP_DOCUMENT_PATH_SEPARATOR } from '@/utils/const/app.const';
import { FOLDER_TREE_ITEM_PREFIX } from '@/utils/const/editor.const';
import { bookmarksSorter } from '@/utils/bookmarks-util';

const sortItems: { label: string; id: AppBookmarkSort }[] = [
  { id: 'name-asc', label: 'Name (A-Z)' },
  { id: 'name-desc', label: 'Name (Z-A)' },
  { id: 'created-desc', label: 'Created date (new to old)' },
  { id: 'created-asc', label: 'Created date (old to new)' },
];

type BookmarkItem = DocumentFlatTreeItem & DocumentStoreBookmarksItem;

const editorStore = useEditorStore();
const bookmarksStore = useBookmarksStore();
const sidebarProvider = useEditorSidebarProvider();

const selectedItems = ref<DocumentFlatTreeItem[]>([]);

const mappedItems = computed<BookmarkItem[]>(() =>
  bookmarksStore.data.reduce<BookmarkItem[]>((acc, bookmark) => {
    const item = editorStore.document.getItemByPath(bookmark.path);
    if (item)
      acc.push({
        ...item,
        createdAt: bookmark.createdAt,
        type: item.isDir ? 'folder' : 'file',
      });

    return acc;
  }, []),
);
const sortedItems = computed(
  () =>
    bookmarksSorter(
      mappedItems.value.slice(),
      bookmarksStore.state,
    ) as BookmarkItem[],
);

function handleContextMenu({
  event,
  item,
}: {
  event: PointerEvent;
  item: FlattenedItem<DocumentFlatTreeItem>;
}) {
  sidebarProvider.handleContextMenu({
    data: {
      selectedItems: sortedItems.value.map((item) => item.path),
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

  editorStore.state.updateState('activeFolderIds', [...expandedFolders]);

  sidebarProvider.setSelectedItems([value]);
  editorStore.state.updateState('activeMenu', 'snippets');
}
</script>

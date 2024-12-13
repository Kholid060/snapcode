<template>
  <div class="flex items-center px-4 pt-4">
    <p class="text-muted-foreground grow cursor-default text-sm font-semibold">
      Bookmarks
    </p>
    <Select v-model="state.sortBy">
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
    @item:context-menu="
      sidebarProvider.handleContextMenu({
        data: {
          selectedItems,
          id: $event.item._id,
          type: $event.item.value.isFolder ? 'folder' : 'snippet',
          isTopOfSelected:
            selectedItems.length > 1 &&
            selectedItems.includes($event.item.value),
        },
        type: 'bookmarks',
        event: $event.event,
      })
    "
  />
</template>
<script lang="ts" setup>
import { Button, Select, SelectContent, SelectItem } from '@snippy/ui';
import type { TreeItemSelectEvent } from 'radix-vue';
import { SelectTrigger } from 'radix-vue';
import type {
  AppBookmarkSort,
  AppBookmarksState,
} from '@/interface/app.interface';
import { useEditorStore } from '@/stores/editor.store';
import { Sorting05Icon } from 'hugeicons-vue';
import type { TreeDataItem } from '@/utils/tree-data-utils';
import type { FolderListItem } from '@/interface/folder.interface';
import type { SnippetListItem } from '@/interface/snippet.interface';
import EditorTreeRoot from '../tree/EditorTreeRoot.vue';
import { useEditorSidebarProvider } from '@/providers/editor.provider';
import { watchDebounced } from '@vueuse/core';
import documentService from '@/services/document.service';

type Item = SnippetListItem | FolderListItem;

const sortItems: { label: string; id: AppBookmarkSort }[] = [
  { id: 'name-asc', label: 'Name (A-Z)' },
  { id: 'name-desc', label: 'Name (Z-A)' },
  { id: 'created-desc', label: 'Created date (new to old)' },
  { id: 'created-asc', label: 'Created date (old to new)' },
  { id: 'updated-desc', label: 'Updated date (new to old)' },
  { id: 'updated-asc', label: 'Updated date (old to new)' },
];

const editorStore = useEditorStore();
const sidebarProvider = useEditorSidebarProvider();

const selectedItems = ref<TreeDataItem[]>([]);
const state = shallowReactive<AppBookmarksState>({
  sortBy: 'name-asc',
});

const items = computed(() => {
  const folders = Object.values(editorStore.data.folders).filter(
    (folder) => folder.isBookmark,
  );
  const snippets = Object.values(editorStore.data.snippets).filter(
    (folder) => folder.isBookmark,
  );

  return { folders, snippets };
});
const sortedItems = computed(() => {
  const { isDate, sortAsc, sortKey } = getSortData();

  const compareFn = (a: Item, z: Item) => {
    const aData = a[sortKey] ?? '';
    const zData = z[sortKey] ?? '';

    const val = isDate
      ? (aData as Date).getTime() - (zData as Date).getTime()
      : (aData as string).localeCompare(zData as string);
    return sortAsc ? val : val * -1;
  };

  return ([] as TreeDataItem[]).concat(
    mapToTreeItem(items.value.folders.slice().sort(compareFn), true),
    mapToTreeItem(items.value.snippets.slice().sort(compareFn), false),
  );
});

function handleSelectItem(event: TreeItemSelectEvent<TreeDataItem>) {
  const value = event.detail.value!;
  if (!value.isFolder) return;

  if (!editorStore.state.sidebarState.activeFolderIds.includes(value.id)) {
    const expandedFolders = new Set(
      editorStore.state.sidebarState.activeFolderIds,
    );
    expandedFolders.add(value.id);

    let iterCount = 0;
    let currFolder = editorStore.data.folders[value.id];
    while (currFolder?.parentId) {
      if (iterCount >= 200) break;

      expandedFolders.add(currFolder.parentId);

      if (
        !currFolder.parentId ||
        !editorStore.data.folders[currFolder.parentId]
      )
        break;

      currFolder = editorStore.data.folders[currFolder.parentId];
      iterCount += 1;
    }

    editorStore.state.setSidebarState('activeFolderIds', [...expandedFolders]);
  }

  sidebarProvider.setSelectedItems([value]);
  editorStore.state.setSidebarState('activeMenu', 'snippets');
}
function mapToTreeItem(items: Item[], isFolder: boolean): TreeDataItem[] {
  return items.map((item) => ({ id: item.id, isFolder }));
}
function getSortData() {
  let sortAsc = false;
  let sortKey: 'updatedAt' | 'createdAt' | 'name';

  switch (state.sortBy) {
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
      sortKey = 'updatedAt';
      sortAsc = true;
      break;
    case 'updated-desc':
      sortKey = 'updatedAt';
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

watchDebounced(
  state,
  () => {
    documentService.stores.bookmarks.xSet('state', state);
  },
  { debounce: 500, deep: true },
);

onBeforeMount(async () => {
  const storedState = await documentService.stores.bookmarks.xGet('state', {
    sortBy: 'name-asc',
  });
  Object.assign(state, storedState);
});
</script>

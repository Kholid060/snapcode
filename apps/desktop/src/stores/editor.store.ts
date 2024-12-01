import * as folderService from '@/db/services/folder.db-service';
import * as snippetService from '@/db/services/snippet.db-service';
import { EditorSidebarState } from '@/interface/editor.interface';
import {
  FolderListItem,
  FolderNewPayload,
  FolderUpdatePayload,
} from '@/interface/folder.interface';
import {
  SnippetListItem,
  SnippetNewPayload,
  SnippetUpdatePayload,
} from '@/interface/snippet.interface';
import { store } from '@/services/store.service';
import { getSnippetExtFromName } from '@/utils/snippet-utils';
import {
  buildTreeData,
  TREE_ROOT_KEY,
  TreeData,
  TreeDataItem,
} from '@/utils/tree-data-utils';
import { watchDebounced } from '@vueuse/core';
import { defineStore } from 'pinia';

const DEFAULT_SIDEBAR_STATE: EditorSidebarState = {
  show: true,
  activeFileId: '',
  activeFolderIds: [],
  activeMenu: 'snippets',
};

const useEditorState = defineStore('editor:state', () => {
  let initiated = false;

  const sidebarState = reactive<EditorSidebarState>({
    ...DEFAULT_SIDEBAR_STATE,
  });

  function setSidebarState<T extends keyof EditorSidebarState>(
    key: T,
    value: EditorSidebarState[T],
  ) {
    sidebarState[key] = value;
  }
  async function init() {
    if (initiated) return;

    const storeData = await store.xGet(store.xKeys.editorSidebarState, {
      ...DEFAULT_SIDEBAR_STATE,
    });
    Object.assign(sidebarState, storeData);

    initiated = true;
  }

  watchDebounced(
    sidebarState,
    () => {
      if (!initiated) return;

      store.xSet(store.xKeys.editorSidebarState, toRaw(sidebarState));
    },
    { debounce: 500 },
  );

  return {
    init,
    sidebarState,
    setSidebarState,
  };
});

const useEditorDataStore = defineStore('editor:snippets', () => {
  let initiated = false;

  const state = useEditorState();

  const treeData = ref<TreeData>({ __root: [] });
  const folders = ref<Record<string, FolderListItem>>({});
  const snippets = ref<Record<string, SnippetListItem>>({});

  const activeSnippet = computed(
    () => snippets.value[state.sidebarState.activeFileId] ?? null,
  );

  function deleteTreeItem(itemId: string, folderId: string = TREE_ROOT_KEY) {
    if (!treeData.value[folderId]) return null;

    const itemIndex = treeData.value[folderId].findIndex(
      (item) => item.id === itemId,
    );
    if (itemIndex === -1) return null;

    const copyData = { ...treeData.value[folderId][itemIndex] };
    treeData.value[folderId].splice(itemIndex, 1);

    return copyData;
  }
  function addTreeItem(data: TreeDataItem[], folderId: string = TREE_ROOT_KEY) {
    if (!treeData.value[folderId]) {
      treeData.value[folderId] = [];
    }

    treeData.value[folderId].push(...data);
    sortTree(folderId);
  }
  function sortTree(folderId?: string) {
    const id = folderId ?? TREE_ROOT_KEY;
    if (!treeData.value[id]) return;

    treeData.value[id].sort((a, z) => {
      const aData = a.isFolder ? folders.value[a.id] : snippets.value[a.id];
      const zData = z.isFolder ? folders.value[z.id] : snippets.value[z.id];

      let value =
        aData.name
          ?.toLowerCase()
          ?.localeCompare(zData.name?.toLowerCase() ?? '') ?? 0;
      if (z.isFolder && !a.isFolder) value = 2;
      else if (a.isFolder && !z.isFolder) value = -2;

      return value;
    });
  }
  function moveTreeItem(
    itemId: string,
    folder: { from: string | null; to: string | null },
  ) {
    if (folder.from === folder.to) return;

    const itemData = deleteTreeItem(itemId, folder.from ?? undefined);
    if (!itemData) return;

    addTreeItem([itemData], folder.to ?? undefined);
  }

  async function addSnippets(payload: SnippetNewPayload[]) {
    if (payload.length === 0) return;

    const addedSnippets = await snippetService.createNewSnippets(payload);
    const groupedSnippets: Record<string, TreeDataItem[]> = {};
    addedSnippets.forEach((snippet) => {
      const folderId = snippet.folderId ?? TREE_ROOT_KEY;
      if (!groupedSnippets[folderId]) groupedSnippets[folderId] = [];

      groupedSnippets[folderId].push({ id: snippet.id, isFolder: false });

      snippets.value[snippet.id] = {
        id: snippet.id,
        ext: snippet.ext,
        name: snippet.name,
        tags: snippet.tags,
        keyword: snippet.keyword,
        folderId: snippet.folderId,
        updatedAt: snippet.updatedAt,
        createdAt: snippet.createdAt,
        isBookmark: snippet.isBookmark,
      };
    });

    for (const folderId in groupedSnippets) {
      addTreeItem(groupedSnippets[folderId], folderId);
    }

    state.setSidebarState(
      'activeFileId',
      addedSnippets[addedSnippets.length - 1]?.id ?? '',
    );
  }
  async function deleteSnippet(snippetId: string) {
    const snippetData = snippets.value[snippetId];
    if (!snippetData) return;

    await snippetService.deleteSnippets(snippetId);
    deleteTreeItem(snippetId, snippetData.folderId ?? undefined);

    if (state.sidebarState.activeFileId === snippetId) {
      state.setSidebarState('activeFileId', snippetId);
    }

    delete snippets.value[snippetId];
  }
  async function updateSnippet(
    snippetId: string,
    payload: SnippetUpdatePayload,
  ) {
    if (!snippets.value[snippetId]) return;

    if (payload.name && !payload.ext) {
      const { ext, name } = await getSnippetExtFromName(payload.name);
      payload.ext = ext;
      payload.name = name;
    }

    const snippet = await snippetService.updateSnippet(snippetId, payload);
    if (!snippet) return;

    if (payload.name || 'folderId' in payload) {
      if ('folderId' in payload) {
        moveTreeItem(snippet.id, {
          to: payload.folderId ?? null,
          from: snippets.value[snippetId].folderId,
        });
      } else {
        sortTree(snippet.folderId ?? undefined);
      }
    }

    snippets.value[snippetId] = {
      ...snippets.value[snippetId],
      ext: snippet.ext,
      name: snippet.name,
      tags: snippet.tags,
      keyword: snippet.keyword,
      folderId: snippet.folderId,
      updatedAt: snippet.updatedAt,
      isBookmark: snippet.isBookmark,
    };
  }

  function deleteFolderRecursive(folderId: string) {
    const items = treeData.value[folderId];
    if (!items) return;

    for (const item of items) {
      if (!item.isFolder) {
        if (state.sidebarState.activeFileId === item.id) {
          state.setSidebarState('activeFileId', '');
        }

        delete snippets.value[item.id];

        continue;
      }

      deleteFolderRecursive(item.id);

      delete folders.value[item.id];
      delete treeData.value[item.id];
    }
  }
  async function addFolder(payload: FolderNewPayload = {}) {
    const [folder] = await folderService.createNewFolders([payload]);

    folders.value[folder.id] = folder;
    addTreeItem(
      [{ id: folder.id, isFolder: true }],
      folder.parentId ?? undefined,
    );
  }
  async function deleteFolder(folderId: string) {
    const folderData = folders.value[folderId];
    if (!folderData) return;

    await folderService.deleteFolders(folderId);
    deleteTreeItem(folderId, folderData.parentId ?? undefined);
    deleteFolderRecursive(folderId);
  }
  async function updateFolder(folderId: string, payload: FolderUpdatePayload) {
    if (!folders.value[folderId]) return;

    const folder = await folderService.updateFolder(folderId, payload);
    if (!folder) return;

    if (payload.name || 'parentId' in payload) {
      if ('parentId' in payload) {
        moveTreeItem(folder.id, {
          to: payload.parentId ?? null,
          from: folders.value[folderId].parentId,
        });
      } else {
        sortTree(folder.parentId ?? undefined);
      }
    }

    folders.value[folderId] = {
      ...folders.value[folderId],
      name: folder.name,
      parentId: folder.parentId,
      isBookmark: folder.isBookmark,
    };
  }

  async function deleteItems(items: TreeDataItem[]) {
    const folderIds: string[] = [];
    const snippetIds: string[] = [];

    for (const item of items) {
      (item.isFolder ? folderIds : snippetIds).push(item.id);
    }

    await folderService.deleteFolders(folderIds);
    await snippetService.deleteSnippets(snippetIds);

    folderIds.forEach((folderId) => {
      const folder = folders.value[folderId];
      if (!folder) return;

      deleteTreeItem(folderId, folder.parentId ?? undefined);
      deleteFolderRecursive(folderId);

      delete folders.value[folderId];
    });
    snippetIds.forEach((snippetId) => {
      const snippet = snippets.value[snippetId];
      if (!snippet) return;

      deleteTreeItem(snippetId, snippet.folderId ?? undefined);
      delete snippets.value[snippetId];
    });
  }

  async function init() {
    if (initiated) return;

    const [snippetList, folderList] = await Promise.all([
      snippetService.getAllSnippets(),
      folderService.getAllFolders(),
    ]);

    folders.value = Object.fromEntries(
      folderList.map((item) => [item.id, item]),
    );
    snippets.value = Object.fromEntries(
      snippetList.map((item) => [item.id, item]),
    );

    treeData.value = buildTreeData({
      folders: folderList,
      snippets: snippetList,
    });
    initiated = true;
  }

  return {
    init,
    folders,
    treeData,
    snippets,
    addFolder,
    deleteItems,
    addSnippets,
    deleteFolder,
    updateFolder,
    deleteSnippet,
    updateSnippet,
    activeSnippet,
  };
});

export const useEditorStore = defineStore('editor', () => {
  let initiated = false;

  const state = useEditorState();
  const data = useEditorDataStore();

  async function init() {
    if (initiated) return;

    await Promise.all([data.init(), state.init()]);

    initiated = true;
  }

  return { data, state, init };
});

import * as folderService from '@/db/services/folder.db-service';
import * as snippetService from '@/db/services/snippet.db-service';
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
import { store, STORE_KEYS } from '@/services/store.service';
import {
  buildTreeData,
  TREE_ROOT_KEY,
  TreeData,
  TreeDataItem,
} from '@/utils/tree-data-utils';
import { watchDebounced } from '@vueuse/core/index.cjs';
import { defineStore } from 'pinia';

const useEditorState = defineStore('editor:state', () => {
  let initiated = false;

  const activeFileId = shallowRef('');
  const activeFolderIds = reactive(new Set<string>());

  function setActiveFile(fileId: string) {
    activeFileId.value = fileId;
  }
  async function init() {
    if (initiated) return;

    const storeData = await Promise.all([
      store.get<string>(STORE_KEYS.editorActiveFile),
      store.get<string[]>(STORE_KEYS.editorActiveFolders),
    ]);
    activeFileId.value = storeData[0]!;
    Object.assign(activeFolderIds, new Set(storeData[1])!);

    initiated = true;
  }

  watchDebounced(
    [activeFileId, activeFolderIds],
    () => {
      console.log({ activeFileId, activeFolderIds });
    },
    { debounce: 500 },
  );

  return {
    init,
    activeFileId,
    setActiveFile,
    activeFolderIds,
  };
});

const useEditorDataStore = defineStore('editor:snippets', () => {
  let initiated = false;

  const state = useEditorState();

  const treeData = ref<TreeData>({ __root: [] });
  const folders = ref<Record<string, FolderListItem>>({});
  const snippets = ref<Record<string, SnippetListItem>>({});

  const activeSnippet = computed(
    () => snippets.value[state.activeFileId] ?? null,
  );

  function deleteTreeItem(itemId: string, folderId: string = TREE_ROOT_KEY) {
    if (!treeData.value[folderId]) return;

    const itemIndex = treeData.value[folderId].findIndex(
      (item) => item.id === itemId,
    );
    if (itemIndex === -1) return;

    treeData.value[folderId].splice(itemIndex, 1);
  }
  function addTreeItem(data: TreeDataItem, folderId: string = TREE_ROOT_KEY) {
    if (!treeData.value[folderId]) {
      treeData.value[folderId] = [];
    }

    treeData.value[folderId].push(data);
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

  async function addSnippet(payload: SnippetNewPayload = {}) {
    const [snippet] = await snippetService.createNewSnippets([payload]);
    snippets.value[snippet.id] = {
      id: snippet.id,
      ext: snippet.ext,
      name: snippet.name,
      tags: snippet.tags,
      folderId: snippet.folderId,
      createdAt: snippet.createdAt,
    };

    addTreeItem(
      {
        id: snippet.id,
        isFolder: false,
      },
      payload.folderId ?? undefined,
    );

    state.setActiveFile(snippet.id);
  }
  async function deleteSnippet(snippetId: string) {
    const snippetData = snippets.value[snippetId];
    if (!snippetData) return;

    await snippetService.deleteSnippets(snippetId);
    deleteTreeItem(snippetId, snippetData.folderId ?? undefined);

    delete snippets.value[snippetId];
  }
  async function updateSnippet(
    snippetId: string,
    payload: SnippetUpdatePayload,
  ) {
    if (!snippets.value[snippetId]) return;

    const snippet = await snippetService.updateSnippet(snippetId, payload);
    if (!snippet) return;

    snippets.value[snippetId] = {
      ...snippets.value[snippetId],
      ext: snippet.ext,
      name: snippet.name,
      tags: snippet.tags,
      folderId: snippet.folderId,
    };

    if (payload.name) {
      sortTree(snippet.folderId ?? undefined);
    }
  }

  async function addFolder(payload: FolderNewPayload = {}) {
    const [folder] = await folderService.createNewFolders([payload]);

    folders.value[folder.id] = folder;
    addTreeItem(
      { id: folder.id, isFolder: true },
      folder.parentId ?? undefined,
    );
  }
  async function deleteFolder(folderId: string) {
    const folderData = folders.value[folderId];
    if (!folderData) return;

    await folderService.deleteFolders(folderId);
    deleteTreeItem(folderId, folderData.parentId ?? undefined);

    delete treeData.value[folderId];
    delete folders.value[folderId];
  }
  async function updateFolder(folderId: string, payload: FolderUpdatePayload) {
    if (!folders.value[folderId]) return;

    const folder = await folderService.updateFolder(folderId, payload);
    if (!folder) return;

    folders.value[folderId] = {
      ...folders.value[folderId],
      name: folder.name,
      parentId: folder.parentId,
    };
    if (payload.name) {
      sortTree(folder.parentId ?? undefined);
    }
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
    addSnippet,
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

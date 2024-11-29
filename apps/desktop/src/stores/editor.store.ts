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
import { getSnippetExtFromName } from '@/utils/snippet-utils';
import {
  buildTreeData,
  TREE_ROOT_KEY,
  TreeData,
  TreeDataItem,
} from '@/utils/tree-data-utils';
import { defineStore } from 'pinia';

const useEditorState = defineStore('editor:state', () => {
  let initiated = false;

  const activeFileId = ref('');
  const activeFolderIds = ref<string[]>([]);

  function setActiveFile(fileId: string) {
    activeFileId.value = fileId;
  }
  async function init() {
    if (initiated) return;

    const storeData = await Promise.all([
      store.get<string>(STORE_KEYS.editorActiveFile),
      store.get<string[]>(STORE_KEYS.editorActiveDirs),
    ]);
    activeFileId.value = storeData[0]!;
    activeFolderIds.value = storeData[1]!;

    initiated = true;
  }

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

  async function addSnippets(payload: SnippetNewPayload[] = []) {
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
        folderId: snippet.folderId,
        updatedAt: snippet.updatedAt,
        createdAt: snippet.createdAt,
      };
    });

    for (const folderId in groupedSnippets) {
      addTreeItem(groupedSnippets[folderId], folderId);
    }

    state.setActiveFile(addedSnippets[addedSnippets.length - 1]?.id ?? '');
  }
  async function deleteSnippet(snippetId: string) {
    const snippetData = snippets.value[snippetId];
    if (!snippetData) return;

    await snippetService.deleteSnippets(snippetId);
    deleteTreeItem(snippetId, snippetData.folderId ?? undefined);

    if (state.activeFileId === snippetId) state.setActiveFile(snippetId);

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
      folderId: snippet.folderId,
      updatedAt: snippet.updatedAt,
    };
  }

  function deleteFolderRecursive(folderId: string) {
    const items = treeData.value[folderId];
    if (!items) return;

    for (const item of items) {
      if (!item.isFolder) {
        if (state.activeFileId === item.id) state.setActiveFile(item.id);

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
    };
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

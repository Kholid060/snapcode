import { SnippetNewPayload } from '@/interface/snippet.interface';
import documentService from '@/services/document.service';
import {
  DocumentCreatedFolder,
  DocumentCreatedSnippet,
  DocumentFlatTree,
  DocumentFlatTreeItem,
  DocumentFlatTreeMetadata,
  DocumentFlatTreeMetadataItem,
  DocumentOldNewVal,
} from '@/interface/document.interface';
import { defineStore } from 'pinia';
import { FolderNewPayload } from '@/interface/folder.interface';
import { useEditorState } from './editor-state.store';
import {
  documentItemsSorter,
  getDocumentParentDir,
  getRootPaths,
  joinDocumentPath,
} from '@/utils/document-utils';
import { TREE_ROOT_KEY } from '@/utils/tree-data-utils';
import { useBookmarksStore } from '../bookmarks.store';
import type { SetOptional } from 'type-fest';
import { nanoid } from 'nanoid/non-secure';
import { isString } from '@/utils/data-type';
import { useAppStore } from '../app.store';
import { getSnippetLangFromName } from '@/utils/snippet-utils';
import { extname } from '@tauri-apps/api/path';

type NewFlatTreeItem = SetOptional<DocumentFlatTreeItem, 'id' | 'parentId'>;
type NewFlatTreeMetadataItem = SetOptional<DocumentFlatTreeMetadataItem, 'id'>;

export const useEditorDocument = defineStore('editor:document', () => {
  const appStore = useAppStore();
  const editorState = useEditorState();
  const bookmarksStore = useBookmarksStore();

  const treeMetadata = reactive<DocumentFlatTreeMetadata>({
    [TREE_ROOT_KEY]: {
      ext: '',
      mtime: 0,
      name: '',
      path: '',
      isDir: true,
      id: TREE_ROOT_KEY,
    },
  });
  const treeData = reactive<DocumentFlatTree>({ [TREE_ROOT_KEY]: [] });

  function sortTree(dir?: string) {
    const dirPath = dir || TREE_ROOT_KEY;
    if (!treeData[dirPath]) return;

    documentItemsSorter(treeData[dirPath], treeMetadata);
  }

  function addItem({
    item,
    metadata,
    sort = true,
  }: {
    sort?: boolean;
    item: NewFlatTreeItem;
    metadata?: NewFlatTreeMetadataItem;
  }) {
    const key = item.parentId || TREE_ROOT_KEY;
    const id = item.id || nanoid(5);
    if (!treeData[key]) {
      treeData[key] = [{ ...item, id, parentId: key }];
    } else {
      treeData[key].push({ ...item, id, parentId: key });
      if (sort) sortTree(key);
    }

    if (metadata) treeMetadata[id] = { ...metadata, id };

    return id;
  }
  function registerItems({
    folders,
    snippets,
  }: {
    folders?: DocumentCreatedFolder[];
    snippets?: DocumentCreatedSnippet[];
  }) {
    const folderIds: string[] = [];
    const snippetIds: string[] = [];
    const parentIds = new Set<string>();

    if (snippets) {
      snippets.forEach((snippet) => {
        const parentId = snippet.metadata?.parentId || TREE_ROOT_KEY;
        parentIds.add(parentId);

        const metadata: NewFlatTreeMetadataItem = {
          isDir: false,
          ext: snippet.ext,
          path: snippet.path,
          mtime: Date.now(),
          name: snippet.name,
          metadata: snippet.stored,
        };
        snippetIds.push(
          addItem({
            metadata,
            sort: false,
            item: { isDir: metadata.isDir, parentId },
          }),
        );
      });
    }

    if (folders) {
      folders.forEach((folder) => {
        const parentId = folder.metadata?.parentId || TREE_ROOT_KEY;
        parentIds.add(parentId);

        const metadata: NewFlatTreeMetadataItem = {
          ext: '',
          isDir: true,
          path: folder.path,
          mtime: Date.now(),
          name: folder.name,
          id: folder.metadata?.id,
        };
        folderIds.push(
          addItem({
            metadata,
            sort: false,
            item: { isDir: metadata.isDir, parentId, id: metadata.id },
          }),
        );
      });
    }

    parentIds.forEach((parentId) => {
      sortTree(parentId);
    });

    return {
      folders: folderIds,
      snippets: snippetIds,
    };
  }
  async function deleteItems(items: DocumentFlatTreeItem[]) {
    const itemPaths: string[] = [];
    const metadataPaths: string[] = [];
    let removeActiveFile = false;

    items.sort((a, z) => {
      if (a.isDir && z.isDir) return 1;

      return a.isDir ? 1 : -1;
    });

    const walkFolder = (folderId: string) => {
      if (!treeData[folderId]) return;

      if (treeMetadata[folderId]) {
        const itemPath = treeMetadata[folderId].path;
        itemPaths.push(itemPath);
        metadataPaths.push(itemPath);
      }

      treeData[folderId].forEach((item) => {
        if (treeMetadata[item.id]) {
          metadataPaths.push(treeMetadata[item.id].path);
        }

        if (item.id === editorState.state.activeFileId) {
          removeActiveFile = true;
        }

        if (item.isDir) walkFolder(item.id);
      });

      delete treeData[folderId];
    };
    items.forEach((item) => {
      if (item.id === editorState.state.activeFileId) {
        removeActiveFile = true;
      }

      const itemIndex =
        treeData[item.parentId]?.findIndex(
          (treeItem) => treeItem.id === item.id,
        ) ?? -1;
      if (itemIndex === -1) return;

      treeData[item.parentId].splice(itemIndex, 1);

      if (item.isDir && treeData[item.id]) {
        walkFolder(item.id);
      } else if (treeData[item.parentId] && treeMetadata[item.id]) {
        const itemPath = treeMetadata[item.id].path;
        itemPaths.push(itemPath);
        metadataPaths.push(itemPath);
        delete treeMetadata[item.id];
      }
    });

    await documentService.deleteItems(
      getRootPaths(itemPaths),
      appStore.settings.deleteToTrash,
    );
    await documentService.stores.metadata.xDelete(metadataPaths);

    if (removeActiveFile) {
      editorState.updateState('activeFileId', '');
    }
  }
  async function moveItem({
    id,
    newParentId,
    oldParentId,
  }: {
    id: string;
    oldParentId: string;
    newParentId: string;
  }) {
    if (oldParentId === newParentId) return;

    const oldParentTree = treeData[oldParentId || TREE_ROOT_KEY];
    const oldItemIndex =
      oldParentTree.findIndex((item) => item.id === id) ?? -1;
    if (oldItemIndex === -1) return;

    const metadata = treeMetadata[id];
    const oldParentPath = treeMetadata[oldParentId]?.path;
    const newParentPath = treeMetadata[newParentId]?.path;
    if (!metadata || !isString(oldParentPath) || !isString(newParentPath))
      return;

    const newPath = joinDocumentPath(newParentPath, metadata.name);
    const [movedPath] = await documentService.moveItems([
      [metadata.path, newPath],
    ]);
    await documentService.renameMetadata([[oldParentPath, movedPath]]);

    addItem({
      item: {
        id: metadata.id,
        parentId: newParentId,
        isDir: metadata.isDir,
      },
    });
    oldParentTree.splice(oldItemIndex, 1);

    bookmarksStore.renameBookmark({
      newPath: movedPath,
      isDir: metadata.isDir,
      oldPath: metadata.path,
    });

    metadata.path = movedPath;
    if (metadata.isDir) {
      await renameFolderMetadata({
        id,
        newPath: movedPath,
      });
    }
  }
  function findItemByPath(path: string, isDir = false) {
    for (const key in treeData) {
      for (const item of treeData[key]) {
        if (
          treeMetadata[item.id]?.path === path &&
          (isDir ? true : isDir === item.isDir)
        ) {
          return item;
        }
      }
    }
  }
  function findItemMetadataByPath(path: string, isDir = false) {
    const item = Object.values(treeMetadata).find(
      (item) => item.path === path && (isDir ? true : isDir === item.isDir),
    );
    return item ?? null;
  }

  async function duplicateSnippet(path: string) {
    const snippet = await documentService.duplicateSnippet(path);
    registerItems({ snippets: [snippet] });
  }
  async function addSnippets(payload: SnippetNewPayload[]) {
    const { snippets } = registerItems({
      snippets: await documentService.createSnippets(payload),
    });

    const lastSnippet = snippets.at(-1);
    if (lastSnippet) {
      editorState.updateState('activeFileId', lastSnippet);
    }

    return snippets;
  }
  async function updateSnippetContents(id: string, content: string) {
    const itemPath = treeMetadata[id]?.path;
    if (!itemPath) return;

    await documentService.updateFileContent(itemPath, content);

    treeMetadata[id].mtime = Date.now();
  }
  async function updateSnippetMetadata(
    id: string,
    payload: Partial<DocumentFlatTreeMetadataItem>,
  ) {
    const currMetadata = treeMetadata[id];
    if (!currMetadata) return;

    let metadata = currMetadata.metadata;
    if (payload.metadata) {
      metadata = {
        ...(currMetadata.metadata ?? {}),
        ...payload.metadata,
      };
      await documentService.setMetadata(currMetadata.path, metadata);

      if (payload.path) {
        await documentService.renameMetadata([
          [currMetadata.path, payload.path],
        ]);
      }
    }

    treeMetadata[id] = {
      ...treeMetadata[id],
      ...payload,
      metadata,
    };
  }

  async function addFolders(payload: FolderNewPayload[]) {
    const folders = await documentService.createFolders(payload);
    registerItems({ folders });

    return folders;
  }

  interface RenameFolderPayload {
    id: string;
    newPath: string;
  }
  async function renameFolderMetadata(basePayload: RenameFolderPayload) {
    const newMetadatKeys: DocumentOldNewVal[] = [];

    const walkFolder = ({ id, newPath }: RenameFolderPayload) => {
      const metadata = treeMetadata[id];
      if (!metadata) return;

      metadata.path = newPath;

      for (const child of treeData[id] || []) {
        const childMetadata = treeMetadata[child.id];
        if (!childMetadata) continue;

        const newChildPath = joinDocumentPath(
          metadata.path,
          childMetadata.name,
        );
        newMetadatKeys.push([childMetadata.path, newChildPath]);
        childMetadata.path = newChildPath;

        if (childMetadata.isDir) {
          walkFolder({
            id: child.id,
            newPath: newChildPath,
          });
        }
      }
    };
    walkFolder(basePayload);

    if (newMetadatKeys.length > 0) {
      await documentService.renameMetadata(newMetadatKeys);
    }

    editorState.saveState();
  }
  function getItemMetadata(itemId: string) {
    return treeMetadata[itemId] ?? null;
  }

  async function rename({ id, newName }: { id: string; newName: string }) {
    const itemMetadata = treeMetadata[id];
    if (!itemMetadata) return;

    const parsedPath = getDocumentParentDir(itemMetadata.path);
    const newPath = joinDocumentPath(parsedPath.parentDir, newName);

    await documentService.renameItem(itemMetadata.path, newPath);

    if (itemMetadata.isDir) {
      treeMetadata[id].name = newName;
      await renameFolderMetadata({ id, newPath });
    } else {
      await updateSnippetMetadata(id, {
        path: newPath,
        name: newName,
        ext: (await extname(newName)) || 'txt',
        metadata: { lang: (await getSnippetLangFromName(newName))?.name ?? '' },
      });
    }

    const item = findItemByPath(newPath, itemMetadata.isDir);
    if (item) sortTree(item.parentId);

    if (
      editorState.state.activeFileId === id ||
      editorState.state.activeFolderIds.includes(id)
    ) {
      editorState.saveState();
    }

    await bookmarksStore.renameBookmark({
      newPath,
      isDir: itemMetadata.isDir,
      oldPath: itemMetadata.path,
    });
  }

  async function init() {
    const data = await documentService.getFlatTree();
    Object.keys(data.flatTree).forEach((key) => {
      documentItemsSorter(data.flatTree[key], data.metadata);
    });
    Object.assign(treeData, data.flatTree);
    Object.assign(treeMetadata, data.metadata);
  }

  return {
    init,
    rename,
    treeData,
    moveItem,
    addFolders,
    deleteItems,
    addSnippets,
    treeMetadata,
    registerItems,
    getItemMetadata,
    duplicateSnippet,
    updateSnippetContents,
    updateSnippetMetadata,
    findItemMetadataByPath,
  };
});

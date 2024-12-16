import {
  SnippetMetadata,
  SnippetNewPayload,
} from '@/interface/snippet.interface';
import documentService from '@/services/document.service';
import {
  DocumentCreatedFolder,
  DocumentCreatedSnippet,
  DocumentFlatTree,
  DocumentFlatTreeItem,
  DocumentOldNewVal,
} from '@/interface/document.interface';
import { defineStore } from 'pinia';
import { FolderNewPayload } from '@/interface/folder.interface';
import { useEditorState } from './editor-state.store';
import {
  documentItemsSorter,
  getDocumentParentDir,
  getNameFromPath,
  joinDocumentPath,
} from '@/utils/document-utils';
import { getSnippetLangFromName } from '@/utils/snippet-utils';
import { TREE_ROOT_KEY } from '@/utils/tree-data-utils';
import { useAppStore } from '../app.store';
import { FOLDER_TREE_ITEM_PREFIX } from '@/utils/const/editor.const';
import { extname } from '@tauri-apps/api/path';
import { useBookmarksStore } from '../bookmarks.store';

export const useEditorDocument = defineStore('editor:document', () => {
  let initiated = false;

  const appStore = useAppStore();
  const editorState = useEditorState();
  const bookmarksStore = useBookmarksStore();

  const treeData = reactive<DocumentFlatTree>({ [TREE_ROOT_KEY]: [] });

  function sortTree(dir?: string) {
    const dirPath = dir || TREE_ROOT_KEY;
    if (!treeData[dirPath]) return;

    documentItemsSorter(treeData[dirPath]);
  }

  function getItemByPath(path: string) {
    const parsedPath = getDocumentParentDir(path);
    return (
      treeData[parsedPath.parentDir || TREE_ROOT_KEY]?.find(
        (item) => item.name === parsedPath.filename,
      ) ?? null
    );
  }
  function addItem(item: DocumentFlatTreeItem, dirPath?: string, sort = false) {
    const key = dirPath || TREE_ROOT_KEY;
    if (!treeData[key]) {
      treeData[key] = [item];
    } else {
      treeData[key].push(item);
    }

    if (sort) sortTree(key);
  }
  function registerItems({
    folders,
    snippets,
  }: {
    folders?: DocumentCreatedFolder[];
    snippets?: DocumentCreatedSnippet[];
  }) {
    const dirs = new Set<string>();

    if (snippets) {
      snippets.forEach((snippet) => {
        const parentDir =
          getDocumentParentDir(snippet.path, snippet.name).parentDir ||
          TREE_ROOT_KEY;
        dirs.add(parentDir);
        addItem(
          {
            isDir: false,
            ext: snippet.ext,
            path: snippet.path,
            mtime: Date.now(),
            name: snippet.name,
            metadata: snippet.stored,
          },
          parentDir,
          false,
        );
      });
    }

    if (folders) {
      folders.forEach((folder) => {
        const parentDir =
          getDocumentParentDir(folder.path, folder.name).parentDir ??
          TREE_ROOT_KEY;
        dirs.add(parentDir);
        addItem(
          {
            ext: '',
            isDir: true,
            path: folder.name,
            mtime: Date.now(),
            name: folder.name,
          },
          parentDir,
          false,
        );
      });
    }

    dirs.forEach((dir) => sortTree(dir));
  }
  async function deleteItems(paths: string[]) {
    const splittedPaths: Record<string, string[]> = {};

    if (paths.length === 1) {
      splittedPaths[paths[0]] = paths[0].split('/');
    } else {
      paths.sort((a, z) => {
        const aPaths = splittedPaths[a] ?? (splittedPaths[a] = a.split('/'));
        const zPaths = splittedPaths[z] ?? (splittedPaths[z] = z.split('/'));

        return aPaths.length - zPaths.length;
      });
    }

    const rootItems: string[] = [];
    for (const path of paths) {
      const isRoot =
        !splittedPaths[path] ||
        splittedPaths[path].length === 1 ||
        !rootItems.some((root) => path.startsWith(root));
      if (isRoot) {
        rootItems.push(path);
        continue;
      }
    }

    await documentService.deleteItems(
      rootItems,
      appStore.settings.deleteToTrash,
    );

    for (const path of paths) {
      if (Object.hasOwn(treeData, path)) {
        Object.keys(treeData).forEach((folderPath) => {
          if (folderPath.startsWith(path)) delete treeData[folderPath];
        });
      }

      const parentDir = splittedPaths[path]
        ? splittedPaths[path].slice(0, -1).join('/') || TREE_ROOT_KEY
        : TREE_ROOT_KEY;
      const itemIndex = (treeData[parentDir] ?? []).findIndex(
        (item) => item.path === path,
      );
      if (itemIndex !== -1) {
        treeData[parentDir].splice(itemIndex, 1);
      }
    }
  }
  async function moveItem(oldPath: string, newPath: string) {
    const oldParentDir =
      getDocumentParentDir(oldPath).parentDir || TREE_ROOT_KEY;
    const oldItemIndex =
      treeData[oldParentDir]?.findIndex((item) => item.path === oldPath) ?? -1;
    if (oldItemIndex === -1) return;

    const newParentDir =
      getDocumentParentDir(newPath).parentDir || TREE_ROOT_KEY;
    if (!treeData[newParentDir] || oldParentDir === newParentDir) return;

    const [movedPath] = await documentService.moveItems([[oldPath, newPath]]);
    await documentService.renameMetadata([[oldPath, movedPath]]);

    addItem(
      {
        ...treeData[oldParentDir][oldItemIndex],
        mtime: Date.now(),
        path: movedPath,
        name: getNameFromPath(movedPath),
      },
      newParentDir,
    );

    if (oldParentDir === editorState.state.activeFileId) {
      editorState.updateState('activeFileId', movedPath);
    }

    treeData[oldParentDir].splice(oldItemIndex, 1);
  }

  async function addSnippets(payload: SnippetNewPayload[]) {
    const snippets = await documentService.createSnippets(payload);
    registerItems({ snippets });

    const lastSnippet = snippets.at(-1);
    if (lastSnippet) {
      editorState.updateState('activeFileId', lastSnippet.path);
    }

    return snippets;
  }
  async function setSnippetContents(path: string, content: string) {
    const snippetPath = getDocumentParentDir(path);
    const item = treeData[snippetPath.parentDir]?.find(
      (item) => item.path === path,
    );
    if (!item) return;

    await documentService.updateFileContent(path, content);

    item.mtime = Date.now();
  }
  async function updateSnippetMetadata(
    path: string,
    data: Partial<SnippetMetadata>,
  ) {
    const parentDir = getDocumentParentDir(path);
    const item = (treeData[parentDir.parentDir] ?? []).find(
      (item) => item.path === path,
    );
    if (!item) return;

    const updatedData = {
      ...(item.metadata ?? {}),
      ...data,
    } as SnippetMetadata;
    await documentService.setMetadata(path, updatedData);

    item.metadata = updatedData;
  }

  async function addFolders(payload: FolderNewPayload[]) {
    const folders = await documentService.createFolders(payload);
    registerItems({ folders });

    return folders;
  }
  async function renameFolder(oldPath: string, newPath: string) {
    if (!treeData[oldPath]) return;

    const newMetadatKeys: DocumentOldNewVal[] = [];
    Object.keys(treeData).forEach((dirPath) => {
      if (!dirPath.startsWith(oldPath)) return;

      const newDirPath = joinDocumentPath(
        newPath,
        dirPath.slice(oldPath.length + 1),
      );
      treeData[newDirPath] = treeData[dirPath].map((item) => {
        const newItemPath = joinDocumentPath(newDirPath, item.name);
        if (!item.isDir) newMetadatKeys.push([item.path, newItemPath]);

        item.path = newItemPath;

        return item;
      });

      delete treeData[dirPath];
    });

    await documentService.renameMetadata(newMetadatKeys);

    let isChanged = false;
    const oldFolderTreeKey = `${FOLDER_TREE_ITEM_PREFIX}${oldPath}`;
    const updatedActiveFolders = editorState.state.activeFolderIds.map(
      (currPath) => {
        if (currPath.startsWith(oldFolderTreeKey)) {
          isChanged = true;
          const updatedPath = joinDocumentPath(
            newPath,
            currPath.slice(oldPath.length + FOLDER_TREE_ITEM_PREFIX.length + 1),
          );
          return `${FOLDER_TREE_ITEM_PREFIX}${updatedPath}`;
        }

        return currPath;
      },
    );
    if (isChanged) {
      editorState.updateState('activeFolderIds', updatedActiveFolders);
    }
  }

  async function rename({ path, newName }: { path: string; newName: string }) {
    const oldPath = getDocumentParentDir(path);
    const oldPathParent = oldPath.parentDir || TREE_ROOT_KEY;
    const items = treeData[oldPathParent] ?? [];
    const itemIndex = items.findIndex((item) => item.path === path);
    if (oldPath.filename === newName || itemIndex === -1) return;

    const newPath = joinDocumentPath(oldPath.parentDir, newName);
    await documentService.renameItem(path, newPath);

    const updatedItemData: DocumentFlatTreeItem = {
      ...items[itemIndex],
      name: newName,
      path: newPath,
      mtime: Date.now(),
    };

    if (!items[itemIndex].isDir) {
      const lang = await getSnippetLangFromName(newName);
      updatedItemData.metadata = {
        ...(updatedItemData.metadata ?? {}),
        lang: lang?.name ?? '',
      };
      updatedItemData.ext = await extname(newName);
      await documentService.moveMetadata({
        newPath,
        oldPath: path,
        data: updatedItemData.metadata,
      });
    } else {
      await renameFolder(path, newPath);
    }

    treeData[oldPathParent][itemIndex] = updatedItemData;

    await bookmarksStore.renameBookmark({
      newPath,
      oldPath: path,
      isDir: items[itemIndex].isDir,
    });

    const activePath = editorState.state.activeFileId;
    if (activePath.startsWith(path)) {
      editorState.updateState(
        'activeFileId',
        editorState.state.activeFileId === path
          ? newPath
          : joinDocumentPath(newPath, activePath.slice(path.length + 1)),
      );
    }
  }

  async function init() {
    if (initiated) return;

    const flatTree = await documentService.getFlatTree();
    Object.keys(flatTree).forEach((key) => {
      documentItemsSorter(flatTree[key]);
    });
    Object.assign(treeData, flatTree);

    initiated = true;
  }

  return {
    init,
    rename,
    treeData,
    moveItem,
    addFolders,
    deleteItems,
    addSnippets,
    registerItems,
    getItemByPath,
    setSnippetContents,
    updateSnippetMetadata,
  };
});

import {
  DocumentCreatedFolder,
  DocumentCreatedSnippet,
  DocumentFlatTree,
  DocumentFlatTreeItem,
} from '@/interface/document.interface';
import { documentItemsSorter, getDocumentParentDir } from './document-utils';
import { TREE_ROOT_KEY } from './tree-data-utils';

export function sortTree(treeData: DocumentFlatTree, dir?: string) {
  const dirPath = dir || TREE_ROOT_KEY;
  if (!treeData[dirPath]) return;

  documentItemsSorter(treeData[dirPath]);
}

export function addTreeItem(
  treeData: DocumentFlatTree,
  {
    item,
    sort,
    dirPath,
  }: {
    sort?: boolean;
    dirPath?: string;
    item: DocumentFlatTreeItem;
  },
) {
  const key = dirPath || TREE_ROOT_KEY;
  if (!treeData[key]) {
    treeData[key] = [item];
  } else {
    treeData[key].push(item);
  }

  if (sort) sortTree(treeData, key);
}

export function registerTreeItems(
  treeData: DocumentFlatTree,
  {
    folders,
    snippets,
  }: {
    folders?: DocumentCreatedFolder[];
    snippets?: DocumentCreatedSnippet[];
  },
) {
  const dirs = new Set<string>();

  if (snippets) {
    snippets.forEach((snippet) => {
      const parentDir =
        getDocumentParentDir(snippet.path, snippet.name) || TREE_ROOT_KEY;
      dirs.add(parentDir);
      addTreeItem(treeData, {
        item: {
          isDir: false,
          path: snippet.path,
          name: snippet.name,
          mtime: Date.now(),
          metadata: snippet.stored,
        },
        dirPath: parentDir,
        sort: false,
      });
    });
  }

  if (folders) {
    folders.forEach((folder) => {
      const parentDir = getDocumentParentDir(folder.path, folder.name);
      dirs.add(parentDir);
      addTreeItem(treeData, {
        item: {
          isDir: true,
          path: folder.path,
          name: folder.name,
          mtime: Date.now(),
        },
        dirPath: parentDir,
        sort: false,
      });
    });
  }

  dirs.forEach((dir) => sortTree(treeData, dir));
}

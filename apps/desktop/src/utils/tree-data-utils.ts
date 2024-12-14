import { DocumentFlatTreeItem } from '@/interface/document.interface';
import { FolderListItem } from '@/interface/folder.interface';
import { SnippetListItem } from '@/interface/snippet.interface';

export const TREE_ROOT_KEY = '__root' as const;

export type TreeDataItem = { id: string; isFolder: boolean };
export type TreeData = Record<
  typeof TREE_ROOT_KEY | (string & {}),
  TreeDataItem[]
>;

export function buildTreeData({
  folders,
  snippets,
}: {
  folders: FolderListItem[];
  snippets: SnippetListItem[];
}) {
  const groupedChildren: TreeData = {
    [TREE_ROOT_KEY]: [],
  };

  for (const item of folders) {
    const parentId = item.parentId || TREE_ROOT_KEY;
    if (!groupedChildren[parentId]) {
      groupedChildren[parentId] = [];
    }

    groupedChildren[parentId].push({ id: item.id, isFolder: true });
  }
  for (const item of snippets) {
    const folderId = item.folderId || TREE_ROOT_KEY;
    if (!groupedChildren[folderId]) {
      groupedChildren[folderId] = [];
    }

    groupedChildren[folderId].push({ id: item.id, isFolder: false });
  }

  return groupedChildren;
}

export function combineTreeItemPath(
  child: DocumentFlatTreeItem,
  parent?: DocumentFlatTreeItem | null,
) {
  return parent ? `${parent.path}/${child.path}` : child.path;
}

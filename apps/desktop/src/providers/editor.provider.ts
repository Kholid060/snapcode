import { EditorSidebarContextMenuItems } from '@/interface/editor.interface';
import { TreeDataItem } from '@/utils/tree-data-utils';

export const EDITOR_SIDEBAR_PROVIDER_KEY = Symbol('editor-sidebar');

export interface EditorSidebarProvider {
  selectedItems: Ref<TreeDataItem[]>;
  deleteSelectedItems: () => Promise<void>;
  setSelectedItems: (data: TreeDataItem[]) => void;
  handleContextMenu: (data: EditorSidebarContextMenuItems) => void;
}

export function useEditorSidebarProvider() {
  return inject(EDITOR_SIDEBAR_PROVIDER_KEY) as EditorSidebarProvider;
}

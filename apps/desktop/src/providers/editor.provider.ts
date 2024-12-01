import { TreeDataItem } from '@/utils/tree-data-utils';

export const EDITOR_SIDEBAR_PROVIDER_KEY = Symbol('editor-sidebar');

export interface EditorSidebarContextMenuData {
  id: string;
  event: PointerEvent;
  isTopOfSelected: boolean;
  type: 'folder' | 'snippet';
}

export interface EditorSidebarProvider {
  selectedItems: Ref<TreeDataItem[]>;
  deleteSelectedItems: () => Promise<void>;
  handleContextMenu: (data: EditorSidebarContextMenuData) => void;
}

export function useEditorSidebarProvider() {
  return inject(EDITOR_SIDEBAR_PROVIDER_KEY) as EditorSidebarProvider;
}

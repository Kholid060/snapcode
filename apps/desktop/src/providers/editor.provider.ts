import { DocumentFlatTreeItem } from '@/interface/document.interface';
import { EditorSidebarContextMenuItems } from '@/interface/editor.interface';

export const EDITOR_SIDEBAR_PROVIDER_KEY = Symbol('editor-sidebar');

export interface EditorSidebarProvider {
  deleteSelectedItems: () => Promise<void>;
  selectedItems: Ref<DocumentFlatTreeItem[]>;
  setSelectedItems: (data: DocumentFlatTreeItem[]) => void;
  handleContextMenu: (data: EditorSidebarContextMenuItems) => void;
}

export function useEditorSidebarProvider() {
  return inject(EDITOR_SIDEBAR_PROVIDER_KEY) as EditorSidebarProvider;
}

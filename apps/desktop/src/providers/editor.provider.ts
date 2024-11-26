import { ShallowRef } from 'vue';

export const EDITOR_SIDEBAR_PROVIDER_KEY = Symbol('editor-sidebar');

export interface EditorSidebarContextMenuData {
  id: string;
  event: PointerEvent;
  type: 'folder' | 'snippet';
}

export interface EditorSidebarDragData {
  id: string;
  isFolder: boolean;
  parentId: string | null;
}

export interface EditorSidebarProvider {
  dragData: ShallowRef<EditorSidebarDragData | null>;
  setDragData: (data: EditorSidebarDragData | null) => void;
  handleContextMenu: (data: EditorSidebarContextMenuData) => void;
}

export function useEditorSidebarProvider() {
  return inject(EDITOR_SIDEBAR_PROVIDER_KEY) as EditorSidebarProvider;
}

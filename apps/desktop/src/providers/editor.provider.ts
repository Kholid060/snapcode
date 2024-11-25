import { unimplFunc } from '@/utils/helper';

export const EDITOR_SIDEBAR_PROVIDER_KEY = Symbol('editor-sidebar');

export interface EditorSidebarContextMenuData {
  id: string;
  event: PointerEvent;
  type: 'folder' | 'snippet';
}

export interface EditorSidebarProvider {
  handleContextMenu: (data: EditorSidebarContextMenuData) => void;
}

export function useEditorSidebarProvider() {
  return inject<EditorSidebarProvider>(EDITOR_SIDEBAR_PROVIDER_KEY, {
    handleContextMenu: unimplFunc,
  });
}

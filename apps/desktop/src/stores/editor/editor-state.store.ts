import { EditorSidebarState } from '@/interface/editor.interface';
import documentService from '@/services/document.service';
import { watchDebounced } from '@vueuse/core';
import { defineStore } from 'pinia';
import { useEditorDocument } from './editor-document.store';

const DEFAULT_SIDEBAR_STATE: EditorSidebarState = {
  activeFileId: '',
  showSidebar: true,
  activeFolderIds: [],
  activeMenu: 'snippets',
};
const DEBOUNCE_MS = 1500;

export const useEditorState = defineStore('editor:state', () => {
  let initiated = false;

  const docStore = useEditorDocument();

  const state = reactive<EditorSidebarState>({
    ...DEFAULT_SIDEBAR_STATE,
  });

  function getMappedFolderIds() {
    return state.activeFolderIds.reduce<string[]>((acc, folderId) => {
      if (docStore.treeMetadata[folderId]) {
        acc.push(docStore.treeMetadata[folderId].path);
      }

      return acc;
    }, []);
  }
  function updateState<T extends keyof EditorSidebarState>(
    key: T,
    value: EditorSidebarState[T],
  ) {
    state[key] = value;
  }
  function saveState() {
    if (!initiated) return;

    const data = { ...toRaw(state) };
    data.activeFolderIds = getMappedFolderIds();
    data.activeFileId = docStore.treeMetadata[data.activeFileId]?.path ?? '';

    documentService.stores.state.xSet('editor', data);
  }
  async function init() {
    const storeData = await documentService.stores.state.xGet('editor', {
      ...DEFAULT_SIDEBAR_STATE,
    });
    const activeFolderIds = new Set(storeData.activeFolderIds);

    Object.values(docStore.treeMetadata).forEach((item) => {
      if (activeFolderIds.has(item.path) && item.isDir) {
        activeFolderIds.add(item.id);
        activeFolderIds.delete(item.path);
      }

      if (storeData.activeFileId === item.path && !item.isDir) {
        storeData.activeFileId = item.id;
      }
    });
    storeData.activeFolderIds = Array.from(activeFolderIds);

    Object.assign(state, storeData);

    setTimeout(() => {
      initiated = true;
    }, DEBOUNCE_MS + 100);
  }

  watchDebounced(state, saveState, { debounce: DEBOUNCE_MS });

  return {
    init,
    state,
    saveState,
    updateState,
  };
});

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
  async function init() {
    if (initiated) return;

    const storeData = await documentService.stores.state.xGet('editor', {
      ...DEFAULT_SIDEBAR_STATE,
    });
    Object.assign(state, storeData);

    initiated = true;
  }

  watchDebounced(
    state,
    (newVal, oldVal) => {
      if (!initiated) return;

      const data = newVal;
      if (newVal.activeFolderIds !== oldVal.activeFolderIds) {
        data.activeFolderIds = getMappedFolderIds();
      }
      if (
        newVal.activeFileId !== oldVal.activeFileId &&
        docStore.treeMetadata[newVal.activeFileId]
      ) {
        data.activeFileId = docStore.treeMetadata[newVal.activeFileId].path;
      }

      documentService.stores.state.xSet('editor', data);
    },
    { debounce: 1500 },
  );

  return {
    init,
    state,
    updateState,
  };
});

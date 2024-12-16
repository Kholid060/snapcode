import { EditorSidebarState } from '@/interface/editor.interface';
import documentService from '@/services/document.service';
import { watchDebounced } from '@vueuse/core';
import { defineStore } from 'pinia';

const DEFAULT_SIDEBAR_STATE: EditorSidebarState = {
  activeFileId: '',
  showSidebar: true,
  activeFolderIds: [],
  activeMenu: 'snippets',
};

export const useEditorState = defineStore('editor:state', () => {
  let initiated = false;

  const state = reactive<EditorSidebarState>({
    ...DEFAULT_SIDEBAR_STATE,
  });

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
    () => {
      if (!initiated) return;

      documentService.stores.state.xSet('editor', toRaw(state));
    },
    { debounce: 500 },
  );

  return {
    init,
    state,
    updateState,
  };
});

import { getAllFolders } from '@/db/services/folder.db-service';
import { createNewSnippets, getAllSnippets } from '@/db/services/snippet.db-service';
import { FolderListItem } from '@/interface/folder.interface';
import { SnippetListItem, SnippetNewPayload } from '@/interface/snippet.interface';
import { store } from '@/services/store.service';
import { APP_STORE_KEYS } from '@/utils/const/app.const';
import { watchDebounced } from '@vueuse/core/index.cjs';
import { defineStore } from 'pinia';

const useEditorState = defineStore('editor:state', () => {
  let initiated = false;

  const activeFileId = shallowRef('');
  const activeFolderIds = reactive(new Set<string>());

  function setActiveFile(fileId: string) {
    activeFileId.value = fileId;
  }
  async function init() {
    if (initiated) return;

    const storeData = await Promise.all([
      store.get<string>(APP_STORE_KEYS.editorActiveFile),
      store.get<string[]>(APP_STORE_KEYS.editorActiveFolders),
    ]);
    activeFileId.value = storeData[0]!;
    Object.assign(activeFolderIds, new Set(storeData[1])!);

    initiated = true;
  }

  watchDebounced([activeFileId, activeFolderIds], () => {
    console.log({ activeFileId, activeFolderIds });
  }, { debounce: 500 });

  return {
    init,
    activeFileId,
    setActiveFile,
    activeFolderIds,
  };
});

const useEditorDataStore = defineStore('editor:snippets', () => {
  let initiated = false;

  const state = useEditorState();

  const folders = ref<Record<string, FolderListItem>>({});
  const snippets = ref<Record<string, SnippetListItem>>({});

  const activeSnippet = computed(() => snippets.value[state.activeFileId] ?? null);

  async function addSnippet(payload: SnippetNewPayload) {
    const [snippet] = await createNewSnippets([payload]);
    snippets.value[snippet.id] = snippet;
    state.setActiveFile(snippet.id);
  }

  async function init() {
    if (initiated) return;

    const [snippetList, folderList] = await Promise.all([getAllSnippets(), getAllFolders()]);

    folders.value = Object.fromEntries(folderList.map((folder) => [folder.id, folder]));
    snippets.value = Object.fromEntries(snippetList.map((snippet) => [snippet.id, snippet]));

    initiated = true;
  }

  return { init, snippets, addSnippet, activeSnippet };
});

export const useEditorStore = defineStore('editor', () => {
  let initiated = false;

  const state = useEditorState();
  const data = useEditorDataStore();

  async function init() {
    if (initiated) return;

    await Promise.all([data.init(), state.init()]);

    initiated = true;
  }

  return { data, state, init };
});

import { DocumentSharedSnippet } from '@/interface/document.interface';
import documentService from '@/services/document.service';
import { defineStore } from 'pinia';

const notLoadedError = () => new Error('Snippets store not loaded');

export const useSharedSnippetsStore = defineStore('shared-snippets', () => {
  let loaded = false;

  const snippets = ref<DocumentSharedSnippet[]>([]);

  async function addItem(snippet: DocumentSharedSnippet) {
    await load();

    snippets.value.push(snippet);
    documentService.stores.data.xSet('sharedSnippets', snippets.value);
  }
  async function updateItem(
    id: string,
    payload: Partial<DocumentSharedSnippet>,
  ) {
    if (!loaded) throw notLoadedError();

    const index = snippets.value.findIndex((item) => item.id === id);
    if (index === -1) return;

    snippets.value[index] = {
      ...snippets.value[index],
      ...payload,
    };
    await documentService.stores.data.xSet('sharedSnippets', snippets.value);
  }
  async function removeItem(id: string) {
    if (!loaded) throw notLoadedError();

    const index = snippets.value.findIndex((item) => item.id === id);
    if (index === -1) return;

    snippets.value.splice(index, 1);
    await documentService.stores.data.xSet('sharedSnippets', snippets.value);
  }
  async function load() {
    if (loaded) return;

    snippets.value = await documentService.stores.data.xGet(
      'sharedSnippets',
      [],
    );
    loaded = true;
  }

  return {
    load,
    addItem,
    snippets,
    removeItem,
    updateItem,
  };
});

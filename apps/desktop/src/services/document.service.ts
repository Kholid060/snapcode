import { watch } from '@tauri-apps/plugin-fs';
import { AppDocumentState } from '@/interface/app.interface';
import { appCommand } from './app-command.service';
import LazyStore from '@/lib/LazyStore';
import {
  DocumentStoreBookmarks,
  DocumentStoreMetadata,
  DocumentStoreSettings,
  DocumentStoreState,
} from '@/interface/document.interface';
import { SnippetNewPayload } from '@/interface/snippet.interface';

interface DocumentStores {
  state: LazyStore<DocumentStoreState>;
  settings: LazyStore<DocumentStoreSettings>;
  metadata: LazyStore<DocumentStoreMetadata>;
  bookmarks: LazyStore<DocumentStoreBookmarks>;
}

class DocumentService {
  private appState!: AppDocumentState;

  #stores!: DocumentStores;

  async init() {
    this.appState = await appCommand.invoke('get_document_state', undefined);

    this.#stores = {
      state: new LazyStore(this.appState.metadataDir + '/state.json'),
      settings: new LazyStore(this.appState.metadataDir + '/settings.json'),
      metadata: new LazyStore(this.appState.metadataDir + '/metadata.json'),
      bookmarks: new LazyStore(this.appState.metadataDir + '/bookmarks.json'),
    };
  }

  get stores() {
    return this.#stores;
  }

  async startWatcher() {
    const unwatch = await watch(
      this.appState.snippetsDir,
      (event) => {
        console.log(event);
      },
      { recursive: true },
    );

    window.onbeforeunload = () => {
      unwatch();
    };
  }

  async createSnippets(snippets: SnippetNewPayload[]) {
    return await appCommand.invoke('create_snippets', { snippets });
  }
}

const documentService = new DocumentService();

export default documentService;

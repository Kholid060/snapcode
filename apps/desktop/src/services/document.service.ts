import { AppDocumentState } from '@/interface/app.interface';
import { appCommand } from './app-command.service';
import LazyStore from '@/lib/LazyStore';
import {
  DocumentStoreBookmarks,
  DocumentStoreMetadata,
  DocumentStoreSettings,
  DocumentStoreState,
} from '@/interface/document.interface';
import {
  SnippetMetadata,
  SnippetNewPayload,
} from '@/interface/snippet.interface';
import { FolderNewPayload } from '@/interface/folder.interface';
import { rename } from '@tauri-apps/plugin-fs';
import { joinDocumentPath } from '@/utils/document-utils';

interface DocumentStores {
  state: Readonly<LazyStore<DocumentStoreState>>;
  settings: Readonly<LazyStore<DocumentStoreSettings>>;
  metadata: Readonly<LazyStore<DocumentStoreMetadata>>;
  bookmarks: Readonly<LazyStore<DocumentStoreBookmarks>>;
}

class DocumentService {
  private appState!: AppDocumentState;

  #buffer: string[] = [];
  #stores!: Readonly<DocumentStores>;

  async init() {
    this.appState = await appCommand.invoke('get_document_state', undefined);

    this.#stores = Object.freeze({
      state: new LazyStore(this.appState.metadataDir + '/state.json'),
      settings: new LazyStore(this.appState.metadataDir + '/settings.json'),
      bookmarks: new LazyStore(this.appState.metadataDir + '/bookmarks.json'),
      metadata: new LazyStore<DocumentStoreMetadata>(
        this.appState.metadataDir + '/metadata.json',
      ),
    });
  }

  get stores() {
    return this.#stores;
  }

  async startWatcher() {
    // const unwatch = await watch(
    //   this.appState.snippetsDir,
    //   (event) => {
    //     console.log(event);
    //   },
    //   { recursive: true },
    // );
    // window.onbeforeunload = () => {
    //   unwatch();
    // };
  }

  async createSnippets(snippets: SnippetNewPayload[]) {
    const items = await appCommand.invoke('create_snippets', { snippets });
    items.forEach((item) => {
      this.#buffer.push(item.path);
    });

    return items;
  }

  async createFolders(folders: FolderNewPayload[]) {
    const items = await appCommand.invoke('create_folders', { folders });
    items.forEach((item) => {
      this.#buffer.push(item.path);
    });

    return items;
  }

  async rename(oldPath: string, newPath: string) {
    const path = await appCommand.invoke('rename_document_item', {
      newPath,
      oldPath,
    });
    this.#buffer.push(path);
  }

  async getFlatTree() {
    const [data, metadata] = await Promise.all([
      appCommand.invoke('get_document_flat_tree', undefined),
      this.#stores.metadata.entries<SnippetMetadata>(),
    ]);

    for (const key in metadata) {
      if (Object.hasOwn(data.metadata, key)) {
        data.metadata[key].stored = metadata[key][1];
      }
    }

    return data;
  }
}

const documentService = new DocumentService();

export default documentService;

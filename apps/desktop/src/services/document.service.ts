import { AppDocumentState } from '@/interface/app.interface';
import { appCommand } from './app-command.service';
import LazyStore from '@/lib/LazyStore';
import {
  DocumentOldNewVal,
  DocumentStoreBookmarks,
  DocumentStoreMetadata,
  DocumentStoreSettings,
  DocumentStoreData,
  DocumentSharedSnippet,
} from '@/interface/document.interface';
import {
  SnippetMetadata,
  SnippetNewPayload,
} from '@/interface/snippet.interface';
import { FolderNewPayload } from '@/interface/folder.interface';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { joinDocumentPath } from '@/utils/document-utils';

interface DocumentStores {
  data: Readonly<LazyStore<DocumentStoreData>>;
  settings: Readonly<LazyStore<DocumentStoreSettings>>;
  metadata: Readonly<LazyStore<DocumentStoreMetadata>>;
  bookmarks: Readonly<LazyStore<DocumentStoreBookmarks>>;
}

class DocumentService {
  private appState!: AppDocumentState;

  #stores!: Readonly<DocumentStores>;

  async init() {
    this.appState = await appCommand.invoke('get_document_state', undefined);

    this.#stores = Object.freeze({
      data: new LazyStore(this.appState.metadataDir + '/data.json'),
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

  async createSnippets(snippets: SnippetNewPayload[]) {
    const items = await appCommand.invoke('create_snippets', { snippets });

    return items;
  }

  async createFolders(folders: FolderNewPayload[]) {
    const items = await appCommand.invoke('create_folders', { folders });
    return items;
  }

  async renameItem(oldPath: string, newPath: string) {
    const path = await appCommand.invoke('rename_document_item', {
      newPath,
      oldPath,
    });

    return path;
  }

  async moveItems(paths: DocumentOldNewVal[]) {
    const result = await appCommand.invoke('move_document_items', {
      items: paths,
    });

    return result;
  }

  async getFlatTree() {
    return appCommand.invoke('get_document_flat_tree', undefined);
  }

  async deleteItems(paths: string[], toTrash: boolean) {
    await appCommand.invoke('remove_document_items', { paths, toTrash });
    await this.#stores.metadata.xDelete(paths);
  }

  async moveMetadata({
    data,
    newPath,
    oldPath,
  }: {
    oldPath: string;
    newPath: string;
    data: SnippetMetadata;
  }) {
    await Promise.allSettled([
      this.stores.metadata.delete(oldPath),
      this.stores.metadata.xSet(newPath, data),
    ]);
  }

  async renameMetadata(keys: DocumentOldNewVal[]) {
    await this.#stores.metadata.xRenameRootKeys(keys);
  }

  async setMetadata(path: string, metadata: SnippetMetadata) {
    await this.#stores.metadata.xSet(path, metadata);
  }

  getFileContent(path: string) {
    return appCommand.invoke('get_snippet_content', { path });
  }

  async updateFileContent(path: string, content: string) {
    await writeTextFile(
      joinDocumentPath(this.appState.snippetsDir, path),
      content,
    );
  }

  search(searchTerm: string) {
    return appCommand.invoke('document_search', {
      searchTerm: searchTerm.slice(0, 120),
    });
  }

  duplicateSnippet(path: string) {
    return appCommand.invoke('duplicate_snippet', { path });
  }

  async addSharedSnippets(snippet: DocumentSharedSnippet) {
    const snippets = await this.#stores.data.xGet('sharedSnippets', []);
    snippets.push(snippet);
    await this.#stores.data.xSet('sharedSnippets', snippets);
  }
}

const documentService = new DocumentService();

export default documentService;

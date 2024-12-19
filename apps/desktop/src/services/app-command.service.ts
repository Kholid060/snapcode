import {
  SnippetNewPayload,
  SnippetPlaceholder,
} from '@/interface/snippet.interface';
import { getLogMessage } from '@/utils/helper';
import { invoke } from '@tauri-apps/api/core';
import { logger } from './logger.service';
import { AppDocumentState } from '@/interface/app.interface';
import {
  DocumentCreatedFolder,
  DocumentCreatedSnippet,
  DocumentOldNewVal,
  DocumentFolderEntry,
  DocumentSearchEntry,
  DocumenFlatTreeData,
} from '@/interface/document.interface';
import { FolderNewPayload } from '@/interface/folder.interface';

interface StoreCommands {
  store_delete_bulks: [{ path: string; keys: string[] }, void];
  store_rename_root_keys: [{ path: string; keys: DocumentOldNewVal[] }, void];
}

interface SnippetCommands {
  get_snippet_content: [{ path: string }, string];
  create_snippets: [
    { snippets: Pick<SnippetNewPayload, 'path' | 'contents'>[] },
    DocumentCreatedSnippet[],
  ];
  open_snippet: [{ snippetId: string }, void];
  send_snippet_content: [
    {
      path: string;
      action: 'copy' | 'paste';
      placeholders: SnippetPlaceholder[];
      plaholdersValue: Record<string, string>;
    },
    void,
  ];
  get_snippet_with_placeholder: [{ path: string }, SnippetPlaceholder[]];
  import_snippet_from_file: [{ dirPath: string }, DocumentCreatedSnippet[]];
}

interface FolderCommands {
  create_folders: [{ folders: FolderNewPayload[] }, DocumentCreatedFolder[]];
}

interface DocumentCommands {
  show_item_in_folder: [{ path: string }, void];
  get_document_state: [undefined, AppDocumentState];
  get_document_flat_tree: [undefined, DocumenFlatTreeData];
  get_all_document_folders: [undefined, DocumentFolderEntry[]];
  document_search: [{ searchTerm: string }, DocumentSearchEntry[]];
  remove_document_items: [{ paths: string[]; toTrash: boolean }, void];
  rename_document_item: [{ oldPath: string; newPath: string }, string];
  move_document_items: [{ items: [from: string, to: string][] }, string[]];
}

interface WindowCommands {
  open_popup_window: [undefined, void];
  update_popup_window_tray_menu: [{ shortcut: string }, void];
}

type Commands = StoreCommands &
  WindowCommands &
  FolderCommands &
  SnippetCommands &
  DocumentCommands;

async function invokeCommand<T extends keyof Commands>(
  name: T,
  arg: Commands[T][0],
) {
  try {
    return await invoke<Commands[T][1]>(name, arg);
  } catch (error) {
    logger.error(getLogMessage(`invoke>${name}`, error));
    throw error;
  }
}

export const appCommand = {
  invoke: invokeCommand,
};

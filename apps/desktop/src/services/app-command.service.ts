import {
  SnippetImportFileItem,
  SnippetNewPayload,
  SnippetPlaceholder,
  SnippetWithPlaceholder,
} from '@/interface/snippet.interface';
import { getLogMessage } from '@/utils/helper';
import { invoke } from '@tauri-apps/api/core';
import { logger } from './logger.service';
import { AppDocumentState } from '@/interface/app.interface';
import {
  DocumenFlatTreeData,
  DocumentCreatedFolder,
  DocumentCretedSnippet,
} from '@/interface/document.interface';
import { FolderNewPayload } from '@/interface/folder.interface';

interface SnippetCommands {
  create_snippets: [
    { snippets: Pick<SnippetNewPayload, 'path' | 'contents'>[] },
    DocumentCretedSnippet[],
  ];
  open_snippet: [{ snippetId: string }, void];
  send_snippet_content: [
    {
      content: string;
      action: 'copy' | 'paste';
      placeholders: SnippetPlaceholder[];
      plaholdersValue: Record<string, string>;
    },
    void,
  ];
  import_snippet_from_file: [undefined, SnippetImportFileItem[]];
  get_snippet_with_placeholder: [{ snippetId: string }, SnippetWithPlaceholder];
}

interface FolderCommands {
  create_folders: [{ folders: FolderNewPayload[] }, DocumentCreatedFolder[]];
}

interface DocumentCommands {
  get_document_state: [undefined, AppDocumentState];
  get_document_flat_tree: [undefined, DocumenFlatTreeData];
  rename_document_item: [{ oldPath: string; newPath: string }, string];
  move_document_items: [{ items: [from: string, to: string][] }, string[]];
}

interface WindowCommands {
  open_popup_window: [undefined, void];
  update_popup_window_tray_menu: [{ shortcut: string }, void];
}

type Commands = SnippetCommands &
  DocumentCommands &
  WindowCommands &
  FolderCommands;

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

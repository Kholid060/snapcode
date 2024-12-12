import {
  SnippetImportFileItem,
  SnippetPlaceholder,
  SnippetWithPlaceholder,
} from '@/interface/snippet.interface';
import { getLogMessage } from '@/utils/helper';
import { invoke } from '@tauri-apps/api/core';
import { logger } from './logger.service';

interface CommandMap {
  open_snippet: [{ snippetId: string }, void];
  open_popup_window: [undefined, void];
  send_snippet_content: [
    {
      content: string;
      action: 'copy' | 'paste';
      placeholders: SnippetPlaceholder[];
      plaholdersValue: Record<string, string>;
    },
    void,
  ];
  update_popup_window_tray_menu: [{ shortcut: string }, void];
  import_snippet_from_file: [undefined, SnippetImportFileItem[]];
  get_snippet_with_placeholder: [{ snippetId: string }, SnippetWithPlaceholder];
}

async function invokeCommand<T extends keyof CommandMap>(
  name: T,
  arg: CommandMap[T][0],
) {
  try {
    return await invoke<CommandMap[T][1]>(name, arg);
  } catch (error) {
    logger.error(getLogMessage(`invoke>${name}`, error));
    throw error;
  }
}

export const appCommand = {
  invoke: invokeCommand,
};

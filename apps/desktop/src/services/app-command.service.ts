import {
  SnippetImportFileItem,
  SnippetWithPlaceholder,
} from '@/interface/snippet.interface';
import { invoke } from '@tauri-apps/api/core';

interface CommandMap {
  open_popup_window: [undefined, void];
  import_snippet_from_file: [undefined, SnippetImportFileItem[]];
  get_snippet_with_placeholder: [{ snippetId: string }, SnippetWithPlaceholder];
}

function invokeCommand<T extends keyof CommandMap>(
  name: T,
  arg: CommandMap[T][0],
) {
  return invoke<CommandMap[T][1]>(name, arg);
}

export const appCommand = {
  invoke: invokeCommand,
};

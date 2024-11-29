import { SnippetImportFileItem } from '@/interface/snippet.interface';
import { invoke } from '@tauri-apps/api/core';

class SnippetCommands {
  static importSnippetFromFiles() {
    return invoke<SnippetImportFileItem[]>('import_snippet_from_file');
  }
}

export default SnippetCommands;

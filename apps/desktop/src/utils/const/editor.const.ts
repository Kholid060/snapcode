import { DocumentSharedSnippet } from '@/interface/document.interface';
import { EditorSettings } from '@/interface/editor.interface';

export const FOLDER_TREE_ITEM_PREFIX = '__$:';

export const EDITOR_DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  indentSize: 4,
  customFont: '',
  fontLigatures: true,
  showLineNumbers: true,
  fontFamily: 'jetbrains-mono',
};

export const SHARED_SNIPPET_PROVDER_LABEL: Record<
  DocumentSharedSnippet['type'],
  string
> = {
  'github-gist': 'GitHub Gist',
};

import { EditorView, EditorViewConfig } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { languages } from '@codemirror/language-data';
import { themeExtension } from './extensions';

export function getLanguageByExt(ext: string) {
  const language = languages.find((lang) => lang.extensions.includes(ext));
  if (!language) return null;

  return language;
}

export function loadCodemirror(config: EditorViewConfig = {}) {
  return new EditorView({
    ...config,
    extensions: [basicSetup, themeExtension, config.extensions ?? []],
  });
}

export { languages };

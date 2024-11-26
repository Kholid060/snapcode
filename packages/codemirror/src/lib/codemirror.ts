
import { EditorView, EditorViewConfig } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { languages } from '@codemirror/language-data';
import { themeExtension } from './cm-extensions';

export function loadLanguageByExt(ext: string) {
  const language = languages.find((lang) => lang.extensions.includes(ext));
  if (!language) return null;

  return language.load();
}

export function loadCodemirror(config: EditorViewConfig = {}) {
  return new EditorView({
    ...config,
    extensions: [
      basicSetup,
      themeExtension,
      config.extensions ?? []
    ],
  }); 
}
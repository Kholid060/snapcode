import { EditorView, EditorViewConfig, keymap } from '@codemirror/view';
import { basicSetup, minimalSetup } from 'codemirror';
import { vscodeKeymap } from '@replit/codemirror-vscode-keymap';
import { languages } from '@codemirror/language-data';
import { EditorState, EditorStateConfig, Extension } from '@codemirror/state';
import { themeExtension } from './theme';
import { syntaxHighlighting } from '@codemirror/language';
import { classHighlighter } from '@lezer/highlight';

export function getLanguageByExt(ext: string) {
  const language = languages.find((lang) => lang.extensions.includes(ext));
  if (!language) return null;

  return language;
}

export function getLanguageByName(name: string) {
  return languages.find((lang) => lang.name === name);
}

export class CMEditorView extends EditorView {
  private extensions?: Extension;

  constructor(config?: EditorViewConfig) {
    super(config);
    this.extensions = config?.extensions;
  }

  replaceContent(config: EditorStateConfig = {}) {
    this.setState(
      EditorState.create({
        ...config,
        extensions: [this.extensions ?? [], config.extensions ?? []],
      }),
    );
  }
}

export function loadCodemirror(config: EditorViewConfig = {}) {
  return new CMEditorView({
    ...config,
    extensions: [
      basicSetup,
      themeExtension,
      // syntaxHighlighting(classHighlighter),
      keymap.of(vscodeKeymap),
      config.extensions ?? [],
    ],
  });
}

export function loadCodemirrorMinimal(config: EditorViewConfig = {}) {
  return new CMEditorView({
    ...config,
    extensions: [
      minimalSetup,
      themeExtension,
      keymap.of(vscodeKeymap),
      config.extensions ?? [],
    ],
  });
}

export { languages };

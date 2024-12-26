import {
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  lineNumbers,
  highlightActiveLineGutter,
} from '@codemirror/view';
import { Extension, EditorState } from '@codemirror/state';
import {
  defaultHighlightStyle,
  syntaxHighlighting,
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap,
} from '@codemirror/language';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
} from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';

export interface BasicExtensionsOptions {
  history: boolean;
  foldGutter: boolean;
  dropCursor: boolean;
  lineNumbers: boolean;
  drawSelection: boolean;
  indentOnInput: boolean;
  closeBrackets: boolean;
  autocompletion: boolean;
  bracketMatching: boolean;
  crosshairCursor: boolean;
  syntaxHighlighting: boolean;
  highlightActiveLine: boolean;
  rectangularSelection: boolean;
  highlightSpecialChars: boolean;
  allowMultipleSelections: boolean;
  highlightActiveLineGutter: boolean;
  highlightSelectionMatches: boolean;
}

const defaultOptions: BasicExtensionsOptions = {
  history: true,
  foldGutter: true,
  dropCursor: true,
  lineNumbers: true,
  drawSelection: true,
  indentOnInput: true,
  closeBrackets: true,
  autocompletion: true,
  bracketMatching: true,
  crosshairCursor: true,
  syntaxHighlighting: true,
  highlightActiveLine: true,
  rectangularSelection: true,
  highlightSpecialChars: true,
  allowMultipleSelections: true,
  highlightActiveLineGutter: true,
  highlightSelectionMatches: true,
};

export const basicExtensions = (
  options?: Partial<BasicExtensionsOptions>,
  extensions: Extension[] = [],
) => {
  const opts = { ...defaultOptions, ...(options ?? {}) };
  return [
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      ...lintKeymap,
    ]),
    ...extensions,
    opts.lineNumbers ? lineNumbers() : [],
    opts.highlightActiveLineGutter ? highlightActiveLineGutter() : [],
    opts.highlightSpecialChars ? highlightSpecialChars() : [],
    opts.history ? history() : [],
    opts.foldGutter ? foldGutter() : [],
    opts.drawSelection ? drawSelection() : [],
    opts.dropCursor ? dropCursor() : [],
    opts.allowMultipleSelections
      ? EditorState.allowMultipleSelections.of(true)
      : [],
    opts.indentOnInput ? indentOnInput() : [],
    opts.syntaxHighlighting
      ? syntaxHighlighting(defaultHighlightStyle, { fallback: true })
      : [],
    opts.bracketMatching ? bracketMatching() : [],
    opts.closeBrackets ? closeBrackets() : [],
    opts.autocompletion ? autocompletion() : [],
    opts.rectangularSelection ? rectangularSelection() : [],
    opts.crosshairCursor ? crosshairCursor() : [],
    opts.highlightActiveLine ? highlightActiveLine() : [],
    opts.highlightSelectionMatches ? highlightSelectionMatches() : [],
  ];
};

export const minimalExtension: Extension = (() => [
  highlightSpecialChars(),
  history(),
  drawSelection(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  keymap.of([...defaultKeymap, ...historyKeymap]),
])();

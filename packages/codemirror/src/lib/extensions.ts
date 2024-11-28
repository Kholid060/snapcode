import { EditorView } from 'codemirror';
import { indentWithTab } from '@codemirror/commands';
import { tokyoNightInit } from '@uiw/codemirror-theme-tokyo-night';
import {
  Decoration,
  DecorationSet,
  keymap,
  MatchDecorator,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';

export const themeExtension = tokyoNightInit({
  settings: {
    background: 'transparent',
    gutterBackground: 'transparent',
    selection: 'hsl(var(--lime-4))',
    lineHighlight: 'hsl(var(--accent) / 0.45)',
  },
});

export const onUpdateExtension = (cb: (update: ViewUpdate) => void) =>
  EditorView.updateListener.of(cb);

export function snippetPlaceholder() {
  const decoration = Decoration.mark({
    class: 'cm-snippet-placeholders',
  });
  const decorator = new MatchDecorator({
    regexp: /\[\[(\w+)\]\]/g,
    decoration: () => decoration,
  });
  const highlighterExt = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = decorator.createDeco(view);
      }

      update(update: ViewUpdate) {
        if (
          update.docChanged ||
          update.heightChanged ||
          update.viewportChanged
        ) {
          this.decorations = decorator.updateDeco(update, this.decorations);
        }
      }
    },
    {
      decorations: (value) => value.decorations,
    },
  );

  return [highlighterExt];
}

export const indentWithTabExtension = keymap.of([indentWithTab]);

import { EditorView } from 'codemirror';
import { indentWithTab } from '@codemirror/commands';
import {
  Decoration,
  DecorationSet,
  keymap,
  MatchDecorator,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';

export const PLACEHOLDER_REGEX = /\[\[(\w+)\]\]/g;

export const onUpdateExtension = (cb: (update: ViewUpdate) => void) =>
  EditorView.updateListener.of(cb);

export interface CMPlaceholderOptions {
  blockDecoration?:
    | Decoration
    | ((
        match: RegExpExecArray,
        view: EditorView,
        pos: number,
      ) => Decoration | null);
}
export function snippetPlaceholder({
  blockDecoration,
}: CMPlaceholderOptions = {}) {
  const decorator = new MatchDecorator({
    regexp: PLACEHOLDER_REGEX,
    decoration:
      blockDecoration ||
      ((match) =>
        Decoration.mark({
          value: match[1],
          class: 'cm-snippet-placeholders',
        })),
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
          console.log(this.decorations);
        }
      }
    },
    {
      decorations: (value) => value.decorations,
      provide: blockDecoration
        ? (plugin) =>
            EditorView.atomicRanges.of((view) => {
              return view.plugin(plugin)?.decorations || Decoration.none;
            })
        : undefined,
    },
  );

  return [highlighterExt];
}

export const indentWithTabExtension = keymap.of([indentWithTab]);

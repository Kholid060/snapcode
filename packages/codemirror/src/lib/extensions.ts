import { EditorView } from 'codemirror';
import { tokyoNightInit } from '@uiw/codemirror-theme-tokyo-night';
import {
  Decoration,
  DecorationSet,
  MatchDecorator,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
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

class PlaceholderWidget extends WidgetType {
  constructor(private value: string) {
    super();
  }

  toDOM(): HTMLElement {
    const span = document.createElement('span');

    span.textContent = this.value;
    span.className = 'bg-red-400 rounded text-white px-1 py-0.5';

    return span;
  }

  updateDOM(): boolean {
    return true;
  }
}

export function snippetPlaceholder({
  matcherRegex,
}: { matcherRegex?: RegExp } = {}) {
  const placeholderMatcher = new MatchDecorator({
    regexp: matcherRegex ?? /\[\[(\w+)\]\]/g,
    decoration: (match) =>
      Decoration.replace({
        widget: new PlaceholderWidget(match[1]),
      }),
  });
  const placeholders = ViewPlugin.fromClass(
    class {
      placeholders: DecorationSet;

      constructor(view: EditorView) {
        this.placeholders = placeholderMatcher.createDeco(view);
      }

      update(update: ViewUpdate) {
        this.placeholders = placeholderMatcher.updateDeco(
          update,
          this.placeholders,
        );
      }
    },
    {
      decorations: (instance) => instance.placeholders,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => {
          return view.plugin(plugin)?.placeholders || Decoration.none;
        }),
    },
  );

  return placeholders;
}

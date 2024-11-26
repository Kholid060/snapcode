import { EditorView } from 'codemirror';
import { tokyoNightInit } from '@uiw/codemirror-theme-tokyo-night';
import { ViewUpdate } from '@codemirror/view';

export const themeExtension = tokyoNightInit({
  settings: {
    background: 'transparent',
    gutterBackground: 'transparent',
    selection: 'hsl(var(--lime-4))',
    lineHighlight: 'hsl(var(--accent) / 0.45)',
  },
});

export const onUpdateExtension = (cb: (update: ViewUpdate) => void) => EditorView.updateListener.of(cb);

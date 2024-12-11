import { tags as t } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import { TagStyle } from '@codemirror/language';

// https://github.com/ayu-theme/ayu-colors
const ayuColors = {
  'syntax.tag': '#39BAE6',
  'syntax.func': '#FFB454',
  'syntax.entity': '#59C2FF',
  'syntax.string': '#AAD94C',
  'syntax.regexp': '#95E6CB',
  'syntax.markup': '#F07178',
  'syntax.keyword': '#FF8F40',
  'syntax.special': '#E6B673',
  'syntax.comment': '#ACB6BF8C',
  'syntax.constant': '#D2A6FF',
  'syntax.operator': '#F29668',
  'vcs.added': '#7FD962',
  'vcs.modified': '#73B8FF',
  'vcs.removed': '#F26D78',
  'editor.fg': '#BFBDB6',
  'editor.bg': '#0D1017',
  'editor.line': '#131721',
  'editor.selection.active': '#409FFF4D',
  'editor.selection.inactive': '#409FFF21',
  'editor.findMatch.active': '#6C5980',
  'editor.findMatch.inactive': '#6C598066',
  'editor.gutter.active': '#6C7380E6',
  'editor.gutter.normal': '#6C738099',
  'editor.indentGuide.active': '#6C738080',
  'editor.indentGuide.normal': '#6C738033',
  'ui.fg': '#565B66',
  'ui.bg': '#0B0E14',
  'ui.line': '#11151C',
  'ui.selection.active': '#47526640',
  'ui.selection.normal': '#47526633',
  'ui.panel.bg': '#0F131A',
  'ui.panel.shadow': '#00000080',
  'common.accent': '#E6B450',
  'common.error': '#D95757',
};

function varColor(name: string, alpha?: number) {
  return `hsl(var(--${name}) ${typeof alpha === 'number' ? `/ ${alpha}` : ''})`;
}

export const themeStyles: TagStyle[] = [
  { tag: t.meta, color: ayuColors['syntax.comment'] },
  { tag: t.heading, color: ayuColors['syntax.string'] },
  { tag: t.link, color: ayuColors['syntax.tag'] },
  { tag: t.monospace, color: ayuColors['syntax.special'] },
  {
    tag: [t.strong, t.strikethrough, t.emphasis],
    color: ayuColors['syntax.markup'],
  },
  { tag: t.list, color: ayuColors['syntax.func'] },
  { tag: t.quote, color: ayuColors['syntax.regexp'] },
  { tag: t.comment, color: ayuColors['syntax.comment'] },
  { tag: t.definition(t.variableName), color: ayuColors['syntax.special'] },
  { tag: [t.string, t.special(t.brace)], color: ayuColors['syntax.special'] },
  { tag: t.string, color: ayuColors['syntax.string'] },
  { tag: t.number, color: ayuColors['syntax.constant'] },
  { tag: t.bool, color: ayuColors['syntax.constant'] },
  { tag: t.null, color: ayuColors['syntax.constant'] },
  { tag: t.keyword, color: ayuColors['syntax.keyword'] },
  { tag: t.operator, color: ayuColors['syntax.operator'] },
  { tag: t.className, color: ayuColors['syntax.entity'] },
  { tag: t.local(t.propertyName), color: ayuColors['syntax.func'] },
  { tag: t.function(t.propertyName), color: ayuColors['syntax.func'] },
  { tag: t.definition(t.typeName), color: ayuColors['syntax.tag'] },
  { tag: t.typeName, color: ayuColors['syntax.tag'] },
  { tag: t.angleBracket, color: '#39bae680' },
  { tag: t.tagName, color: ayuColors['syntax.entity'] },
  { tag: t.attributeName, color: ayuColors['syntax.func'] },
  { tag: t.regexp, color: ayuColors['syntax.regexp'] },
  { tag: t.self, color: ayuColors['syntax.entity'] },
  { tag: [t.special(t.variableName)], color: ayuColors['syntax.special'] },
];

export const themeExtension = createTheme({
  theme: 'dark',
  settings: {
    background: 'inherit',
    backgroundImage: '',
    foreground: varColor('muted-foreground'),
    caret: varColor('primary'),
    selection: varColor('primary', 0.2),
    selectionMatch: varColor('primary', 0.25),
    lineHighlight: '#8a91991a',
    gutterBorder: 'none',
    gutterBackground: 'inherit',
    gutterForeground: 'inherit',
  },
  styles: themeStyles,
});

import { findModeByMIME } from './codemirrorLanguages';

const languages = {
  'c++': {
    name: 'C++',
    mode: 'text/x-c++src',
    ext: 'cpp',
  },
  'c#': {
    name: 'C#',
    mode: 'text/x-csharp',
    ext: 'cs',
  },
  c: {
    name: 'C',
    mode: 'text/x-csrc',
    ext: '',
  },
  css: {
    name: 'CSS',
    mode: 'text/css',
    ext: 'c',
  },
  html: {
    name: 'HTML',
    mode: 'text/html',
    ext: 'html',
  },
  java: {
    name: 'Java',
    mode: 'text/x-java',
    ext: 'java',
  },
  javascript: {
    name: 'Javascript',
    mode: 'text/javascript',
    ext: 'js',
  },
  jsx: {
    name: 'Javascript (JSX)',
    mode: 'text/jsx',
    ext: 'jsx',
  },
  json: {
    name: 'JSON',
    mode: 'application/json',
    ext: 'json',
  },
  kotlin: {
    name: 'Kotlin',
    mode: 'text/x-kotlin',
    ext: 'kt',
  },
  less: {
    name: 'Less',
    mode: 'text/x-less',
    ext: 'less',
  },
  python: {
    name: 'Python',
    mode: 'text/x-python',
    ext: 'py',
  },
  scss: {
    name: 'SCSS',
    mode: 'text/x-scss',
    ext: 'scss',
  },
  typescript: {
    name: 'Typescript',
    mode: 'application/typescript',
    ext: 'ts',
  },
  tsx: {
    name: 'Typescript (TSX)',
    mode: 'text/typescript-jsx',
    ext: 'tsx',
  },
  vue: {
    name: 'Vue',
    mode: 'text/x-vue',
    ext: 'vue',
  },
};

export function getLangInfo(lang, field = 'mode') {
  let langMime = lang;

  if (languages[lang]) langMime = languages[lang].mode;

  const info = findModeByMIME(langMime || '');

  if (!info) return '';

  return info[field];
}

export default languages;

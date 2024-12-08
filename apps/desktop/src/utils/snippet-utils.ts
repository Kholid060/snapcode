import sanitizeHtml from 'sanitize-html';
import { extname } from '@tauri-apps/api/path';
import { languages } from '@snippy/codemirror';
import { catchAsyncFn } from './helper';

export async function getSnippetLangFromName(snippetName: string) {
  const ext = await catchAsyncFn(() => extname(snippetName), null);
  const language = languages.find(
    (lang) =>
      (ext && lang.extensions?.includes(ext)) ||
      (lang.filename && lang.filename.test(snippetName)),
  );

  return language ?? null;
}

export function sanitizeSnippetHTML(str: string) {
  return sanitizeHtml(str, {
    allowedTags: ['span'],
    allowedAttributes: { span: ['search-result'] },
  });
}

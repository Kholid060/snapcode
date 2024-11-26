import { extname } from '@tauri-apps/api/path';
import { catchAsyncFn } from './helper';

export async function getSnippetExtFromName(snippetName: string) {
  const ext = await catchAsyncFn(() => extname(snippetName), null);
  const name = ext ? snippetName.slice(0, -(ext.length + 1)) : snippetName;

  return {
    name,
    ext: ext || 'txt',
  };
}

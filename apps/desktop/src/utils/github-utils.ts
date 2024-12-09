import { GitHubGistFile } from '@/interface/github.interface';
import { SnippetNewPayload } from '@/interface/snippet.interface';
import { fetch } from '@tauri-apps/plugin-http';
import { FetchError } from './errors';

export const GITHUB_GISTS_BASE_URL = 'https://gist.github.com/';

export function extractGistsIdFromURL(url: string) {
  if (!url.startsWith(GITHUB_GISTS_BASE_URL)) return null;

  const { 1: gistId } = url.slice(GITHUB_GISTS_BASE_URL.length).split('/');
  return gistId ?? null;
}

export async function githubGistFileToSnippet(
  file: GitHubGistFile,
  folderId?: string | null,
): Promise<SnippetNewPayload> {
  const data: SnippetNewPayload = {
    folderId,
    name: file.filename,
    lang: file.language,
    content: file.content,
  };
  if (!file.content) {
    const response = await fetch(file.raw_url);
    if (!response.ok) {
      throw new FetchError({
        data: null,
        status: response.status,
        message: response.statusText,
        statusText: response.statusText,
      });
    }

    data.content = await response.text();
  }

  return data;
}

export function githubGistFilesToSnippet(
  files: GitHubGistFile[],
  folderId?: string | null,
) {
  return Promise.all(
    files.map((file) => githubGistFileToSnippet(file, folderId)),
  );
}

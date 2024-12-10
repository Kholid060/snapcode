import {
  GitHubApiPagination,
  GitHubGistFile,
  GitHubGistListItem,
  GitHubLinkHeaderRel,
} from '@/interface/github.interface';
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

export function githubLinkHeaderParser(header: string) {
  const pagination: GitHubApiPagination = {};
  for (const str of header.split(',')) {
    const [rawUrl, rawRel] = str.split(';');
    const url = rawUrl.trim().slice(1, -1);
    const rel = rawRel.trim().slice(5, -1) as GitHubLinkHeaderRel;

    pagination[rel] = url;
  }

  return pagination;
}

export function getGitHubGistName(gist: GitHubGistListItem) {
  return gist.description || Object.keys(gist.files)[0] || '(unnamed gist)';
}

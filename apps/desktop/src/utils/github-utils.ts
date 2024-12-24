import {
  GitHubApiPagination,
  GitHubGistFile,
  GitHubGistListItem,
  GitHubLinkHeaderRel,
} from '@/interface/github.interface';
import {
  SnippetNewPayload,
  SnippetNewPayloadMetadata,
} from '@/interface/snippet.interface';
import { FetchError } from './errors';
import { joinDocumentPath } from './document-utils';

export const GITHUB_GISTS_BASE_URL = 'https://gist.github.com/';

export function extractGistsIdFromURL(url: string) {
  if (!url.startsWith(GITHUB_GISTS_BASE_URL)) return null;

  const paths = url.slice(GITHUB_GISTS_BASE_URL.length).split('/');
  return paths[1] ?? paths[0] ?? null;
}

export async function githubGistFileToSnippet({
  file,
  metadata,
  folderPath,
}: {
  file: GitHubGistFile;
  folderPath?: string | null;
  metadata?: SnippetNewPayloadMetadata;
}): Promise<SnippetNewPayload> {
  const data: SnippetNewPayload = {
    metadata,
    stored: {
      lang: file.language,
    },
    contents: file.content ?? '',
    path: joinDocumentPath(folderPath, file.filename),
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

    data.contents = await response.text();
  }

  return data;
}

export function githubGistFilesToSnippet({
  files,
  metadata,
  folderPath,
}: {
  files: GitHubGistFile[];
  folderPath?: string | null;
  metadata?: SnippetNewPayloadMetadata;
}) {
  return Promise.all(
    files.map((file) =>
      githubGistFileToSnippet({ file, metadata, folderPath }),
    ),
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

export function getGitHubGistUrl(gistId: string) {
  return `${GITHUB_GISTS_BASE_URL}${gistId}`;
}

import appVault from './app-vault.service';
import { FetchError } from '@/utils/errors';
import {
  GitHubCreateGistPayload,
  GitHubGistListItem,
  GitHubUpdateGistPayload,
} from '@/interface/github.interface';
import { githubLinkHeaderParser } from '@/utils/github-utils';

type FetchInit = RequestInit & {
  auth?: boolean;
  responseType?: 'json' | 'text';
};

const GITHUB_API_BASE_URL = 'https://api.github.com';

async function fetchGitHubApi<T = unknown>(
  path: string,
  init: FetchInit = { auth: true, responseType: 'json' },
) {
  const fetchInit: FetchInit = { auth: true, responseType: 'json', ...init };
  fetchInit.headers = new Headers(fetchInit.headers);
  fetchInit.headers.set('Accept', 'application/vnd.github+json');

  if (init.auth) {
    const githubKey = await appVault.get('github-key');

    if (githubKey) {
      fetchInit.headers.set('Authorization', `Bearer ${githubKey ?? ''}`);
    }
  }

  const response = await fetch(`${GITHUB_API_BASE_URL}${path}`, fetchInit);
  let result: T;

  switch (fetchInit.responseType) {
    case 'json':
      result = await response.json();
      break;
    case 'text':
      result = (await response.text()) as T;
      break;
    default:
      throw new Error('Invalid response type');
  }

  if (!response.ok) {
    throw new FetchError({
      data: result,
      status: response.status,
      statusText: response.statusText,
      // @ts-expect-error aaaa
      message: result?.message ?? response.statusText,
    });
  }

  return { data: result, headers: response.headers };
}

export async function listGitHubGistsByUsername(
  username: string,
  params: Record<string, string> | URLSearchParams = {},
) {
  const searchParams = new URLSearchParams(params);
  const { data, headers } = await fetchGitHubApi<GitHubGistListItem[]>(
    `/users/${username}/gists?${searchParams.toString()}`,
  );

  return {
    data: data,
    ratelimitRemaining: headers.get('x-ratelimit-remaining'),
    pagination: headers.has('link')
      ? githubLinkHeaderParser(headers.get('link')!)
      : null,
  };
}

export async function getGitHubGistsById(id: string) {
  const result = await fetchGitHubApi<GitHubGistListItem>(`/gists/${id}`);

  return {
    data: result.data,
    ratelimitRemaining: result.headers.get('x-ratelimit-remaining'),
  };
}

export async function createGitHubGist(payload: GitHubCreateGistPayload) {
  const result = await fetchGitHubApi<GitHubGistListItem>('/gists', {
    auth: true,
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return {
    data: result.data,
    ratelimitRemaining: result.headers.get('x-ratelimit-remaining'),
  };
}

export async function updateGitHubGist(
  gistId: string,
  payload: GitHubUpdateGistPayload,
) {
  const result = await fetchGitHubApi<GitHubGistListItem>(`/gists/${gistId}`, {
    auth: true,
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return {
    data: result.data,
    ratelimitRemaining: result.headers.get('x-ratelimit-remaining'),
  };
}

export async function deleteGitHubGist(gistId: string) {
  const result = await fetchGitHubApi(`/gists/${gistId}`, {
    auth: true,
    method: 'DELETE',
    responseType: 'text',
  });

  return {
    data: result.data,
    ratelimitRemaining: result.headers.get('x-ratelimit-remaining'),
  };
}

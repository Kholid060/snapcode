import { ClientOptions, fetch } from '@tauri-apps/plugin-http';
import appVault from './app-vault.service';
import { FetchError } from '@/utils/errors';
import { GitHubGistListItem } from '@/interface/github.interface';

type FetchInit = RequestInit &
  ClientOptions & {
    auth?: boolean;
  };

const GITHUB_API_BASE_URL = 'https://api.github.com';

async function fetchGitHubApi<T = unknown>(
  path: string,
  init: FetchInit = { auth: true },
) {
  const fetchInit = init;
  fetchInit.headers = new Headers(fetchInit.headers);
  fetchInit.headers.set('Accept', 'application/vnd.github+json');

  if (init.auth) {
    const githubKey = await appVault.get('github-key');

    if (githubKey) {
      fetchInit.headers.set('Authorization', `Bearer ${githubKey ?? ''}`);
    }
  }

  const response = await fetch(`${GITHUB_API_BASE_URL}${path}`, fetchInit);
  const result = (await response.json()) as T;

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

export async function listGitHubGistsByUsername(username: string) {
  const result = await fetchGitHubApi<GitHubGistListItem[]>(
    `users/${username}/gists`,
    {
      auth: true,
    },
  );

  return {
    data: result.data,
    ratelimitRemaining: result.headers.get('x-ratelimit-remaining'),
  };
}

export async function getGitHubGistsById(id: string) {
  const result = await fetchGitHubApi<GitHubGistListItem>(`/gists/${id}`, {
    auth: true,
  });

  return {
    data: result.data,
    ratelimitRemaining: result.headers.get('x-ratelimit-remaining'),
  };
}

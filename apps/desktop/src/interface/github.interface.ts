export interface GitHubGistFile {
  type: string;
  size: number;
  raw_url: string;
  content?: string;
  language: string;
  filename: string;
}

export interface GitHubGistListItem {
  id: string;
  url: string;
  public: boolean;
  created_at: string;
  updated_at: string;
  description: string | null;
  files: Record<string, GitHubGistFile>;
}

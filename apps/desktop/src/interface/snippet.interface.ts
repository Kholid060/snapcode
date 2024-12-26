export interface SnippetPlaceholder {
  end: number;
  name: string;
  start: number;
}
export interface SnippetNewPayloadMetadata {
  parentId: string;
}
export interface SnippetNewPayload {
  path: string;
  contents: string;
  stored?: SnippetMetadata;
  metadata?: SnippetNewPayloadMetadata;
}
export interface SnippetImportFileItem {
  ext: string;
  name: string;
  content: string;
}

export interface SnippetSearchListItem {
  id: string;
  name: string;
  content?: string;
}

export interface SnippetMetadata {
  lang: string;
}

export interface SnippetWithPlaceholder {
  name: string;
  path: string;
  placeholders: SnippetPlaceholder[];
}

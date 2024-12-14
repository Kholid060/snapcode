import { NewSnippet, SelectSnippet } from '@/db/schema';

export interface SnippetPlaceholder {
  end: number;
  name: string;
  start: number;
}

export type SnippetListItem = Omit<
  SelectSnippet,
  'content' | 'placeholders' | '_id' | 'checkPlaceholder'
>;

export interface SnippetNewPayload {
  path: string;
  contents: string;
  stored?: SnippetMetadata;
}

export type SnippetUpdatePayload = Partial<
  Omit<NewSnippet, 'id' | 'createdAt' | 'updatedAt' | 'placeholderCheckAt'>
>;

export interface SnippetImportFileItem {
  ext: string;
  name: string;
  content: string;
}

export type SnippetId = SelectSnippet['id'];

export interface SnippetSearchListItem {
  id: string;
  name: string;
  content?: string;
}

export type SnippetWithPlaceholder = Pick<
  SelectSnippet,
  'content' | 'placeholders' | 'lang' | 'name' | 'id'
>;

export interface SnippetMetadata {
  lang: string;
}

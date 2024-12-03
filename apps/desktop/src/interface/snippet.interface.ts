import { NewSnippet, SelectSnippet } from '@/db/schema';

export interface SnippetPlaceholder {
  name: string;
  defValue: string;
}

export type SnippetListItem = Omit<
  SelectSnippet,
  'content' | 'placeholders' | '_id'
>;

export type SnippetNewPayload = Omit<NewSnippet, 'id' | '_id'>;

export type SnippetUpdatePayload = Partial<
  Omit<NewSnippet, 'id' | 'createdAt' | 'updatedAt'>
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

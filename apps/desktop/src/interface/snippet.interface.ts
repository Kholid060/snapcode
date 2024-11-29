import { NewSnippet, SelectSnippet } from '@/db/schema';

export interface SnippetPlaceholder {
  name: string;
  defValue: string;
}

export type SnippetListItem = Omit<SelectSnippet, 'content' | 'placeholders'>;

export type SnippetNewPayload = Omit<NewSnippet, 'id'>;

export type SnippetUpdatePayload = Partial<
  Omit<NewSnippet, 'id' | 'createdAt' | 'updatedAt'>
>;

export interface SnippetImportFileItem {
  ext: string;
  name: string;
  content: string;
}

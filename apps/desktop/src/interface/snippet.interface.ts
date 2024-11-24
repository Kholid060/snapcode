import { NewSnippet, SelectSnippet } from '@/db/schema';

export interface SnippetPlaceholder {
  name: string;
  defValue: string;
}

export type SnippetListItem = Omit<SelectSnippet, 'content' | 'placeholders' | 'updatedAt'>;

export type SnippetNewPayload = Omit<NewSnippet, 'id'>;

import { SnippetListItem, SnippetNewPayload } from '@/interface/snippet.interface';
import { db } from '../db';
import { snippetsTable } from '../schema';

export async function createNewSnippets(snippets: SnippetNewPayload[]) {
  return await db.insert(snippetsTable).values(snippets).returning();
}

export async function getAllSnippets(): Promise<SnippetListItem[]> {
  return db.query.snippetsTable.findMany({
    columns: {
      id: true,
      ext: true,
      tags: true,
      name: true,
      folderId: true,
      createdAt: true,
    },
  });
}

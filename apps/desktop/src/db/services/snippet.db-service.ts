import {
  SnippetListItem,
  SnippetNewPayload,
  SnippetUpdatePayload,
} from '@/interface/snippet.interface';
import { db } from '../db';
import { snippetsTable } from '../schema';
import { eq, inArray } from 'drizzle-orm';

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
      keyword: true,
      folderId: true,
      updatedAt: true,
      createdAt: true,
    },
    orderBy(fields, operators) {
      return operators.sql`${fields.name} COLLATE NOCASE ASC`;
    },
  });
}

export async function deleteSnippets(ids: string | string[]) {
  await db
    .delete(snippetsTable)
    .where(
      Array.isArray(ids)
        ? inArray(snippetsTable.id, ids)
        : eq(snippetsTable.id, ids),
    );
}

export async function updateSnippet(
  snippetId: string,
  { content, ext, folderId, name, placeholders, tags }: SnippetUpdatePayload,
) {
  const [snippet] = await db
    .update(snippetsTable)
    .set({ content, ext, folderId, name, placeholders, tags })
    .where(eq(snippetsTable.id, snippetId))
    .returning();

  return snippet;
}

export function getSnippetContent(snippetId: string) {
  return db.query.snippetsTable
    .findFirst({
      columns: {
        content: true,
      },
      where(fields, operators) {
        return operators.eq(fields.id, snippetId);
      },
    })
    .execute();
}

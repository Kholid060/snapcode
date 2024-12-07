import {
  SnippetId,
  SnippetListItem,
  SnippetNewPayload,
  SnippetSearchListItem,
  SnippetUpdatePayload,
} from '@/interface/snippet.interface';
import { db } from '../db';
import { NewSnippet, snippetsTable, snippetsVTable } from '../schema';
import { and, AnyColumn, eq, inArray, sql } from 'drizzle-orm';
import { DB_VIRTUAL_TABLE_NAME } from '@/utils/const/db.const';

export async function createNewSnippets(snippets: SnippetNewPayload[]) {
  return await db.insert(snippetsTable).values(snippets).returning();
}

export async function getAllSnippets(): Promise<SnippetListItem[]> {
  return db.query.snippetsTable.findMany({
    columns: {
      id: true,
      tags: true,
      name: true,
      lang: true,
      keyword: true,
      folderId: true,
      updatedAt: true,
      createdAt: true,
      isBookmark: true,
    },
    orderBy(fields, operators) {
      return operators.sql`${fields.name} COLLATE NOCASE ASC`;
    },
  });
}

export async function deleteSnippets(ids: SnippetId | SnippetId[]) {
  await db
    .delete(snippetsTable)
    .where(
      Array.isArray(ids)
        ? inArray(snippetsTable.id, ids)
        : eq(snippetsTable.id, ids),
    );
}

export async function updateSnippet(
  snippetId: SnippetId,
  {
    name,
    tags,
    lang,
    content,
    keyword,
    folderId,
    isBookmark,
    placeholders,
  }: SnippetUpdatePayload,
) {
  const payload: Partial<NewSnippet> = {
    name,
    tags,
    lang,
    content,
    keyword,
    folderId,
    isBookmark,
    placeholders,
  };
  if (typeof content === 'string') {
    payload.checkPlaceholder = true;
  }

  const [snippet] = await db
    .update(snippetsTable)
    .set(payload)
    .where(eq(snippetsTable.id, snippetId))
    .returning();

  return snippet;
}

export function getSnippetContent(snippetId: SnippetId) {
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

function snippetQueryParser(query: string) {
  const result: { content: string; name: string } = {
    name: query,
    content: '',
  };

  result.name = query
    .replace(/\b\w+:\w+\b/g, (match) => {
      const [key, value] = match.split(':');
      switch (key) {
        case 'cnt':
          result.content = value;
          break;
      }

      return '';
    })
    .trim();

  return result;
}
function vtSnippetFunc<T extends AnyColumn>(
  column: T,
  index: number,
  max = 64,
) {
  return sql
    .raw(
      `snippet(vt_snippets, ${index}, '<span search-result>', '</span>', '...', ${max}) as ${column.name}`,
    )
    .mapWith(column);
}
function vtMatchQuery(column: string, query: string) {
  return query.length < 3
    ? sql.raw(`${column} LIKE '%${query}%'`)
    : sql`${sql.raw(column)} MATCH '"${sql.raw(query)}"'`;
}
export async function querySnippets(
  query: string,
): Promise<SnippetSearchListItem[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const useGlob = trimmedQuery.length < 3;
  const { content, name } = useGlob
    ? { name: query, content: '' }
    : snippetQueryParser(query);
  if (!name && !content) return [];

  return await db
    .select({
      id: sql<string>`id`,
      ...(content && { content: vtSnippetFunc(snippetsVTable.content, 2) }),
      name: name ? vtSnippetFunc(snippetsVTable.name, 1) : sql<string>`name`,
    })
    .from(snippetsVTable)
    .where(
      and(
        name ? vtMatchQuery('name', name) : undefined,
        content ? vtMatchQuery('content', content) : undefined,
      ),
    )
    .orderBy(sql.raw(`bm25(${DB_VIRTUAL_TABLE_NAME.snippets}) DESC`))
    .execute();
}

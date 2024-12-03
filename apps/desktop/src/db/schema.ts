import { SnippetPlaceholder } from '@/interface/snippet.interface';
import { DB_VIRTUAL_TABLE_NAME } from '@/utils/const/db.const';
import { relations } from 'drizzle-orm';
import {
  AnySQLiteColumn,
  index,
  integer,
  sqliteTable,
  sqliteView,
  text,
} from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';

export const foldersTable = sqliteTable(
  'folders',
  {
    id: text('id')
      .primaryKey()
      .$default(() => nanoid()),
    name: text('name').default('Unnamed'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$default(
      () => new Date(),
    ),
    isBookmark: integer('is_bookmark', { mode: 'boolean' }),
    parentId: text('parent_id').references(
      (): AnySQLiteColumn => foldersTable.id,
      { onDelete: 'cascade' },
    ),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .$default(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    nameIdx: index('folder_name_idx').on(table.name),
    parentIdx: index('folder_parent_idx').on(table.parentId),
    bookmarkIdx: index('folder_bookmark_idx').on(table.isBookmark),
    createdAtIdx: index('folder_created_at_idx').on(table.createdAt),
  }),
);
export type NewFolder = typeof foldersTable.$inferInsert;
export type SelectFolder = typeof foldersTable.$inferSelect;

export const foldersRelations = relations(foldersTable, ({ one, many }) => ({
  folderParent: one(foldersTable, {
    references: [foldersTable.id],
    fields: [foldersTable.parentId],
  }),
  snippets: many(snippetsTable),
}));

export const snippetsTable = sqliteTable(
  'snippets',
  {
    _id: integer('_id').primaryKey({ autoIncrement: true }),
    id: text('id')
      .unique()
      .$default(() => nanoid())
      .notNull(),
    ext: text('ext').default('txt'),
    keyword: text('keyword').default(''),
    content: text('content').default(''),
    name: text('name').default('Unnamed'),
    tags: text({ mode: 'json' })
      .$type<string[]>()
      .$default(() => []),
    placeholders: text({ mode: 'json' }).$type<SnippetPlaceholder[]>(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$default(
      () => new Date(),
    ),
    isBookmark: integer('is_bookmark', { mode: 'boolean' }),
    folderId: text('folder_id').references(() => foldersTable.id, {
      onDelete: 'cascade',
    }),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .$default(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    extIdx: index('snippet_ext_idx').on(table.ext),
    nameIdx: index('snippet_name_idx').on(table.name),
    tagsIdx: index('snippet_tags_idx').on(table.tags),
    folderIdx: index('snippet_folder_idx').on(table.folderId),
    bookmarkIdx: index('snippet_bookmark_idx').on(table.isBookmark),
    createdAtIdx: index('snippet_created_at_idx').on(table.createdAt),
  }),
);
export type NewSnippet = typeof snippetsTable.$inferInsert;
export type SelectSnippet = typeof snippetsTable.$inferSelect;

export const snippetsRelations = relations(snippetsTable, ({ one }) => ({
  folder: one(foldersTable, {
    references: [foldersTable.id],
    fields: [snippetsTable.folderId],
  }),
}));

export const snippetsVTable = sqliteView(DB_VIRTUAL_TABLE_NAME.snippets, {
  id: text('id'),
  name: text('name'),
  content: text('content'),
  keyword: text('keyword'),
}).existing();

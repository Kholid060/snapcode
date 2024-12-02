import { createDbBulkUpdate } from '@/utils/db-utils';
import { TreeDataItem } from '@/utils/tree-data-utils';
import { foldersTable, snippetsTable } from '../schema';
import { db } from '../db';
import { inArray } from 'drizzle-orm';

export async function updateBookmarks(items: TreeDataItem[], value: boolean) {
  const folderUpdate = createDbBulkUpdate(foldersTable.id);
  const snippetUpdate = createDbBulkUpdate(snippetsTable.id);

  for (const item of items) {
    (item.isFolder ? folderUpdate : snippetUpdate).push(item.id, value);
  }

  await db.transaction(async (tx) => {
    const folderPayload = folderUpdate.build();
    const snippetPayload = snippetUpdate.build();

    if (folderPayload.targets.length > 0) {
      await tx
        .update(foldersTable)
        .set({ isBookmark: folderPayload.sql })
        .where(inArray(foldersTable.id, folderPayload.targets));
    }
    if (snippetPayload.targets.length > 0) {
      await tx
        .update(snippetsTable)
        .set({ isBookmark: snippetPayload.sql })
        .where(inArray(snippetsTable.id, snippetPayload.targets));
    }
  });
}

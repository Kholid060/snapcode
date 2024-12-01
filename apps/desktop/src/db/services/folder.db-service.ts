import {
  FolderListItem,
  FolderUpdatePayload,
} from '@/interface/folder.interface';
import { db } from '../db';
import { foldersTable, NewFolder } from '../schema';
import { eq, inArray } from 'drizzle-orm';

export async function createNewFolders(folders: Omit<NewFolder, 'id'>[]) {
  return await db.insert(foldersTable).values(folders).returning();
}

export async function getAllFolders(): Promise<FolderListItem[]> {
  return db.query.foldersTable.findMany({
    columns: {
      id: true,
      name: true,
      parentId: true,
      createdAt: true,
      isBookmark: true,
    },
    orderBy(fields, operators) {
      return operators.sql`${fields.name} COLLATE NOCASE ASC`;
    },
  });
}

export async function deleteFolders(ids: string | string[]) {
  await db
    .delete(foldersTable)
    .where(
      Array.isArray(ids)
        ? inArray(foldersTable.id, ids)
        : eq(foldersTable.id, ids),
    );
}

export async function updateFolder(
  folderId: string,
  { name, parentId, isBookmark }: FolderUpdatePayload,
) {
  const [folder] = await db
    .update(foldersTable)
    .set({ name, parentId, isBookmark })
    .where(eq(foldersTable.id, folderId))
    .returning();

  return folder;
}

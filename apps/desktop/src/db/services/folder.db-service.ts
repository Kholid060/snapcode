import { FolderListItem } from '@/interface/folder.interface';
import { db } from '../db';
import { foldersTable, NewFolder } from '../schema';

export async function createNewFolders(folders: Omit<NewFolder, 'id'>[]) {
  await db.insert(foldersTable).values(folders);
}

export async function getAllFolders(): Promise<FolderListItem[]> {
  return db.query.foldersTable.findMany({
    columns: {
      id: true,
      name: true,
      parentId: true,
      createdAt: true,
    },
  });
}

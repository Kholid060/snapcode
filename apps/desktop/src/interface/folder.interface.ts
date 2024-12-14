import { NewFolder, SelectFolder } from '@/db/schema';

export type FolderListItem = SelectFolder;

export interface FolderNewPayload {
  path: string;
}

export type FolderUpdatePayload = Partial<
  Omit<NewFolder, 'id' | 'createdAt' | 'updatedAt'>
>;

export type FolderId = SelectFolder['id'];

import { NewFolder, SelectFolder } from '@/db/schema';

export type FolderListItem = SelectFolder;

export type FolderNewPayload = NewFolder;

export type FolderUpdatePayload = Partial<
  Omit<NewFolder, 'id' | 'createdAt' | 'updatedAt'>
>;

export type FolderId = SelectFolder['id'];

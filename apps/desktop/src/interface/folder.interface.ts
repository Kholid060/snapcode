import { NewFolder, SelectFolder } from '@/db/schema';

export type FolderListItem = SelectFolder;

export type FolderNewPayload = Omit<NewFolder, 'id'>;

export type FolderUpdatePayload = Partial<
  Omit<NewFolder, 'id' | 'createdAt' | 'updatedAt'>
>;

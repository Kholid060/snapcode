import { NewFolder, SelectFolder } from '@/db/schema';

export type FolderListItem = Omit<SelectFolder, 'updatedAt'>;

export type FolderNewPayload = Omit<NewFolder, 'id'>;

export type FolderUpdatePayload = Partial<
  Omit<NewFolder, 'id' | 'createdAt' | 'updatedAt'>
>;

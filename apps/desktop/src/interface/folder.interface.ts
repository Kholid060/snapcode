import { SelectFolder } from '@/db/schema';

export type FolderListItem = Omit<SelectFolder, 'updatedAt'>;

import { AppBookmarksState } from '@/interface/app.interface';
import { DocumentStoreBookmarksItem } from '@/interface/document.interface';

export function getBookmarksSortData(state: AppBookmarksState) {
  let sortAsc = false;
  let sortKey: 'createdAt' | 'path';

  switch (state.sortBy) {
    case 'created-asc':
      sortKey = 'createdAt';
      sortAsc = true;
      break;
    case 'created-desc':
      sortKey = 'createdAt';
      sortAsc = false;
      break;
    case 'name-asc':
      sortKey = 'path';
      sortAsc = true;
      break;
    case 'name-desc':
      sortKey = 'path';
      sortAsc = false;
      break;
    default:
      throw new Error('Invalid sort key');
  }

  const isDate = !sortKey.startsWith('name');

  return {
    isDate,
    sortAsc,
    sortKey,
  };
}

export function bookmarksSorter<T extends DocumentStoreBookmarksItem>(
  items: T[],
  state: AppBookmarksState,
): T[] {
  const { isDate, sortAsc, sortKey } = getBookmarksSortData(state);

  return items.sort((a, z) => {
    const aData = a[sortKey];
    const zData = z[sortKey];

    const val = isDate
      ? (aData as number) - (zData as number)
      : (aData as string).localeCompare(zData as string);
    return sortAsc ? val : val * -1;
  });
}

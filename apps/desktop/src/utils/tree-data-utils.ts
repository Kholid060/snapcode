import { TreeItemSelectEvent, FlattenedItem } from 'radix-vue';

export const TREE_ROOT_KEY = '__root' as const;

export function selectTreeItemsByMouse<T>({
  item,
  event,
  items,
  selectedItems: selectedItemsParam,
}: {
  selectedItems: T[];
  item: FlattenedItem<T>;
  items: FlattenedItem<T>[];
  event: TreeItemSelectEvent<T>;
}) {
  const selectedItems = selectedItemsParam.slice();
  const { originalEvent } = event.detail;

  if (originalEvent.ctrlKey || originalEvent.metaKey) {
    const itemIndex = selectedItems.indexOf(item.value);
    if (itemIndex === -1) selectedItems.push(item.value);
    else selectedItems.splice(itemIndex, 1);
    event.preventDefault();
  }

  const [firstValue] = selectedItems;
  if (!originalEvent.shiftKey || !firstValue) return selectedItems;

  const firstIndex = items.findIndex(
    (treeItem) => treeItem.value === firstValue,
  );
  const itemIndex = items.indexOf(item);
  if (firstIndex === -1 || itemIndex === -1 || firstIndex === itemIndex)
    return selectedItems;

  const isAfter = firstIndex > itemIndex;

  const newSelectedItems = items
    .slice(
      Math.min(firstIndex, itemIndex),
      Math.max(firstIndex, itemIndex) + (isAfter ? 0 : 1),
    )
    .map((treeItem) => treeItem.value);
  if (isAfter) newSelectedItems.unshift(items[firstIndex].value);

  event.preventDefault();

  return newSelectedItems;
}

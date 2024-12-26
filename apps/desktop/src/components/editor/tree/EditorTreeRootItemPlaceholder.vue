<template>
  <div
    ref="tree-item"
    class="relative z-10 flex h-7 w-full items-center rounded border-none pl-2 outline-none focus-visible:ring-2"
    :class="{ 'bg-primary/40 text-foreground': isDragOver }"
  />
</template>

<script setup lang="ts">
import { TREE_ROOT_KEY } from '@/utils/tree-data-utils';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { unrefElement } from '@vueuse/core';

const treeItemEl = useTemplateRef('tree-item');

const isDragOver = shallowRef(false);

watchEffect((onCleanup) => {
  const currentElement = unrefElement(treeItemEl as Ref);
  if (!currentElement) return;

  const dndFunction = combine(
    dropTargetForElements({
      element: currentElement,
      canDrop: () => {
        return true;
      },
      getData: () => {
        return {
          id: '',
          isDir: false,
          parentId: TREE_ROOT_KEY,
        };
      },
      onDragEnter: () => {
        isDragOver.value = true;
      },
      onDragLeave: () => {
        isDragOver.value = false;
      },
      onDrop: () => {
        isDragOver.value = false;
      },
      getIsSticky: () => true,
    }),

    monitorForElements({
      canMonitor: () => {
        return true;
      },
    }),
  );

  // Cleanup dnd function
  onCleanup(() => dndFunction());
});
</script>

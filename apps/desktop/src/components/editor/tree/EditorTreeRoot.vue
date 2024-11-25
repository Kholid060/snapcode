<template>
  <TreeRoot
    v-slot="{ flattenItems }"
    class="text-muted-foreground select-none list-none text-sm"
    :items="editorStore.data.treeData.__root"
    :get-key="(item) => item.id"
    :get-children="getChildren"
    multiple
    selection-behavior="replace"
    v-model:expanded="activeDirs"
  >
    <EditorTreeItem
      v-for="item in flattenItems"
      :key="item._id + item.index"
      :item="item"
      v-bind="item.bind"
    />
  </TreeRoot>
</template>

<script setup lang="ts">
import { TreeRoot } from 'radix-vue';
import { debouncedWatch } from '@vueuse/core';
import {
  type Instruction,
  extractInstruction,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useEditorStore } from '@/stores/editor.store';
import EditorTreeItem from './EditorTreeItem.vue';
import type { TreeDataItem } from '@/utils/tree-data-utils';
import { store, STORE_KEYS } from '@/services/store.service';

const editorStore = useEditorStore();

const activeDirs = ref<string[]>([]);

function getChildren(item: TreeDataItem) {
  return item.isFolder ? (editorStore.data.treeData[item.id] ?? []) : undefined;
}

watchEffect((onCleanup) => {
  const dndFunction = combine(
    monitorForElements({
      onDrop(args) {
        const { location, source } = args;
        // didn't drop on anything
        if (!location.current.dropTargets.length) return;

        const itemId = source.data.id as string;
        const target = location.current.dropTargets[0];
        const targetId = target.data.id as string;

        const instruction: Instruction | null = extractInstruction(target.data);

        if (instruction !== null) {
          console.log('instructions', { itemId, targetId, instruction });
          // items.value = updateTree(items.value, {
          //   type: 'instruction',
          //   instruction,
          //   itemId,
          //   targetId,
          // }) ?? [];
        }
      },
    }),
  );

  onCleanup(() => {
    dndFunction();
  });
});

debouncedWatch(activeDirs, () => {
  store.set(STORE_KEYS.editorActiveDirs, activeDirs.value);
}, { debounce: 250, deep: true });

onMounted(() => {
  store.get<string[]>(STORE_KEYS.editorActiveDirs).then((value) => {
    activeDirs.value = value ?? [];
  });
});
</script>

<template>
  <TreeItem
    ref="elRef"
    v-slot="{ isExpanded }"
    :value="item.value"
    :level="item.level"
    class="relative w-full border-none"
    :class="{ 'opacity-50': isDragging }"
    @contextmenu.prevent="
      sidebarProvider.handleContextMenu({
        id: item._id,
        event: $event,
        type: item.value.isFolder ? 'folder' : 'snippet',
      })
    "
  >
    <template v-if="item.hasChildren">
      <FolderIcon v-if="!isExpanded" class="size-4" />
      <FolderOpenIcon v-else class="size-4" />
    </template>
    <component
      :is="item.value.isFolder ? FolderIcon : FileIcon"
      v-else
      class="size-4"
    />
    <div class="pl-2">
      {{ itemData?.name ?? '' }}
    </div>
    <div
      v-if="instruction"
      class="absolute top-0 h-full w-full border-blue-500"
      :style="{
        left: `${instruction?.currentLevel * instruction?.indentPerLevel}px`,
        width: `calc(100% - ${instruction?.currentLevel * instruction?.indentPerLevel}px)`,
      }"
      :class="{
        '!border-b-2': instruction?.type === 'reorder-below',
        '!border-t-2': instruction?.type === 'reorder-above',
        'rounded !border-2': instruction?.type === 'make-child',
      }"
    />
  </TreeItem>
</template>

<script setup lang="ts">
import { computed, h, nextTick, ref, render, watchEffect } from 'vue';
import { type FlattenedItem, TreeItem } from 'radix-vue';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {
  type Instruction,
  attachInstruction,
  extractInstruction,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { unrefElement } from '@vueuse/core';
import type { TreeDataItem } from '@/utils/tree-data-builder';
import { useEditorStore } from '@/stores/editor.store';
import FolderIcon from '~icons/hugeicons/folder-01';
import FolderOpenIcon from '~icons/hugeicons/folder-02';
import FileIcon from '~icons/hugeicons/file-01';
import { useEditorSidebarProvider } from '@/providers/editor.provider';

const props = defineProps<{
  item: FlattenedItem<TreeDataItem>;
}>();

const editorStore = useEditorStore();
const sidebarProvider = useEditorSidebarProvider();

const elRef = ref();
const isDragging = ref(false);
const isDraggedOver = ref(false);
const isInitialExpanded = ref(false);
const instruction = ref<Extract<
  Instruction,
  { type: 'reorder-above' | 'reorder-below' | 'make-child' }
> | null>(null);

const itemData = computed(() => {
  const item = props.item.value;
  return (
    (item.isFolder
      ? editorStore.data.folders[item.id]
      : editorStore.data.snippets[item.id]) ?? null
  );
});
const mode = computed(() => {
  if (props.item.hasChildren) return 'expanded';
  // if (props.item.index + 1 === props.item.parentItem?.children?.length)
  //   return 'last-in-group';
  return 'standard';
});

watchEffect((onCleanup) => {
  const currentElement = unrefElement(elRef);

  if (!currentElement) return;

  const item = {
    ...props.item.value,
    level: props.item.level,
    id: props.item._id,
  };

  const expandItem = () => {
    if (!elRef.value?.isExpanded) {
      elRef.value?.handleToggle();
    }
  };

  const closeItem = () => {
    if (elRef.value?.isExpanded) {
      elRef.value?.handleToggle();
    }
  };

  const dndFunction = combine(
    draggable({
      element: currentElement,
      getInitialData: () => item,
      onDragStart: () => {
        isDragging.value = true;
        isInitialExpanded.value = elRef.value?.isExpanded;
        closeItem();
      },
      onDrop: () => {
        isDragging.value = false;
        if (isInitialExpanded.value) expandItem();
      },
      onGenerateDragPreview({ nativeSetDragImage }) {
        setCustomNativeDragPreview({
          getOffset: pointerOutsideOfPreview({ x: '16px', y: '8px' }),
          render: ({ container }) => {
            return render(
              h(
                'div',
                {
                  class:
                    'bg-white text-blackA11 rounded-md text-sm font-medium px-3 py-1.5',
                },
                item.id,
              ),
              container,
            );
          },
          nativeSetDragImage,
        });
      },
    }),

    dropTargetForElements({
      element: currentElement,
      getData: ({ input, element }) => {
        const data = { id: item.id };

        return attachInstruction(data, {
          input,
          element,
          indentPerLevel: 16,
          currentLevel: props.item.level,
          mode: mode.value,
          block: [],
        });
      },
      canDrop: ({ source }) => {
        return source.data.id !== item.id;
      },
      onDrag: ({ self }) => {
        instruction.value = extractInstruction(
          self.data,
        ) as typeof instruction.value;
      },
      onDragEnter: ({ source }) => {
        if (source.data.id !== item.id) {
          isDraggedOver.value = true;
          expandItem();
        }
      },
      onDragLeave: () => {
        isDraggedOver.value = false;
        instruction.value = null;
      },
      onDrop: ({ location }) => {
        isDraggedOver.value = false;
        instruction.value = null;
        if (location.current.dropTargets[0].data.id === item.id) {
          nextTick(() => {
            expandItem();
          });
        }
      },
      getIsSticky: () => true,
    }),

    monitorForElements({
      canMonitor: ({ source }) => {
        return source.data.id !== item.id;
      },
    }),
  );

  // Cleanup dnd function
  onCleanup(() => dndFunction());
});
</script>

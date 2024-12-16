<template>
  <TreeItem
    ref="tree-item"
    v-bind="item.bind"
    v-slot="{ isExpanded }"
    draggable="true"
    :value="item.value"
    :level="item.level"
    class="data-[selected]:bg-primary/20 data-[selected]:text-foreground relative z-10 flex h-7 w-full items-center rounded border-none pl-2 outline-none focus-visible:ring-2"
    :class="[
      dragState.isDragOver
        ? 'bg-primary/20 text-foreground'
        : dragState.isDragging
          ? 'bg-primary text-primary-foreground'
          : 'focus-visible:ring-primary',
      editorStore.state.state.activeFileId === item._id && !dragState.isDragging
        ? 'bg-accent/70 text-foreground'
        : 'hover:bg-accent/70',
    ]"
    @toggle="handleToggle"
    :title="item.value.name"
  >
    <template v-if="item.level > 1">
      <span
        v-for="i in item.level - 1"
        :key="'indent' + item._id + i"
        class="border-border/60 pointer-events-none inline-block h-full w-4 flex-shrink-0 border-l"
      >
      </span>
    </template>
    <div class="size-4 flex-shrink-0">
      <component
        v-if="item.value.isDir"
        class="size-4"
        :is="isExpanded ? Folder02Icon : Folder01Icon"
      />
      <AppFileExtIcon
        v-else-if="item.value.ext !== 'txt'"
        :lang="item.value.metadata?.lang"
        :ext="item.value.ext"
        class="size-4"
      >
        <File01Icon class="size-4" />
      </AppFileExtIcon>
      <File01Icon v-else class="size-4 flex-shrink-0" />
    </div>
    <div class="truncate pl-1">
      {{ item.value.name }}
    </div>
  </TreeItem>
</template>

<script setup lang="ts">
import { render } from 'vue';
import type { TreeItemToggleEvent } from 'radix-vue';
import { type FlattenedItem, TreeItem } from 'radix-vue';
import { useEditorStore } from '@/stores/editor.store';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { unrefElement } from '@vueuse/core';
import { Folder01Icon, Folder02Icon, File01Icon } from 'hugeicons-vue';
import type { DocumentFlatTreeItem } from '@/interface/document.interface';

const props = defineProps<{
  item: FlattenedItem<DocumentFlatTreeItem>;
}>();

const AppFileExtIcon = defineAsyncComponent(
  () => import('@/components/app/AppFileExtIcon.vue'),
);

const editorStore = useEditorStore();

const treeItemEl = useTemplateRef('tree-item');

const dragState = shallowReactive({
  isDragging: false,
  isDragOver: false,
  isInitialExpanded: false,
});

function handleToggle(event: TreeItemToggleEvent<DocumentFlatTreeItem>) {
  const { originalEvent } = event.detail;
  if (
    originalEvent instanceof PointerEvent &&
    (originalEvent.ctrlKey || originalEvent.metaKey || originalEvent.shiftKey)
  ) {
    event.preventDefault();
    return;
  }
}
function expandItem() {
  if (!treeItemEl.value?.isExpanded) {
    treeItemEl.value?.handleToggle();
  }
}
function closeItem() {
  if (treeItemEl.value?.isExpanded) {
    treeItemEl.value?.handleToggle();
  }
}

watchEffect((onCleanup) => {
  const currentElement = unrefElement(treeItemEl as Ref);
  if (!currentElement) return;

  const item = {
    ...props.item.value,
    level: props.item.level,
    id: props.item._id,
  };

  const dndFunction = combine(
    draggable({
      element: currentElement,
      getInitialData: () =>
        props.item.value as unknown as Record<string, unknown>,
      onDragStart: () => {
        dragState.isDragging = true;
        dragState.isInitialExpanded = treeItemEl.value?.isExpanded ?? false;
        closeItem();
      },
      onDrop: () => {
        dragState.isDragging = false;
        if (dragState.isInitialExpanded) expandItem();
      },
      onGenerateDragPreview({ nativeSetDragImage }) {
        setCustomNativeDragPreview({
          getOffset: pointerOutsideOfPreview({ x: '16px', y: '8px' }),
          render: ({ container }) => {
            return render(
              h(
                'div',
                {
                  class: 'bg-card rounded-md text-sm px-2 py-1.5 border',
                },
                props.item.value.name ?? '',
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
      canDrop: ({ source }) => {
        return source.data.id !== item.id;
      },
      getData: () => props.item.value as unknown as Record<string, unknown>,
      onDragEnter: ({ source }) => {
        if (source.data.id !== item.id) {
          dragState.isDragOver = true;
          expandItem();
        }
      },
      onDragLeave: () => {
        dragState.isDragOver = false;
      },
      onDrop: ({ location }) => {
        dragState.isDragOver = false;
        if (location.current.dropTargets[0].data.id === item.id) {
          nextTick(() => {
            expandItem();
          });
        }
      },
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

<template>
  <div class="relative">
    <TreeItem
      ref="tree-item"
      v-bind="item.bind"
      v-slot="{ isExpanded }"
      draggable="true"
      :value="item.value"
      :level="item.level"
      class="relative z-10 flex h-7 w-full items-center rounded border-none pl-2 outline-none focus-visible:ring-2"
      :class="[
        dragState.isDragOver
          ? 'bg-primary/40 text-foreground'
          : dragState.isDragging
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent/65 focus-visible:ring-primary',
        {
          'bg-accent/65 text-foreground':
            editorStore.state.activeFileId === item._id &&
            !dragState.isDragging,
        },
      ]"
      @select="handleSelect"
      @contextmenu.prevent="
        sidebarProvider.handleContextMenu({
          id: item._id,
          event: $event,
          type: item.value.isFolder ? 'folder' : 'snippet',
        })
      "
      :title="itemData.name"
    >
      <template v-if="item.level > 1">
        <span
          v-for="i in item.level - 1"
          :key="'indent' + item._id + i"
          class="border-border/60 pointer-events-none inline-block h-full w-4 flex-shrink-0 border-l"
        >
        </span>
      </template>
      <component
        v-if="item.value.isFolder"
        class="size-4 flex-shrink-0"
        :is="isExpanded ? Folder02Icon : Folder01Icon"
      />
      <AppFileExtIcon
        v-else-if="itemData.ext && itemData.ext !== 'txt'"
        :ext="itemData.ext"
        class="size-4 flex-shrink-0"
      >
        <File01Icon class="size-4 flex-shrink-0" />
      </AppFileExtIcon>
      <File01Icon v-else class="size-4 flex-shrink-0" />
      <div class="truncate pl-1">
        {{ itemData.name }}
      </div>
    </TreeItem>
  </div>
</template>

<script setup lang="ts">
import { computed, render } from 'vue';
import { type FlattenedItem, TreeItem } from 'radix-vue';
import type { TreeDataItem } from '@/utils/tree-data-utils';
import { useEditorStore } from '@/stores/editor.store';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { useEditorSidebarProvider } from '@/providers/editor.provider';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { unrefElement } from '@vueuse/core';
import { Folder01Icon, Folder02Icon, File01Icon } from 'hugeicons-vue';

const props = defineProps<{
  item: FlattenedItem<TreeDataItem>;
}>();

const AppFileExtIcon = defineAsyncComponent(
  () => import('@/components/app/AppFileExtIcon.vue'),
);

const editorStore = useEditorStore();
const sidebarProvider = useEditorSidebarProvider();

const treeItemEl = useTemplateRef('tree-item');

const dragState = shallowReactive({
  isDragging: false,
  isDragOver: false,
  isInitialExpanded: false,
});

const itemData = computed(() => {
  const item = props.item.value;
  const data = item.isFolder
    ? editorStore.data.folders[item.id]
    : editorStore.data.snippets[item.id];
  if (!data) return { name: '', parentId: null };

  return 'ext' in data
    ? {
        ext: data.ext,
        parentId: data.folderId,
        name: `${data.name}.${data.ext}`,
      }
    : {
        ext: null,
        name: data.name || '',
        parentId: data.parentId,
      };
});

function handleSelect(event: CustomEvent) {
  if (props.item.value.isFolder) {
    event.preventDefault();
    return;
  }

  editorStore.state.setActiveFile(props.item._id);
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
      getInitialData: () => ({
        ...itemData.value,
        id: item.id,
        isFolder: item.isFolder,
      }),
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
                itemData.value.name,
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
      getData: () => {
        return {
          ...itemData.value,
          id: item.id,
          isFolder: item.isFolder,
        };
      },
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

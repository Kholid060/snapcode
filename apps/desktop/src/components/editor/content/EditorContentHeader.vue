<template>
  <div
    class="relative flex h-14 items-center border-b px-4 pr-36"
    data-tauri-drag-region
  >
    <template v-if="activeFile">
      <div>
        <EditableRoot
          :model-value="`${activeFile.name ?? ''}.${activeFile.ext ?? 'txt'}`"
          placeholder="Snippet name"
          auto-resize
          @update:model-value="isNameFormDirty = true"
          @submit="updateSnippetName($event ?? 'Unnamed')"
        >
          <EditableArea class="text-foreground">
            <EditablePreview />
            <EditableInput class="placeholder:text-foreground w-full" />
          </EditableArea>
        </EditableRoot>
        <p
          class="text-muted-foreground select-none text-sm leading-tight"
          :key="updatedAtKey"
        >
          Last updated {{ dayjs(activeFile.updatedAt).fromNow() }}
        </p>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { useEditorStore } from '@/stores/editor.store';
import {
  EditableRoot,
  EditableArea,
  EditableInput,
  EditablePreview,
} from 'radix-vue';
import { onWatcherCleanup } from 'vue';
import dayjs from '@/lib/dayjs';

let interval = -1;

const editorStore = useEditorStore();

const updatedAtKey = shallowRef(-10000);
const isNameFormDirty = shallowRef(false);

const activeFile = computed(() => editorStore.data.activeSnippet);

function updateSnippetName(name: string) {
  if (!isNameFormDirty.value) return;

  editorStore.data.updateSnippet(activeFile.value.id, {
    name,
  });

  isNameFormDirty.value = false;
}

watch(
  () => activeFile.value?.updatedAt,
  (date) => {
    clearInterval(interval);
    if (!date) return;

    interval = setInterval(() => {
      updatedAtKey.value += 1;
    }, 60_000);

    onWatcherCleanup(() => clearInterval(interval));
  },
);
onUnmounted(() => {
  clearInterval(interval);
});
</script>

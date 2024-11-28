<template>
  <div
    class="relative flex h-14 items-center border-b px-4 pr-36"
    data-tauri-drag-region
  >
    <template v-if="activeFile">
      <EditableRoot
        :default-value="`${activeFile.name ?? ''}.${activeFile.ext ?? 'txt'}`"
        placeholder="Snippet name"
        auto-resize
        @submit="
          editorStore.data.updateSnippet(activeFile.id, {
            name: $event ?? 'Unnamed',
          })
        "
      >
        <EditableArea class="w-[250px] text-white">
          <EditablePreview />
          <EditableInput class="w-full placeholder:text-white" />
        </EditableArea>
      </EditableRoot>
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

const editorStore = useEditorStore();

const activeFile = computed(() => editorStore.data.activeSnippet);
</script>

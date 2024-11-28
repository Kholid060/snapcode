<template>
  <div
    class="relative flex h-14 items-center border-b px-4 pr-36"
    data-tauri-drag-region
  >
    <template v-if="activeFile">
      <div>
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
          <EditableArea class="text-foreground">
            <EditablePreview />
            <EditableInput class="placeholder:text-foreground w-full" />
          </EditableArea>
        </EditableRoot>
        <p class="text-muted-foreground text-sm leading-tight">
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
import dayjs from '@/lib/dayjs';

const editorStore = useEditorStore();

const activeFile = computed(() => editorStore.data.activeSnippet);
</script>

<template>
  <div class="flex h-14 items-center border-b px-4">
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
        <!-- <EditableEditTrigger
          v-if="!isEditing"
          class="text-green11 shadow-blackA7 hover:bg-mauve3 inline-flex h-[35px] w-max items-center justify-center rounded bg-white px-[15px] text-[15px] font-medium leading-[35px] shadow-[0_2px_10px] outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
        /> -->
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

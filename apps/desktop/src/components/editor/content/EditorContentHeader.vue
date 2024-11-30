<template>
  <div
    class="relative flex h-14 items-center border-b px-4 pr-36"
    data-tauri-drag-region
  >
    <template v-if="activeFile">
      <UiEditable
        :value="`${activeFile.name ?? ''}.${activeFile.ext ?? 'txt'}`"
        placeholder="Snippet name"
        class="hover:bg-secondary focus:bg-secondary -ml-1 inline-block flex-shrink-0 truncate rounded px-1 py-0.5 transition before:pl-1 focus:outline-none"
        @submit="$event.isDirty && updateSnippetName($event.value ?? 'Unnamed')"
      />
      <div class="pointer-events-none grow"></div>
      <UiEditable
        :value="activeFile.keyword ?? ''"
        class="bg-secondary hover:bg-secondary-hover text-muted-foreground ml-4 h-7 min-w-24 rounded-md border px-1 py-1 text-sm transition before:pl-1"
        placeholder="keyword"
      />
      <span class="bg-border h-3/5 w-px" />
    </template>
  </div>
</template>
<script setup lang="ts">
import UiEditable from '@/components/ui/UiEditable.vue';
import { useEditorStore } from '@/stores/editor.store';

const editorStore = useEditorStore();

const activeFile = computed(() => editorStore.data.activeSnippet);

function updateSnippetName(name: string) {
  editorStore.data.updateSnippet(activeFile.value.id, {
    name,
  });
}

onUnmounted(() => {});
</script>

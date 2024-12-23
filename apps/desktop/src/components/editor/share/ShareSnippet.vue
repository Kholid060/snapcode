<template>
  <Dialog
    :open="Boolean(activeComponent)"
    modal
    @update:open="(open) => !open && editorStore.state.setActiveShareModal('')"
  >
    <DialogContent>
      <component :is="activeComponent" />
    </DialogContent>
  </Dialog>
</template>
<script setup lang="ts">
import type { EditorShareModal } from '@/interface/editor.interface';
import { Dialog, DialogContent } from '@snippy/ui';
import ShareGithubGist from './ShareGithubGist.vue';
import { useEditorStore } from '@/stores/editor.store';

const shareComponent: Record<EditorShareModal, Component> = {
  'github-gist': ShareGithubGist,
};

const editorStore = useEditorStore();

const activeComponent = computed(() => {
  const id = editorStore.state.activeShareModal;
  if (!id || !editorStore.state.state.activeFileId) return null;

  return shareComponent[id];
});
</script>

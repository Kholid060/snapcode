<template>
  <AppDialogProvider>
    <TooltipProvider>
      <main class="flex h-screen">
        <EditorView />
      </main>
    </TooltipProvider>
  </AppDialogProvider>
  <Toaster />
</template>

<script setup lang="ts">
import { Toaster, TooltipProvider } from '@snippy/ui';
import EditorView from './components/editor/EditorView.vue';
import AppDialogProvider from './components/app/AppDialogProvider.vue';
import { useAppStore } from './stores/app.store';

const appStore = useAppStore();
appStore.init();
</script>

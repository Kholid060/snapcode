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
import { useHotkeysStore } from './stores/hotkeys.store';
import { useGlobalHotkey } from './composables/hotkey.composable';
import { appCommand } from './services/app-command.service';

await useAppStore()
  .init()
  .catch(() => {});
await useHotkeysStore().init();

useGlobalHotkey('quickAccessWindow', async ({ state }) => {
  if (state !== 'Pressed') return;
  await appCommand.invoke('open_popup_window', undefined);
});
</script>

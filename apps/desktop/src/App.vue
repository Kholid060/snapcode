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
import { useEditorStore } from './stores/editor.store';
import { useBookmarksStore } from './stores/bookmarks.store';

const appStore = useAppStore();

await Promise.all([appStore.init(), useEditorStore().init()]);
useHotkeysStore().init();
useBookmarksStore().init();

appStore.appInitiated = true;

useGlobalHotkey(
  'quickAccessWindow',
  async ({ state }) => {
    if (state !== 'Pressed') return;
    await appCommand.invoke('open_popup_window', undefined);
  },
  {
    onKeyChanged(keys) {
      appCommand.invoke('update_popup_window_tray_menu', { shortcut: keys });
    },
  },
);
</script>

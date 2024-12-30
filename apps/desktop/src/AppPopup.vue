<template>
  <TooltipProvider>
    <div class="flex h-screen flex-col">
      <div
        data-tauri-drag-region
        class="relative flex h-10 w-full flex-shrink-0 items-center justify-center"
      >
        <div class="pointer-events-none h-1 w-12 rounded-full bg-white/20" />
        <Button
          variant="ghost"
          size="icon"
          class="absolute right-1 top-1 size-7"
          @click="currWindow.hide()"
        >
          <Cancel01Icon class="text-muted-foreground size-[18px]" />
        </Button>
      </div>
      <PopupMenu v-model="activeMenu" class="mt-2" />
      <KeepAlive include="PopupNewSnippet">
        <component :is="popupComponentsMap[activeMenu]" />
      </KeepAlive>
    </div>
  </TooltipProvider>
  <Toaster />
</template>

<script setup lang="ts">
import { Button, Toaster, TooltipProvider } from '@snippy/ui';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Cancel01Icon } from 'hugeicons-vue';
import PopupSearch from './components/popup/PopupSearch.vue';
import PopupMenu from './components/popup/PopupMenu.vue';
import type { AppPopupMenuItems } from './interface/app.interface';
import PopupBookmarks from './components/popup/PopupBookmarks.vue';
import PopupNewSnippet from './components/popup/PopupNewSnippet.vue';
import { useTauriWindowEvent } from './composables/tauri.composable';

const TIMEOUT_WINDOW_MS = 10 * 60 * 1000;
let timeout = -1;

const popupComponentsMap: Record<AppPopupMenuItems, Component> = {
  search: PopupSearch,
  bookmarks: PopupBookmarks,
  'new-snippet': PopupNewSnippet,
};

const currWindow = getCurrentWindow();

const activeMenu = shallowRef<AppPopupMenuItems>('search');

useTauriWindowEvent('tauri://focus', () => {
  clearTimeout(timeout);
});
useTauriWindowEvent('tauri://blur', () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    currWindow.close();
  }, TIMEOUT_WINDOW_MS);
});

const excludeRole = ['combobox'];
window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || event.ctrlKey || event.shiftKey || event.altKey)
    return;

  if (
    event.target instanceof HTMLElement &&
    (excludeRole.includes(event.target.role ?? '') ||
      event.target.classList.contains('cm-content'))
  )
    return;

  currWindow.hide();
});
</script>
<style>
body {
  background-color: theme('colors.card.DEFAULT') !important;
}
</style>

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
      <PopupSearch />
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

const currWindow = getCurrentWindow();

const activeMenu = shallowRef<AppPopupMenuItems>('search');

window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || event.ctrlKey || event.shiftKey || event.altKey)
    return;

  currWindow.hide();
});
</script>
<style>
body {
  background-color: theme('colors.card.DEFAULT') !important;
}
</style>

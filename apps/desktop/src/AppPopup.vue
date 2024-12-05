<template>
  <div class="flex h-screen flex-col">
    <div
      data-tauri-drag-region
      class="relative flex h-10 w-full items-center justify-center"
    >
      <div class="pointer-events-none h-1 w-12 rounded-full bg-white/20" />
      <Button
        variant="ghost"
        size="icon"
        class="absolute right-1 top-1 size-7"
        @click="currWindow.hide()"
      >
        <Cancel01Icon class="text-muted-foreground size-5" />
      </Button>
    </div>
    <PopupMenu v-model="activeMenu" class="mt-1.5" />
    <PopupSearch />
  </div>
  <Toaster />
</template>

<script setup lang="ts">
import { Button, Toaster } from '@snippy/ui';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Cancel01Icon } from 'hugeicons-vue';
import PopupSearch from './components/popup/PopupSearch.vue';
import PopupMenu from './components/popup/PopupMenu.vue';
import type { AppPopupMenuItems } from './interface/app.interface';

const currWindow = getCurrentWindow();

const activeMenu = shallowRef<AppPopupMenuItems>('search');
</script>
<style>
body {
  background-color: theme('colors.card.DEFAULT') !important;
}
</style>

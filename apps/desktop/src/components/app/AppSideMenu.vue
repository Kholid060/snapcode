<template>
  <div class="bg-olive-2 flex w-12 flex-shrink-0 flex-col border-r">
    <div
      data-tauri-drag-region
      class="flex h-14 items-center justify-center border-b"
    >
      <img
        class="pointer-events-none w-10 select-none"
        src="@snippy/shared/assets/svg/logo-no-bg.svg"
      />
    </div>
    <div
      class="text-muted-foreground flex grow flex-col items-center gap-2 py-4"
    >
      <TooltipSimple
        v-for="item in items"
        :key="item.id"
        side="right"
        :label="item.label"
      >
        <Button
          size="icon"
          :variant="appStore.activeSidebar === item.id ? 'default' : 'ghost'"
          @click="appStore.setActiveSidebar(item.id)"
        >
          <component :is="item.icon" class="size-5" />
        </Button>
      </TooltipSimple>
      <Dialog v-model:open="showSettings">
        <TooltipSimple label="Code Images" side="right">
          <DialogTrigger>
            <Button size="icon" variant="ghost">
              <WebProgrammingIcon class="size-5" />
            </Button>
          </DialogTrigger>
        </TooltipSimple>
        <DialogContent>
          <p>Settings</p>
        </DialogContent>
      </Dialog>
      <div class="grow"></div>
      <Dialog v-model:open="showSettings">
        <TooltipSimple label="Settings" side="right">
          <DialogTrigger>
            <Button size="icon" variant="ghost">
              <Settings01Icon class="size-5" />
            </Button>
          </DialogTrigger>
        </TooltipSimple>
        <DialogContent>
          <p>Settings</p>
        </DialogContent>
      </Dialog>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  Settings01Icon,
  AllBookmarkIcon,
  WebProgrammingIcon,
  FolderFileStorageIcon,
} from 'hugeicons-vue';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  TooltipSimple,
} from '@snippy/ui';
import type { Component } from 'vue';
import type { AppSidebarItems } from '@/interface/app.interface';
import { useAppStore } from '@/stores/app.store';
import { useHotkey } from '@/composables/hotkey.composable';
import { APP_DEFAULT_HOTKEY } from '@/utils/const/app.const';

const items: { icon: Component; id: AppSidebarItems; label: string }[] = [
  { icon: FolderFileStorageIcon, id: 'snippets', label: 'Snippets' },
  { icon: AllBookmarkIcon, id: 'bookmarks', label: 'Bookmarks' },
];

const appStore = useAppStore();

const showSettings = shallowRef(false);

useHotkey(
  [
    APP_DEFAULT_HOTKEY.snippetsMenu,
    APP_DEFAULT_HOTKEY.openSettings,
    APP_DEFAULT_HOTKEY.bookmarksMenu,
  ],
  (_, handler) => {
    switch (handler.key) {
      case APP_DEFAULT_HOTKEY.bookmarksMenu:
        appStore.setActiveSidebar('bookmarks');
        break;
      case APP_DEFAULT_HOTKEY.snippetsMenu:
        appStore.setActiveSidebar('snippets');
        break;
      case APP_DEFAULT_HOTKEY.openSettings:
        showSettings.value = true;
        break;
    }
  },
);
</script>

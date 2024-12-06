<template>
  <div class="relative z-10 space-x-1.5 px-4 text-sm">
    <TooltipSimple
      v-for="(item, index) in menuItems"
      :key="item.id"
      align="start"
      side="bottom"
      :label="`${item.label} (${getHotkeyLabel(`mod+${index + 1}`)})`"
    >
      <button
        :class="[
          model === item.id
            ? 'bg-primary text-primary-foreground max-w-[500px]'
            : 'bg-secondary text-muted-foreground hover:text-foreground max-w-9',
        ]"
        class="inline-flex h-7 origin-left items-center overflow-hidden rounded-md px-2"
        @click="model = item.id"
      >
        <component :is="item.icon" class="size-5 flex-shrink-0" />
        <span
          :class="item.id !== model && 'opacity-0'"
          class="ml-1 whitespace-nowrap transition-opacity duration-500"
        >
          {{ item.label }}
        </span>
      </button>
    </TooltipSimple>
  </div>
</template>
<script setup lang="ts">
import { getHotkeyLabel, useHotkey } from '@/composables/hotkey.composable';
import type { AppPopupMenuItems } from '@/interface/app.interface';
import { TooltipSimple } from '@snippy/ui';
import { Search01Icon, FileAddIcon, AllBookmarkIcon } from 'hugeicons-vue';

const menuItems: { icon: Component; label: string; id: AppPopupMenuItems }[] = [
  { icon: Search01Icon, label: 'Search', id: 'search' },
  { icon: AllBookmarkIcon, label: 'Bookmarks', id: 'bookmarks' },
  { icon: FileAddIcon, label: 'New snippet', id: 'new-snippet' },
];

const model = defineModel<AppPopupMenuItems>();

useHotkey(
  menuItems.map((_, index) => `mod+${index + 1}`),
  (_event, { shortcut }) => {
    const index = +shortcut.split('+')[1] - 1;
    if (!menuItems[index]) return;

    model.value = menuItems[index].id;
  },
);
</script>
<style lang="css" scoped>
button {
  transition-property: max-width background-color color;
  transition-duration: 500ms;
  transition-timing-function: ease;
}
</style>

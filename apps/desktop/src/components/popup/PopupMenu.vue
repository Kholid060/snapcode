<template>
  <div class="space-x-1 px-4 text-sm">
    <button
      v-for="item in menuItems"
      :key="item.id"
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
  </div>
</template>
<script setup lang="ts">
import type { AppPopupMenuItems } from '@/interface/app.interface';
import { Search01Icon, FileAddIcon } from 'hugeicons-vue';

const menuItems: { icon: Component; label: string; id: AppPopupMenuItems }[] = [
  { icon: Search01Icon, label: 'Search', id: 'search' },
  { icon: FileAddIcon, label: 'New snippet', id: 'new-snippet' },
];

const model = defineModel<AppPopupMenuItems>();
</script>
<style lang="css" scoped>
button {
  transition-property: max-width background-color color;
  transition-duration: 500ms;
  transition-timing-function: ease;
}
</style>

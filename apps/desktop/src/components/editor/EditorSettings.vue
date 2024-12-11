<template>
  <div class="flex h-full">
    <div class="bg-olive-2 relative min-h-96 w-64 border-r px-4 py-10">
      <p class="text-muted-foreground pl-2 text-xs">Settings</p>
      <div class="text-muted-foreground mt-1 space-y-1 text-sm">
        <button
          v-for="item in menu"
          :key="item.id"
          class="flex h-8 w-full items-center rounded-md px-2 transition-colors"
          @click="activeMenu = item.id"
          :class="[
            item.id === activeMenu
              ? 'bg-secondary text-primary'
              : 'hover:bg-secondary hover:text-foreground',
          ]"
        >
          <component :is="item.icon" class="mr-2 size-5" />
          {{ item.label }}
        </button>
      </div>
      <UiLink
        href="https://github.com/kholid060/snippy"
        aria-label="GitHub repository"
        class="absolute bottom-4 left-4 opacity-70 transition-opacity hover:opacity-100"
      >
        <img src="@/assets/svg/github-mark-white.svg" class="size-5" />
      </UiLink>
    </div>
    <div style="height: calc(100vh - 20rem)" class="grow px-8 py-10">
      <h3 class="mb-2 text-lg font-semibold">
        {{ menu.find((item) => item.id === activeMenu)?.label }}
      </h3>
      <component :is="settingsComponentsMap[activeMenu]" />
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  KeyboardIcon,
  Settings05Icon,
  WebProgrammingIcon,
} from 'hugeicons-vue';
import EditorSettingsGeneral from './settings/EditorSettingsGeneral.vue';
import EditorSettingsEditor from './settings/EditorSettingsEditor.vue';
import EditorSettingsHotkeys from './settings/EditorSettingsHotkeys.vue';
import UiLink from '../ui/UiLink.vue';

type SettingItems = 'general' | 'editor' | 'hotkeys';

const menu: { id: SettingItems; label: string; icon: Component }[] = [
  { id: 'general', label: 'General', icon: Settings05Icon },
  { id: 'editor', label: 'Editor', icon: WebProgrammingIcon },
  { id: 'hotkeys', label: 'Hotkeys', icon: KeyboardIcon },
];
const settingsComponentsMap: Record<SettingItems, Component> = {
  editor: EditorSettingsEditor,
  hotkeys: EditorSettingsHotkeys,
  general: EditorSettingsGeneral,
};

const activeMenu = shallowRef<SettingItems>('general');
</script>

<template>
  <div class="flex h-full">
    <div
      class="bg-olive-2 relative min-h-96 w-64 flex-shrink-0 border-r px-4 py-10"
    >
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
      <p class="text-muted-foreground mt-8 pl-2 text-xs">Integrations</p>
      <div class="text-muted-foreground mt-1 space-y-1 text-sm">
        <button
          v-for="item in integrations"
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
    <div class="editor-content grow overflow-auto px-8 py-10">
      <h3 class="mb-2 text-lg font-semibold">
        {{
          [...menu, ...integrations].find((item) => item.id === activeMenu)
            ?.label
        }}
      </h3>
      <component :is="settingsComponentsMap[activeMenu]" />
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  GithubIcon,
  KeyboardIcon,
  Settings05Icon,
  WebProgrammingIcon,
} from 'hugeicons-vue';
import EditorSettingsGeneral from './settings/EditorSettingsGeneral.vue';
import EditorSettingsEditor from './settings/EditorSettingsEditor.vue';
import EditorSettingsHotkeys from './settings/EditorSettingsHotkeys.vue';
import UiLink from '../ui/UiLink.vue';
import EditorSettingsGitHubGist from './settings/EditorSettingsGitHubGist.vue';
import type { EditorSettingItems } from '@/interface/editor.interface';
import { useEditorStore } from '@/stores/editor.store';

const integrations: {
  label: string;
  icon: Component;
  id: EditorSettingItems;
}[] = [
  { id: 'integration:github-gist', label: 'GitHub Gist', icon: GithubIcon },
];
const menu: { id: EditorSettingItems; label: string; icon: Component }[] = [
  { id: 'general', label: 'General', icon: Settings05Icon },
  { id: 'editor', label: 'Editor', icon: WebProgrammingIcon },
  { id: 'hotkeys', label: 'Hotkeys', icon: KeyboardIcon },
];
const settingsComponentsMap: Record<EditorSettingItems, Component> = {
  editor: EditorSettingsEditor,
  hotkeys: EditorSettingsHotkeys,
  general: EditorSettingsGeneral,
  'integration:github-gist': EditorSettingsGitHubGist,
};

const editorStore = useEditorStore();

const activeMenu = computed({
  get() {
    return editorStore.state.settingsState.activeItem;
  },
  set(value) {
    editorStore.state.settingsState.activeItem = value;
  },
});
</script>
<style lang="css" scoped>
@screen lg {
  .editor-content {
    height: calc(100vh - 20rem);
  }
}

.editor-content {
  height: calc(100vh - 10rem);
}
</style>

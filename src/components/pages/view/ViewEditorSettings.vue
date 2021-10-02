<template>
  <div class="grid grid-cols-1 gap-2 md:grid-cols-2 mb-4">
    <label class="flex items-center">
      <checkbox-ui
        :model-value="settings.lineNumbers"
        class="mr-2"
        @change="updateSettings({ lineNumbers: $event })"
      />
      <span>Line numbers</span>
    </label>
    <label class="flex items-center">
      <checkbox-ui
        :model-value="settings.lineWrapping"
        class="mr-2"
        @change="updateSettings({ lineWrapping: $event })"
      />
      <span>Wrap lines</span>
    </label>
  </div>
  <div class="md:flex space-y-2 md:space-y-0 md:space-x-4">
    <label class="flex-1 block">
      <span class="text-sm ml-2 text-lighter">Font size:</span>
      <select-ui
        :model-value="settings.fontSize"
        class="w-full"
        @change="updateSettings({ fontSize: $event })"
      >
        <option v-for="size in fontSize" :key="size" :value="size">{{ size }}</option>
      </select-ui>
    </label>
    <label class="flex-1 block">
      <span class="text-sm ml-2 text-lighter">Indent space:</span>
      <select-ui
        :model-value="settings.tabSize"
        class="w-full"
        @change="updateSettings({ tabSize: $event })"
      >
        <option v-for="indent in indentSpace" :key="indent.id" :value="indent.id">
          {{ indent.name }}
        </option>
      </select-ui>
    </label>
    <label class="flex-1 block">
      <span class="text-sm ml-2 text-lighter">Key map:</span>
      <select-ui
        :model-value="settings.keyMap"
        class="w-full"
        @change="updateSettings({ keyMap: $event })"
      >
        <option v-for="item in keyMap" :key="item.id" :value="item.id">{{ item.name }}</option>
      </select-ui>
    </label>
  </div>
</template>
<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const fontSize = [10, 14, 16, 20, 24, 30, 32, 36, 40, 48, 52];
const indentSpace = [
  { id: 2, name: '2 Spaces' },
  { id: 3, name: '3 Spaces' },
  { id: 4, name: '4 Spaces' },
];
const keyMap = [
  { name: 'Default', id: 'default' },
  { id: 'sublime', name: 'Sublime Text' },
  { id: 'emacs', name: 'EMACS' },
];

const settings = computed(() => store.state.editorSettings);

function updateSettings(data) {
  store.commit('updateState', {
    key: 'editorSettings',
    value: { ...settings.value, ...data },
  });

  localStorage.setItem('editor-settings', JSON.stringify(settings.value));
}
</script>

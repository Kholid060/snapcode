<template>
  <div class="divide-border/60 divide-y">
    <EditorSettingsItem>
      <template #content>
        <p>Font family</p>
        <p class="text-muted-foreground text-sm">
          Controls the editor font family
        </p>
      </template>
      <Input
        class="mr-2 h-9 w-auto"
        :default-value="editorStore.settings.data.customFont"
        placeholder="Font family"
        v-if="editorStore.settings.data.fontFamily === 'custom'"
        @update:model-value="updateCustomFont($event as string)"
      />
      <Select
        :model-value="editorStore.settings.data.fontFamily"
        @update:model-value="updateFonts"
      >
        <SelectTrigger class="h-9 w-auto">
          <SelectValue class="pr-2" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="font in APP_EDITOR_FONTS"
            :key="font.id"
            :value="font.id"
          >
            {{ font.name }}
          </SelectItem>
          <SelectItem value="custom"> Custom </SelectItem>
        </SelectContent>
      </Select>
    </EditorSettingsItem>
    <EditorSettingsItem>
      <template #content>
        <p>Font size</p>
        <p class="text-muted-foreground text-sm">Font size in pixels</p>
      </template>
      <span
        class="text-muted-foreground size-7 rounded border text-center text-sm tabular-nums leading-7"
      >
        {{ editorStore.settings.data.fontSize }}
      </span>
      <Slider
        :model-value="[editorStore.settings.data.fontSize]"
        class="ml-2 w-32"
        :min="12"
        :max="32"
        :min-steps-between-thumbs="1"
        @update:model-value="
          editorStore.settings.updateSetting('fontSize', $event?.[0] ?? 16)
        "
      />
    </EditorSettingsItem>
    <EditorSettingsItem>
      <template #content>
        <p>Font ligatures</p>
        <p class="text-muted-foreground text-sm">
          Enable font ligatures or font features
        </p>
      </template>
      <Switch v-model:checked="editorStore.settings.data.fontLigatures" />
    </EditorSettingsItem>
    <EditorSettingsItem>
      <template #content>
        <p>Show line numbers</p>
        <p class="text-muted-foreground text-sm">
          Show line numbers in the gutter
        </p>
      </template>
      <Switch v-model:checked="editorStore.settings.data.showLineNumbers" />
    </EditorSettingsItem>
    <EditorSettingsItem>
      <template #content>
        <p>Tab indent size</p>
        <p class="text-muted-foreground text-sm">
          The number of spaces used for indentation
        </p>
      </template>
      <span
        class="text-muted-foreground size-7 rounded border text-center text-sm tabular-nums leading-7"
      >
        {{ editorStore.settings.data.indentSize }}
      </span>
      <Slider
        :model-value="[editorStore.settings.data.indentSize]"
        class="ml-2 w-32"
        :min="2"
        :max="8"
        :min-steps-between-thumbs="1"
        @update:model-value="
          editorStore.settings.updateSetting('indentSize', $event?.[0] ?? 4)
        "
      />
    </EditorSettingsItem>
  </div>
</template>
<script setup lang="ts">
import { useEditorStore } from '@/stores/editor.store';
import EditorSettingsItem from './EditorSettingsItem.vue';
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
} from '@snippy/ui';
import { useDebounceFn } from '@vueuse/core';
import type { AppEditorFonts } from '@/utils/const/app.const';
import { APP_EDITOR_FONTS } from '@/utils/const/app.const';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';

const editorStore = useEditorStore();

async function updateFonts(font: string) {
  try {
    const fontName = font as AppEditorFonts;

    editorStore.settings.updateSetting('fontFamily', fontName);
  } catch (error) {
    logger.error(getLogMessage('settings:toggle-app-startup', error));
  }
}

const updateCustomFont = useDebounceFn((value: string) => {
  editorStore.settings.updateSetting('customFont', value);
}, 500);
</script>

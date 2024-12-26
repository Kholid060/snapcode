<template>
  <ul class="mt-4 space-y-0.5">
    <li
      v-for="hotkey in labels"
      :key="hotkey.id"
      class="hover:bg-secondary/70 text-muted-foreground hover:text-foreground flex h-10 items-center rounded-md px-2 transition-colors"
    >
      <p class="grow truncate pr-4">{{ hotkey.label }}</p>
      <Kbd
        v-for="key in hotkeysStore.getLabel(hotkey.id).split('+')"
        :key="key"
        class="ml-0.5 inline-block min-w-6 text-center capitalize"
      >
        {{ key }}
      </Kbd>
      <p
        v-if="recordingId === hotkey.id"
        class="text-primary bg-primary/10 ml-2 rounded px-2 text-sm"
      >
        Press keys...
      </p>
      <Button
        size="sm"
        variant="ghost"
        class="ml-2 size-7 flex-shrink-0 p-0 transition-colors"
        :class="recordingId === hotkey.id && 'text-primary'"
        @click="startUpdate(hotkey.id)"
      >
        <component
          :is="recordingId === hotkey.id ? Cancel01Icon : PencilEdit01Icon"
          class="size-5"
        />
      </Button>
    </li>
  </ul>
</template>
<script setup lang="ts">
import { useHotkeyRecorder } from '@/composables/hotkey.composable';
import { logger } from '@/services/logger.service';
import { useHotkeysStore } from '@/stores/hotkeys.store';
import {
  APP_DEFAULT_GLOBAL_SHORTCUT,
  type AppHotkeys,
} from '@/utils/const/app.const';
import { getLogMessage } from '@/utils/helper';
import { Button, Kbd, useToast } from '@snippy/ui';
import { Cancel01Icon, PencilEdit01Icon } from 'hugeicons-vue';

const labels: { id: AppHotkeys; label: string }[] = [
  { id: 'bookmarksMenu', label: 'Open bookmarks' },
  { id: 'newFolder', label: 'New folder' },
  { id: 'newSnippet', label: 'New snippet' },
  { id: 'openSettings', label: 'Open settings' },
  { id: 'quickAccessWindow', label: 'Open quick access window' },
  { id: 'searchMenu', label: 'Search files' },
  { id: 'snippetsMenu', label: 'Snippets list' },
];
labels.sort((a, z) => a.label.localeCompare(z.label));

const { toast } = useToast();
const hotkeysStore = useHotkeysStore();
const hotkeyRecorder = useHotkeyRecorder(updateHotkey);

const recordingId = shallowRef('');

async function updateHotkey(keys: string) {
  try {
    if (keys.endsWith('+') || keys.endsWith('-')) {
      toast({
        variant: 'destructive',
        title: `Hotkey ends with "+" or "-" is currently not supported`,
      });
      return;
    }

    if (hotkeysStore.hotkeys[recordingId.value as AppHotkeys] === keys) return;

    const hasConflict = Object.values(hotkeysStore.hotkeys).some(
      (item) => item.toLowerCase() === keys.toLowerCase(),
    );
    if (hasConflict) {
      const conflictKeyLabel = labels.find(
        (item) => item.id === recordingId.value,
      )?.label;

      toast({
        variant: 'destructive',
        title: `This hotkey has conflict with the "${conflictKeyLabel}" hotkey`,
      });
      return;
    }

    await hotkeysStore.updateHotkey(recordingId.value as AppHotkeys, keys);
    hotkeyRecorder.stopRecording();
  } catch (error) {
    logger.error(getLogMessage('settings:update-hotkey', error));
    toast({
      variant: 'destructive',
      title: 'An error occured when updating hotkey',
    });
  }
}
function startUpdate(id: string) {
  if (id === recordingId.value) {
    hotkeyRecorder.stopRecording();
    recordingId.value = '';
    return;
  }

  recordingId.value = id;

  if (!hotkeyRecorder.isRecording.value) {
    hotkeyRecorder.startRecording(id in APP_DEFAULT_GLOBAL_SHORTCUT);
  }
}

watch(hotkeyRecorder.isRecording, (isRecording) => {
  if (!isRecording) recordingId.value = '';
});
</script>

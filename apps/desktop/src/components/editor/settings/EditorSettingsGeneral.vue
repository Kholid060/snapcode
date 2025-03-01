<template>
  <div class="divide-border/60 divide-y">
    <EditorSettingsItem>
      <template #content>
        <p>App update</p>
        <p class="text-muted-foreground text-sm">
          Version: {{ settings.appVersion }} | status:
          {{ checkUpdateStatusText }}
        </p>
      </template>
      <Button
        size="sm"
        class="text-sm"
        :is-loading="
          state.isCheckingUpdated || appStore.updateState.status === 'updating'
        "
        :disabled="appStore.updateState.status === 'need-restart'"
        @click="checkUpdate"
      >
        Check for updates
      </Button>
    </EditorSettingsItem>
    <EditorSettingsItem>
      <template #content>
        <p>Automatically check updates</p>
        <p class="text-muted-foreground text-sm">
          Automatically check updates and install it if there's a newer version
        </p>
      </template>
      <Switch
        :checked="settings.autoUpdateEnabled"
        @update:checked="toggleAutoUpdate"
      />
    </EditorSettingsItem>
    <EditorSettingsItem>
      <template #content>
        <p>Launch at startup</p>
        <p class="text-muted-foreground text-sm">
          Launch the app on the system startup
        </p>
      </template>
      <Switch
        :checked="settings.startupEnabled"
        @update:checked="toggleAppStartup"
      />
    </EditorSettingsItem>
    <EditorSettingsItem>
      <template #content>
        <p>Deleted snippets</p>
        <p class="text-muted-foreground text-sm">
          Select what happened to the snippets after deleted
        </p>
      </template>
      <Select
        :model-value="appStore.settings.deleteToTrash ? '1' : '0'"
        @update:model-value="
          appStore.updateSettings('deleteToTrash', $event === '1')
        "
      >
        <SelectTrigger class="w-auto">
          <SelectValue class="pr-2" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1"> Move to system trash </SelectItem>
          <SelectItem value="0"> Permanently delete </SelectItem>
        </SelectContent>
      </Select>
    </EditorSettingsItem>
  </div>
</template>
<script setup lang="ts">
import { logger } from '@/services/logger.service';
import { store } from '@/services/store.service';
import { getLogMessage } from '@/utils/helper';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  useToast,
} from '@snippy/ui';
import { getVersion } from '@tauri-apps/api/app';
import * as autoStart from '@tauri-apps/plugin-autostart';
import EditorSettingsItem from './EditorSettingsItem.vue';
import { useAppStore } from '@/stores/app.store';

const { toast } = useToast();
const appStore = useAppStore();

const state = shallowReactive({
  isCheckingUpdated: false,
});
const settings = shallowReactive({
  appVersion: '',
  startupEnabled: false,
  autoUpdateEnabled: false,
});

const checkUpdateStatusText = computed(() => {
  switch (appStore.updateState.status) {
    case 'latest':
      return 'latest version';
    case 'need-restart':
      return 'updates installed, restart the app to apply it';
    case 'updating':
      return `updating (${Math.ceil(appStore.updateState.downloadProgress)}%)`;
    default:
      return '';
  }
});

async function toggleAppStartup(enabled: boolean) {
  try {
    if (enabled) await autoStart.enable();
    else await autoStart.disable();

    settings.startupEnabled = enabled;
  } catch (error) {
    logger.error(getLogMessage('settings:toggle-app-startup', error));
  }
}
async function toggleAutoUpdate(enabled: boolean) {
  try {
    await store.xSet('autoUpdate', enabled);
    settings.autoUpdateEnabled = enabled;
  } catch (error) {
    logger.error(getLogMessage('settings:toggle-app-autoupdate', error));
  }
}
async function checkUpdate() {
  if (appStore.updateState.status !== 'latest') return;

  try {
    state.isCheckingUpdated = true;
    await appStore.checkUpdate();
  } catch (error) {
    toast({
      title: 'An error occured when checking update',
      variant: 'destructive',
      description: typeof error === 'string' ? error : '',
    });
  } finally {
    state.isCheckingUpdated = false;
  }
}

async function initData() {
  try {
    const [version, startup, autoUpdate] = await Promise.all([
      getVersion(),
      autoStart.isEnabled(),
      store.xGet('autoUpdate', true),
    ]);

    settings.appVersion = version;
    settings.startupEnabled = startup;
    settings.autoUpdateEnabled = autoUpdate;
  } catch (error) {
    logger.error(getLogMessage('settings:general-init', error));
  }
}

onBeforeMount(() => {
  initData();
});
</script>

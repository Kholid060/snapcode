<template>
  <slot />
  <template v-for="item in items" :key="item.id">
    <component
      :is="DIALOGS_COMPONENT_MAP[item.data.type]"
      :options="item.data.options"
      @close="handleClose(item.id, $event)"
    />
  </template>
</template>
<script setup lang="ts">
import type {
  AppDialogProvider,
  AppDialogItems,
} from '@/providers/app-dialog.provider';
import { APP_DIALOG_PROVIDER_KEY } from '@/providers/app-dialog.provider';
import { promiseWithResolver, type PromiseWithResolver } from '@snippy/shared';
import AppDialogConfirm from './dialog/AppDialogConfirm.vue';
import AppDialogPrompt from './dialog/AppDialogPrompt.vue';
import type { Component } from 'vue';
import AppDialogSelectData from './dialog/AppDialogSelectData.vue';

interface AppDialogItemsData {
  id: number;
  data: AppDialogItems;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolver: PromiseWithResolver<any>;
}

let id = 0;
const DIALOGS_COMPONENT_MAP: Record<
  AppDialogItems['type'],
  Component<{ options: AppDialogItems['options'] }>
> = {
  prompt: AppDialogPrompt,
  confirm: AppDialogConfirm,
  'select-data': AppDialogSelectData,
};

const items = ref<AppDialogItemsData[]>([]);

function handleClose(dialogId: number, result: unknown) {
  let dialogIndex = 0;
  const dialogData = items.value.find((item, index) => {
    if (item.id === dialogId) {
      dialogIndex = index;
      return true;
    }

    return false;
  });
  if (!dialogData) return;

  dialogData.resolver.resolve(result);
  items.value.splice(dialogIndex, 1);
}
function dialogHandler<T>(data: AppDialogItems): Promise<T> {
  const resolver = promiseWithResolver<T>();
  items.value.push({
    data,
    resolver,
    id: ++id,
  });

  return resolver.promise;
}

provide<AppDialogProvider>(APP_DIALOG_PROVIDER_KEY, {
  async selectData(options) {
    return dialogHandler({ type: 'select-data', options });
  },
  async confirm(options) {
    return dialogHandler({ type: 'confirm', options });
  },
  async prompt(options) {
    return dialogHandler({ type: 'prompt', options });
  },
});
</script>

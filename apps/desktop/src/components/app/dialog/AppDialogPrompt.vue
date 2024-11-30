<template>
  <Dialog
    default-open
    @update:open="!$event && $emit('close', { canceled: true, value: '' })"
  >
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>
          {{ options.title ?? 'Prompt' }}
        </DialogTitle>
      </DialogHeader>
      <form @submit.prevent="$emit('close', { canceled: false, value })">
        <Input
          :placeholder="options.placeholder"
          :default-value="options.defaultValue ?? ''"
          @update:model-value="value = $event.toString()"
        />
        <DialogFooter class="mt-6">
          <Button
            @click="$emit('close', { canceled: true, value: '' })"
            type="button"
            variant="outline"
          >
            {{ options.cancelBtnLabel ?? 'Cancel' }}
          </Button>
          <Button :variant="options.okBtnVariant" type="submit" class="ml-2">
            {{ options.okBtnLabel ?? 'Ok' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
<script setup lang="ts">
import type {
  AppDialogPromptOptions,
  AppDialogPromptResult,
} from '@/providers/app-dialog.provider';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@snippy/ui';

const props = withDefaults(
  defineProps<{ options?: AppDialogPromptOptions }>(),
  {
    options: () => ({ title: 'Prompt' }),
  },
);
defineEmits<{
  close: [value: AppDialogPromptResult];
}>();

let value = props.options.defaultValue ?? '';
</script>

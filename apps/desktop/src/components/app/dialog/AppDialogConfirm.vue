<template>
  <AlertDialog
    default-open
    @update:open="
      !$event && $emit('close', { dontAskValue, isConfirmed: false })
    "
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ options.title }}</AlertDialogTitle>
        <AlertDialogDescription class="text-muted-foreground">
          {{ options.body }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter class="mt-4">
        <template v-if="options.showDontAsk">
          <Checkbox
            id="dont-ask-prompt"
            @update:checked="dontAskValue = $event"
          />
          <label
            for="dont-ask-prompt"
            class="text-muted-foreground select-none text-sm"
          >
            Don't ask again
          </label>
        </template>
        <AlertDialogCancel>
          {{ options.cancelBtnLabel ?? 'Cancel' }}
        </AlertDialogCancel>
        <AlertDialogAction
          class="ml-2"
          :variant="options.okBtnVariant"
          @click="$emit('close', { isConfirmed: true, dontAskValue })"
        >
          {{ options.okBtnLabel ?? 'Ok' }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
<script setup lang="ts">
import type {
  AppDialogConfirmOptions,
  AppDialogConfirmResult,
} from '@/providers/app-dialog.provider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Checkbox,
} from '@snippy/ui';

withDefaults(defineProps<{ options?: AppDialogConfirmOptions }>(), {
  options: () => ({ title: 'Confirm?' }),
});
defineEmits<{
  close: [value: AppDialogConfirmResult];
}>();

let dontAskValue: boolean;
</script>

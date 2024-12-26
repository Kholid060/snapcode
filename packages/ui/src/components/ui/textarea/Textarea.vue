<script setup lang="ts">
import { type HTMLAttributes } from 'vue';
import { cn } from '../../../lib/utils';
import { useVModel } from '@vueuse/core';

const props = defineProps<{
  autogrow?: boolean;
  modelValue?: string | number;
  defaultValue?: string | number;
  class?: HTMLAttributes['class'];
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void;
}>();

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
});

function handleInput(event: Event) {
  if (!props.autogrow) return;

  const target = event.target as HTMLTextAreaElement;
  target.style.height = 'auto';
  target.style.height =
    target.offsetHeight - target.clientHeight + target.scrollHeight + 'px';
}
</script>

<template>
  <textarea
    v-model="modelValue"
    :class="
      cn(
        'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
    @input="handleInput"
  />
</template>

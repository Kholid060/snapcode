<script setup lang="ts">
import { cn } from '../../../lib/utils';
import { Search } from 'lucide-vue-next';
import {
  ComboboxInput,
  type ComboboxInputProps,
  useForwardProps,
} from 'radix-vue';
import { computed, type HTMLAttributes } from 'vue';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<
  ComboboxInputProps & {
    defaultTheme?: boolean;
    containerClass?: string;
    class?: HTMLAttributes['class'];
  }
>();

const delegatedProps = computed(() => {
  const { class: _, containerClass: __, ...delegated } = props;

  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <div
    :class="
      cn(!defaultTheme && 'flex items-center border-b px-3', containerClass)
    "
    cmdk-input-wrapper
  >
    <slot name="icon">
      <Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
    </slot>
    <ComboboxInput
      v-bind="{ ...forwardedProps, ...$attrs }"
      auto-focus
      :class="
        cn(
          !defaultTheme &&
            'placeholder:text-muted-foreground flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50',
          props.class,
        )
      "
    />
    <slot name="append" />
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '../../../lib/utils';
import { Primitive, type PrimitiveProps } from 'radix-vue';
import { type ButtonVariants, buttonVariants } from '.';
import { LoaderCircleIcon } from 'lucide-vue-next';

interface Props extends PrimitiveProps {
  isLoading?: boolean;
  size?: ButtonVariants['size'];
  class?: HTMLAttributes['class'];
  variant?: ButtonVariants['variant'];
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
});
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        buttonVariants({ variant, size }),
        props.class,
        isLoading && 'relative',
      )
    "
  >
    <slot />
    <div
      v-if="isLoading"
      style="background-color: inherit; border-radius: inherit"
      class="absolute left-0 top-0 z-50 flex size-full items-center justify-center"
    >
      <LoaderCircleIcon style="color: inherit" class="animate-spin" />
    </div>
  </Primitive>
</template>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn(kbdVariants({ variant }), props.class)"
  >
    <slot />
  </Primitive>
</template>
<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { kbdVariants, type KbdVariants } from '.';
import { Primitive, type PrimitiveProps } from 'radix-vue';
import { cn } from '../../../lib/utils';

interface Props extends PrimitiveProps {
  class?: HTMLAttributes['class'];
  variant?: KbdVariants['variant'];
}

const props = withDefaults(defineProps<Props>(), {
  as: 'kbd',
});
</script>

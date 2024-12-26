<template>
  <Tooltip v-bind="forwarded">
    <TooltipTrigger as-child>
      <slot />
    </TooltipTrigger>
    <TooltipContent
      :side="side"
      :align="align"
      :class="contentClass"
      :side-offset="sideOffset"
      :align-offset="alignOffset"
    >
      {{ label }}
    </TooltipContent>
  </Tooltip>
</template>
<script setup lang="ts">
import type { TooltipContentProps } from 'radix-vue';
import {
  type TooltipRootEmits,
  type TooltipRootProps,
  useForwardPropsEmits,
} from 'radix-vue';
import Tooltip from './Tooltip.vue';
import TooltipTrigger from './TooltipTrigger.vue';
import TooltipContent from './TooltipContent.vue';

const emits = defineEmits<TooltipRootEmits>();
const props = defineProps<
  TooltipRootProps & { contentClass?: string } & Pick<
      TooltipContentProps,
      'align' | 'side' | 'sideOffset' | 'alignOffset'
    > & { label: string }
>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <Tooltip v-bind="forwarded">
    <TooltipTrigger as-child>
      <slot />
    </TooltipTrigger>
    <TooltipContent class="px-3 text-xs">
      {{ label }}
    </TooltipContent>
  </Tooltip>
</template>
<script setup lang="ts">
import {
  type TooltipRootEmits,
  type TooltipRootProps,
  useForwardPropsEmits,
} from 'radix-vue';
import Tooltip from './Tooltip.vue';
import TooltipTrigger from './TooltipTrigger.vue';
import TooltipContent from './TooltipContent.vue';

const emits = defineEmits<TooltipRootEmits>();
const props = defineProps<TooltipRootProps & { label: string }>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

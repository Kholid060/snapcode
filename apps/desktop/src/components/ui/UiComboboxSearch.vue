<template>
  <ComboboxAnchor :class="cn('relative', containerClass)">
    <Search01Icon
      class="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2"
    />
    <ComboboxInput
      v-bind="$attrs"
      class="focus:ring-ring focus:ring-offset-background cmx-search-input h-9 w-full rounded-md border bg-inherit px-10 text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2"
      ref="search-input"
      placeholder="Search..."
    />
    <CancelCircleIcon
      @click="clearSearch"
      class="text-muted-foreground absolute right-3 top-1/2 hidden size-5 -translate-y-1/2"
    />
  </ComboboxAnchor>
</template>
<script setup lang="ts">
import { cn } from '@snippy/ui';
import { unrefElement } from '@vueuse/core';
import { CancelCircleIcon, Search01Icon } from 'hugeicons-vue';
import { ComboboxAnchor, ComboboxInput } from 'radix-vue';

defineOptions({
  inheritAttrs: false,
});
const props = defineProps<{
  autoFocus?: boolean;
  containerClass?: string;
}>();

const searchInput = useTemplateRef<HTMLInputElement>('search-input');

function clearSearch() {
  const inputEl = unrefElement(searchInput);
  if (inputEl) {
    inputEl.value = '';
    inputEl.dispatchEvent(new InputEvent('input'));
  }
}
function focusInput() {
  unrefElement(searchInput)?.focus();
}

defineExpose({
  inputEl: computed(() => unrefElement(searchInput)),
});

onActivated(() => {
  if (props.autoFocus) focusInput();
});
onMounted(() => {
  if (props.autoFocus) focusInput();
});
</script>
<style>
.cmx-search-input:not(:placeholder-shown) + svg {
  display: block;
}
</style>

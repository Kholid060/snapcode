<template>
  <img
    v-if="iconName"
    v-bind="$attrs"
    :src="`/vscode-icons/file_type_${iconName}.svg`"
  />
  <slot v-else />
</template>
<script setup lang="ts">
import iconExtData from '@snippy/shared/data/vscode-ext-icons.json';
import iconData from '@snippy/shared/data/vscode-icons-metadata.json';

defineOptions({
  inheritAttrs: false,
});
const props = defineProps<{
  ext?: string;
  lang?: string;
}>();

type IconKeys = keyof typeof iconData;
type IconExtKeys = keyof typeof iconExtData;

const iconName = computed(
  () =>
    iconData[props.lang as IconKeys] || iconExtData[props.ext as IconExtKeys],
);
</script>

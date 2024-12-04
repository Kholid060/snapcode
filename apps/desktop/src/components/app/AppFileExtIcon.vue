<template>
  <img
    v-if="iconData[lang as IconKeys]"
    v-bind="$attrs"
    :src="`/vscode-icons/file_type_${iconData[lang as IconKeys]}.svg`"
  />
  <slot v-else />
</template>
<script setup lang="ts">
import iconData from '@snippy/shared/data/vscode-icons-metadata.json';

defineOptions({
  inheritAttrs: false,
});
defineProps<{
  lang: string;
}>();

type IconKeys = keyof typeof iconData;
</script>

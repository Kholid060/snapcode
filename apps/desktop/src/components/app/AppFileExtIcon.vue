<template>
  <img
    v-if="iconData[ext as IconKeys]"
    :src="`/vscode-icons/file_type_${iconData[ext as IconKeys]}.svg`"
  />
  <slot v-else />
</template>
<script setup lang="ts">
import iconData from '@snippy/shared/data/vscode-icons-metadata.json';

defineProps<{
  ext: string;
}>();

type IconKeys = keyof typeof iconData;
</script>

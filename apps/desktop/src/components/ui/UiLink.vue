<template>
  <a @click="handleLink" :href="href">
    <slot />
  </a>
</template>
<script setup lang="ts">
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';
import { openUrl } from '@tauri-apps/plugin-opener';

const props = defineProps<{ href?: string }>();

function handleLink(event: MouseEvent) {
  const url = props.href?.trim();
  if (!url || !url.startsWith('http')) return;

  event.preventDefault();
  openUrl(url).catch((error) => {
    logger.error(getLogMessage('app:open-link', error));
  });
}
</script>

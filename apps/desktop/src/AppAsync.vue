<template>
  <Suspense>
    <App />
  </Suspense>
  <div
    v-if="errorMessage && !appStore.appInitiated"
    class="flex h-screen w-screen flex-col items-center justify-center"
  >
    <div class="max-w-xl">
      <p>An error occured while loading app</p>
      <pre
        class="bg-card text-muted-foreground mt-4 overflow-auto rounded-md p-4 text-sm"
      >
        {{ errorMessage }}
      </pre>
      <Button as-child>
        <UiLink
          class="mt-8"
          href="https://github.com/Kholid060/snippy/issues/new/choose"
        >
          Report issue
        </UiLink>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@snippy/ui';
import App from './App.vue';
import UiLink from './components/ui/UiLink.vue';
import { logger } from './services/logger.service';
import { getLogMessage } from './utils/helper';
import { useAppStore } from './stores/app.store';

const appStore = useAppStore();

const errorMessage = shallowRef('');

onErrorCaptured((error) => {
  errorMessage.value = error.stack ? error.stack : error.message;
  logger.error(getLogMessage('app', error) + '\n' + error.stack);
});
</script>

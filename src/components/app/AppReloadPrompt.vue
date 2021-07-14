<template>
  <div
    v-if="needRefresh"
    class="
      absolute
      p-5
      absolute
      z-50
      bottom-0
      right-0
      bg-gray-700
      m-5
      max-w-xs
      shadow-xl
      rounded-xl
    "
  >
    <p class="leading-tight">New content available, click on reload button to update.</p>
    <div class="space-x-2 flex mt-4">
      <button-ui class="w-64" @click="needRefresh = false">Close</button-ui>
      <button-ui variant="primary" class="w-64" @click="updateServiceWorker">Reload</button-ui>
    </div>
  </div>
</template>
<script>
import { useRegisterSW } from 'virtual:pwa-register/vue';

export default {
  setup() {
    const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW();

    function close() {
      offlineReady.value = false;
      needRefresh.value = false;
    }

    return {
      needRefresh,
      offlineReady,
      updateServiceWorker,
    };
  },
};
</script>

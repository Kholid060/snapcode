<template>
  <Suspense>
    <App />
  </Suspense>
</template>

<script setup lang="ts">
import App from './App.vue';

onErrorCaptured(console.error);
</script>

<template>
  <main class="flex h-screen">
    <EditorSidebar />
    <div class="flex-1">
      <RouterView />
    </div>
  </main>
</template>
<script setup lang="ts">
import EditorSidebar from '@/components/editor/EditorSidebar.vue';
</script>

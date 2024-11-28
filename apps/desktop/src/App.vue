<template>
  <TooltipProvider>
    <main class="flex h-screen">
      <AppSideMenu />
      <EditorView />
    </main>
  </TooltipProvider>
  <Toaster />
</template>

<script setup lang="ts">
import { Toaster, TooltipProvider } from '@snippy/ui';
import EditorView from './components/editor/EditorView.vue';
import AppSideMenu from './components/app/AppSideMenu.vue';
</script>

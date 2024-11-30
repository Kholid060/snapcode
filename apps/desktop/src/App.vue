<template>
  <AppDialogProvider>
    <TooltipProvider>
      <main class="flex h-screen">
        <AppSideMenu />
        <EditorView />
      </main>
    </TooltipProvider>
  </AppDialogProvider>
  <Toaster />
</template>

<script setup lang="ts">
import { Toaster, TooltipProvider } from '@snippy/ui';
import EditorView from './components/editor/EditorView.vue';
import AppSideMenu from './components/app/AppSideMenu.vue';
import AppDialogProvider from './components/app/AppDialogProvider.vue';
</script>

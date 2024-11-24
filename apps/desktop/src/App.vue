<template>
  <TooltipProvider>
    <EditorView />
  </TooltipProvider>
  <Toaster />
</template>

<script setup lang="ts">
import { Toaster, TooltipProvider } from '@snippy/ui';
import EditorView from './components/editor/EditorView.vue';
</script>

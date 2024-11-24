<script setup lang="ts">
import { Button } from '@snippy/ui';
import { SearchIcon } from 'lucide-vue-next';
</script>

<template>
  <aside class="border-r w-64 bg-olive-2">
    <div class="h-14 flex items-center px-4 border-b gap-2">
      <Button class="grow">
        Add snippet
      </Button>
      <Button
        size="icon"
        variant="secondary"
      >
        <SearchIcon class="size-5" />
      </Button>
    </div>
  </aside>
</template>

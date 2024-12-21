<template>
  <CollapsibleRoot v-if="item.contents.length" v-model:open="open">
    <div class="flex items-center gap-1">
      <button @click.stop="open = !open">
        <ArrowRight01Icon
          :class="[
            'text-muted-foreground size-4 transition-transform',
            open ? 'rotate-90' : '',
          ]"
        />
      </button>
      <slot />
    </div>
    <CollapsibleContent
      as="ul"
      class="text-muted-foreground CollapsibleContent mt-1 divide-y border-t pl-5 text-xs"
    >
      <li
        v-for="content in item.contents"
        :key="content[0]"
        class="line-clamp-5 whitespace-pre-wrap py-1 leading-tight"
        v-html="sanitizeSnippetHTML(content[1].trim())"
      ></li>
    </CollapsibleContent>
  </CollapsibleRoot>
  <slot v-else />
</template>
<script lang="ts" setup>
import { sanitizeSnippetHTML } from '@/utils/snippet-utils';
import type { DocumentSearchEntry } from '@/interface/document.interface';
import { CollapsibleContent, CollapsibleRoot } from 'radix-vue';
import { ArrowRight01Icon } from 'hugeicons-vue';

defineProps<{
  item: DocumentSearchEntry;
}>();

const open = shallowRef(true);
</script>
<style>
.CollapsibleContent {
  overflow: hidden;
}
.CollapsibleContent[data-state='open'] {
  animation: slideDown 150ms ease-out;
}
.CollapsibleContent[data-state='closed'] {
  animation: slideUp 150ms ease-out;
}

@keyframes slideDown {
  from {
    height: 0;
  }
  to {
    height: var(--radix-collapsible-content-height);
  }
}

@keyframes slideUp {
  from {
    height: var(--radix-collapsible-content-height);
  }
  to {
    height: 0;
  }
}
</style>

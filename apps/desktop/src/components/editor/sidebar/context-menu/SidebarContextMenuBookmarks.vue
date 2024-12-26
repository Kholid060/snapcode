<template>
  <ContextMenuContent class="context-menu-content min-w-40">
    <ContextMenuItem
      class="text-destructive-text focus:text-destructive-text"
      @click="removeFromBookmark"
    >
      <DeleteIcon class="mr-2 size-4" />
      Remove
    </ContextMenuItem>
  </ContextMenuContent>
</template>
<script setup lang="ts">
import type { EditorSidebarBookmarksCtxMenu } from '@/interface/editor.interface';
import { logger } from '@/services/logger.service';
import { useBookmarksStore } from '@/stores/bookmarks.store';
import { getLogMessage } from '@/utils/helper';
import { ContextMenuItem, ContextMenuContent, useToast } from '@snippy/ui';
import { Delete02Icon as DeleteIcon } from 'hugeicons-vue';

const props = defineProps<{
  ctxData: EditorSidebarBookmarksCtxMenu['data'];
}>();

const { toast } = useToast();
const bookmarksStore = useBookmarksStore();

async function removeFromBookmark() {
  try {
    const removeItems: string[] = props.ctxData.isTopOfSelected
      ? props.ctxData.selectedItems
      : [props.ctxData.path];
    if (removeItems.length < 1) return;

    await bookmarksStore.removeBookmarks(removeItems);
  } catch (error) {
    logger.error(getLogMessage('sidebar-remove-bookmark-ctx-menu', error));
    toast({
      variant: 'destructive',
      title: 'Error updating bookmark',
    });
  }
}
</script>
<style>
.context-menu-content {
  animation: none !important;
}
</style>

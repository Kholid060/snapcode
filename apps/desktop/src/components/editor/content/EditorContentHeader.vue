<template>
  <div
    class="relative flex h-14 items-center border-b px-4 pr-36"
    data-tauri-drag-region
  >
    <TooltipSimple
      :label="editorStore.state.state.showSidebar ? 'Collapse' : 'Expand'"
    >
      <Button
        size="icon"
        @click="
          editorStore.state.updateState(
            'showSidebar',
            !editorStore.state.state.showSidebar,
          )
        "
        class="text-muted-foreground"
        variant="ghost"
      >
        <component
          :is="
            editorStore.state.state.showSidebar
              ? SidebarLeft01Icon
              : SidebarRight01Icon
          "
          class="size-5"
        />
      </Button>
    </TooltipSimple>
    <template v-if="editorStore.activeSnippet">
      <div class="pointer-events-none ml-2 grow overflow-hidden">
        <p
          v-text="editorStore.activeSnippet.name"
          placeholder="Snippet name"
          class="hover:bg-secondary focus:bg-secondary pointer-events-auto line-clamp-2 inline-block max-w-full truncate rounded px-1 py-0.5 align-sub transition focus:outline-none"
          @click="updateSnippetName"
        />
      </div>
      <TooltipSimple
        :label="isBookmarked ? 'Remove from bookmark' : 'Add to bookmark'"
      >
        <Button
          variant="secondary"
          size="icon"
          class="ml-4 flex-shrink-0"
          :class="{ 'text-primary bg-primary/10': isBookmarked }"
          @click="
            bookmarksStore.setBookmark(
              {
                path: editorStore.activePath,
                type: editorStore.activeSnippet.isDir ? 'folder' : 'file',
              },
              !isBookmarked,
            )
          "
        >
          <component
            :is="isBookmarked ? Bookmark02Icon : BookmarkAdd02Icon"
            :fill="isBookmarked ? 'currentColor' : 'none'"
            class="size-5"
          />
        </Button>
      </TooltipSimple>
      <span class="bg-border ml-4 h-3/5 w-px" />
    </template>
  </div>
</template>
<script setup lang="ts">
import { useAppDialog } from '@/providers/app-dialog.provider';
import { logger } from '@/services/logger.service';
import { useBookmarksStore } from '@/stores/bookmarks.store';
import { useEditorStore } from '@/stores/editor.store';
import { sanitizeDocumentFileName } from '@/utils/document-utils';
import { getLogMessage } from '@/utils/helper';
import { Button, TooltipSimple, useToast } from '@snippy/ui';
import {
  Bookmark02Icon,
  BookmarkAdd02Icon,
  SidebarLeft01Icon,
  SidebarRight01Icon,
} from 'hugeicons-vue';

const { toast } = useToast();
const appDialog = useAppDialog();
const editorStore = useEditorStore();
const bookmarksStore = useBookmarksStore();

const isBookmarked = computed(() => {
  if (!editorStore.state.state.activeFileId) return false;

  return bookmarksStore.isBookmarked(editorStore.state.state.activeFileId);
});

async function updateSnippetName() {
  if (!editorStore.activeSnippet) return;

  try {
    const { name, id } = editorStore.activeSnippet;
    const newName = await appDialog.prompt({
      defaultValue: name,
      okBtnLabel: 'Rename',
      title: 'Rename snippet',
    });
    if (newName.canceled) return;

    const sanitizedNewName =
      sanitizeDocumentFileName(newName.value) || 'unnamed.txt';
    if (name === sanitizedNewName) return;

    await editorStore.document.rename({
      id,
      newName: sanitizedNewName,
    });
  } catch (error) {
    logger.error(getLogMessage('rename-snippet', error));
    toast({
      variant: 'destructive',
      title: 'An error occured',
      description: typeof error === 'string' ? error : (error as Error).message,
    });
  }
}
</script>

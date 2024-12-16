<template>
  <ContextMenuContent
    v-if="ctxData.isTopOfSelected"
    class="context-menu-content min-w-40"
  >
    <ContextMenuItem
      class="text-destructive-text focus:text-destructive-text"
      @click="sidebarProvider.deleteSelectedItems"
    >
      <DeleteIcon class="mr-2 size-4" />
      Delete
    </ContextMenuItem>
  </ContextMenuContent>
  <ContextMenuContent v-else class="context-menu-content min-w-40">
    <template v-if="ctxData.type === 'snippet'">
      <ContextMenuItem @click="renameItem">
        <PencilEditIcon class="mr-2 size-4" />
        Rename
      </ContextMenuItem>
      <ContextMenuItem @click="toggleBookmark">
        <component
          :is="isBookmarked ? Bookmark02Icon : BookmarkAdd02Icon"
          class="mr-2 size-4"
          :class="isBookmarked && 'fill-current'"
        />
        {{ isBookmarked ? 'Remove from bookmark' : 'Add to bookmark' }}
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        class="text-destructive-text focus:text-destructive-text"
        @click="deleteItem"
      >
        <DeleteIcon class="mr-2 size-4" />
        Delete
      </ContextMenuItem>
    </template>
    <template v-else>
      <ContextMenuItem @click="createFolderSnippet">
        <FileAddIcon class="mr-2 size-4" />
        New snippet
      </ContextMenuItem>
      <ContextMenuItem @click="createFolderFolder">
        <FolderAddIcon class="mr-2 size-4" />
        New folder
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem @click="renameItem">
        <PencilEditIcon class="mr-2 size-4" />
        Rename
      </ContextMenuItem>
      <ContextMenuItem @click="toggleBookmark">
        <component
          :is="isBookmarked ? Bookmark02Icon : BookmarkAdd02Icon"
          class="mr-2 size-4"
          :class="isBookmarked && 'fill-current'"
        />
        {{ isBookmarked ? 'Remove from bookmark' : 'Add to bookmark' }}
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        class="text-destructive-text focus:text-destructive-text"
        @click="deleteItem"
      >
        <DeleteIcon class="mr-2 size-4" />
        Delete
      </ContextMenuItem>
    </template>
  </ContextMenuContent>
</template>
<script setup lang="ts">
import type { EditorSidebarSnippetsCtxMenu } from '@/interface/editor.interface';
import { useAppDialog } from '@/providers/app-dialog.provider';
import { useEditorSidebarProvider } from '@/providers/editor.provider';
import documentService from '@/services/document.service';
import { logger } from '@/services/logger.service';
import { useBookmarksStore } from '@/stores/bookmarks.store';
import { useEditorStore } from '@/stores/editor.store';
import {
  joinDocumentPath,
  sanitizeDocumentFileName,
} from '@/utils/document-utils';
import { getLogMessage } from '@/utils/helper';
import {
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuContent,
  useToast,
} from '@snippy/ui';
import {
  FileAddIcon,
  FolderAddIcon,
  Bookmark02Icon,
  BookmarkAdd02Icon,
  Delete02Icon as DeleteIcon,
  PencilEdit01Icon as PencilEditIcon,
} from 'hugeicons-vue';

const props = defineProps<{
  ctxData: EditorSidebarSnippetsCtxMenu['data'];
}>();

const { toast } = useToast();
const appDialog = useAppDialog();
const editorStore = useEditorStore();
const bookmarksStore = useBookmarksStore();
const sidebarProvider = useEditorSidebarProvider();

const itemData = computed(() => {
  console.log(props.ctxData);
  return {};
});
const isBookmarked = computed(() =>
  bookmarksStore.isBookmarked(props.ctxData.path),
);

async function createFolderSnippet() {
  try {
    if (props.ctxData.type !== 'folder') return;
    await editorStore.document.addSnippets([
      {
        contents: '',
        path: joinDocumentPath(props.ctxData.path, 'unnamed.txt'),
      },
    ]);
  } catch (error) {
    logger.error(getLogMessage('sidebar-create-snip-ctx-menu', error));
    toast({
      variant: 'destructive',
      title: `Error adding snippet`,
    });
  }
}
async function createFolderFolder() {
  try {
    if (props.ctxData.type !== 'folder') return;

    await editorStore.document.addFolders([
      { path: joinDocumentPath(props.ctxData.path, 'unnamed') },
    ]);
  } catch (error) {
    console.error(error);
    logger.error(getLogMessage('sidebar-create-folder-ctx-menu', error));
    toast({
      variant: 'destructive',
      title: `Error adding folder`,
    });
  }
}

async function renameItem() {
  try {
    if (!itemData.value) return;

    const result = await appDialog.prompt({
      defaultValue: props.ctxData.name,
      okBtnLabel: 'Rename',
      placeholder: props.ctxData.type === 'folder' ? 'unnamed' : 'unnamed.txt',
      title:
        props.ctxData.type === 'folder' ? 'Rename folder' : 'Rename snippet',
    });
    if (result.canceled) return;

    const sanitizedNamed =
      sanitizeDocumentFileName(result.value) || 'unnamed.txt';
    if (sanitizedNamed === props.ctxData.name) return;

    await editorStore.document.rename({
      path: props.ctxData.path,
      newName: sanitizedNamed,
    });
  } catch (error) {
    console.error(error);
    logger.error(getLogMessage('sidebar-rename-ctx-menu', error));
    toast({
      variant: 'destructive',
      title: 'An error occured',
      description: typeof error === 'string' ? error : (error as Error).message,
    });
  }
}
async function toggleBookmark() {
  if (!itemData.value) return;

  try {
    bookmarksStore.setBookmark(
      {
        path: props.ctxData.path,
        type: props.ctxData.type === 'folder' ? 'folder' : 'file',
      },
      !isBookmarked.value,
    );
  } catch (error) {
    console.error(error);
    logger.error(getLogMessage('sidebar-bookmark-ctx-menu', error));
    toast({
      variant: 'destructive',
      title: `Error updating bookmark`,
    });
  }
}
async function deleteItem() {
  try {
    const dontShowDialog =
      await documentService.stores.settings.xGet('noPromptDelete');
    let dontAskPrompt = false;

    if (!dontShowDialog) {
      const { isConfirmed, dontAskValue } = await appDialog.confirm({
        title:
          props.ctxData.type === 'folder'
            ? 'Delete folder?'
            : 'Delete snippet?',
        body: `Are you sure you want to delete "${props.ctxData.name ?? ''}"? This will be permanently deleted and it cannot be undone.`,
        okBtnLabel: 'Delete',
        okBtnVariant: 'destructive',
        showDontAsk: true,
      });
      if (!isConfirmed) return;

      dontAskPrompt = dontAskValue;
    }

    await editorStore.document.deleteItems([props.ctxData.path]);
    if (dontAskPrompt) {
      await documentService.stores.settings.xSet('noPromptDelete', true);
    }
  } catch (error) {
    logger.error(getLogMessage('sidebar-delete-ctx-menu', error));
    toast({
      variant: 'destructive',
      title: `Error deleting ${props.ctxData.type}`,
    });
  }
}
</script>
<style>
.context-menu-content {
  animation: none !important;
}
</style>

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
    <template v-if="ctxData.type === 'folder'">
      <ContextMenuItem @click="createFolderSnippet">
        <FileAddIcon class="mr-2 size-4" />
        New snippet
      </ContextMenuItem>
      <ContextMenuItem @click="createFolderFolder">
        <FolderAddIcon class="mr-2 size-4" />
        New folder
      </ContextMenuItem>
      <ContextMenuSeparator />
    </template>
    <ContextMenuItem @click="renameItem">
      <PencilEditIcon class="mr-2 size-4" />
      Rename
    </ContextMenuItem>
    <ContextMenuItem
      v-if="ctxData.type === 'snippet'"
      @click="copySnippetContent"
    >
      <Copy01Icon class="mr-2 size-4" />
      Copy content
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
    <ContextMenuItem v-if="ctxData.type === 'snippet'" @click="makeSnippetCopy">
      <File01Icon class="mr-2 size-4" />
      Make a copy
    </ContextMenuItem>
    <ContextMenuItem @click="moveItemFolder">
      <FolderTransferIcon class="mr-2 size-4" />
      Move {{ ctxData.type === 'folder' ? 'folder' : 'snippet' }}
    </ContextMenuItem>
    <ContextMenuItem @click="showInExplorer">
      <ExternalDriveIcon class="mr-2 size-4" />
      Show in system explorer
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem
      class="text-destructive-text focus:text-destructive-text"
      @click="deleteItem"
    >
      <DeleteIcon class="mr-2 size-4" />
      Delete
    </ContextMenuItem>
  </ContextMenuContent>
</template>
<script setup lang="ts">
import type { EditorSidebarSnippetsCtxMenu } from '@/interface/editor.interface';
import { useAppDialog } from '@/providers/app-dialog.provider';
import { useEditorSidebarProvider } from '@/providers/editor.provider';
import { appCommand } from '@/services/app-command.service';
import documentService from '@/services/document.service';
import { logger } from '@/services/logger.service';
import { useAppStore } from '@/stores/app.store';
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
  ExternalDriveIcon,
  FolderTransferIcon,
  Delete02Icon as DeleteIcon,
  PencilEdit01Icon as PencilEditIcon,
  Copy01Icon,
  File01Icon,
} from 'hugeicons-vue';

const props = defineProps<{
  ctxData: EditorSidebarSnippetsCtxMenu['data'];
}>();

const { toast } = useToast();
const appStore = useAppStore();
const appDialog = useAppDialog();
const editorStore = useEditorStore();
const bookmarksStore = useBookmarksStore();
const sidebarProvider = useEditorSidebarProvider();

const metadata = computed(
  () => editorStore.document.treeMetadata[props.ctxData.item.id],
);
const isBookmarked = computed(() => {
  return metadata.value
    ? bookmarksStore.isBookmarked(metadata.value.path)
    : false;
});

async function moveItemFolder() {
  try {
    const selectedFolder = await appDialog.selectData({
      type: 'folder',
      title: `Select folder where to move the ${props.ctxData.type === 'folder' ? 'folder' : 'snippet'}`,
    });
    if (
      selectedFolder.canceled ||
      (props.ctxData.item.isDir &&
        props.ctxData.item.id === selectedFolder.data.id)
    )
      return;

    await editorStore.document.moveItem({
      id: props.ctxData.item.id,
      newParentId: selectedFolder.data.id,
      oldParentId: props.ctxData.item.parentId,
    });
  } catch (error) {
    logger.error(getLogMessage('ctx-menu-move-item', error));
  }
}
function showInExplorer() {
  appCommand.invoke('show_item_in_folder', { path: metadata.value.path });
}
async function createFolderSnippet() {
  try {
    if (props.ctxData.type !== 'folder') return;
    await editorStore.document.addSnippets([
      {
        contents: '',
        metadata: {
          parentId: props.ctxData.item.id,
        },
        path: joinDocumentPath(metadata.value.path, 'unnamed.txt'),
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
      {
        path: joinDocumentPath(metadata.value.path, 'unnamed'),
        metadata: {
          parentId: props.ctxData.item.id,
        },
      },
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
async function makeSnippetCopy() {
  try {
    const metadata = editorStore.document.getItemMetadata(
      props.ctxData.item.id,
    );
    if (!metadata || metadata.isDir) return;

    await editorStore.document.duplicateSnippet(metadata.path);
  } catch (error) {
    logger.error(getLogMessage('duplicate-snippet', error));
    toast({
      variant: 'destructive',
      title: 'An error occured',
      description: typeof error === 'string' ? error : '',
    });
  }
}
async function renameItem() {
  try {
    const result = await appDialog.prompt({
      defaultValue: metadata.value.name,
      okBtnLabel: 'Rename',
      placeholder: props.ctxData.type === 'folder' ? 'unnamed' : 'unnamed.txt',
      title:
        props.ctxData.type === 'folder' ? 'Rename folder' : 'Rename snippet',
    });
    if (result.canceled) return;

    const sanitizedNamed =
      sanitizeDocumentFileName(result.value) || 'unnamed.txt';
    if (sanitizedNamed === metadata.value.name) return;

    await editorStore.document.rename({
      newName: sanitizedNamed,
      id: props.ctxData.item.id,
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
  try {
    await bookmarksStore.setBookmark(
      {
        path: metadata.value.path,
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
      description: typeof error === 'string' ? error : '',
    });
  }
}
async function deleteItem() {
  try {
    const dontShowDialog =
      await documentService.stores.settings.xGet('noPromptDelete');
    let dontAskPrompt = false;

    if (!dontShowDialog) {
      const bodyMessage = appStore.settings.deleteToTrash
        ? ''
        : 'This will be permanently deleted and it cannot be undone';
      const { isConfirmed, dontAskValue } = await appDialog.confirm({
        title:
          props.ctxData.type === 'folder'
            ? 'Delete folder?'
            : 'Delete snippet?',
        body: `Are you sure you want to delete "${metadata.value.name ?? ''}"? ${bodyMessage}.`,
        okBtnLabel: 'Delete',
        okBtnVariant: 'destructive',
        showDontAsk: true,
      });
      if (!isConfirmed) return;

      dontAskPrompt = dontAskValue;
    }

    await editorStore.document.deleteItems([props.ctxData.item]);
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
async function copySnippetContent() {
  try {
    await appCommand.invoke('send_snippet_content', {
      action: 'copy',
      placeholders: [],
      plaholdersValue: {},
      path: metadata.value.path,
    });
    toast({
      title: 'Content copied',
    });
  } catch (error) {
    logger.error(getLogMessage('copy-snippet-content', error));
    toast({
      variant: 'destructive',
      title: `Error updating bookmark`,
      description: typeof error === 'string' ? error : '',
    });
  }
}
</script>
<style>
.context-menu-content {
  animation: none !important;
}
</style>

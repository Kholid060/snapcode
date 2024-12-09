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
          :is="itemData?.isBookmark ? Bookmark02Icon : BookmarkAdd02Icon"
          class="mr-2 size-4"
        />
        {{ itemData?.isBookmark ? 'Remove from bookmark' : 'Add to bookmark' }}
      </ContextMenuItem>
      <ContextMenuItem @click="exportSnippet">
        <FileUploadIcon class="mr-2 size-4" />
        Export as file
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
          :is="itemData?.isBookmark ? Bookmark02Icon : BookmarkAdd02Icon"
          class="mr-2 size-4"
        />
        {{ itemData?.isBookmark ? 'Remove from bookmark' : 'Add to bookmark' }}
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
import { logger } from '@/services/logger.service';
import { store, STORE_KEYS } from '@/services/store.service';
import { useEditorStore } from '@/stores/editor.store';
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
  FileUploadIcon,
} from 'hugeicons-vue';

const props = defineProps<{
  ctxData: EditorSidebarSnippetsCtxMenu['data'];
}>();

const { toast } = useToast();
const appDialog = useAppDialog();
const editorStore = useEditorStore();
const sidebarProvider = useEditorSidebarProvider();

const itemData = computed(() =>
  props.ctxData.type === 'snippet'
    ? editorStore.data.snippets[props.ctxData.id]
    : editorStore.data.folders[props.ctxData.id],
);

function exportSnippet() {}
async function createFolderSnippet() {
  try {
    if (props.ctxData.type !== 'folder') return;
    await editorStore.data.addSnippets([{ folderId: props.ctxData.id }]);
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

    await editorStore.data.addFolders([{ parentId: props.ctxData.id }]);
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

    let name = itemData.value.name ?? '';
    if ('ext' in itemData.value) name += `.${itemData.value.ext}`;

    const result = await appDialog.prompt({
      defaultValue: name,
      okBtnLabel: 'Rename',
      placeholder: props.ctxData.type === 'folder' ? 'unnamed' : 'unnamed.txt',
      title:
        props.ctxData.type === 'folder' ? 'Rename folder' : 'Rename snippet',
    });
    if (result.canceled) return;

    await (props.ctxData.type === 'folder'
      ? editorStore.data.updateFolder(props.ctxData.id, {
          name: result.value,
        })
      : editorStore.data.updateSnippet(props.ctxData.id, {
          name: result.value,
        }));
  } catch (error) {
    logger.error(getLogMessage('sidebar-rename-ctx-menu', error));
    toast({
      variant: 'destructive',
      title: `Error rename ${props.ctxData.type}`,
    });
  }
}
async function toggleBookmark() {
  if (!itemData.value) return;

  try {
    await (props.ctxData.type === 'folder'
      ? editorStore.data.updateFolder(props.ctxData.id, {
          isBookmark: !itemData.value.isBookmark,
        })
      : editorStore.data.updateSnippet(props.ctxData.id, {
          isBookmark: !itemData.value.isBookmark,
        }));
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
    const dontShowDialog = await store.get<boolean>(STORE_KEYS.noDeletePrompt);
    let dontAskPrompt = false;

    if (!dontShowDialog) {
      const { isConfirmed, dontAskValue } = await appDialog.confirm({
        title:
          props.ctxData.type === 'folder'
            ? 'Delete folder?'
            : 'Delete snippet?',
        body: `Are you sure you want to delete "${itemData.value?.name ?? ''}"? This will be permanently deleted and it cannot be undone.`,
        okBtnLabel: 'Delete',
        okBtnVariant: 'destructive',
        showDontAsk: true,
      });
      if (!isConfirmed) return;

      dontAskPrompt = dontAskValue;
    }

    await (props.ctxData.type === 'folder'
      ? editorStore.data.deleteFolder(props.ctxData.id)
      : editorStore.data.deleteSnippet(props.ctxData.id));

    if (dontAskPrompt) {
      await store.set(STORE_KEYS.noDeletePrompt, true);
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

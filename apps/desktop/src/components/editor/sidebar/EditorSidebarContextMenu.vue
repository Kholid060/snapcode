<template>
  <ContextMenu>
    <ContextMenuTrigger as-child>
      <slot />
    </ContextMenuTrigger>
    <ContextMenuContent class="context-menu-content min-w-40">
      <template v-if="itemType === 'snippet'">
        <ContextMenuItem @click="renameItem">
          <PencilEditIcon class="mr-2 size-4" />
          Rename
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
  </ContextMenu>
</template>
<script setup lang="ts">
import { useAppDialog } from '@/providers/app-dialog.provider';
import { logger } from '@/services/logger.service';
import { store, STORE_KEYS } from '@/services/store.service';
import { useEditorStore } from '@/stores/editor.store';
import { getLogMessage } from '@/utils/helper';
import {
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  useToast,
} from '@snippy/ui';
import {
  FileAddIcon,
  FolderAddIcon,
  Delete02Icon as DeleteIcon,
  PencilEdit01Icon as PencilEditIcon,
} from 'hugeicons-vue';

const props = defineProps<{
  itemId: string;
  itemType: 'snippet' | 'folder';
}>();

const { toast } = useToast();
const appDialog = useAppDialog();
const editorStore = useEditorStore();

function getData() {
  return props.itemType === 'snippet'
    ? editorStore.data.snippets[props.itemId]
    : editorStore.data.folders[props.itemId];
}

async function createFolderSnippet() {
  try {
    if (props.itemType !== 'folder') return;
    await editorStore.data.addSnippets([{ folderId: props.itemId }]);
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
    if (props.itemType !== 'folder') return;

    await editorStore.data.addFolder({ parentId: props.itemId });
  } catch (error) {
    logger.error(getLogMessage('sidebar-create-folder-ctx-menu', error));
    toast({
      variant: 'destructive',
      title: `Error adding folder`,
    });
  }
}

async function renameItem() {
  try {
    const data = getData();
    if (!data) return;

    let name = data.name ?? '';
    if ('ext' in data) name += `.${data.ext}`;

    const result = await appDialog.prompt({
      defaultValue: name,
      okBtnLabel: 'Rename',
      placeholder: props.itemType === 'folder' ? 'unnamed' : 'unnamed.txt',
      title: props.itemType === 'folder' ? 'Rename folder' : 'Rename snippet',
    });
    if (result.canceled) return;

    await (props.itemType === 'folder'
      ? editorStore.data.updateFolder(props.itemId, {
          name: result.value,
        })
      : editorStore.data.updateSnippet(props.itemId, {
          name: result.value,
        }));
  } catch (error) {
    logger.error(getLogMessage('sidebar-rename-ctx-menu', error));
    toast({
      variant: 'destructive',
      title: `Error rename ${props.itemType}`,
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
          props.itemType === 'folder' ? 'Delete folder?' : 'Delete snippet?',
        body: `Are you sure you want to delete "${getData()?.name ?? ''}"? This will be permanently deleted and it cannot be undone.`,
        okBtnLabel: 'Delete',
        okBtnVariant: 'destructive',
        showDontAsk: true,
      });
      if (!isConfirmed) return;

      dontAskPrompt = dontAskValue;
    }

    await (props.itemType === 'folder'
      ? editorStore.data.deleteFolder(props.itemId)
      : editorStore.data.deleteSnippet(props.itemId));

    if (dontAskPrompt) {
      await store.set(STORE_KEYS.noDeletePrompt, true);
    }
  } catch (error) {
    logger.error(getLogMessage('sidebar-delete-ctx-menu', error));
    toast({
      variant: 'destructive',
      title: `Error deleting ${props.itemType}`,
    });
  }
}
</script>
<style>
.context-menu-content {
  animation: none !important;
}
</style>

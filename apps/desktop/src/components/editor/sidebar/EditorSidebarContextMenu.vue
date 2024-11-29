<template>
  <ContextMenu>
    <ContextMenuTrigger as-child>
      <slot />
    </ContextMenuTrigger>
    <ContextMenuContent class="context-menu-content min-w-40">
      <template v-if="itemType === 'snippet'">
        <ContextMenuItem @click="startRenameItem">
          <PencilEditIcon class="mr-2 size-4" />
          Rename
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          class="text-destructive-text focus:text-destructive-text"
          @click="deleteItemPrompt"
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
        <ContextMenuItem
          @click="
            renameDialog.newName = getData().name ?? '';
            renameDialog.show = true;
          "
        >
          <PencilEditIcon class="mr-2 size-4" />
          Rename
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          class="text-destructive-text focus:text-destructive-text"
          @click="deleteItemPrompt"
        >
          <DeleteIcon class="mr-2 size-4" />
          Delete
        </ContextMenuItem>
      </template>
    </ContextMenuContent>
  </ContextMenu>
  <AlertDialog v-model:open="deleteDialog.show">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          {{ itemType === 'folder' ? 'Delete folder?' : 'Delete snippet?' }}
        </AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete
          <span class="font-semibold">"{{ getData()?.name ?? '' }}"</span>? This
          will be permanently deleted and it cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter class="mt-4 items-center">
        <Checkbox
          id="dont-ask-prompt"
          v-model:checked="deleteDialog.dontAskPrompt"
        />
        <label
          for="dont-ask-prompt"
          class="text-muted-foreground select-none text-sm"
        >
          Don't ask again
        </label>
        <div class="grow"></div>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" @click="deleteItem">
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  <Dialog v-model:open="renameDialog.show">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>
          {{ itemType === 'folder' ? 'Rename folder' : 'Rename snippet' }}
        </DialogTitle>
      </DialogHeader>
      <form @submit.prevent="renameItem">
        <Input
          :placeholder="itemType === 'folder' ? 'unnamed' : 'unnamed.txt'"
          v-model="renameDialog.newName"
        />
        <DialogFooter class="mt-6">
          <Button type="submit">Rename</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
<script setup lang="ts">
import { logger } from '@/services/logger.service';
import { store, STORE_KEYS } from '@/services/store.service';
import { useEditorStore } from '@/stores/editor.store';
import { getLogMessage } from '@/utils/helper';
import {
  ContextMenuItem,
  ContextMenuSeparator,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  DialogHeader,
  AlertDialogTitle,
  AlertDialog,
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Checkbox,
  AlertDialogCancel,
  AlertDialogAction,
  useToast,
  Dialog,
  DialogContent,
  DialogTitle,
  Input,
  DialogFooter,
  Button,
  AlertDialogHeader,
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
const editorStore = useEditorStore();

const deleteDialog = shallowReactive({
  show: false,
  dontAskPrompt: false,
});
const renameDialog = shallowReactive({
  show: false,
  newName: '',
});

function getData() {
  return props.itemType === 'snippet'
    ? editorStore.data.snippets[props.itemId]
    : editorStore.data.folders[props.itemId];
}

async function createFolderSnippet() {
  try {
    if (props.itemType !== 'folder') return;
    await editorStore.data.addSnippets({ folderId: props.itemId });
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
    await (props.itemType === 'folder'
      ? editorStore.data.updateFolder(props.itemId, {
          name: renameDialog.newName,
        })
      : editorStore.data.updateSnippet(props.itemId, {
          name: renameDialog.newName,
        }));

    renameDialog.newName = '';
    renameDialog.show = false;
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
    await (props.itemType === 'folder'
      ? editorStore.data.deleteFolder(props.itemId)
      : editorStore.data.deleteSnippet(props.itemId));

    deleteDialog.show = false;

    if (deleteDialog.dontAskPrompt) {
      await store.set(STORE_KEYS.noDeletePrompt, deleteDialog.dontAskPrompt);
    }
  } catch (error) {
    logger.error(getLogMessage('sidebar-delete-ctx-menu', error));
    toast({
      variant: 'destructive',
      title: `Error deleting ${props.itemType}`,
    });
  }
}
async function deleteItemPrompt() {
  const dontShowDialog = await store.get<boolean>(STORE_KEYS.noDeletePrompt);
  if (!dontShowDialog) {
    deleteDialog.show = true;
    return;
  }

  deleteItem();
}
function startRenameItem() {
  const data = getData();
  if (!data) return;

  let name = data.name ?? '';
  if ('ext' in data) name += `.${data.ext}`;

  renameDialog.newName = name;
  renameDialog.show = true;
}
</script>
<style>
.context-menu-content {
  animation: none !important;
}
</style>

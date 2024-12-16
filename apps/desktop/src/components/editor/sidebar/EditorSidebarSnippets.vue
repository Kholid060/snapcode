<template>
  <div class="flex items-center p-4 pb-0">
    <p class="text-muted-foreground grow cursor-default text-sm font-semibold">
      Snippets
    </p>
    <TooltipSimple label="Add snippet">
      <EditorSidebarIconButton
        aria-label="New snippet"
        @click="createNewSnippet()"
      >
        <FileAddIcon class="size-[18px]" />
      </EditorSidebarIconButton>
    </TooltipSimple>
    <TooltipSimple label="Add folder">
      <EditorSidebarIconButton @click="createNewFolder" class="ml-0.5">
        <FolderAddIcon class="size-[18px]" />
      </EditorSidebarIconButton>
    </TooltipSimple>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <EditorSidebarIconButton class="ml-0.5">
          <MoreHorizontalCircle01Icon class="size-[18px]" />
        </EditorSidebarIconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem @click="showGitHubGistsDialog = true">
          <img src="@/assets/svg/github-mark-white.svg" class="size-4" />
          Import GitHub gists
        </DropdownMenuItem>
        <DropdownMenuItem @click="importSnippetFromFiles">
          <File01Icon />
          Import from file
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
  <EditorTreeRoot
    v-model="selectedItems"
    ref="tree-root"
    :items="editorStore.document.treeData.__root"
    :get-children="getChildren"
    @item:context-menu="
      sidebarProvider.handleContextMenu({
        data: {
          name: $event.item.value.name,
          path: $event.item.value.path,
          type: $event.item.value.isDir ? 'folder' : 'snippet',
          isTopOfSelected:
            selectedItems.length > 1 &&
            selectedItems.includes($event.item.value),
        },
        type: 'snippets',
        event: $event.event,
      })
    "
    class="mt-2 grow overflow-auto px-2 pb-4 pt-1"
  />
  <Dialog v-model:open="showGitHubGistsDialog">
    <DialogContent class="block space-y-0 p-0">
      <EditorSidebarGitHubGists @close="showGitHubGistsDialog = false" />
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  TooltipSimple,
  DropdownMenuTrigger,
  useToast,
  Dialog,
  DialogContent,
} from '@snippy/ui';
import EditorSidebarIconButton from './EditorSidebarIconButton.vue';
import { useEditorStore } from '@/stores/editor.store';
import { logger } from '@/services/logger.service';
import EditorTreeRoot from '../tree/EditorTreeRoot.vue';
import {
  FileAddIcon,
  FolderAddIcon,
  File01Icon,
  MoreHorizontalCircle01Icon,
} from 'hugeicons-vue';
import { useHotkey } from '@/composables/hotkey.composable';
import { formatLogMessage, getLogMessage } from '@/utils/helper';
import { useAppDialog } from '@/providers/app-dialog.provider';
import { useEditorSidebarProvider } from '@/providers/editor.provider';
import { appCommand } from '@/services/app-command.service';
import EditorSidebarGitHubGists from './EditorSidebarGitHubGists.vue';
import type { DocumentFlatTreeItem } from '@/interface/document.interface';

const { toast } = useToast();
const appDialog = useAppDialog();
const editorStore = useEditorStore();
const sidebarProvider = useEditorSidebarProvider();

const treeRootRef = useTemplateRef<HTMLElement>('tree-root');

const isHidden = shallowRef(false);
const showGitHubGistsDialog = shallowRef(false);

const selectedItems = computed({
  get() {
    return sidebarProvider.selectedItems.value;
  },
  set(value) {
    sidebarProvider.selectedItems.value = value;
  },
});

function getChildren(item: DocumentFlatTreeItem) {
  return item.isDir
    ? (editorStore.document.treeData[item.path] ?? [])
    : undefined;
}
async function createNewSnippet() {
  try {
    await editorStore.document.addSnippets([
      { contents: '', path: 'unnamed.txt', stored: { lang: 'txt' } },
    ]);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      await logger.error(`[create-snippet] ${error.message}`);
    }
    toast({
      variant: 'destructive',
      title: 'Error creating a new snippet',
    });
  }
}
async function createNewFolder() {
  try {
    await editorStore.document.addFolders([{ path: 'unnamed' }]);
  } catch (error) {
    if (error instanceof Error) {
      await logger.error(`[create-folder] ${error.message}`);
    }
    toast({
      variant: 'destructive',
      title: 'Error creating a new folder',
    });
  }
}
async function importSnippetFromFiles() {
  try {
    const dirPath = await appDialog.selectFolder({
      title: 'Select a folder where to put the snippets',
    });
    if (dirPath.canceled) return;

    const snippets = await appCommand.invoke('import_snippet_from_file', {
      dirPath: dirPath.path ?? '',
    });
    if (snippets.length === 0) return;

    editorStore.document.registerItems({ snippets });

    toast({
      title: `${snippets.length} files imported into "${dirPath.path || 'root'}" folder`,
    });
  } catch (error) {
    const message = getLogMessage(error);
    toast({
      description: message,
      variant: 'destructive',
      title: 'An error occured',
    });
    logger.error(formatLogMessage('import-snippet-from-file', message));
  }
}

useHotkey(['newSnippet', 'newFolder'], (_, handler) => {
  switch (handler.hotkeyId) {
    case 'newSnippet':
      createNewSnippet();
      break;
    case 'newFolder':
      createNewFolder();
      break;
  }
});
useHotkey(
  {
    key: 'delete',
    element: treeRootRef,
  },
  () => {
    if (isHidden.value) return;
    sidebarProvider.deleteSelectedItems();
  },
);

onActivated(() => {
  isHidden.value = false;
});
onDeactivated(() => {
  isHidden.value = true;
});
</script>

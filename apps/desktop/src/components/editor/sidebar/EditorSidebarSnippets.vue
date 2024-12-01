<template>
  <div class="flex items-center p-4 pb-1">
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
        <DropdownMenuItem>
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
  <EditorTreeRoot class="custom-scroll grow overflow-auto px-2 pb-4 pt-2" />
</template>

<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  TooltipSimple,
  DropdownMenuTrigger,
  useToast,
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
import { APP_DEFAULT_HOTKEY } from '@/utils/const/app.const';
import SnippetCommands from '@/services/commands/SnippetCommands';
import { getLogMessage } from '@/utils/helper';
import { useAppDialog } from '@/providers/app-dialog.provider';

defineProps<{
  hide?: boolean;
}>();

const { toast } = useToast();
const appDialog = useAppDialog();
const editorStore = useEditorStore();

async function createNewSnippet() {
  try {
    await editorStore.data.addSnippets([{}]);
  } catch (error) {
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
    await editorStore.data.addFolder();
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
    const files = await SnippetCommands.importSnippetFromFiles();
    if (files.length === 0) return;

    const selectedFolder = await appDialog.selectFolder({
      title: 'Select a folder where to put the snippets',
    });
    if (selectedFolder.canceled) return;

    await editorStore.data.addSnippets(
      files.map((file) => ({
        ext: file.ext,
        name: file.name,
        content: file.content,
        folderId: selectedFolder.folderId,
      })),
    );
  } catch (error) {
    logger.error(getLogMessage('import-snippet-from-file', error));
  }
}

useHotkey(
  [APP_DEFAULT_HOTKEY.newSnippet, APP_DEFAULT_HOTKEY.newFolder],
  (_, handler) => {
    switch (handler.key) {
      case APP_DEFAULT_HOTKEY.newSnippet:
        createNewSnippet();
        break;
      case APP_DEFAULT_HOTKEY.newFolder:
        createNewFolder();
        break;
    }
  },
);
</script>

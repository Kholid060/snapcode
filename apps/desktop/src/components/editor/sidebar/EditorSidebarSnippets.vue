<template>
  <div class="p-4 flex items-center">
    <p class="text-sm font-semibold text-muted-foreground cursor-default grow">
      Snippets
    </p>
    <TooltipSimple label="Add snippet">
      <EditorSidebarIconButton
        aria-label="New snippet"
        @click="createNewSnippet()"
      >
        <FileAddIcon />
      </EditorSidebarIconButton>
    </TooltipSimple>
    <TooltipSimple label="Add folder">
      <EditorSidebarIconButton class="ml-0.5">
        <FolderAddIcon />
      </EditorSidebarIconButton>
    </TooltipSimple>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <EditorSidebarIconButton class="ml-0.5">
          <MoreHorizontalIcon />
        </EditorSidebarIconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <GitHubIcon />
          Import GitHub gists
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FileIcon />
          Import from file
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
  <ul>
    <li
      v-for="snippet in editorStore.data.snippets"
      :key="snippet.id"
    >
      {{ snippet.id }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, TooltipSimple, DropdownMenuTrigger, useToast } from '@snippy/ui';
import FolderAddIcon from '~icons/hugeicons/folder-add';
import FileAddIcon from '~icons/hugeicons/file-add';
import GitHubIcon from '~icons/hugeicons/github';
import FileIcon from '~icons/hugeicons/file-01';
import MoreHorizontalIcon from '~icons/hugeicons/more-horizontal-circle-01';
import EditorSidebarIconButton from './EditorSidebarIconButton.vue';
import { useEditorStore } from '@/stores/editor.store';
import { logger } from '@/services/logger.service';
import { SnippetNewPayload } from '@/interface/snippet.interface';

const { toast } = useToast();
const editorStore = useEditorStore();

async function createNewSnippet({ folderId, name }: Pick<SnippetNewPayload, 'name' | 'folderId'> = {}) {
  try {
    await editorStore.data.addSnippet({ name, folderId });
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

console.log(editorStore);
</script>

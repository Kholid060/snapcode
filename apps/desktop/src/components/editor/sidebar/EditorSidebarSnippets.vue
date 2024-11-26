<template>
  <div v-show="!hide" class="flex items-center p-4 pb-2">
    <p class="text-muted-foreground grow cursor-default text-sm font-semibold">
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
      <EditorSidebarIconButton @click="createNewFolder" class="ml-0.5">
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
  <EditorTreeRoot
    v-show="!hide"
    class="custom-scroll grow overflow-auto px-2 pb-4"
  />
  <EditorSidebarContextMenu
    :item-id="contextMenuItemData.id"
    :item-type="contextMenuItemData.type"
  >
    <button ref="context-menu-trigger" class="hidden"></button>
  </EditorSidebarContextMenu>
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
import FolderAddIcon from '~icons/hugeicons/folder-add';
import FileAddIcon from '~icons/hugeicons/file-add';
import GitHubIcon from '~icons/hugeicons/github';
import FileIcon from '~icons/hugeicons/file-01';
import MoreHorizontalIcon from '~icons/hugeicons/more-horizontal-circle-01';
import EditorSidebarIconButton from './EditorSidebarIconButton.vue';
import { useEditorStore } from '@/stores/editor.store';
import { logger } from '@/services/logger.service';
import EditorTreeRoot from '../tree/EditorTreeRoot.vue';
import type { EditorSidebarDragData } from '@/providers/editor.provider';
import {
  EDITOR_SIDEBAR_PROVIDER_KEY,
  type EditorSidebarContextMenuData,
  type EditorSidebarProvider,
} from '@/providers/editor.provider';
import EditorSidebarContextMenu from './EditorSidebarContextMenu.vue';

defineProps<{
  hide?: boolean;
}>();

const { toast } = useToast();
const editorStore = useEditorStore();

const contextMenuTrigger = useTemplateRef('context-menu-trigger');

const dragData = shallowRef<EditorSidebarDragData | null>(null);
const contextMenuItemData = shallowReactive<{
  id: string;
  type: 'snippet' | 'folder';
}>({
  id: '',
  type: 'folder',
});

async function createNewSnippet() {
  try {
    await editorStore.data.addSnippet();
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
function handleContextMenu({ event, id, type }: EditorSidebarContextMenuData) {
  if (!contextMenuTrigger.value) return;

  contextMenuTrigger.value.dispatchEvent(new PointerEvent(event.type, event));
  Object.assign(contextMenuItemData, { id, type });
}

provide<EditorSidebarProvider>(EDITOR_SIDEBAR_PROVIDER_KEY, {
  dragData,
  handleContextMenu,
  setDragData(data) {
    dragData.value = data;
  },
});
</script>

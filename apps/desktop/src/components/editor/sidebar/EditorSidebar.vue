<template>
  <aside class="bg-olive-2 flex h-screen w-64 flex-col border-r">
    <div
      class="text-muted-foreground relative flex h-14 flex-shrink-0 items-center gap-1 border-b px-4"
    >
      <TooltipSimple v-for="item in items" :key="item.id" :label="item.label">
        <Button
          size="icon"
          :variant="
            editorStore.state.sidebarState.activeMenu === item.id
              ? 'default'
              : 'ghost'
          "
          @click="editorStore.state.setSidebarState('activeMenu', item.id)"
        >
          <component :is="item.icon" class="size-5" />
        </Button>
      </TooltipSimple>
      <Dialog v-model:open="showSettings">
        <TooltipSimple label="Code Images">
          <DialogTrigger>
            <Button size="icon" variant="ghost">
              <WebProgrammingIcon class="size-5" />
            </Button>
          </DialogTrigger>
        </TooltipSimple>
        <DialogContent>
          <p>Settings</p>
        </DialogContent>
      </Dialog>
      <div class="grow"></div>
      <Dialog v-model:open="showSettings">
        <TooltipSimple label="Settings">
          <DialogTrigger>
            <Button size="icon" variant="ghost">
              <Settings01Icon class="size-5" />
            </Button>
          </DialogTrigger>
        </TooltipSimple>
        <DialogContent>
          <p>Settings</p>
        </DialogContent>
      </Dialog>
    </div>
    <EditorSidebarSearch v-if="false" />
    <EditorSidebarSnippets :hide="false" />
    <EditorSidebarContextMenu :ctx-data="contextMenuItemData">
      <button ref="context-menu-trigger" class="hidden"></button>
    </EditorSidebarContextMenu>
  </aside>
</template>
<script setup lang="ts">
import EditorSidebarSnippets from './EditorSidebarSnippets.vue';
import EditorSidebarSearch from './EditorSidebarSearch.vue';
import {
  AllBookmarkIcon,
  FolderFileStorageIcon,
  Search01Icon,
  Settings01Icon,
  WebProgrammingIcon,
} from 'hugeicons-vue';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  TooltipSimple,
  useToast,
} from '@snippy/ui';
import { useHotkey } from '@/composables/hotkey.composable';
import { APP_DEFAULT_HOTKEY } from '@/utils/const/app.const';
import type { EditorSidebarItems } from '@/interface/editor.interface';
import { useEditorStore } from '@/stores/editor.store';
import type {
  EditorSidebarContextMenuData,
  EditorSidebarProvider,
} from '@/providers/editor.provider';
import { EDITOR_SIDEBAR_PROVIDER_KEY } from '@/providers/editor.provider';
import EditorSidebarContextMenu from './EditorSidebarContextMenu.vue';
import type { TreeDataItem } from '@/utils/tree-data-utils';
import { store } from '@/services/store.service';
import { logger } from '@/services/logger.service';
import { useAppDialog } from '@/providers/app-dialog.provider';
import { getLogMessage } from '@/utils/helper';

const items: { icon: Component; id: EditorSidebarItems; label: string }[] = [
  { icon: FolderFileStorageIcon, id: 'snippets', label: 'Snippets' },
  { icon: AllBookmarkIcon, id: 'bookmarks', label: 'Bookmarks' },
  { icon: Search01Icon, id: 'search', label: 'Search' },
];

const contextMenuTrigger = useTemplateRef('context-menu-trigger');

const { toast } = useToast();
const appDialog = useAppDialog();
const editorStore = useEditorStore();

const showSettings = shallowRef(false);
const selectedItems = ref<TreeDataItem[]>([]);

const contextMenuItemData = shallowReactive<
  Omit<EditorSidebarContextMenuData, 'event'>
>({
  id: '',
  type: 'folder',
  isTopOfSelected: false,
});

function handleContextMenu({
  id,
  type,
  event,
  isTopOfSelected,
}: EditorSidebarContextMenuData) {
  if (!contextMenuTrigger.value) return;

  contextMenuTrigger.value.dispatchEvent(new PointerEvent(event.type, event));
  Object.assign(contextMenuItemData, { id, type, isTopOfSelected });
}
async function deleteSelectedItems() {
  try {
    const dontShowDialog = await store.xGet(store.xKeys.noDeletePrompt, false);
    let dontAskPrompt = false;

    if (!dontShowDialog) {
      const { isConfirmed, dontAskValue } = await appDialog.confirm({
        title: 'Delete snippets/folders?',
        body: `Are you sure you want to delete "${selectedItems.value.length} items"? This will be permanently deleted and it cannot be undone.`,
        okBtnLabel: 'Delete',
        okBtnVariant: 'destructive',
        showDontAsk: true,
      });
      if (!isConfirmed) return;

      dontAskPrompt = dontAskValue;
    }

    await editorStore.data.deleteItems(selectedItems.value);
    selectedItems.value = [];

    if (dontAskPrompt) {
      await store.xSet(store.xKeys.noDeletePrompt, true);
    }
  } catch (error) {
    console.error(error);
    logger.error(getLogMessage('sidebar-delete-ctx-menu', error));
    toast({
      variant: 'destructive',
      title: `Error deleting items`,
    });
  }
}

provide<EditorSidebarProvider>(EDITOR_SIDEBAR_PROVIDER_KEY, {
  selectedItems,
  handleContextMenu,
  deleteSelectedItems,
});

useHotkey(
  [
    APP_DEFAULT_HOTKEY.searchMenu,
    APP_DEFAULT_HOTKEY.snippetsMenu,
    APP_DEFAULT_HOTKEY.openSettings,
    APP_DEFAULT_HOTKEY.bookmarksMenu,
  ],
  (_, handler) => {
    switch (handler.key) {
      case APP_DEFAULT_HOTKEY.bookmarksMenu:
        editorStore.state.setSidebarState('activeMenu', 'bookmarks');
        break;
      case APP_DEFAULT_HOTKEY.snippetsMenu:
        editorStore.state.setSidebarState('activeMenu', 'snippets');
        break;
      case APP_DEFAULT_HOTKEY.searchMenu:
        editorStore.state.setSidebarState('activeMenu', 'search');
        break;
      case APP_DEFAULT_HOTKEY.openSettings:
        showSettings.value = true;
        break;
    }
  },
);
</script>

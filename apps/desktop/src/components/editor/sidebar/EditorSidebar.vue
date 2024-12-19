<template>
  <aside class="bg-olive-2 flex h-screen w-64 flex-col border-r">
    <div
      class="text-muted-foreground relative flex h-14 flex-shrink-0 items-center gap-1 border-b px-4"
    >
      <TooltipSimple
        v-for="item in items"
        :key="item.id"
        content-class="capitalize"
        :label="`${item.label} (${hotkeysStore.getLabel(item.hotkey)})`"
      >
        <Button
          size="icon"
          :variant="
            editorStore.state.state.activeMenu === item.id ? 'default' : 'ghost'
          "
          @click="editorStore.state.updateState('activeMenu', item.id)"
        >
          <component :is="item.icon" class="size-5" />
        </Button>
      </TooltipSimple>
      <div class="grow"></div>
      <Dialog v-model:open="showSettings" modal>
        <TooltipSimple
          content-class="capitalize"
          :label="`Settings (${hotkeysStore.getLabel('openSettings')})`"
        >
          <DialogTrigger>
            <Button size="icon" variant="ghost">
              <Settings01Icon class="size-5" />
            </Button>
          </DialogTrigger>
        </TooltipSimple>
        <DialogContent class="block max-w-5xl space-y-0 overflow-auto p-0">
          <EditorSettings />
        </DialogContent>
      </Dialog>
    </div>
    <KeepAlive include="EditorSidebarSnippets,EditorSidebarSearch">
      <component
        :is="sidebarComponentsMap[editorStore.state.state.activeMenu]"
      />
    </KeepAlive>
    <ContextMenu>
      <ContextMenuTrigger as-child>
        <button
          ref="context-menu-trigger"
          class="hidden"
          data-contextmenu
        ></button>
      </ContextMenuTrigger>
      <component
        v-if="ctxMenuData"
        :ctx-data="ctxMenuData.data"
        :is="ctxMenuComps[ctxMenuData.type]"
      />
    </ContextMenu>
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
} from 'hugeicons-vue';
import {
  Button,
  ContextMenu,
  ContextMenuTrigger,
  Dialog,
  DialogContent,
  DialogTrigger,
  TooltipSimple,
  useToast,
} from '@snippy/ui';
import { useHotkey } from '@/composables/hotkey.composable';
import type { AppHotkeys } from '@/utils/const/app.const';
import type {
  EditorSidebarContextMenuItems,
  EditorSidebarItems,
} from '@/interface/editor.interface';
import { useEditorStore } from '@/stores/editor.store';
import type { EditorSidebarProvider } from '@/providers/editor.provider';
import { EDITOR_SIDEBAR_PROVIDER_KEY } from '@/providers/editor.provider';
import { logger } from '@/services/logger.service';
import { useAppDialog } from '@/providers/app-dialog.provider';
import { getLogMessage } from '@/utils/helper';
import EditorSidebarBookmarks from './EditorSidebarBookmarks.vue';
import SidebarContextMenuSnippets from './context-menu/SidebarContextMenuSnippets.vue';
import SidebarContextMenuBookmarks from './context-menu/SidebarContextMenuBookmarks.vue';
import EditorSettings from '../EditorSettings.vue';
import { useHotkeysStore } from '@/stores/hotkeys.store';
import documentService from '@/services/document.service';
import type { DocumentFlatTreeItem } from '@/interface/document.interface';

const items: {
  label: string;
  hotkey: AppHotkeys;
  icon: Component;
  id: EditorSidebarItems;
}[] = [
  {
    id: 'snippets',
    label: 'Snippets',
    hotkey: 'snippetsMenu',
    icon: FolderFileStorageIcon,
  },
  {
    id: 'bookmarks',
    label: 'Bookmarks',
    icon: AllBookmarkIcon,
    hotkey: 'bookmarksMenu',
  },
  {
    id: 'search',
    label: 'Search',
    icon: Search01Icon,
    hotkey: 'searchMenu',
  },
];
const sidebarComponentsMap: Record<EditorSidebarItems, Component> = {
  search: EditorSidebarSearch,
  snippets: EditorSidebarSnippets,
  bookmarks: EditorSidebarBookmarks,
};
const ctxMenuComps: Record<EditorSidebarContextMenuItems['type'], Component> = {
  snippets: SidebarContextMenuSnippets,
  bookmarks: SidebarContextMenuBookmarks,
};

const contextMenuTrigger = useTemplateRef('context-menu-trigger');

const { toast } = useToast();
const appDialog = useAppDialog();
const editorStore = useEditorStore();
const hotkeysStore = useHotkeysStore();

const showSettings = shallowRef(false);
const selectedItems = ref<DocumentFlatTreeItem[]>([]);
const ctxMenuData = shallowRef<EditorSidebarContextMenuItems | null>(null);

function handleContextMenu(data: EditorSidebarContextMenuItems) {
  if (!contextMenuTrigger.value) return;

  contextMenuTrigger.value.dispatchEvent(
    new PointerEvent(data.event.type, data.event),
  );

  ctxMenuData.value = data;
}
async function deleteSelectedItems() {
  try {
    const dontShowDialog = await documentService.stores.settings.xGet(
      'noPromptDelete',
      false,
    );
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

    await editorStore.document.deleteItems(selectedItems.value);
    selectedItems.value = [];

    if (dontAskPrompt) {
      await documentService.stores.settings.xSet('noPromptDelete', true);
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
  setSelectedItems(data) {
    selectedItems.value = data;
  },
});

useHotkey(
  ['searchMenu', 'snippetsMenu', 'openSettings', 'bookmarksMenu'],
  (_, handler) => {
    switch (handler.hotkeyId) {
      case 'bookmarksMenu':
        editorStore.state.updateState('activeMenu', 'bookmarks');
        break;
      case 'snippetsMenu':
        editorStore.state.updateState('activeMenu', 'snippets');
        break;
      case 'searchMenu':
        editorStore.state.updateState('activeMenu', 'search');
        break;
      case 'openSettings':
        showSettings.value = true;
        break;
    }
  },
);
</script>

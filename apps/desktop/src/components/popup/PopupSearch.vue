<template>
  <PopupInputPlaceholder
    v-if="inputSnippet"
    :snippet="inputSnippet"
    @close="inputSnippet = null"
  />
  <AppSearchSnippets
    v-else
    class="popup-search rounded-none"
    @select-item="handleSelectItem"
    @update:selected-value="actionState = { actionIndex: -1, itemId: $event }"
  >
    <template #search="{ search }">
      <div class="search-input relative mt-1.5 flex gap-1.5 px-4 pb-3">
        <ComboboxAnchor class="relative grow">
          <Search01Icon
            class="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2"
          />
          <ComboboxInput
            class="focus:ring-ring focus:ring-offset-background h-9 w-full rounded-md border bg-inherit px-10 text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2"
            ref="search-input"
            placeholder="Search..."
            @keydown="handleInputKeydown"
          />
          <CancelCircleIcon
            v-if="search"
            @click="clearSearch"
            class="text-muted-foreground absolute right-3 top-1/2 size-5 -translate-y-1/2"
          />
        </ComboboxAnchor>
      </div>
    </template>
    <template #item="{ html, item }">
      <div class="flex items-center">
        <p v-html="html" class="grow truncate pr-2"></p>
        <div class="action invisible flex items-center gap-0.5">
          <TooltipSimple
            v-for="(action, index) in itemActions"
            :key="action.id"
            :label="action.label"
            side="bottom"
            align="end"
          >
            <button
              class="hover:bg-secondary hover:text-foreground size-6 flex-shrink-0 content-center rounded-sm text-center transition-colors"
              :id="item.id + index"
              @click.stop="actionHandlerMap[action.id]"
              :class="
                item.id === actionState.itemId &&
                index === actionState.actionIndex
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground'
              "
            >
              <component :is="action.icon" class="inline size-[18px]" />
            </button>
          </TooltipSimple>
        </div>
      </div>
    </template>
  </AppSearchSnippets>
</template>
<script setup lang="ts">
import { unrefElement } from '@vueuse/core';
import AppSearchSnippets from '../app/AppSearchSnippets.vue';
import type {
  SnippetSearchListItem,
  SnippetWithPlaceholder,
} from '@/interface/snippet.interface';
import { ComboboxAnchor, ComboboxInput } from 'radix-vue';
import { appCommand } from '@/services/app-command.service';
import {
  CancelCircleIcon,
  Copy02Icon,
  FileEditIcon,
  Search01Icon,
} from 'hugeicons-vue';
import PopupInputPlaceholder from './PopupInputPlaceholder.vue';
import { useTauriWindowEvent } from '@/composables/tauri.composable';
import { TooltipSimple, useToast } from '@snippy/ui';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { getSnippetContent } from '@/db/services/snippet.db-service';

type ActionItems = 'copy' | 'edit';

let prevActiveAction: HTMLElement | null = null;
const itemActions: { id: ActionItems; icon: Component; label: string }[] = [
  { icon: FileEditIcon, id: 'edit', label: 'Edit' },
  { icon: Copy02Icon, id: 'copy', label: 'Copy' },
];

const actionHandlerMap = {
  edit: editSnippet,
  copy: copyContent,
};
const currentWindow = getCurrentWindow();

const { toast } = useToast();
const searchInput = useTemplateRef<HTMLInputElement>('search-input');

const inputSnippet = shallowRef<SnippetWithPlaceholder | null>(null);
const actionState = ref({
  itemId: '',
  actionIndex: -1,
});

async function editSnippet() {
  try {
    await appCommand.invoke('open_snippet', {
      snippetId: actionState.value.itemId,
    });
    await currentWindow.hide();
  } catch {
    toast({
      variant: 'destructive',
      title: 'An error occured',
    });
  }
}
async function copyContent() {
  try {
    const result = await getSnippetContent(actionState.value.itemId);
    if (!result) return;

    await appCommand.invoke('send_snippet_content', {
      action: 'copy',
      placeholders: [],
      plaholdersValue: {},
      content: result.content,
    });

    toast({
      title: 'Copied',
    });
  } catch {
    toast({
      variant: 'destructive',
      title: 'An error occured',
    });
  }
}
async function handleSelectItem(item: SnippetSearchListItem) {
  const action = actionState.value.itemId
    ? itemActions[actionState.value.actionIndex]
    : null;
  if (action) {
    if (action.id === 'edit') editSnippet();
    else copyContent();

    return;
  }

  try {
    const result = await appCommand.invoke('get_snippet_with_placeholder', {
      snippetId: item.id,
    });
    if (result.placeholders.length === 0) {
      await appCommand.invoke('send_snippet_content', {
        action: 'paste',
        placeholders: [],
        plaholdersValue: {},
        content: result.content,
      });
      return;
    }

    inputSnippet.value = result;
  } catch {
    toast({
      variant: 'destructive',
      title: 'An error occured',
    });
  }
}
function clearSearch() {
  const inputEl = unrefElement(searchInput);
  if (inputEl) {
    inputEl.value = '';
    inputEl.dispatchEvent(new InputEvent('input'));
  }
}
function handleInputKeydown(event: KeyboardEvent) {
  if (!actionState.value.itemId) return;

  const { key } = event;
  const inputEl = event.target as HTMLInputElement;
  if (
    inputEl.selectionEnd !== inputEl.selectionStart ||
    (key !== 'ArrowLeft' && key !== 'ArrowRight')
  )
    return;

  if (key === 'ArrowLeft') {
    if (actionState.value.actionIndex < 0) return;
    actionState.value.actionIndex -= 1;
  } else {
    if (
      actionState.value.actionIndex >= itemActions.length - 1 ||
      inputEl.value.length !== inputEl.selectionEnd
    )
      return;
    actionState.value.actionIndex += 1;
  }

  event.preventDefault();
}

useTauriWindowEvent('tauri://focus', () => {
  unrefElement(searchInput.value)?.focus();
});

watchEffect(() => {
  if (!inputSnippet.value) {
    nextTick(() => {
      unrefElement(searchInput.value)?.focus();
    });
  }
});
watch(
  actionState,
  (value) => {
    if (prevActiveAction) {
      prevActiveAction.dispatchEvent(new Event('blur', { bubbles: true }));
    }

    if (!value.itemId || value.actionIndex < 0) return;

    const btn = document.getElementById(value.itemId + value.actionIndex);
    prevActiveAction = btn;

    btn?.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
  },
  { deep: true },
);
</script>
<style>
[data-radix-vue-combobox-item] {
  &:hover .action,
  &[data-highlighted] .action {
    visibility: visible;
  }
}
</style>

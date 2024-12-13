<template>
  <PopupInputPlaceholder
    v-if="inputSnippet"
    :snippet="inputSnippet"
    @close="inputSnippet = null"
    @sended="
      emit('snippet:sended', inputSnippet.id);
      inputSnippet = null;
    "
  />
  <Command
    v-else
    v-bind="forwarded"
    @update:selected-value="
      actionState = { actionIndex: -1, itemId: $event as string }
    "
  >
    <div class="search-input relative px-4 pb-3 pt-1.5">
      <UiComboboxSearch
        ref="search-input"
        auto-focus
        @keydown="handleInputKeydown"
      />
    </div>
    <CommandList class="max-h-none px-4 pt-1">
      <CommandEmpty>
        <slot name="empty">
          <span class="text-muted-foreground">No results found.</span>
        </slot>
      </CommandEmpty>
      <CommandGroup :heading="groupHeading" class="p-0">
        <CommandItem
          v-for="item in items"
          :key="item.id"
          :value="item.id"
          class="border-border/50 mb-px block"
          @select.prevent="handleSelectItem(item)"
        >
          <div class="flex items-center">
            <p
              v-if="itemContainsHtml"
              v-html="sanitizeSnippetHTML(item.name ?? '')"
              class="grow truncate pr-2"
            ></p>
            <p v-else v-text="item.name" class="grow truncate pr-2"></p>
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
          <p
            v-if="'content' in item"
            v-html="sanitizeSnippetHTML(item.content ?? '')"
            class="text-muted-foreground mt-1 max-h-[120px] overflow-hidden overflow-ellipsis whitespace-pre-wrap border-t pt-1 text-xs"
          ></p>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
</template>
<script
  setup
  lang="ts"
  generic="T extends SnippetSearchListItem | SnippetListItem"
>
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  TooltipSimple,
  useToast,
} from '@snippy/ui';
import UiComboboxSearch from '../ui/UiComboboxSearch.vue';
import type { ComboboxRootProps } from 'radix-vue';
import { useForwardPropsEmits, type ComboboxRootEmits } from 'radix-vue';
import { Copy02Icon, FileEditIcon } from 'hugeicons-vue';
import type {
  SnippetListItem,
  SnippetSearchListItem,
  SnippetWithPlaceholder,
} from '@/interface/snippet.interface';
import { getSnippetContent } from '@/db/services/snippet.db-service';
import { appCommand } from '@/services/app-command.service';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { sanitizeSnippetHTML } from '@/utils/snippet-utils';
import { useTauriWindowEvent } from '@/composables/tauri.composable';
import PopupInputPlaceholder from './PopupInputPlaceholder.vue';

defineOptions({
  inheritAttrs: false,
});
const props = defineProps<
  ComboboxRootProps & {
    items: T[];
    groupHeading?: string;
    itemContainsHtml?: boolean;
  }
>();
const emit = defineEmits<ComboboxRootEmits & { 'snippet:sended': [string] }>();

type ActionItems = 'copy' | 'edit';

let prevActiveAction: HTMLElement | null = null;
const itemActions: { id: ActionItems; icon: Component; label: string }[] = [
  { icon: Copy02Icon, id: 'copy', label: 'Copy' },
  { icon: FileEditIcon, id: 'edit', label: 'Edit' },
];
const actionHandlerMap = {
  edit: editSnippet,
  copy: copyContent,
};

const currentWindow = getCurrentWindow();

const { toast } = useToast();
const forwarded = useForwardPropsEmits(props, emit);
const searchInput = useTemplateRef('search-input');

const inputSnippet = shallowRef<SnippetWithPlaceholder | null>(null);
const actionState = ref({
  itemId: '',
  actionIndex: -1,
});

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
async function handleSelectItem(item: T) {
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
      emit('snippet:sended', item.id);
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

useTauriWindowEvent('tauri://focus', () => {
  searchInput.value?.inputEl?.focus();
});

watchEffect(() => {
  if (!inputSnippet.value) {
    nextTick(() => {
      searchInput.value?.inputEl?.focus();
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

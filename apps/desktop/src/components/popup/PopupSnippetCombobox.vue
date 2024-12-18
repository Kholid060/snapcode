<template>
  <PopupInputPlaceholder
    v-if="inputSnippet"
    :snippet="inputSnippet"
    @close="inputSnippet = null"
    @sended="
      emit('snippet:sended', inputSnippet.path);
      inputSnippet = null;
    "
  />
  <Command
    v-else
    v-bind="forwarded"
    @update:selected-value="
      actionState = { actionIndex: -1, path: $event as string }
    "
  >
    <div class="search-input relative px-4 pb-3 pt-1.5">
      <UiComboboxSearch
        ref="search-input"
        auto-focus
        @keydown="handleInputKeydown"
      />
    </div>
    <CommandList class="max-h-none px-4 pb-4 pt-1">
      <CommandEmpty>
        <slot name="empty">
          <span class="text-muted-foreground">No results found.</span>
        </slot>
      </CommandEmpty>
      <CommandGroup :heading="groupHeading" class="p-0">
        <CommandItem
          v-for="item in items"
          :key="item.path"
          :value="item.path"
          class="border-border/50 relative mb-px block overflow-hidden"
          @select.prevent="handleSelectItem(item)"
        >
          <p
            v-if="itemContainsHtml"
            v-html="sanitizeSnippetHTML(item.name ?? '')"
            class="truncate pr-2"
          ></p>
          <p v-else v-text="item.name" class="grow truncate pr-2"></p>
          <p class="text-muted-foreground truncate text-xs leading-tight">
            /{{ item.path }}
          </p>
          <div
            class="action from-accent invisible absolute right-0 top-0 flex h-full items-center gap-0.5 bg-gradient-to-l from-70% to-transparent pl-4 pr-2"
          >
            <TooltipSimple
              v-for="(action, index) in itemActions"
              :key="action.id"
              :label="action.label"
              side="bottom"
              align="end"
            >
              <button
                class="hover:bg-secondary hover:text-foreground size-6 flex-shrink-0 content-center rounded-sm text-center transition-colors"
                :id="item.path + index"
                @click.stop="actionHandlerMap[action.id]"
                :class="
                  item.path === actionState.path &&
                  index === actionState.actionIndex
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground'
                "
              >
                <component :is="action.icon" class="inline size-[18px]" />
              </button>
            </TooltipSimple>
            <slot name="actions:suffix" :item="item"></slot>
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
<script setup lang="ts">
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
import { appCommand } from '@/services/app-command.service';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { sanitizeSnippetHTML } from '@/utils/snippet-utils';
import { useTauriWindowEvent } from '@/composables/tauri.composable';
import PopupInputPlaceholder from './PopupInputPlaceholder.vue';
import type { DocumentSearchEntry } from '@/interface/document.interface';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';
import { getNameFromPath } from '@/utils/document-utils';
import type { SnippetWithPlaceholder } from '@/interface/snippet.interface';

defineOptions({
  inheritAttrs: false,
});
const props = defineProps<
  ComboboxRootProps & {
    groupHeading?: string;
    itemContainsHtml?: boolean;
    items: DocumentSearchEntry[];
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
  path: '',
  actionIndex: -1,
});

function handleInputKeydown(event: KeyboardEvent) {
  if (!actionState.value.path) return;

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
async function handleSelectItem(item: DocumentSearchEntry) {
  const action = actionState.value.path
    ? itemActions[actionState.value.actionIndex]
    : null;
  if (action) {
    if (action.id === 'edit') editSnippet();
    else copyContent();

    return;
  }

  try {
    const placeholders = await appCommand.invoke(
      'get_snippet_with_placeholder',
      {
        path: item.path,
      },
    );

    if (placeholders.length === 0) {
      await appCommand.invoke('send_snippet_content', {
        path: item.path,
        action: 'paste',
        placeholders: [],
        plaholdersValue: {},
      });
      emit('snippet:sended', item.path);
      return;
    }

    inputSnippet.value = {
      placeholders,
      path: item.path,
      name: getNameFromPath(item.path),
    };
  } catch (error) {
    console.error(error);
    logger.error(getLogMessage('popup-placeholder', error));
    toast({
      variant: 'destructive',
      title: 'An error occured',
      description: typeof error === 'string' ? error : '',
    });
  }
}

async function editSnippet() {
  try {
    await appCommand.invoke('open_snippet', {
      snippetId: actionState.value.path,
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
    await appCommand.invoke('send_snippet_content', {
      action: 'copy',
      placeholders: [],
      plaholdersValue: {},
      path: actionState.value.path,
    });

    toast({
      title: 'Copied',
    });
  } catch (error) {
    logger.error(getLogMessage('popup-combobox:copy', error));
    toast({
      variant: 'destructive',
      title: 'An error occured',
      description: typeof error === 'string' ? error : '',
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

    if (!value.path || value.actionIndex < 0) return;

    const btn = document.getElementById(value.path + value.actionIndex);
    prevActiveAction = btn;

    btn?.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
  },
  { deep: true },
);
</script>

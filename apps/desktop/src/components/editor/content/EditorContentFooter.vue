<template>
  <div class="text-muted-foreground flex h-6 items-center border-t px-2">
    <p class="min-w-20 cursor-default text-xs">
      Ln {{ cursorPos.line }}, Col {{ cursorPos.col }}
    </p>
    <p class="select-none text-xs leading-tight" :key="updatedAtKey">
      Last updated {{ dayjs(activeSnippet.updatedAt).fromNow() }}
    </p>
    <div class="grow"></div>
    <Popover v-model:open="openLangSelector">
      <PopoverTrigger as-child>
        <button
          role="combobox"
          class="hover:bg-secondary min-w-12 rounded p-0.5 text-left text-xs"
        >
          {{ languageLabel }}
          <ArrowDown01Icon class="inline size-4 align-text-top" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" class="w-48 p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              <CommandItem
                value="txt"
                @select="updateSnippetLang('txt')"
                :class="{
                  'text-lime-10 hover:!text-lime-10':
                    activeSnippet.lang === 'txt',
                }"
              >
                <span class="grow">Plain Text</span>
                <Tick02Icon
                  class="ml-2 size-4"
                  v-if="activeSnippet.lang === 'txt'"
                />
              </CommandItem>
              <CommandItem
                v-for="language in sortedLangs"
                :key="language.name"
                :value="language.name"
                @select="updateSnippetLang(language.name)"
                :class="{
                  'text-lime-10 hover:!text-lime-10':
                    language.extensions.includes(activeSnippet.lang),
                }"
              >
                <span class="grow">{{ language.name }}</span>
                <Tick02Icon
                  class="ml-2 size-4"
                  v-if="language.extensions.includes(activeSnippet.lang)"
                />
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
</template>
<script setup lang="ts">
import { Tick02Icon, ArrowDown01Icon } from 'hugeicons-vue';
import dayjs from '@/lib/dayjs';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useToast,
} from '@snippy/ui';
import { languages } from '@snippy/codemirror';
import { useEditorStore } from '@/stores/editor.store';
import { logger } from '@/services/logger.service';
import { catchAsyncFn, getLogMessage } from '@/utils/helper';
import { computedAsync } from '@vueuse/core';
import { extname } from '@tauri-apps/api/path';

defineProps<{
  languageLabel: string;
  cursorPos: {
    col: number;
    line: number;
  };
}>();

let interval = -1;

const { toast } = useToast();
const editorStore = useEditorStore();

const updatedAtKey = shallowRef(-10000);
const openLangSelector = shallowRef(false);

const activeSnippet = computedAsync(
  async () => ({
    updatedAt: editorStore.data.activeSnippet.updatedAt,
    lang: await catchAsyncFn(
      () => extname(editorStore.data.activeSnippet.name ?? ''),
      'txt',
    ),
  }),
  { lang: 'txt', updatedAt: new Date() },
);

const sortedLangs = languages.sort((a, z) => a.name.localeCompare(z.name));

async function updateSnippetLang(lang: string) {
  try {
    openLangSelector.value = false;

    await editorStore.data.updateSnippet(editorStore.data.activeSnippet.id!, {
      lang,
    });
  } catch (error) {
    console.error(error);
    logger.error(getLogMessage('editor-update-lang', error));
    toast({
      variant: 'destructive',
      title: `Error updating snippet`,
    });
  }
}

watch(
  () => activeSnippet.value.updatedAt,
  (date) => {
    clearInterval(interval);
    if (!date) return;

    interval = setInterval(() => {
      updatedAtKey.value += 1;
    }, 60_000);

    onWatcherCleanup(() => clearInterval(interval));
  },
);

onUnmounted(() => {
  clearInterval(interval);
});
</script>

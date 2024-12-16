<template>
  <div class="text-muted-foreground flex h-6 items-center border-t px-2">
    <p class="min-w-20 cursor-default text-xs">
      Ln {{ cursorPos.line }}, Col {{ cursorPos.col }}
    </p>
    <p class="ml-4 select-none text-xs leading-tight" :key="updatedAtKey">
      Last updated {{ dayjs(editorStore.activeSnippet?.mtime).fromNow() }}
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
                :value="PLAIN_TEXT_LABEL"
                @select="updateSnippetLang(PLAIN_TEXT_LABEL)"
                :class="{
                  'text-lime-10 hover:!text-lime-10':
                    editorStore.activeSnippet?.metadata?.lang ===
                    PLAIN_TEXT_LABEL,
                }"
              >
                <span class="grow">Plain Text</span>
                <Tick02Icon
                  class="ml-2 size-4"
                  v-if="
                    editorStore.activeSnippet?.metadata?.lang ===
                    PLAIN_TEXT_LABEL
                  "
                />
              </CommandItem>
              <CommandItem
                v-for="language in sortedLangs"
                :key="language.name"
                :value="language.name"
                @select="updateSnippetLang(language.name)"
                :class="{
                  'text-lime-10 hover:!text-lime-10':
                    language.name === languageLabel,
                }"
              >
                <span class="grow">{{ language.name }}</span>
                <Tick02Icon
                  class="ml-2 size-4"
                  v-if="language.name === languageLabel"
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
import { getLogMessage } from '@/utils/helper';

defineProps<{
  languageLabel: string;
  cursorPos: {
    col: number;
    line: number;
  };
}>();

let interval = -1;
const PLAIN_TEXT_LABEL = 'Plain Text';

const { toast } = useToast();
const editorStore = useEditorStore();

const updatedAtKey = shallowRef(-10000);
const openLangSelector = shallowRef(false);

const sortedLangs = languages.sort((a, z) => a.name.localeCompare(z.name));

async function updateSnippetLang(lang: string) {
  if (!editorStore.activeSnippet) return;

  try {
    openLangSelector.value = false;

    await editorStore.document.updateSnippetMetadata(
      editorStore.activeSnippet.path,
      {
        lang,
      },
    );
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
  () => editorStore.activeSnippet?.mtime,
  (mtime) => {
    clearInterval(interval);
    if (typeof mtime !== 'number') return;

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

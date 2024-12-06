<template>
  <div class="mb-2 mt-1.5 flex flex-shrink-0 select-none items-center px-4">
    <Button
      size="icon"
      variant="secondary"
      class="h-9 w-7 flex-shrink-0"
      @click="$emit('close')"
    >
      <ArrowLeft01Icon class="size-6" />
    </Button>
    <div class="ml-2">
      <p class="text-muted-foreground text-xs leading-tight">Placeholders</p>
      <p class="gap-1 truncate text-sm leading-tight">
        <AppFileExtIcon :lang="snippet.lang ?? ''" class="inline size-4">
          <File01Icon class="inline size-4 flex-shrink-0" />
        </AppFileExtIcon>
        {{ snippet.name ?? 'unnamed.txt' }}
      </p>
    </div>
  </div>
  <div ref="placeholder-container" class="grow overflow-auto px-4 pt-1">
    <div v-for="placeholder in placeholders" :key="placeholder.name">
      <label :for="placeholder.name">
        {{ placeholder.name.slice(2, -2) }}
      </label>
      <Textarea
        type="text"
        class="min-h-[auto] resize-none overflow-hidden bg-inherit"
        :id="placeholder.name"
        autogrow
        rows="1"
      />
    </div>
  </div>
  <div class="sticky bottom-0 flex px-4 py-2">
    <Button size="sm"> Paste ({{ getHotkeyLabel('mod+enter') }}) </Button>
  </div>
</template>
<script lang="ts" setup>
import type { SelectSnippet } from '@/db/schema';
import AppFileExtIcon from '../app/AppFileExtIcon.vue';
import { ArrowLeft01Icon, File01Icon } from 'hugeicons-vue';
import { Button, Textarea } from '@snippy/ui';
import { getHotkeyLabel, useHotkey } from '@/composables/hotkey.composable';

interface PlaceholderItem {
  name: string;
  value: string;
}

const props = defineProps<{
  snippet: Pick<SelectSnippet, 'name' | 'content' | 'lang' | 'placeholders'>;
}>();
const emit = defineEmits<{
  close: [];
}>();

const container = useTemplateRef('placeholder-container');

const placeholders = shallowRef<Record<string, PlaceholderItem>>({});

useHotkey({ key: 'esc', capture: true, single: true }, (event) => {
  event.stopPropagation();
  emit('close');
});

onMounted(() => {
  placeholders.value = props.snippet.placeholders.reduce<
    Record<string, PlaceholderItem>
  >((acc, item) => {
    if (!acc[item.name]) {
      acc[item.name] = { name: item.name, value: '' };
    }

    return acc;
  }, {});

  nextTick(() => {
    container.value?.querySelector('textarea')?.focus();
  });
});
</script>

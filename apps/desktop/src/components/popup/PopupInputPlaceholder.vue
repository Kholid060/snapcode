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
        {{ snippet.name ?? 'unnamed.txt' }}
      </p>
    </div>
  </div>
  <div ref="placeholder-container" class="grow overflow-auto px-4 pt-1">
    <div v-for="(_value, key) in placeholders" :key="key">
      <label :for="key" class="truncate text-sm">
        {{ key.slice(2, -2) }}
      </label>
      <Textarea
        type="text"
        v-model="placeholders[key]"
        class="min-h-[auto] resize-none overflow-hidden bg-inherit"
        :id="key"
        autogrow
        rows="1"
      />
    </div>
  </div>
  <div class="sticky bottom-0 space-x-2 px-4 py-2">
    <Button
      :disabled="!!actionState && actionState !== 'paste'"
      :is-loading="!!actionState && actionState === 'paste'"
      size="sm"
      class="gap-0 text-sm"
      @click="sendContent('paste')"
    >
      Paste
      <Kbd variant="primary-top" class="ml-1 capitalize">
        {{ getHotkeyLabel('mod') }}
      </Kbd>
      <Kbd variant="primary-top" class="ml-px"> ↵ </Kbd>
    </Button>
    <Button
      size="sm"
      variant="secondary"
      class="gap-0 text-sm"
      :disabled="!!actionState && actionState !== 'copy'"
      :is-loading="!!actionState && actionState === 'copy'"
      @click="sendContent('copy')"
    >
      Copy
      <Kbd variant="primary-top" class="ml-1"> Alt </Kbd>
      <Kbd variant="primary-top" class="ml-px"> ↵ </Kbd>
    </Button>
  </div>
</template>
<script lang="ts" setup>
import { ArrowLeft01Icon } from 'hugeicons-vue';
import { Button, Kbd, Textarea, useToast } from '@snippy/ui';
import { getHotkeyLabel, useHotkey } from '@/composables/hotkey.composable';
import { appCommand } from '@/services/app-command.service';
import type { SnippetWithPlaceholder } from '@/interface/snippet.interface';

const props = defineProps<{
  snippet: SnippetWithPlaceholder;
}>();
const emit = defineEmits<{
  close: [];
  sended: [];
}>();

const { toast } = useToast();
const container = useTemplateRef('placeholder-container');

const placeholders = shallowRef<Record<string, string>>({});
const actionState = shallowRef<'paste' | 'copy' | null>(null);

async function sendContent(action: 'paste' | 'copy') {
  try {
    actionState.value = action;
    await appCommand.invoke('send_snippet_content', {
      action,
      content: props.snippet.content,
      plaholdersValue: placeholders.value,
      placeholders: props.snippet.placeholders,
    });

    emit('sended');
  } catch {
    toast({
      variant: 'destructive',
      title: 'An error occured',
    });
  } finally {
    actionState.value = null;
  }
}

useHotkey({ key: 'esc', capture: true, single: true }, (event) => {
  event.stopPropagation();
  emit('close');
});
useHotkey(['mod+enter', 'alt+enter'], (_, { shortcut }) => {
  sendContent(shortcut === 'alt+enter' ? 'copy' : 'paste');
});

onMounted(() => {
  placeholders.value = props.snippet.placeholders.reduce<
    Record<string, string>
  >((acc, item) => {
    if (!acc[item.name]) acc[item.name] = '';

    return acc;
  }, {});

  nextTick(() => {
    container.value?.querySelector('textarea')?.focus();
  });
});
</script>

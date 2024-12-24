<template>
  <div class="flex items-center px-4 pt-4">
    <p class="text-muted-foreground grow cursor-default text-sm font-semibold">
      Shared snippets
    </p>
    <Select
      :model-value="sortBy"
      @update:model-value="updateSort($event as AppBookmarkSort)"
    >
      <SelectTrigger as-child>
        <Button
          variant="ghost"
          class="text-muted-foreground h-6 gap-1 px-1 text-xs"
        >
          <Sorting05Icon class="size-[18px]" />
          Sort
        </Button>
      </SelectTrigger>
      <SelectContent side="bottom">
        <SelectItem v-for="item in sortItems" :key="item.id" :value="item.id">
          {{ item.label }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
  <ul class="mt-3 grow space-y-px overflow-auto px-2 pb-4 pt-0.5">
    <li
      v-for="snippet in sortedSnippets"
      :key="snippet.id"
      @click="activeSnippet = snippet"
      class="text-muted-foreground hover:bg-accent/70 rounded-md px-2 py-1 text-sm"
    >
      <p class="text-foreground">{{ snippet.name }}</p>
      <p class="text-xs">
        {{ sharedProviderLabel[snippet.type] }} ·
        {{ dayjs(snippet.createdAt).fromNow() }}
      </p>
    </li>
  </ul>
  <Dialog
    modal
    :open="Boolean(activeSnippet)"
    @update:open="!$event && (activeSnippet = null)"
  >
    <DialogScrollContent v-if="activeSnippet">
      <DialogHeader class="gap-0">
        <DialogTitle class="truncate">
          {{ activeSnippet.name }}
        </DialogTitle>
        <DialogDescription>
          {{ sharedProviderLabel[activeSnippet.type] }}
        </DialogDescription>
      </DialogHeader>
      <SharedEditGithubGist
        :item="activeSnippet"
        @updated="updateSharedSnippetData"
      />
    </DialogScrollContent>
  </Dialog>
</template>
<script setup lang="ts">
import type { AppBookmarkSort } from '@/interface/app.interface';
import type { DocumentSharedSnippet } from '@/interface/document.interface';
import documentService from '@/services/document.service';
import {
  Button,
  Select,
  SelectItem,
  SelectContent,
  Dialog,
  DialogScrollContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@snippy/ui';
import { SelectTrigger } from 'radix-vue';
import dayjs from 'dayjs';
import { Sorting05Icon } from 'hugeicons-vue';
import SharedEditGithubGist from '../share/edit/SharedEditGithubGist.vue';

const sortItems: { label: string; id: AppBookmarkSort }[] = [
  { id: 'name-asc', label: 'Name (A-Z)' },
  { id: 'name-desc', label: 'Name (Z-A)' },
  { id: 'created-desc', label: 'Created date (new to old)' },
  { id: 'created-asc', label: 'Created date (old to new)' },
];
const sharedProviderLabel: Record<DocumentSharedSnippet['type'], string> = {
  'github-gist': 'GitHub Gist',
};

const snippets = shallowRef<DocumentSharedSnippet[]>([]);
const activeSnippet = shallowRef<DocumentSharedSnippet | null>(null);
const sortBy = ref<AppBookmarkSort>(
  (localStorage.getItem('shared-sort') as AppBookmarkSort) ?? 'created-desc',
);

const sortedSnippets = computed(() => {
  let key: keyof DocumentSharedSnippet = 'createdAt';
  let asc = false;

  switch (sortBy.value) {
    case 'name-asc':
      key = 'name';
      asc = true;
      break;
    case 'name-desc':
      key = 'name';
      asc = false;
      break;
    case 'created-desc':
      key = 'createdAt';
      asc = false;
      break;
    case 'created-asc':
      key = 'createdAt';
      asc = true;
      break;
  }

  const isNumber = key === 'createdAt';
  return snippets.value.slice().sort((a, z) => {
    const aData = a[key];
    const zData = z[key];

    const val = isNumber
      ? (aData as number) - (zData as number)
      : (aData as string).localeCompare(zData as string, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
    return asc ? val : val * -1;
  });
});

function updateSharedSnippetData({ name }: { name: string }) {
  if (!activeSnippet.value) return;

  const index = snippets.value.findIndex(
    (item) => item.id === activeSnippet.value!.id,
  );
  if (index === -1) return;

  snippets.value[index].name = name;
  documentService.stores.data.xSet('sharedSnippets', snippets.value);
  activeSnippet.value = null;
}
function updateSort(value: AppBookmarkSort) {
  localStorage.setItem('shared-sort', value);
  sortBy.value = value;
}

onBeforeMount(async () => {
  snippets.value = await documentService.stores.data.xGet('sharedSnippets', []);
});
</script>

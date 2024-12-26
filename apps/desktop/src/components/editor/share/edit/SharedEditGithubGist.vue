<template>
  <div v-if="isPending || isFetching">
    <Skeleton class="h-40 w-full" />
    <div class="mt-4 space-y-1">
      <Skeleton class="h-9 w-full" />
      <Skeleton class="h-9 w-full" />
      <Skeleton class="h-9 w-full" />
    </div>
  </div>
  <div v-else-if="isError" class="text-center">
    <img src="@/assets/svg/bug-fixing.svg" class="mx-auto -mt-8 w-64" />
    <h2 class="-mt-4 text-lg font-semibold">Failed to fetch GitHub Gist</h2>
    <p class="text-muted-foreground">
      {{ error?.message }}
    </p>
    <div class="mt-6">
      <DialogClose as-child>
        <Button variant="secondary" class="mr-2"> Close </Button>
      </DialogClose>
      <Button @click="refetch"> Retry </Button>
    </div>
  </div>
  <template v-else-if="data">
    <div>
      <Label for="gist-description">Description</Label>
      <Textarea
        id="gist-description"
        class="mb-2"
        :default-value="data.data.description ?? ''"
        @update:model-value="updatePayload.description = $event.toString()"
      />
      <Label>Files</Label>
      <ul
        class="divide-border/50 block w-full divide-y overflow-hidden rounded-lg border"
      >
        <li
          v-for="filename in Object.keys(data.data.files)"
          :key="filename"
          class="hover:bg-secondary/70 group flex items-center p-2 text-sm transition-none hover:no-underline"
        >
          <div class="grow">
            <p class="max-w-xs truncate pr-2 leading-tight">{{ filename }}</p>
            <div
              v-if="updatePayload.files[filename]?.type === 'update'"
              class="mt-0.5 flex flex-wrap gap-0.5 leading-[0]"
            >
              <span
                v-if="updatePayload.files[filename].filename"
                :title="updatePayload.files[filename].filename"
                class="bg-secondary-hover inline-block max-w-48 truncate rounded px-1 py-0.5 text-xs"
              >
                Name: {{ updatePayload.files[filename].filename }}
              </span>
              <span
                v-if="updatePayload.files[filename].path"
                :title="updatePayload.files[filename].path"
                class="bg-secondary-hover inline-block max-w-48 truncate rounded px-1 py-0.5 text-xs"
              >
                Content: {{ updatePayload.files[filename].path }}
              </span>
            </div>
          </div>
          <template v-if="updatePayload.files[filename]?.type === 'delete'">
            <span
              class="bg-destructive/20 text-destructive-text rounded-md px-1.5 py-1 text-xs"
            >
              Delete
            </span>
            <Button
              size="sm"
              variant="ghost"
              class="ml-1 text-sm"
              @click.stop="delete updatePayload.files[filename]"
            >
              undo
            </Button>
          </template>
          <template v-else>
            <TooltipSimple label="Rename">
              <Button
                class="invisible size-8 p-0 group-hover:visible"
                variant="ghost"
                @click.stop="rename(filename)"
              >
                <PencilEdit01Icon class="size-5" />
              </Button>
            </TooltipSimple>
            <TooltipSimple label="Replace content">
              <Button
                class="invisible mx-0.5 size-8 p-0 group-hover:visible"
                variant="ghost"
                @click.stop="replaceFileContent(filename)"
              >
                <FileSyncIcon class="size-5" />
              </Button>
            </TooltipSimple>
            <TooltipSimple label="Delete file">
              <Button
                class="invisible size-8 p-0 group-hover:visible"
                variant="ghost"
                @click.stop="updatePayload.files[filename] = { type: 'delete' }"
              >
                <Delete02Icon class="text-destructive-text size-5" />
              </Button>
            </TooltipSimple>
          </template>
        </li>
      </ul>
    </div>
    <DialogFooter class="mt-8">
      <DialogClose as-child>
        <Button variant="secondary" :disabled="isLoading"> Cancel </Button>
      </DialogClose>
      <Button @click="updateGist" :is-loading="isLoading">
        Save changes
      </Button>
    </DialogFooter>
  </template>
</template>
<script setup lang="ts">
import type { DocumentSharedSnippet } from '@/interface/document.interface';
import type { GitHubUpdateGistPayload } from '@/interface/github.interface';
import { useAppDialog } from '@/providers/app-dialog.provider';
import documentService from '@/services/document.service';
import {
  getGitHubGistsById,
  updateGitHubGist,
} from '@/services/github-gists.service';
import { logger } from '@/services/logger.service';
import { sanitizeDocumentFileName } from '@/utils/document-utils';
import { FetchError } from '@/utils/errors';
import { getGitHubGistName } from '@/utils/github-utils';
import { getLogMessage, updateObject } from '@/utils/helper';
import {
  Button,
  DialogClose,
  DialogFooter,
  Label,
  Skeleton,
  Textarea,
  TooltipSimple,
  useToast,
} from '@snippy/ui';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { Delete02Icon, FileSyncIcon, PencilEdit01Icon } from 'hugeicons-vue';

const props = defineProps<{ item: DocumentSharedSnippet }>();
const emit = defineEmits<{
  updated: [data: { name: string }];
}>();

const { toast } = useToast();
const appDialog = useAppDialog();
const queryClient = useQueryClient();

const { isPending, isFetching, isError, data, error, refetch } = useQuery({
  retry: 1,
  refetchInterval: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  queryKey: ['github-gist', props.item.id],
  queryFn: () => getGitHubGistsById(props.item.id),
});

const updatePayload = reactive<{
  description?: string;
  files: Record<
    string,
    { type: 'delete' } | { type: 'update'; path?: string; filename?: string }
  >;
}>({
  files: {},
});
const isLoading = shallowRef(false);

async function rename(filename: string) {
  const updateData =
    updatePayload.files[filename]?.type === 'update'
      ? updatePayload.files[filename]
      : null;
  const result = await appDialog.prompt({
    okBtnLabel: 'Rename',
    title: 'Rename file',
    defaultValue: updateData?.filename || filename,
  });
  const sanitizedFilename = !result.canceled
    ? sanitizeDocumentFileName(result.value)
    : '';
  if (sanitizedFilename && sanitizedFilename === filename) return;

  updatePayload.files[filename] = {
    type: 'update',
    ...(updateData || {}),
    filename: sanitizedFilename,
  };
}
async function replaceFileContent(filename: string) {
  const result = await appDialog.selectData({
    type: 'snippet',
    title: 'Replace file content with...',
  });
  if (result.canceled) return;

  updatePayload.files[filename] = {
    type: 'update',
    ...(updatePayload.files[filename]?.type === 'update'
      ? updatePayload.files[filename]
      : {}),
    path: result.data.path,
  };
}
async function updateGist() {
  try {
    isLoading.value = true;

    const payload: GitHubUpdateGistPayload = {};
    if (Object.hasOwn(updatePayload, 'description')) {
      payload.description = updatePayload.description;
    }

    for (const filename in updatePayload.files) {
      if (!payload.files) payload.files = {};

      const file = updatePayload.files[filename];
      if (file.type === 'delete') {
        payload.files[filename] = null;
      } else if (file.type === 'update') {
        if (!payload.files[filename]) payload.files[filename] = {};

        if (file.filename) {
          updateObject(payload.files[filename], {
            filename: file.filename,
          });
        }
        if (file.path) {
          const content =
            (await documentService.getFileContent(file.path)) || '[empty]';
          updateObject(payload.files[filename], { content });
        }
      }
    }

    const result = await updateGitHubGist(props.item.id, payload);

    emit('updated', { name: getGitHubGistName(result.data) });

    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: ['github-gist', props.item.id],
      });
    }, 1000);
  } catch (error) {
    logger.error(getLogMessage('share-snippet-github-gist', error));

    let message = typeof error === 'string' ? error : '';
    if (error instanceof FetchError) {
      message = error.message;
    }

    toast({
      duration: 5000,
      description: message,
      variant: 'destructive',
      title: 'An error occured when updating GitHub Gist',
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <ContextMenuContent class="context-menu-content min-w-40">
    <ContextMenuItem as-child>
      <UiLink :href="getGitHubGistUrl(props.ctxData.item.id)">
        <LinkCircle02Icon class="mr-2 size-4" />
        Open URL
      </UiLink>
    </ContextMenuItem>
    <ContextMenuItem
      @click="copyText(getGitHubGistUrl(props.ctxData.item.id), true)"
    >
      <Copy01Icon class="mr-2 size-4" />
      Copy URL
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem
      class="text-destructive-text focus:text-destructive-text"
      @click="removeItem"
    >
      <DeleteIcon class="mr-2 size-4" />
      Remove
    </ContextMenuItem>
    <ContextMenuItem
      v-if="props.ctxData.item.type === 'github-gist'"
      class="text-destructive-text focus:text-destructive-text"
      @click="removeGitHubGist"
    >
      <DeleteIcon class="mr-2 size-4" />
      Remove GitHub Gist
    </ContextMenuItem>
  </ContextMenuContent>
</template>
<script setup lang="ts">
import UiLink from '@/components/ui/UiLink.vue';
import { useCopyText } from '@/composables/clipboard.composable';
import type { EditorSidebarSharedSnippetsCtxMenu } from '@/interface/editor.interface';
import { useAppDialog } from '@/providers/app-dialog.provider';
import { deleteGitHubGist } from '@/services/github-gists.service';
import { logger } from '@/services/logger.service';
import { useSharedSnippetsStore } from '@/stores/shared-snippets.store';
import { FetchError } from '@/utils/errors';
import { getGitHubGistUrl } from '@/utils/github-utils';
import { getLogMessage } from '@/utils/helper';
import {
  ContextMenuItem,
  ContextMenuContent,
  useToast,
  ContextMenuSeparator,
} from '@snippy/ui';
import {
  Copy01Icon,
  LinkCircle02Icon,
  Delete02Icon as DeleteIcon,
} from 'hugeicons-vue';

const props = defineProps<{
  ctxData: EditorSidebarSharedSnippetsCtxMenu['data'];
}>();

const { toast } = useToast();
const appDialog = useAppDialog();
const { copyText } = useCopyText();
const sharedSnippetsStore = useSharedSnippetsStore();

async function removeItem() {
  try {
    await sharedSnippetsStore.removeItem(props.ctxData.item.id);
  } catch (error) {
    logger.error(getLogMessage('remove-shared-snippets-ctx-menu', error));
    toast({
      variant: 'destructive',
      title: 'An error occured',
      description: typeof error === 'string' ? error : '',
    });
  }
}
async function removeGitHubGist() {
  try {
    const confirmed = await appDialog.confirm({
      okBtnLabel: 'Delete',
      title: 'Delete GitHub Gist',
      okBtnVariant: 'destructive',
      body: `Are you sure you want to delete the "${props.ctxData.item.name}" GitHub Gist? This action can't be undone.`,
    });
    if (!confirmed.isConfirmed) return;

    await deleteGitHubGist(props.ctxData.item.id);
    await removeItem();
  } catch (error) {
    logger.error(getLogMessage('remove-github-gist', error));

    let message = typeof error === 'string' ? error : '';
    if (error instanceof FetchError) {
      message = error.message;
    }

    toast({
      description: message,
      variant: 'destructive',
      title: 'Error removing GitHub Gist',
    });
  }
}
</script>
<style>
.context-menu-content {
  animation: none !important;
}
</style>

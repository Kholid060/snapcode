<template>
  <DialogHeader class="px-6 pt-6">
    <DialogTitle>Import GitHub Gists</DialogTitle>
  </DialogHeader>
  <form @submit.prevent="startImport">
    <div class="p-6">
      <Label for="gist-input">GitHub username/Gist URL</Label>
      <Input
        v-model="gistState.url"
        id="gist-input"
        placeholder="https://gists.github.com/john_doe/92kd91ads"
      />
      <p
        v-if="gistState.ratelimitRemaining"
        class="text-muted-foreground text-sm"
      >
        API usage remaining: {{ gistState.ratelimitRemaining }}
      </p>
      <CollapsibleRoot v-model:open="openSettings">
        <CollapsibleContent
          class="CollapsibleContent mt-2 rounded-md p-2"
          :class="openSettings && 'bg-card'"
        >
          <div class="flex items-center">
            <Label for="pat-input">GitHub Personal access tokens</Label>
            <div class="grow"></div>
            <button
              v-if="hasGitHubPAT"
              type="button"
              class="text-sm underline"
              @click="removeGitHubPAT"
            >
              remove
            </button>
          </div>
          <Input
            id="pat-input"
            v-model="githubPat"
            placeholder="github_pat_xxxx"
            class="bg-transparent"
            autocomplete="off"
            :readonly="hasGitHubPAT"
            @blur="saveGitHubPAT"
          />
          <p class="text-muted-foreground mt-0.5 text-xs">
            Use
            <a
              href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic"
              target="_blank"
              class="underline"
            >
              GitHub fine-grained access tokens
            </a>
            to increase the API limit. You can use one that doesn't have any
            permissions.
          </p>
        </CollapsibleContent>
      </CollapsibleRoot>
    </div>
    <DialogFooter class="px-6 pb-6 pt-2">
      <Button
        class="px-2"
        variant="ghost"
        type="button"
        :class="[
          openSettings
            ? 'bg-secondary text-foreground'
            : 'text-muted-foreground',
        ]"
        @click="openSettings = !openSettings"
      >
        <component
          :is="openSettings ? Cancel01Icon : Settings01Icon"
          class="size-5"
        />
        Settings
      </Button>
      <div class="grow"></div>
      <DialogClose as-child>
        <Button type="button" variant="outline">Cancel</Button>
      </DialogClose>
      <Button type="submit" :is-loading="gistState.loading">Import</Button>
    </DialogFooter>
  </form>
</template>
<script setup lang="ts">
import type { FolderNewPayload } from '@/interface/folder.interface';
import type { GitHubGistListItem } from '@/interface/github.interface';
import type { SnippetNewPayload } from '@/interface/snippet.interface';
import { useAppDialog } from '@/providers/app-dialog.provider';
import appVault from '@/services/app-vault.service';
import { getGitHubGistsById } from '@/services/github-gists.service';
import { logger } from '@/services/logger.service';
import { useEditorStore } from '@/stores/editor.store';
import {
  extractGistsIdFromURL,
  GITHUB_GISTS_BASE_URL,
  githubGistFilesToSnippet,
  githubGistFileToSnippet,
} from '@/utils/github-utils';
import { getLogMessage } from '@/utils/helper';
import {
  Button,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  useToast,
} from '@snippy/ui';
import { Cancel01Icon, Settings01Icon } from 'hugeicons-vue';
import { nanoid } from 'nanoid';
import { CollapsibleContent, CollapsibleRoot } from 'radix-vue';

const emit = defineEmits<{
  close: [];
}>();

const { toast } = useToast();
const appDialog = useAppDialog();
const editorStore = useEditorStore();

const gistState = shallowReactive({
  url: '',
  loading: false,
  ratelimitRemaining: '',
});

const githubPat = shallowRef('');
const openSettings = shallowRef(false);
const hasGitHubPAT = shallowRef(false);

async function storeGitHubGists(
  gists: GitHubGistListItem[],
  folderId?: string | null,
) {
  const folders: FolderNewPayload[] = [];
  const snippets: SnippetNewPayload[] = [];

  await Promise.all(
    gists.map(async (gist) => {
      const files = Object.values(gist.files);
      if (files.length > 1) {
        const snippetFolderId = nanoid();
        folders.push({
          parentId: folderId,
          id: snippetFolderId,
          name: gist.description
            ? gist.description.slice(0, 120)
            : files[0].filename,
        });
        snippets.push(
          ...(await githubGistFilesToSnippet(files, snippetFolderId)),
        );
      } else if (files[0]) {
        snippets.push(await githubGistFileToSnippet(files[0], folderId));
      }
    }),
  );

  await editorStore.data.addFolders(folders);
  await editorStore.data.addSnippets(snippets);

  return {
    folders: folders.length,
    snippets: snippets.length,
  };
}
async function saveGitHubPAT() {
  try {
    await appVault.update('github-key', githubPat.value);
  } catch (error) {
    logger.error(getLogMessage('import-gists:save-key', error));
  }
}
async function removeGitHubPAT() {
  try {
    await appVault.remove('github-key');
    githubPat.value = '';
    hasGitHubPAT.value = false;
  } catch (error) {
    logger.error(getLogMessage('import-gists:remove-key', error));
  }
}
async function importById(url: string) {
  try {
    gistState.loading = true;

    const gistId = extractGistsIdFromURL(url);
    if (!gistId) {
      toast({
        variant: 'destructive',
        title: 'Invalid GitHub Gists URL',
      });
      return;
    }

    const gist = await getGitHubGistsById(gistId);
    gistState.ratelimitRemaining = gist.ratelimitRemaining ?? '';

    const result = await appDialog.selectFolder({
      title: 'Select folder where to store the snippets',
    });
    if (result.canceled) return;

    const storedData = await storeGitHubGists([gist.data], result.folderId);

    toast({
      title: `${storedData.snippets} snippets imported`,
    });
    emit('close');
  } catch (error) {
    logger.error(getLogMessage('import-gists:by-id', error));

    toast({
      variant: 'destructive',
      title: 'An error occured',
      description: (error as Error).message,
    });
  } finally {
    gistState.loading = false;
  }
}
function startImport() {
  const trimmedValue = gistState.url.trim();
  if (!trimmedValue) return;

  if (trimmedValue.startsWith(GITHUB_GISTS_BASE_URL)) {
    importById(trimmedValue);
  }
}

onMounted(() => {
  appVault.get('github-key').then((value) => {
    hasGitHubPAT.value = Boolean(value);
    githubPat.value = value ? '#'.repeat(12) + value.slice(-4) : '';
  });
});
</script>
<style>
.CollapsibleContent {
  overflow: hidden;
}
.CollapsibleContent[data-state='open'] {
  animation: slideDown 300ms ease-out;
}
.CollapsibleContent[data-state='closed'] {
  animation: slideUp 300ms ease-out;
}

@keyframes slideDown {
  from {
    height: 0;
  }
  to {
    height: var(--radix-collapsible-content-height);
  }
}

@keyframes slideUp {
  from {
    height: var(--radix-collapsible-content-height);
  }
  to {
    height: 0;
  }
}
</style>

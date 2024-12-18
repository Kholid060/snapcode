<template>
  <DialogHeader class="px-6 pt-6">
    <DialogTitle>Import GitHub Gists</DialogTitle>
  </DialogHeader>
  <form @submit.prevent="startImport">
    <div class="px-6 pb-2 pt-6">
      <Label for="gist-input">GitHub username/Gist URL</Label>
      <div class="flex gap-2">
        <Button
          v-if="listGistsByUsernameData"
          type="button"
          @click="clearListPageState"
          class="size-10 flex-shrink-0 px-0"
          variant="secondary"
        >
          <ArrowLeft01Icon />
        </Button>
        <Input
          v-model="gistState.url"
          id="gist-input"
          :disabled="
            Boolean(listGistsByUsernameData) || listImportState.isLoading
          "
          placeholder="https://gists.github.com/john_doe/92kd91ads"
        />
      </div>
      <p
        v-if="gistState.ratelimitRemaining"
        class="text-muted-foreground text-sm"
      >
        API usage remaining: {{ gistState.ratelimitRemaining }}
      </p>
    </div>
    <div
      class="overflow-auto px-6 pb-6"
      style="max-height: calc(100vh - 18rem)"
    >
      <CollapsibleRoot
        v-if="!listGistsByUsernameData"
        v-model:open="openSettings"
      >
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
            :disabled="hasGitHubPAT"
            @blur="saveGitHubPAT"
          />
          <p class="text-muted-foreground mt-0.5 text-xs">
            Use
            <UiLink
              href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token"
              class="underline"
            >
              GitHub fine-grained access tokens
            </UiLink>
            to increase the API limit. You can use one that doesn't have any
            permissions.
          </p>
        </CollapsibleContent>
      </CollapsibleRoot>
      <ListboxRoot
        v-model="selectedGists"
        v-if="listGistsByUsernameData"
        multiple
        class="pt-1"
      >
        <ListboxContent>
          <ListboxItem
            v-for="gist in githubGistsList"
            :key="gist.id"
            :value="gist"
            class="data-[highlighted]:ring-primary text-muted-foreground focus:ring-ring data-[state=checked]:bg-primary/10 data-[state=checked]:text-foreground relative mb-px flex h-8 w-full select-none items-center rounded px-2 text-sm outline-none focus:ring-2 data-[disabled]:opacity-50 data-[highlighted]:ring-2"
          >
            <ListboxItemIndicator class="absolute left-2">
              <Tick02Icon class="size-5" />
            </ListboxItemIndicator>
            <p class="grow truncate pl-6">
              {{ getGitHubGistName(gist) }}
            </p>
          </ListboxItem>
          <div
            v-if="
              listGistsPaginationState.hasPagination &&
              !listImportState.isLoading
            "
            class="mt-1 flex justify-end gap-2"
          >
            <Button
              variant="secondary"
              type="button"
              class="mt-4"
              :disabled="
                listGistsPaginationState.page <= 0 ||
                listGistsPaginationState.isLoading
              "
              @click="listGistsPaginationState.page -= 1"
            >
              Prev page
            </Button>
            <Button
              variant="secondary"
              type="button"
              class="mt-4"
              :disabled="
                listGistsPaginationState.page >=
                listGistsPaginationState.maxPage
              "
              :is-loading="listGistsPaginationState.isLoading"
              @click="loadNextListPage"
            >
              Next page
            </Button>
          </div>
        </ListboxContent>
      </ListboxRoot>
    </div>
    <DialogFooter
      v-if="listGistsByUsernameData"
      class="items-center px-6 pb-6 pt-2"
    >
      <p v-if="listImportState.isLoading">
        <Loading03Icon class="inline animate-spin align-top" />
        {{ listImportState.importCount }} imported
      </p>
      <template v-else>
        <Checkbox
          @update:checked="toggleSelectAllSnippets"
          id="select-all-checkbox"
          :checked="selectedGists.length > 0"
        >
          <MinusSignIcon
            v-if="selectedGists.length !== listGistsByUsernameData.length"
          />
        </Checkbox>
        <Label for="select-all-checkbox">
          {{
            selectedGists.length !== listGistsByUsernameData.length
              ? 'Select'
              : 'Deselect'
          }}
          all
        </Label>
      </template>
      <div class="grow"></div>
      <DialogClose as-child>
        <Button
          type="button"
          variant="outline"
          :disabled="listImportState.isLoading || listImportState.isLoading"
        >
          Cancel
        </Button>
      </DialogClose>
      <Button
        :disabled="listImportState.isLoading || selectedGists.length <= 0"
        class="gap-0"
        type="button"
        @click="importSelectedGists"
      >
        Import selected
        <span class="ml-1 tabular-nums">({{ selectedGists.length }})</span>
      </Button>
    </DialogFooter>
    <DialogFooter v-else class="px-6 pb-6 pt-2">
      <p v-if="listImportState.isLoading">
        <Loading03Icon class="inline animate-spin align-top" />
        {{ listImportState.importCount }} imported
      </p>
      <Button
        v-else
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
        <Button
          type="button"
          variant="outline"
          :disabled="listImportState.isLoading || listImportState.isLoading"
        >
          Cancel
        </Button>
      </DialogClose>
      <div
        class="bg-primary text-primary-foreground relative flex h-9 items-center rounded-md text-sm"
      >
        <div
          v-if="gistState.loading || listImportState.isLoading"
          style="background-color: inherit; border-radius: inherit"
          class="absolute left-0 top-0 z-50 flex size-full items-center justify-center"
        >
          <Loading03Icon style="color: inherit" class="animate-spin" />
        </div>
        <button
          type="submit"
          class="hover:bg-lime-10 h-full grow rounded-l-md px-3 font-medium transition-colors"
          :disabled="gistState.loading || listImportState.isLoading"
        >
          Import
        </button>
        <hr class="h-6 w-px bg-black/20" />
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            class="hover:bg-lime-10 h-full w-9 rounded-r-md text-center transition-colors"
            :disabled="gistState.loading || listImportState.isLoading"
          >
            <ArrowDown01Icon class="inline size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="importAll"> Import all </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </DialogFooter>
  </form>
</template>
<script setup lang="ts">
import UiLink from '@/components/ui/UiLink.vue';
import type { FolderNewPayload } from '@/interface/folder.interface';
import type {
  GitHubApiPagination,
  GitHubGistListItem,
} from '@/interface/github.interface';
import type { SnippetNewPayload } from '@/interface/snippet.interface';
import { useAppDialog } from '@/providers/app-dialog.provider';
import appVault from '@/services/app-vault.service';
import {
  getGitHubGistsById,
  listGitHubGistsByUsername,
} from '@/services/github-gists.service';
import { logger } from '@/services/logger.service';
import { useEditorStore } from '@/stores/editor.store';
import {
  joinDocumentPath,
  sanitizeDocumentFileName,
} from '@/utils/document-utils';
import { FetchError } from '@/utils/errors';
import {
  extractGistsIdFromURL,
  getGitHubGistName,
  GITHUB_GISTS_BASE_URL,
  githubGistFilesToSnippet,
  githubGistFileToSnippet,
} from '@/utils/github-utils';
import { getLogMessage } from '@/utils/helper';
import { TREE_ROOT_KEY } from '@/utils/tree-data-utils';
import {
  Button,
  Checkbox,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  useToast,
} from '@snippy/ui';
import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  Cancel01Icon,
  Loading03Icon,
  MinusSignIcon,
  Settings01Icon,
  Tick02Icon,
} from 'hugeicons-vue';
import { nanoid } from 'nanoid/non-secure';
import {
  CollapsibleContent,
  CollapsibleRoot,
  ListboxContent,
  ListboxItem,
  ListboxItemIndicator,
  ListboxRoot,
} from 'radix-vue';

interface ListPaginationState {
  page: number;
  maxPage: number;
  isLoading: boolean;
  hasPagination: boolean;
  link: GitHubApiPagination | null;
}

const emit = defineEmits<{
  close: [];
}>();

const LIST_GIST_PER_PAGE = 30;
const defaultListPaginationState = {
  page: 0,
  link: null,
  isLoading: false,
  maxPage: Infinity,
  hasPagination: false,
};

const { toast } = useToast();
const appDialog = useAppDialog();
const editorStore = useEditorStore();

const gistState = shallowReactive({
  url: '',
  loading: false,
  ratelimitRemaining: '',
});

const listImportState = shallowReactive({
  importCount: 0,
  isLoading: false,
});
const listGistsPaginationState = shallowReactive<ListPaginationState>({
  ...defaultListPaginationState,
});
const selectedGists = shallowRef<GitHubGistListItem[]>([]);
const listGistsByUsernameData = shallowRef<GitHubGistListItem[] | null>(null);

const githubPat = shallowRef('');
const openSettings = shallowRef(false);
const hasGitHubPAT = shallowRef(false);

const githubGistsList = computed(() => {
  if (!listGistsByUsernameData.value) return [];
  if (listGistsByUsernameData.value.length <= LIST_GIST_PER_PAGE)
    return listGistsByUsernameData.value;

  const pageNum = listGistsPaginationState.page;
  return listGistsByUsernameData.value.slice(
    pageNum > 0 ? pageNum * LIST_GIST_PER_PAGE : pageNum,
    (pageNum + 1) * LIST_GIST_PER_PAGE,
  );
});

async function importAll() {
  const username = gistState.url.trim();
  if (!username) return;
  if (username.startsWith(GITHUB_GISTS_BASE_URL)) {
    importById(username);
    return;
  }

  try {
    const selectFolder = await appDialog.selectFolder({
      title: 'Select folder where to store the snippets',
    });
    if (selectFolder.canceled) return;

    listImportState.isLoading = true;
    let params: Record<string, string> | URLSearchParams = {
      per_page: LIST_GIST_PER_PAGE.toString(),
    };

    while (true) {
      const result = await listGitHubGistsByUsername(username, params);
      await storeGitHubGists(result.data, selectFolder.folder.id);

      listImportState.importCount += result.data.length;
      gistState.ratelimitRemaining = result.ratelimitRemaining ?? '';

      const nextLinkUrl = result.pagination?.next;
      if (!nextLinkUrl) break;

      params = new URL(nextLinkUrl).searchParams;
    }

    selectedGists.value = [];
    toast({
      title: `${listImportState.importCount} snippets imported`,
    });
    emit('close');
  } catch (error) {
    logger.error(getLogMessage('import-gists:import-all', error));
    toast({
      variant: 'destructive',
      title: 'An error occured',
      description: (error as Error).message,
    });
  } finally {
    listImportState.importCount = 0;
    listImportState.isLoading = false;
  }
}
async function importSelectedGists() {
  try {
    const selectFolder = await appDialog.selectFolder({
      title: 'Select folder where to store the snippets',
    });
    if (selectFolder.canceled) return;

    listImportState.isLoading = true;
    let page = 0;

    while (true) {
      const gists = selectedGists.value.slice(
        page > 0 ? page * LIST_GIST_PER_PAGE : 0,
        (page + 1) * LIST_GIST_PER_PAGE,
      );
      if (gists.length <= 0) break;

      await storeGitHubGists(gists, selectFolder.folder.id);
      listImportState.importCount += gists.length;

      page += 1;
    }

    selectedGists.value = [];
    toast({
      title: `${listImportState.importCount} snippets imported`,
    });
    emit('close');
  } catch (error) {
    console.error(error);
    logger.error(getLogMessage('import-gists:import-selected', error));
    toast({
      variant: 'destructive',
      title: 'An error occured',
      description: (error as Error).message,
    });
  } finally {
    listImportState.importCount = 0;
    listImportState.isLoading = false;
  }
}
function clearListPageState() {
  selectedGists.value = [];
  listGistsByUsernameData.value = null;
  Object.assign(listGistsPaginationState, { ...defaultListPaginationState });
}
async function loadNextListPage() {
  if (!listGistsByUsernameData.value) return;
  try {
    const nextPageItemIndex =
      (listGistsPaginationState.page + 1) * LIST_GIST_PER_PAGE + 1;
    if (listGistsByUsernameData.value[nextPageItemIndex]) {
      listGistsPaginationState.page += 1;
      return;
    }

    const nextLink = listGistsPaginationState.link?.next;
    if (!nextLink) {
      listGistsPaginationState.maxPage = listGistsPaginationState.page;
      return;
    }

    listGistsPaginationState.isLoading = true;
    const result = await listGitHubGistsByUsername(
      gistState.url.trim(),
      new URL(nextLink).searchParams,
    );

    gistState.ratelimitRemaining = result.ratelimitRemaining ?? '';
    listGistsByUsernameData.value = listGistsByUsernameData.value.concat(
      result.data,
    );
    listGistsPaginationState.page += 1;
    listGistsPaginationState.link = result.pagination;
  } catch (error) {
    logger.error(getLogMessage('import-gists:load-next-page', error));
    toast({
      variant: 'destructive',
      title: 'An error occured',
      description: (error as Error).message,
    });
  } finally {
    listGistsPaginationState.isLoading = false;
  }
}
function toggleSelectAllSnippets() {
  if (
    !listGistsByUsernameData.value ||
    listGistsByUsernameData.value.length === 0
  )
    return;

  selectedGists.value =
    selectedGists.value.length !== listGistsByUsernameData.value.length
      ? listGistsByUsernameData.value
      : [];
}
async function storeGitHubGists(
  gists: GitHubGistListItem[],
  folderId?: string | null,
) {
  const folders: FolderNewPayload[] = [];
  const snippets: SnippetNewPayload[] = [];

  const folderMetadata =
    editorStore.document.treeMetadata[folderId || TREE_ROOT_KEY];

  await Promise.all(
    gists.map(async (gist) => {
      const files = Object.values(gist.files);
      if (files.length > 1) {
        const gistFolderId = nanoid(5);
        const folderName = gist.description
          ? sanitizeDocumentFileName(gist.description.slice(0, 120))
          : files[0].filename;
        const folderPath = joinDocumentPath(
          folderMetadata.path,
          folderName + `-${nanoid(4)}`,
        );
        folders.push({
          path: folderPath,
          metadata: { id: gistFolderId, parentId: folderMetadata.id },
        });
        snippets.push(
          ...(await githubGistFilesToSnippet({
            files,
            folderPath,
            metadata: { parentId: gistFolderId },
          })),
        );
      } else if (files[0]) {
        snippets.push(
          await githubGistFileToSnippet({
            file: files[0],
            folderPath: folderMetadata.path,
            metadata: folderId
              ? {
                  parentId: folderId,
                }
              : undefined,
          }),
        );
      }
    }),
  );

  console.log({ folders, snippets });

  if (folders.length > 0) await editorStore.document.addFolders(folders);
  if (snippets.length > 0) await editorStore.document.addSnippets(snippets);

  return {
    folders: folders.length,
    snippets: snippets.length,
  };
}
async function saveGitHubPAT() {
  try {
    if (hasGitHubPAT.value) return;

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

    const storedData = await storeGitHubGists([gist.data], result.folder.id);

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
async function startImportByUsername(username: string) {
  try {
    gistState.loading = true;

    const gists = await listGitHubGistsByUsername(username, {
      per_page: LIST_GIST_PER_PAGE.toString(),
    });
    gistState.ratelimitRemaining = gists.ratelimitRemaining ?? '';

    listGistsByUsernameData.value = gists.data;
    listGistsPaginationState.link = gists.pagination;
    listGistsPaginationState.hasPagination = Boolean(gists.pagination);
  } catch (error) {
    if (error instanceof FetchError && error.status === 404) {
      toast({
        variant: 'destructive',
        title: 'GitHub user not found',
      });
      return;
    }

    logger.error(getLogMessage('import-gists:start-by-username', error));

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
  } else {
    startImportByUsername(trimmedValue);
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

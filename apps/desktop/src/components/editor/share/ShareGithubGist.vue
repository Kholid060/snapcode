<template>
  <DialogHeader>
    <DialogTitle> Share Snippet to GitHub Gist </DialogTitle>
  </DialogHeader>
  <div v-if="sharedGist.isShared">
    <p class="text-sm">Snippets successfully shared to GitHub Gist</p>
    <div class="flex items-center gap-2">
      <div class="relative grow">
        <Input
          :model-value="getGitHubGistUrl(sharedGist.id)"
          readonly
          class="pr-9"
          @click="$event.target.select()"
        />
        <UiLink
          class="absolute right-2 top-1/2 -translate-y-1/2"
          :href="getGitHubGistUrl(sharedGist.id)"
        >
          <LinkCircle02Icon class="size-5" />
        </UiLink>
      </div>
      <Button @click="copyText(getGitHubGistUrl(sharedGist.id))">
        {{ copied ? '✅ Copied' : 'Copy' }}
      </Button>
    </div>
  </div>
  <template v-else>
    <div class="mx-auto my-4 max-w-sm text-center" v-if="!hasGithubPat">
      <h2 class="text-lg font-semibold">Missing access token</h2>
      <p class="text-muted-foreground mt-1 text-sm">
        GitHub Personal Access Token is required to share snippet to GitHub Gist
      </p>
      <div class="mt-4 space-x-2">
        <Button
          @click="editorStore.state.openSettings('integration:github-gist')"
        >
          Open settings
        </Button>
        <Button @click="checkToken" variant="secondary"> Retry </Button>
      </div>
    </div>
    <template v-else>
      <fieldset>
        <Label>Snippets</Label>
        <TagsInput class="w-full gap-0 px-0" :model-value="gistPayload.paths">
          <div class="flex flex-wrap items-center gap-1 px-3">
            <TagsInputItem
              v-for="item in gistPayload.paths"
              :key="item"
              :value="item"
              :title="item"
            >
              <TagsInputItemText class="max-w-56 truncate" />
              <TagsInputItemDelete />
            </TagsInputItem>
          </div>
          <ComboboxRoot
            v-model="gistPayload.paths"
            v-model:open="open"
            v-model:search-term="searchTerm"
            class="w-full"
          >
            <ComboboxAnchor as-child>
              <ComboboxInput placeholder="Search snippet..." as-child>
                <TagsInputInput
                  class="w-full px-3"
                  :class="gistPayload.paths.length > 0 ? 'mt-2' : ''"
                  @keydown.enter.prevent
                />
              </ComboboxInput>
            </ComboboxAnchor>
            <ComboboxPortal>
              <ComboboxContent style="z-index: 999" class="relative">
                <CommandList
                  position="popper"
                  class="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 mt-2 w-[--radix-popper-anchor-width] rounded-md border shadow-md outline-none"
                >
                  <CommandEmpty />
                  <CommandGroup>
                    <CommandItem
                      v-for="item in filteredSnippets"
                      :key="item.path"
                      :value="item.path"
                      @select.prevent="
                        (ev: CustomEvent) => {
                          if (typeof ev.detail.value === 'string') {
                            searchTerm = '';
                            gistPayload.paths.push(ev.detail.value);
                          }
                          if (filteredSnippets.length === 0) {
                            open = false;
                          }
                        }
                      "
                    >
                      {{ item.path }}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </ComboboxContent>
            </ComboboxPortal>
          </ComboboxRoot>
        </TagsInput>
      </fieldset>
      <fieldset>
        <Label for="gist-description">Description (optional)</Label>
        <Textarea v-model="gistPayload.description" id="gist-description" />
      </fieldset>
      <fieldset class="flex items-center gap-2">
        <Switch id="gist-public" v-model:checked="gistPayload.public" />
        <Label for="gist-public">Public</Label>
      </fieldset>
      <DialogFooter class="mt-4">
        <Button
          class="text-muted-foreground px-2"
          variant="ghost"
          type="button"
          @click="editorStore.state.openSettings('integration:github-gist')"
        >
          <Settings01Icon class="size-5" />
          Settings
        </Button>
        <div class="grow"></div>
        <DialogClose as-child>
          <Button variant="secondary" type="button" :disabled="isLoading">
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="button"
          :disabled="gistPayload.paths.length === 0"
          :is-loading="isLoading"
          @click="shareSnippets"
        >
          Share
        </Button>
      </DialogFooter>
    </template>
  </template>
</template>
<script setup lang="ts">
import appVault from '@/services/app-vault.service';
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxPortal,
  ComboboxRoot,
} from 'radix-vue';
import {
  Button,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Switch,
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
  Textarea,
  useToast,
} from '@snippy/ui';
import { useEditorStore } from '@/stores/editor.store';
import { LinkCircle02Icon, Settings01Icon } from 'hugeicons-vue';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';
import { getNameFromPath } from '@/utils/document-utils';
import { createGitHubGist } from '@/services/github-gists.service';
import type { GitHubCreateGistPayload } from '@/interface/github.interface';
import documentService from '@/services/document.service';
import { getGitHubGistName, getGitHubGistUrl } from '@/utils/github-utils';
import { FetchError } from '@/utils/errors';
import UiLink from '@/components/ui/UiLink.vue';
import { useCopyText } from '@/composables/clipboard.composable';

const { toast } = useToast();
const editorStore = useEditorStore();
const { copied, copyText } = useCopyText();

const open = shallowRef(false);
const searchTerm = shallowRef('');
const isLoading = shallowRef(false);
const hasGithubPat = shallowRef(false);

const sharedGist = shallowReactive({
  id: '',
  isShared: false,
});
const gistPayload = reactive<{
  paths: string[];
  public: boolean;
  description: string;
}>({
  paths: [],
  public: false,
  description: '',
});

const snippets = computed(() =>
  Object.values(editorStore.document.treeMetadata).filter(
    (item) => !item.isDir,
  ),
);
const filteredSnippets = computed(() =>
  snippets.value.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.value.toLowerCase()) &&
      !gistPayload.paths.includes(item.path),
  ),
);

async function checkToken() {
  hasGithubPat.value = await appVault
    .get('github-key')
    .then((value) => Boolean(value));
}
async function shareSnippets() {
  try {
    isLoading.value = true;

    const paths: Record<string, string> = {};
    const duplicateCount: Record<string, number> = {};

    for (const path of gistPayload.paths) {
      let filename = getNameFromPath(path);
      if (Object.hasOwn(paths, filename)) {
        duplicateCount[filename] = (duplicateCount[filename] || 0) + 1;
        filename = `(${duplicateCount[filename]}) ${filename}`;
      }

      paths[filename] = path;
    }

    const payload: Required<GitHubCreateGistPayload> = {
      files: {},
      public: gistPayload.public,
      description: gistPayload.description,
    };
    await Promise.all(
      Object.entries(paths).map(async ([name, path]) => {
        const content =
          (await documentService.getFileContent(path)) || '[empty]';
        payload.files[name] = { content };
      }),
    );

    const gist = await createGitHubGist(payload);
    await documentService.addSharedSnippets({
      id: gist.data.id,
      type: 'github-gist',
      createdAt: Date.now(),
      name: getGitHubGistName(gist.data),
    });

    sharedGist.id = gist.data.id;
    sharedGist.isShared = true;
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
      title: 'Failed to share snippet',
    });
  } finally {
    isLoading.value = false;
  }
}

onBeforeMount(async () => {
  gistPayload.paths = [editorStore.activeSnippet!.path];
  checkToken();
});
</script>

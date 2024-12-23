<template>
  <div class="mt-4">
    <Label for="pat-input">GitHub Personal Access Tokens</Label>
    <div class="flex items-center gap-2">
      <Input
        id="pat-input"
        v-model="githubPat"
        placeholder="github_pat_xxxx"
        class="bg-transparent"
        autocomplete="off"
        :disabled="Boolean(githubPat)"
        @blur="saveGitHubPAT"
      />
      <Button
        v-if="Boolean(githubPat)"
        type="button"
        variant="secondary"
        @click="removeGitHubPAT"
      >
        remove
      </Button>
    </div>
    <p class="text-muted-foreground mt-0.5 text-xs">
      <UiLink
        href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token"
        class="underline"
      >
        GitHub fine-grained access tokens
      </UiLink>
      are required when you want to share snippets to the GitHub Gist or
      increase the API limit when importing GitHub Gist. The token must have the
      "Gists" permission to share snippets.
    </p>
  </div>
</template>
<script setup lang="ts">
import UiLink from '@/components/ui/UiLink.vue';
import appVault from '@/services/app-vault.service';
import { logger } from '@/services/logger.service';
import { getLogMessage } from '@/utils/helper';
import { Button, Input, Label } from '@snippy/ui';

const githubPat = shallowRef('');

async function removeGitHubPAT() {
  try {
    await appVault.remove('github-key');
    githubPat.value = '';
  } catch (error) {
    logger.error(getLogMessage('share-github-gist:remove-key', error));
  }
}
async function saveGitHubPAT() {
  try {
    if (!githubPat.value) return;

    await appVault.update('github-key', githubPat.value);
  } catch (error) {
    logger.error(getLogMessage('import-gists:save-key', error));
  }
}

onBeforeMount(async () => {
  githubPat.value = await appVault
    .get('github-key')
    .then((value) => (value ? '#'.repeat(12) + value.slice(-4) : ''));
});
</script>

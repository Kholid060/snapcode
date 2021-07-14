<template>
  <div class="snippet-view container my-10 px-4">
    <error-state-ui v-if="state.status === 'error'" code="404"></error-state-ui>
    <template v-else>
      <snippet-navigation v-if="state.status === 'idle'" v-bind="{ file }"></snippet-navigation>
      <div v-else class="w-64 bg-input-dark animate-pulse rounded-lg mb-12 h-12"></div>
      <div class="editor bg-light rounded-lg pb-4">
        <div class="rounded-t-lg p-4 mb-4 flex items-center border-b">
          <div v-if="state.status === 'idle'" class="file-info">
            <p>{{ file.name }}</p>
            <p class="text-sm leading-tight text-lighter">{{ file.language }}</p>
          </div>
          <div v-else class="h-10 rounded-lg w-48 bg-input-dark animate-pulse"></div>
          <div class="flex-grow"></div>
          <div
            v-if="state.isLocalFile && !file.isShared"
            v-tooltip:bottom="'Only you can see this snippet'"
            class="px-3 py-2 rounded-full bg-danger self-center bg-opacity-25 text-danger mr-4"
          >
            <v-mdi name="mdi-lock-outline" size="20"></v-mdi>
            <span class="ml-1 text-sm">Private</span>
          </div>
          <snippet-buttons-group
            v-bind="{ file, isLocalFile: state.isLocalFile }"
            @fork="state.isLocalFile = true"
          ></snippet-buttons-group>
        </div>
        <app-codemirror :model-value="file.code" :options="cmOptions"></app-codemirror>
      </div>
    </template>
  </div>
</template>
<script>
import { defineAsyncComponent, onMounted, ref, shallowReactive } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { File } from '~/models';
import languages from '~/utils/languages';
import { apiFetch } from '~/utils/firebase';
import SnippetNavigation from '~/components/pages/snippet/SnippetNavigation.vue';
import SnippetButtonsGroup from '~/components/pages/snippet/SnippetButtonsGroup.vue';

export default {
  components: {
    SnippetButtonsGroup,
    AppCodemirror: defineAsyncComponent(() => import('~/components/app/AppCodemirror.vue')),
    SnippetNavigation,
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const route = router.currentRoute.value;

    const file = ref({ user: {} });
    const state = shallowReactive({
      status: 'idle',
      isLocalFile: false,
    });
    const cmOptions = shallowReactive({
      readOnly: true,
      mode: '',
    });

    onMounted(async () => {
      try {
        state.status = 'loading';
        const localFile = File.find(route.params.fileId);

        if (localFile !== null) {
          state.isLocalFile = true;
          file.value = {
            ...localFile,
            user: {
              displayName: store.state.user.displayName || 'Guest',
              photoURL: store.state.user?.photoUrl || null,
            },
          };
        } else {
          const data = await apiFetch(`/files/${route.params.fileId}`);
          file.value = data;
        }

        cmOptions.mode = languages[file.value.language]?.mode;
        state.status = 'idle';
      } catch (error) {
        console.error(error);
        state.status = 'error';
      }
    });

    return {
      file,
      state,
      cmOptions,
      languages,
    };
  },
};
</script>
<style>
.snippet-view .CodeMirror-linenumber,
.snippet-view .CodeMirror-linenumbers {
  @apply bg-light !important;
}
</style>

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
          <snippet-buttons-group :file="file"></snippet-buttons-group>
        </div>
        <app-codemirror
          class="px-4 pb-4"
          :model-value="file.code"
          :options="cmOptions"
        ></app-codemirror>
      </div>
    </template>
  </div>
</template>
<script>
import { defineAsyncComponent, onMounted, ref, shallowReactive, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
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
  props: {
    isModal: Boolean,
  },
  setup(props) {
    const store = useStore();
    const route = useRoute();

    const file = ref({ user: {} });
    const state = shallowReactive({
      status: 'idle',
      isRetrieved: false,
    });
    const cmOptions = shallowReactive({
      readOnly: true,
      mode: '',
    });

    async function fetchSnippet() {
      if (!route.params.fileId) return;

      try {
        state.status = 'loading';
        const cache = store.getters.getSnippetCache(route.params.fileId);

        if (cache) {
          file.value = cache;
        } else {
          const data = await apiFetch(`/files/${route.params.fileId}`);
          file.value = data;
        }

        cmOptions.mode = languages[file.value.language]?.mode;
        state.status = 'idle';
        state.isRetrieved = true;
      } catch (error) {
        console.error(error);
        state.status = 'error';
      }
    }

    watch(() => route.params, () => {
      if (!state.isRetrieved) fetchSnippet();
    });

    onMounted(fetchSnippet);

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

<template>
  <div class="container px-2 md:px-4 lg:px-0 py-4">
    <explore-navigation @update="fetchData"></explore-navigation>
    <spinner-ui v-if="state.status === 'loading'" size="36" class="mx-auto mt-6"></spinner-ui>
    <error-state-ui
      v-else-if="state.status === 'error'"
      code="500"
      @action="fetchData"
    ></error-state-ui>
    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-2 mb-8 gap-4">
        <explore-card
          v-for="snippet in $store.state.snippetsCache"
          v-bind="{ snippet }"
          :key="snippet.id"
          @modal="showModal(snippet)"
        ></explore-card>
      </div>
      <div v-if="$store.state.nextKey" class="text-center">
        <button-ui :loading="state.btnLoading" @click="loadMore">Load more</button-ui>
      </div>
    </template>
  </div>
  <modal-ui v-model="state.showModal" custom-content>
    <div class="fixed top-0 left-0 w-full h-screen flex flex-col" style="z-index: 9999">
      <div
        class="h-14 bg-black bg-opacity-50 cursor-pointer items-center justify-end hidden md:flex"
        @click="closeModal"
      >
        <v-mdi name="mdi-close" class="mr-4"></v-mdi>
      </div>
      <div class="bg-lighter rounded-t-lg overflow-auto bg-opacity-100 flex-1">
        <snippet :snippet="state.snippet"></snippet>
      </div>
    </div>
  </modal-ui>
</template>
<script>
import { reactive, watchEffect, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';
import CodeMirror from '~/lib/codemirror';
import dayjs from '~/lib/dayjs';
import Snippet from './Snippet.vue';
import { apiFetch } from '~/utils/firebase';
import ExploreCard from '~/components/pages/explore/ExploreCard.vue';
import ExploreNavigation from '~/components/pages/explore/ExploreNavigation.vue';

export default {
  components: { ExploreCard, ExploreNavigation, Snippet },
  setup() {
    const route = useRoute();
    const toast = useToast();
    const router = useRouter();
    const store = useStore();

    const state = reactive({
      status: 'idle',
      showModal: false,
      btnLoading: false,
    });

    function formatSnippet(snippet) {
      return {
        ...snippet,
        createdAt: dayjs(snippet.createdAt).fromNow(),
        name: snippet.name,
      };
    }
    function fetchSnippets(query = {}, replace = false) {
      return new Promise((resolve, reject) => {
        const searchParam = new URLSearchParams(query);

        apiFetch(`/explore?${searchParam.toString()}`)
          .then((data) => {
            if (data.error) throw new Error(data.error);

            const snippets = data.snippets.map(formatSnippet);

            store.commit('updateState', { key: 'nextKey', value: data.nextKey });

            if (replace) store.commit('updateState', { key: 'snippetsCache', value: snippets });
            else store.commit('addSnippetCache', snippets);

            resolve();
          })
          .catch((error) => {
            console.error(error);
            reject();
          });
      });
    }
    function loadMore() {
      state.btnLoading = true;

      const query = { ...route.query, nextPageId: JSON.stringify(store.state.nextKey) };

      fetchSnippets(query)
        .then(() => {
          state.btnLoading = false;
        })
        .catch((error) => {
          console.error(error);
          state.btnLoading = false;
          toast.error('Something went wrong');
        });
    }
    function fetchData(useCache) {
      if (!route.path.includes('explore') && store.state.snippetsCache.length !== 0) return;

      state.status = 'loading';

      const query = { ...route.query };
      const isInvalidSort =
        query.sortBy && !['oldestSnippets', 'recentSnippets'].includes(query.sortBy);

      if (isInvalidSort) {
        query.sortBy = 'recentSnippets';
      }

      fetchSnippets(query, true)
        .then(() => {
          state.status = 'idle';
        })
        .catch(() => {
          state.status = 'error';
        });
    }
    async function showModal(snippet) {
      const backgroundView = router.currentRoute.value.fullPath;

      await router.push({
        name: 'snippet',
        params: { fileId: snippet.id },
      });

      history.replaceState({ ...history.state, backgroundView }, '');
      store.commit('updateState', { key: 'historyState', value: history.state });
    }
    function closeModal() {
      history.back();
    }

    const stop = watchEffect(
      () => {
        state.showModal = store.state.historyState.backgroundView ? true : false;
      },
      { flush: 'post' }
    );

    onMounted(() => {
      window.CodeMirror = CodeMirror;

      fetchData();
    });
    onUnmounted(stop);

    return {
      state,
      loadMore,
      showModal,
      fetchData,
      closeModal,
    };
  },
};
</script>

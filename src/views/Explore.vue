<template>
  <div class="container px-2 md:px-4 lg:px-0 py-4">
    <explore-navigation></explore-navigation>
    <spinner-ui v-if="state.status === 'loading'" size="36" class="mx-auto mt-6"></spinner-ui>
    <div v-else-if="state.status === 'error'" class="py-12 text-center">
      <img :src="sadFaceSvg" class="mx-auto" alt="error image" />
      <p class="text-lg mb-4">Oppss... something went wrong.</p>
      <button-ui variant="primary" @click="fetchData"> Try again </button-ui>
    </div>
    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-2 mb-8 gap-4">
        <explore-card
          v-for="snippet in state.snippets"
          :key="snippet.id"
          v-bind="{ snippet }"
        ></explore-card>
      </div>
      <div v-if="state.nextKey" class="text-center">
        <button-ui :loading="state.btnLoading" @click="loadMore">Load more</button-ui>
      </div>
    </template>
  </div>
</template>
<script>
import { reactive, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import dayjs from '~/lib/dayjs';
import languages from '~/utils/languages';
import sadFaceSvg from '~/assets/svg/sad-face.svg';
import ExploreCard from '~/components/pages/explore/ExploreCard.vue';
import ExploreNavigation from '~/components/pages/explore/ExploreNavigation.vue';

export default {
  components: { ExploreCard, ExploreNavigation },
  setup() {
    const route = useRoute();
    const toast = useToast();

    const state = reactive({
      status: 'idle',
      snippets: [],
      nextKey: null,
      btnLoading: false,
    });

    function formatSnippet(snippet) {
      const language = languages[snippet.language] || {};

      return {
        ...snippet,
        createdAt: dayjs(snippet.createdAt).fromNow(),
        mode: language.mode || '',
        name: `${snippet.name} [${snippet.language}]`,
      };
    }
    function fetchSnippets(query = {}, replace = false) {
      return new Promise((resolve, reject) => {
        const searchParam = new URLSearchParams(query);

        fetch(`${import.meta.env.VITE_API_BASE_URL}/explore?${searchParam.toString()}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.error) throw new Error(data.error);

            const snippets = data.snippets.map(formatSnippet);

            state.nextKey = data.nextKey;

            if (replace) state.snippets = snippets;
            else state.snippets.push(...snippets);

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

      const query = { ...route.query, nextPageId: JSON.stringify(state.nextKey) };

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
    function fetchData() {
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

    watch(() => route.query, fetchData, { immediate: true });

    return {
      state,
      loadMore,
      fetchData,
      sadFaceSvg,
    };
  },
};
</script>

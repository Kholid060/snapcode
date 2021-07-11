<template>
  <div class="container px-2 md:px-4 lg:px-0 py-4">
    <spinner-ui v-if="state.status === 'loading'" size="36" class="mx-auto mt-6"></spinner-ui>
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 mb-8 gap-4">
      <explore-card
        v-for="snippet in state.snippets"
        :key="snippet.id"
        v-bind="{ snippet }"
      ></explore-card>
    </div>
    <div v-if="state.nextKey" class="text-center">
      <button-ui :loading="state.btnLoading" @click="loadMore">Load more</button-ui>
    </div>
  </div>
</template>
<script>
import { onMounted, reactive } from 'vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import languages from '~/utils/languages';
import ExploreCard from '~/components/pages/explore/ExploreCard.vue';

dayjs.extend(relativeTime);

export default {
  components: { ExploreCard },
  setup() {
    const state = reactive({
      loading: false,
      snippets: [],
      nextKey: null,
      btnLoading: false,
    });

    function formatSnippet(snippet) {
      const language = languages[snippet.language] || {};

      return {
        ...snippet,
        createdAt: dayjs(snippet.createdAt).fromNow(),
        mode: language.mode,
        name: `${snippet.name}.${language.ext}`,
      };
    }
    function fetchSnippets(query = '') {
      return new Promise((resolve, reject) => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/explore${query}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.error) throw new Error(data.error);

            const snippets = data.snippets.map(formatSnippet);

            state.nextKey = data.nextKey;
            state.snippets.push(...snippets);

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

      fetchSnippets(`?nextPageId=${JSON.stringify(state.nextKey)}`).then(() => {
        state.btnLoading = false;
      });
    }

    onMounted(() => {
      state.status = 'loading';

      fetchSnippets().then(() => {
        state.status = 'idle';
      });
    });

    return {
      state,
      loadMore,
    };
  },
};
</script>

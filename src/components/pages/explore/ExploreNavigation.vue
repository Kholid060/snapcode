<template>
  <div class="flex items-center mb-4 md:mb-8">
    <button class="lg:hidden mr-2" @click="$store.dispatch('toggleSidebar')">
      <v-mdi name="mdi-menu" class="cursor-pointer"></v-mdi>
    </button>
    <popover-ui class="mr-4 z-0 md:hidden">
      <button-ui icon>
        <v-mdi name="mdi-magnify"></v-mdi>
      </button-ui>
      <template #popover>
        <input-ui
          v-model="query.q"
          prepend-icon="mdi-magnify"
          placeholder="Search snippets"
          @keyup.enter="updateQuery('q')"
        ></input-ui>
      </template>
    </popover-ui>
    <input-ui
      v-model="query.q"
      class="mr-4 hidden md:block"
      prepend-icon="mdi-magnify"
      placeholder="Search snippets"
      @keyup.enter="updateQuery('q')"
    ></input-ui>
    <div class="flex-grow"></div>
    <select-ui
      v-model="query.sortBy"
      placeholder="Sort by"
      class="mr-3"
      @change="updateQuery('sortBy')"
    >
      <option value="recentSnippets">Recent snippets</option>
      <option value="oldestSnippets">Oldest snippets</option>
    </select-ui>
    <app-user-popover></app-user-popover>
  </div>
</template>
<script>
import { shallowReactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppUserPopover from '../../app/AppUserPopover.vue';

export default {
  components: { AppUserPopover },
  setup() {
    const sorts = [];

    const router = useRouter();

    const query = shallowReactive({
      q: '',
      sortBy: 'recentSnippets',
    });

    function updateQuery(key) {
      const currentQuery = router.currentRoute.value.query;

      router.push({ query: { ...currentQuery, [key]: query[key] } });
    }

    onMounted(() => {
      Object.keys(query).forEach((key) => {
        const value = router.currentRoute.value.query[key];

        if (value) query[key] = value;
      });
    });

    return {
      query,
      updateQuery,
    };
  },
};
</script>

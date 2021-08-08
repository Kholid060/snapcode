<template>
  <div class="flex items-center mb-4 md:mb-8">
    <button class="lg:hidden mr-2" aria-label="menu" @click="$store.dispatch('toggleSidebar')">
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
import { shallowReactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppUserPopover from '../../app/AppUserPopover.vue';

export default {
  components: { AppUserPopover },
  emits: ['update'],
  setup(props, { emit }) {
    const sorts = [];

    const router = useRouter();

    const query = shallowReactive({
      q: '',
      sortBy: 'recentSnippets',
    });

    async function updateQuery(key) {
      const currentQuery = router.currentRoute.value.query;

      await router.push({ query: { ...currentQuery, [key]: query[key] } });

      emit('update');
    }

    watch(
      () => router.currentRoute.value.path,
      (value) => {
        if (value.includes('explore')) {
          Object.keys(query).forEach((key) => {
            const value = router.currentRoute.value.query[key];

            if (value) query[key] = value;
          });
        }
      },
      { immediate: true }
    );

    return {
      query,
      updateQuery,
    };
  },
};
</script>

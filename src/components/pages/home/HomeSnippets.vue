<template>
  <div class="snippets relative h-full">
    <div class="border-b px-5 py-3 flex items-center justify-between">
      <div class="sort">
        <button-ui
          v-tooltip="sort.type === 'asc' ? 'ascending' : 'descending'"
          icon
          aria-label="sort"
          class="rounded-r-none border-r align-bottom"
          @click="sort.type = sort.type === 'asc' ? 'desc' : 'asc'"
        >
          <v-mdi :name="sort.type === 'asc' ? 'mdiSortAscending' : 'mdiSortDescending'"></v-mdi>
        </button-ui>
        <select-ui v-model="sort.by" class="rounded-l-none">
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.name }}
          </option>
        </select-ui>
      </div>
      <popover-ui>
        <button-ui icon variant="primary" :disabled="activeFilter === 'starred'" aria-label="add">
          <v-mdi name="mdi-plus"></v-mdi>
        </button-ui>
        <template #popover>
          <list-ui class="space-y-1 w-44">
            <list-item-ui v-close-popover small class="cursor-pointer" @click="addFile">
              <template #prepend>
                <v-mdi name="mdi-file-outline"></v-mdi>
              </template>
              <span>Add snippet</span>
            </list-item-ui>
            <list-item-ui
              v-close-popover
              small
              class="cursor-pointer"
              @click="emitter.emit('import-gist')"
            >
              <template #prepend>
                <v-mdi name="mdi-github"></v-mdi>
              </template>
              <span>Import gists</span>
            </list-item-ui>
          </list-ui>
        </template>
      </popover-ui>
    </div>
    <div v-if="!isRetrieved" class="skeletons">
      <div v-for="i in 5" :key="i" class="border-b py-4 px-5 w-full bg-input animate-pulse">
        <div class="w-36 rounded-lg h-6 bg-input animate-pulse"></div>
        <div class="w-24 mt-2 rounded-lg h-6 bg-input animate-pulse"></div>
      </div>
    </div>
    <snippet-list v-else v-bind="{ snippets }"></snippet-list>
    <p v-if="isRetrieved && snippets.length === 0" class="text-lighter text-center my-6">No data</p>
  </div>
</template>
<script>
import { computed, shallowReactive } from 'vue';
import { useStore } from 'vuex';
import emitter from 'tiny-emitter/instance';
import { File } from '~/models';
import { useStorage } from '~/composable';
import SnippetList from './snippet/SnippetList.vue';

export default {
  components: { SnippetList },
  setup() {
    const store = useStore();
    const storage = useStorage();

    const sort = shallowReactive({
      by: 'createdAt',
      type: 'desc',
    });
    const sortOptions = [
      { name: 'Created date', value: 'createdAt' },
      { name: 'Name', value: 'name' },
      { name: 'Language', value: 'language' },
    ];

    const activeFilter = computed(() => store.state.filterBy);
    const isRetrieved = computed(() => store.state.isRetrieved);
    const snippets = computed(() => {
      const search = store.state.searchQuery;
      const filtered = File.query()
        .where((file) => {
          if (activeFilter.value === 'all') return true;
          if (activeFilter.value === 'starred') return file.starred;

          return file.folderId === activeFilter.value;
        })
        .where(
          ({ name, code }) =>
            name.toLowerCase().includes(search) || code.toLowerCase().includes(search)
        )
        .orderBy(sort.by, sort.type)
        .get();

      return filtered;
    });

    function addFile() {
      storage.model('files').update({
        data: {
          name: 'untitled snippet',
          folderId: store.state.filterBy === 'all' ? '' : store.state.filterBy,
          isNew: true,
          isEdited: true,
          createdAt: Date.now(),
        },
      });
    }

    return {
      sort,
      addFile,
      emitter,
      snippets,
      sortOptions,
      isRetrieved,
      activeFilter,
    };
  },
};
</script>
<style>
.select-sort > button {
  @apply rounded-l-none;
}
</style>

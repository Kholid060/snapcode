<template>
  <div
    class="fixed z-40 top-0 left-0 w-full lg:w-64 bg-black bg-opacity-25 h-screen"
    :class="[store.state.showSidebar ? 'block' : 'hidden lg:block']"
    @click.self="closeSidebar"
  >
    <div
      class="bg-light h-full p-5 overflow-auto scroll w-64 bg-opacity-100 shadow-xl lg:shadow-none"
    >
      <div class="mb-6 library">
        <list-ui class="space-y-1">
          <list-item-ui small tag="router-link" :active="$route.name === 'explore'" to="/explore">
            <template #prepend>
              <v-mdi name="mdi-compass-outline"></v-mdi>
            </template>
            Explore
          </list-item-ui>
          <list-item-ui v-if="!isInHome" small tag="router-link" to="/">
            <template #prepend>
              <v-mdi name="mdi-archive-outline"></v-mdi>
            </template>
            My Snippets
          </list-item-ui>
          <template v-else>
            <list-item-ui
              v-for="filter in filters"
              :key="filter.id"
              small
              class="cursor-pointer"
              :active="activeFilter === filter.id"
              @click="filterBy(filter.id)"
            >
              <template #prepend>
                <v-mdi :name="filter.icon"></v-mdi>
              </template>
              {{ filter.name }}
            </list-item-ui>
          </template>
        </list-ui>
      </div>
      <div v-if="isInHome" class="folders">
        <div class="flex items-center text-lighter justify-between mb-3">
          <p>Folders</p>
          <v-mdi
            v-tooltip="'Add folder'"
            class="cursor-pointer"
            name="mdi-plus"
            @click="addFolder"
          ></v-mdi>
        </div>
        <sidebar-folders
          v-bind="{ activeFilter }"
          @update-filter="filterBy($event)"
        ></sidebar-folders>
      </div>
    </div>
  </div>
</template>
<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { useDialog, useStorage } from '~/composable';
import { Folder } from '~/models';
import SidebarFolders from './sidebar/SidebarFolders.vue';

export default {
  components: { SidebarFolders },
  setup() {
    const filters = [
      { id: 'all', name: 'All Snippets', icon: 'mdi-archive-outline' },
      { id: 'starred', name: 'Starred', icon: 'mdi-star-outline' },
    ];

    const store = useStore();
    const route = useRoute();
    const dialog = useDialog();
    const storage = useStorage();

    const activeFilter = computed(() => store.state.filterBy);
    const isInHome = computed(() => ['home', 'view'].includes(route.name));

    function filterBy(name) {
      store.commit('updateState', { key: 'filterBy', value: name });
    }
    function addFolder() {
      dialog.prompt({
        title: 'Add folder',
        input: {
          placeholder: 'Folder name',
        },
        onConfirm: (name) => {
          storage.model('folders').update({
            data: {
              name,
              isEdited: true,
              isNew: true,
            },
          });
        },
      });
    }
    function closeSidebar() {
      store.commit('updateState', {
        key: 'showSidebar',
        value: false,
      });
    }

    return {
      store,
      filters,
      isInHome,
      filterBy,
      addFolder,
      closeSidebar,
      activeFilter,
    };
  },
};
</script>

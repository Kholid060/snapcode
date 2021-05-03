<template>
  <div
    class="absolute z-50 lg:relative w-full lg:w-64 bg-black bg-opacity-25 h-screen"
    :class="[store.state.showSidebar ? 'block' : 'hidden lg:block']"
    @click.self="closeSidebar"
  >
    <div
      class="bg-light h-full p-5 overflow-auto scroll w-64 bg-opacity-100 shadow-xl lg:shadow-none"
    >
      <div class="mb-6 library">
        <p class="mb-3 text-lighter">Library</p>
        <list-ui class="space-y-1">
          <list-item-ui
            v-for="filter in filters"
            :key="filter.id"
            small
            class="cursor-pointer"
            :active="activeFilter === filter.id"
            @click="filterBy(filter.id)"
          >
            <template #prepend>
              <icon-ui :name="filter.icon"></icon-ui>
            </template>
            {{ filter.name }}
          </list-item-ui>
        </list-ui>
      </div>
      <div class="folders">
        <div class="flex items-center text-lighter justify-between mb-3">
          <p>Folders</p>
          <icon-ui
            v-tooltip="'Add folder'"
            class="cursor-pointer"
            name="plus"
            @click="addFolder"
          ></icon-ui>
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
import { useDialog } from '~/composable';
import { Folder } from '~/models';
import SidebarFolders from './sidebar/SidebarFolders.vue';

export default {
  components: { SidebarFolders },
  setup() {
    const filters = [
      { id: 'all', name: 'All Snippets', icon: 'archive' },
      { id: 'starred', name: 'Starred', icon: 'star' },
    ];

    const store = useStore();
    const dialog = useDialog();

    const activeFilter = computed(() => store.state.filterBy);

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
          Folder.$update({
            data: {
              name,
              isEdited: true,
              isNew: true,
            },
          });
          store.commit('updateState', {
            key: 'isDataChanged',
            value: true,
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
      filterBy,
      addFolder,
      closeSidebar,
      activeFilter,
    };
  },
};
</script>

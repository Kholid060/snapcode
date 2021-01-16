<template>
	<div
		class="absolute z-50 lg:relative w-full lg:w-64 bg-black bg-opacity-25"
		@click.self="closeSidebar"
		:class="[store.state.showSidebar ? 'block' : 'hidden lg:block']"
	>
		<div
			class="bg-light h-full p-5 h-screen overflow-auto scroll w-64 bg-opacity-100 shadow-xl lg:shadow-none"
		>
			<div class="mb-6 library">
				<p class="mb-3 text-lighter">Library</p>
				<list-ui class="space-y-1">
					<list-item-ui
						small
						class="cursor-pointer"
						:active="activeFilter === 'all'"
						@click="filterBy('all')"
					>
						<template #prepend>
							<icon-ui name="archive"></icon-ui>
						</template>
						All snippets
					</list-item-ui>
					<list-item-ui
						small
						class="cursor-pointer"
						:active="activeFilter === 'starred'"
						@click="filterBy('starred')"
					>
						<template #prepend>
							<icon-ui name="star"></icon-ui>
						</template>
						Starred
					</list-item-ui>
				</list-ui>
			</div>
			<div class="folders">
				<div class="flex items-center text-lighter justify-between mb-3">
					<p>Folders</p>
					<icon-ui
						class="cursor-pointer"
						name="mdiPlus"
						v-tooltip="'Add folder'"
						@click="addFolder"
					></icon-ui>
				</div>
				<folder-list
          v-bind="{ activeFilter }"
          @update-filter="filterBy($event)"
        ></folder-list>
			</div>
		</div>
	</div>
</template>
<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useDialog } from '~/composable';
import { Folder } from '~/models';
import FolderList from './FolderList.vue';

export default {
  components: { FolderList },
  setup() {
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
  		filterBy,
      addFolder,
  		closeSidebar,
  		activeFilter,
  	};
  },
};
</script>

<template>
	<div class="bg-light h-full p-5 h-screen overflow-auto scroll">
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
				></icon-ui>
			</div>
			<list-ui class="space-y-1">
				<list-item-ui
					small 
					v-for="folder in folders" 
					:key="folder.id" 
					class="cursor-pointer"
					@click="filterBy(folder.id)"
					:active="folder.id === activeFilter"
				>
					<template #prepend>
						<icon-ui name="folder"></icon-ui>
					</template>
					{{ folder.name }}
				</list-item-ui>
			</list-ui>
		</div>
	</div>
</template>
<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { Folder } from '~/models';

export default {
  setup() {
  	const store = useStore();
  	const activeFilter = computed(() => store.state.filterBy);
  	const folders = computed(() => Folder.all());

  	function filterBy(name) {
  		store.commit('updateState', { key: 'filterBy', value: name });
  	}

  	return {
  		folders,
  		filterBy,
  		activeFilter,
  	};
  },
};
</script>

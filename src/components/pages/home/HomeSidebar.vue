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
				<p class="text-lighter text-center mt-8" v-if="folders.length === 0">
					You have no folder
				</p>
				<list-ui class="space-y-1">
					<list-item-ui
						small 
						v-for="folder in folders" 
						:key="folder.id" 
						class="cursor-pointer group"
						@click="filterBy(folder.id)"
						:active="folder.id === activeFilter"
					>
						<template #prepend>
							<icon-ui name="folder"></icon-ui>
						</template>
						<p class="text-overflow w-32">{{ folder.name }}</p>
						<template #append>
							<popover-ui class="text-default">
								<icon-ui
									name="dotsHorizontal"
									:class="[folder.id === activeFilter ? 'visibile' : 'md:invisible']"
									class="group-hover:visible"
								></icon-ui>
								<template #popover>
									<list-ui class="w-40 space-y-1">
										<list-item-ui 
											v-close-popover 
											small 
											@click="renameFolder(folder)"
											class="cursor-pointer"
										>
											<template #prepend>
												<icon-ui name="pencil"></icon-ui>
											</template>
											Rename
										</list-item-ui>
										<list-item-ui 
											@click="deleteFolder(folder)" 
											small
											v-close-popover 
											class="cursor-pointer"
										>
											<template #prepend>
												<icon-ui name="trash" class="text-danger"></icon-ui>
											</template>
											Delete
										</list-item-ui>
									</list-ui>
								</template>
							</popover-ui>
						</template>
					</list-item-ui>
				</list-ui>
			</div>
		</div>
	</div>
</template>
<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useDialog } from 'comps-ui';
import { Folder, File } from '~/models';

export default {
  setup() {
  	const dialog = useDialog();
  	const store = useStore();
  	const activeFilter = computed(() => store.state.filterBy);
  	const folders = computed(() => Folder.query().orderBy('name', 'asc').get());

  	function filterBy(name) {
  		store.commit('updateState', { key: 'filterBy', value: name });
  	}
  	function addFolder() {
  		dialog.prompt({
  			title: 'Add folder',
  			input: {
  				label: 'Folder name',
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
  	function renameFolder({ name, id }) {
  		dialog.prompt({
  			title: 'Rename folder',
  			input: {
  				label: 'Folder name',
  				modelValue: name,
  				maxlength: 60,
  			},
  			onConfirm: (newName) => {
  				Folder.$update({
  					where: id,
  					data: {
  						name: newName.slice(0, 60),
  						isEdited: true,
  					},
  				});
  			},
  		});
  	}
  	function deleteFolder({ id, name }) {
	  	dialog.confirm({
	  		title: 'Delete folder',
	  		content: `Are you sure want to delete "${name}" folder?`,
	  		buttons: {
	  			confirm: {
	  				text: 'Delete',
	  				variant: 'danger',
	  			},
	  		},
	  		onConfirm: () => {
		  		Folder.$delete(id).then(async () => {
		  			await File.$delete((file) => file.folderId === id);
		  			
		  			store.commit('updateState', { key: 'filterBy', value: 'all' });
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
  		folders,
  		filterBy,
  		addFolder,
  		closeSidebar,
  		deleteFolder,
  		renameFolder,
  		activeFilter,
  	};
  },
};
</script>

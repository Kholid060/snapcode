<template>
  <div class="snippets relative h-full">
  	<div class="border-b px-5 py-3 flex items-center justify-between">
  		<div class="sort">
	  		<button-ui 
	  			icon 
	  			@click="sort.type = sort.type === 'asc' ? 'desc' : 'asc'"
	  			v-tooltip="sort.type === 'asc' ? 'ascending' : 'descending'"
	  			class="rounded-r-none border-r align-bottom"
	  		>
	  			<icon-ui 
	  				:name="sort.type === 'asc' ? 'sortAscending' : 'sortDescending'"
	  			></icon-ui>
	  		</button-ui>
	  		<select-ui 
	  			width="160px" 
	  			class="select-sort"
	  			:options="sortOptions"
	  			v-model="sort.by"
	  		></select-ui>
	  	</div>
	  	<button-ui 
	  		icon 
	  		variant="primary" 
	  		v-tooltip="'Add snippet'"
	  		@click="addFile"
	  		:disabled="activeFilter === 'starred' || activeFilter === 'all'"
	  	>
	  		<icon-ui name="mdiPlus"></icon-ui>
	  	</button-ui>
  	</div>
  	<transition-group name="snippet-list">
  		<div 
  			class="snippet-container"
  			v-for="snippet in snippets" 
			  :key="snippet.id"
  		>
		  	<router-link 
		  		:to="`/view/${snippet.id}`"
		  		v-slot="{ navigate, href, isExactActive }"
		  		custom
		  		exact-active-class="bg-light text-primary"
		  	>
				  <div 
				  	class="py-4 px-5 border-b snippet block hover:bg-light group"
				  	:class="{ 'text-primary bg-light': isExactActive }"
				  >
			  		<div class="mb-3 flex items-center">
			  			<icon-ui
			  				name="link" 
			  				size="18" 
			  				class="text-primary mr-1" 
			  				v-if="snippet.isShared"
			  			></icon-ui>
			  			<a 
			  				class="leading-tight text-overflow flex-1 pr-2 focus:text-primary"
			  				v-bind="{ href }"
			  				@click="navigate"
			  			>{{ snippet.name }}</a>
				  		<icon-ui 
				  			:name="snippet.starred ? 'starSolid' : 'star'" 
				  			size="22"
				  			:class="[snippet.starred ? 'text-warning visible' : 'invisible text-light']" 
				  			class="group-hover:visible cursor-pointer"
				  			@click="updateFile(snippet.id, { starred: !snippet.starred })"
				  		></icon-ui>
				  	</div>
			  		<div class="snippet__footer text-sm text-lighter flex items-center justify-between">
			  			<span>{{ snippet.language }}</span>
			  			<span>{{ formatTime(snippet.createdAt) }}</span>
			  		</div>
			  	</div>
			  </router-link>
			</div>
		</transition-group>
  </div>
</template>
<script>
import { computed, shallowReactive } from 'vue';
import { useStore } from 'vuex';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { File } from '~/models';

dayjs.extend(relativeTime);

export default {
  setup() {
  	const sort = shallowReactive({
  		by: 'createdAt',
  		type: 'desc',
  	});
  	const sortOptions = ['createdAt', 'name', 'language'];
  	const store = useStore();
  	const activeFilter = computed(() => store.state.filterBy);
  	const snippets = computed(() => {
  		const search = store.state.searchQuery;
  		const filtered = File.query()
  			.where((file) => {
  				if (activeFilter.value === 'all') return true;
  				if (activeFilter.value === 'starred') return file.starred;

  				return file.folderId === activeFilter.value;
  			})
  			.where(({ name, code }) => name.includes(search) || code.includes(search))
  			.orderBy(sort.by, sort.type)
  			.get();

  		return filtered;
  	});

  	function updateFile(id, data) {
  		File.update({
  			where: id,
  			data,
  		});
  	}
  	function addFile() {
  		File.insert({
  			data: {
  				name: 'untitled snippet',
  				folderId: store.state.filterBy,
  			},
  		});
  	}
  	function formatTime(time) {
  		return dayjs(time).fromNow();
  	}

  	return {
  		sort,
  		addFile,
  		snippets,
  		updateFile,
  		formatTime,
  		sortOptions,
  		activeFilter,
  	};
  },
};
</script>
<style>
.select-sort > button {
	@apply rounded-l-none;
}

.snippet-container {
	transition: all 0.4s ease;
}

.snippet-list-leave-active {
  position: absolute;
  width: 100%;
}

.snippet-list-enter-from,
.snippet-list-leave-to {
  opacity: 0;
}

.snippet-list-enter-from,
.snippet-list-enter-from, {
  transform: translateY(30px);
}
</style>

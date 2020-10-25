<template>
	<div class="folders border-b lg:border-b-0">
		<div class="mb-3">
			<span class="text-lighter">Folders</span>
			<icon-ui class="float-right text-primary" name="mdiPlus"></icon-ui>
		</div>
		<div class="folders__list lg:space-y-2 lg:space-x-0 flex lg:block space-x-2">
			<router-link
				v-for="folder in folders" 
				:key="folder.id"
				:to="`/folder/${folder.id}`"
			>
				<card-ui 
					class="w-full cursor-pointer border border-transparent" 
					hover 
					:class="{ 'border-primary': folder.id === activeFolder }"
				>
			    <p class="capitalize font-medium mb-1 text-overflow">
			    	{{ folder.name }}
			    </p>
			    <p class="text-light leading-snug line-clamp">
				    {{ folder.description }}
			   	</p>
			   	<template #footer>
			   		<div class="text-lighter">
				   		<icon-ui name="clock" class="mr-1 align-middle"></icon-ui>
				   		<span class="align-middle">2 days ago</span>
				   	</div>
			   	</template>
			  </card-ui> 
			</router-link>
		</div>
	</div>
</template>
<script>
import { useRoute } from 'vue-router';
import { Folder } from '~/models';

export default {
  setup() {
  	const folders = Folder.all();
  	const route = useRoute();
  	const activeFolder = route.params.folderId;

  	function convertDate(date) {
  		return date;
  	}

  	return {
  		folders,
  		convertDate,
  		activeFolder,
  	};
  },
};
</script>

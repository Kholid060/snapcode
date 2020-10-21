<template>
	<div class="folder">
		<div class="folder__detail mb-4">
			<input 
				type="text" 
				:value="folder.name" 
				class="text-2xl bg-transparent"
				title="Click to rename"
			>
			<textarea 
				v-autoresize
				rows="1"
				:value="folder.description" 
				class="bg-transparent w-full text-light resize-none"
				placeholder="Folder description" 
			></textarea>
		</div>
		<div class="folder__files space-y-2">
			<file-card
				v-for="file in files"
				:key="file.id"
				:file="file"
			></file-card>
		</div>
	</div>
</template>
<script>
import { useRoute } from 'vue-router';
import { File, Folder } from '~/models';
import FileCard from '~/components/pages/folders/FileCard/index.vue';

export default {
  components: { FileCard },
  setup() {
  	const route = useRoute();
  	const { folderId } = route.params;
  	const folder = Folder.query().where('id', folderId).first();
  	const files = File.query().where('folderId', folderId).get();

  	return {
  		files,
  		folder,
  	};
  },
};
</script>

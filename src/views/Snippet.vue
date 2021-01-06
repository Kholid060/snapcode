<template>
	<div class="snippet-view container my-10 px-4">
		<snippet-navigation v-bind="{ file }" v-if="isRetrieved"></snippet-navigation>
		<div class="w-64 bg-input-dark animate-pulse rounded-lg mb-12 h-12" v-else></div>
		<div class="editor bg-light rounded-lg pb-4">
			<div class="rounded-t-lg p-4 mb-4 flex items-center border-b">
				<div class="file-info" v-if="isRetrieved">
					<p>{{ file.name }}</p>
					<p class="text-sm leading-tight text-lighter">{{ file.language }}</p>
				</div>
				<div class="h-10 rounded-lg w-48 bg-input-dark animate-pulse" v-else></div>
				<div class="flex-grow"></div>
				<div
				  class="px-3 py-2 rounded-full bg-danger self-center bg-opacity-25 text-danger mr-4"
				  v-tooltip:bottom="'Only you can see this snippet'"
				  v-if="isLocalFile && !file.isShared"
				>
					<icon-ui name="lockClosed" size="20"></icon-ui>
					<span class="ml-1 text-sm">Private</span>
				</div>
				<buttons-group
					v-bind="{ file, isLocalFile }"
					@fork="isLocalFile = true"
				></buttons-group>
			</div>
			<codemirror
				:model-value="file.code"
				:options="cmOptions"
			></codemirror>
		</div>
	</div>
</template>
<script>
import {
  defineAsyncComponent,
  onMounted,
  ref,
  shallowReactive,
} from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { File } from '~/models';
import languages from '~/utils/languages';
import { apiFetch } from '~/utils/firebase';
import SnippetNavigation from '~/components/pages/snippet/SnippetNavigation.vue';
import ButtonsGroup from '~/components/pages/snippet/ButtonsGroup.vue';

export default {
  components: {
    ButtonsGroup,
    Codemirror: defineAsyncComponent(() => import('~/components/ui/Codemirror.vue')),
    SnippetNavigation,
  },
  setup() {
  	const store = useStore();
  	const router = useRouter();

  	const route = router.currentRoute.value;

  	const isLocalFile = ref(false);
  	const isRetrieved = ref(false);
  	const file = ref({ user: {} });
  	const cmOptions = shallowReactive({
  		readOnly: true,
  		mode: '',
  	});

  	onMounted(async () => {
	  	try {
	  		const localFile = File.find(route.params.fileId);

	  		if (localFile !== null) {
	  			isLocalFile.value = true;
	  			file.value = {
	  				...localFile,
	  				user: {
	  					displayName: store.state.user.displayName || 'Guest',
	  					photoURL: store.state.user?.photoUrl || null,
	  				},
	  			};
	  		} else {
		  		const data = await apiFetch(`/files/${route.params.fileId}`);
		  		file.value = data;
		  	}

	  		cmOptions.mode = languages[file.value.language].mode;
	  		isRetrieved.value = true;
	  	} catch (error) {
	  		console.error(error);
	  		router.replace('/404');
	  	}
  	});

  	return {
  		file,
  		cmOptions,
  		languages,
  		isRetrieved,
  		isLocalFile,
  	};
  },
};
</script>
<style>
.snippet-view .CodeMirror-linenumber,
.snippet-view .CodeMirror-linenumbers {
	@apply bg-light !important;
}
</style>

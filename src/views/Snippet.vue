<template>
	<div class="snippet-view container my-10 px-4">
		<nav class="nav flex mb-12 items-center">
			<div class="author flex items-center">
				<avatar-ui class="mr-4">
					<img 
						:src="file.user.photoURL" 
						alt="user photo" 
						v-if="file.user.photoURL"
					/>
					<icon-ui name="user" v-else></icon-ui>
				</avatar-ui>
				<div class="author__name">
					<p>{{ file.user.displayName }}</p>
					<p class="leading-tight text-lighter">
						Created at: {{ formatDate(file.createdDate) }}
					</p>
				</div>
			</div>
			<div class="flex-grow"></div>
			<button-ui 
				@click="theme.toggle" 
				icon
				v-tooltip="'Dark mode'"
				:class="{ 'text-primary': theme.currentTheme.value === 'dark' }"
			>
				<icon-ui name="moon"></icon-ui>
			</button-ui>
		</nav>
		<div class="editor bg-light rounded-lg pb-4">
			<div class="rounded-t-lg p-4 mb-4 flex items-center border-b">
				<div class="file-info">
					<p>{{ file.name }}</p>
					<p class="text-sm leading-tight text-lighter">{{ file.language }}</p>
				</div>
				<div class="flex-grow"></div>
				<button-group-ui class="divide-x">
					<button-ui icon v-tooltip.group="'Fork snippet'" v-if="!isLocalFile">
						<icon-ui name="mdiSourceFork"></icon-ui>
					</button-ui>
					<button-ui icon @click="copyCode" v-tooltip.group="'Copy code'">
						<icon-ui name="clipboardCopy"></icon-ui>
					</button-ui>
					<button-ui icon v-tooltip.group="'Share snippet'">
						<icon-ui name="share"></icon-ui>
					</button-ui>
				</button-group-ui>
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
import { useGroupTooltip, useTheme } from 'comps-ui';
import dayjs from 'dayjs';
import { File } from '~/models';
import languages from '~/utils/languages';
import copyToClipboard from '~/utils/copyToClipboard';
import { apiFetch } from '~/utils/firebase';

export default {
  components: { 
    Codemirror: defineAsyncComponent(() => import('~/components/ui/Codemirror.vue')),
  },
  setup() {
  	const theme = useTheme();
  	const store = useStore();
  	const router = useRouter();

  	const route = router.currentRoute.value;
  	
  	const file = ref({
  		user: {},
  	});
  	const isLocalFile = ref(false);
  	const cmOptions = shallowReactive({
  		readOnly: true,
  		mode: '',
  	});

  	const formatDate = (date) => dayjs(date).format('DD MMMM YYYY');

  	function copyCode() {
  		copyToClipboard(file.value.code);
  	}
  	
  	onMounted(async () => {
	  	try {
	  		useGroupTooltip();

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

	  		cmOptions.mode = languages[localFile.language].mode;
	  	} catch (error) {
	  		console.error(error);
	  		// router.replace('/404');
	  	}
  	});

  	return {
  		file,
  		theme,
  		copyCode,
  		cmOptions,
  		languages,
  		formatDate,
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

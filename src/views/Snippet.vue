<template>
	<div class="snippet-view container my-10 px-4">
		<nav class="nav flex mb-12 items-center">
			<div class="author flex items-center">
				<avatar-ui class="mr-4">
					<icon-ui name="user"></icon-ui>
				</avatar-ui>
				<div class="author__name">
					<p>John Doe</p>
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
import { useRouter } from 'vue-router';
import { useGroupTooltip, useTheme } from 'comps-ui';
import dayjs from 'dayjs';
import { File } from '~/models';
import languages from '~/utils/languages';
import copyToClipboard from '~/utils/copyToClipboard';

export default {
  components: { 
    Codemirror: defineAsyncComponent(() => import('~/components/ui/Codemirror.vue')),
  },
  setup() {
  	const theme = useTheme();
  	const router = useRouter();
  	const route = router.currentRoute.value;
  	
  	const file = ref({});
  	const cmOptions = shallowReactive({
  		readOnly: true,
  		mode: '',
  	});

  	const formatDate = (date) => dayjs(date).format('DD MMMM YYYY');

  	function copyCode() {
  		copyToClipboard(file.code);
  	}
  	
  	onMounted(() => {
  		useGroupTooltip();

  		const findFile = File.find(route.params.fileId);

  		if (findFile === null || !findFile.isShared) router.replace('/404');

  		file.value = findFile;
  		cmOptions.mode = languages[findFile.language].mode;
  	});

  	return {
  		file,
  		theme,
  		copyCode,
  		cmOptions,
  		languages,
  		formatDate,
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

<template>
	<div class="h-full snippet relative flex flex-col" v-if="file">
		<button class="bg-light absolute top-0 z-50 rounded-br-lg" v-if="state.isEditorFocused">
			<icon-ui name="chevronDown" size="18"></icon-ui>
		</button>
		<expand-transition>
			<div class="pt-3 px-5 flex items-center justify-between" v-if="!state.isEditorFocused">
				<div>
					<input 
						type="text" 
						:value="file.name" 
						class="bg-transparent text-lg"
						@change="updateFile({ name: $event.target.value })"
            maxlength="60" 
					/>
					<p class="text-lighter text-sm">
						Created at: {{ formatDate(file.createdAt) }}
					</p>
				</div>
				<file-buttons-group
					v-bind="{ file }"
					@change="updateFile"
				></file-buttons-group>
			</div>
		</expand-transition>
		<codemirror
			class="flex-1 overflow-auto scroll mt-2" 
			:model-value="file.code"
			@change="updateFile({ code: $event })"
			@cursor-activity="state.cursorPosition = $event"
			@focus="state.isEditorFocused = true"
			@blur="state.isEditorFocused = false"
			:options="state.cmOptions"
		></codemirror>
		<div class="px-5 text-sm text-lighter py-2">
			<popover-ui>
				<button>{{ file.language }}</button>
				<template #popover>
					<list-ui class="w-32 space-y-1 text-default text-base">
						<list-item-ui 
							v-for="(value, language) in languages"
							:active="language === file.language"
							:key="language"
							small
							class="cursor-pointer"
							@click="updateFile({ language })"
						>
							{{ language }}
						</list-item-ui>
					</list-ui>
				</template>
			</popover-ui>
			<span class="float-right">
        Line {{ state.cursorPosition.line + 1 }}, 
        Column {{ state.cursorPosition.column + 1 }}
      </span>
		</div>
	</div>
</template>
<script>
import {
  computed, reactive, watch, defineAsyncComponent,
} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import dayjs from 'dayjs';
import { useTheme } from 'comps-ui';
import { File } from '~/models';
import languages from '~/utils/languages';
import debounce from '~/utils/debounce';
import FileButtonsGroup from '~/components/pages/view/FileButtonsGroup.vue';

export default {
  components: { 
    Codemirror: defineAsyncComponent(() => import('~/components/pages/view/Codemirror.vue')),
    FileButtonsGroup,
  },
  setup() {
  	const theme = useTheme();
  	const route = useRoute();
  	const router = useRouter();
  	
  	const fileId = computed(() => route.params.fileId);
  	const file = computed(() => {
  		const findFile = File.find(fileId.value);
  		
  		if (findFile === null) {
  			router.replace('/');
  			return {};
  		}

  		return findFile;
  	});  		
  	
  	const state = reactive({
  		isEditorFocused: false,
  		cmOptions: {
  			mode: 'text/javascript',
  			theme: 'one-dark',
  		},
  		cursorPosition: {
  			line: 1,
  			column: 1,
  		},
  	});
  
    const updateFile = debounce((data) => {
      File.$update({
        where: file.value.id,
        data,
      });
    }, 500);

  	function formatDate(date) {
  		return dayjs(date).format('DD MMMM YYYY');	
  	}

  	watch([theme.currentTheme, () => file.value.language], () => {
  		state.cmOptions = {
  			mode: languages[file.value.language]?.mode,
  			theme: theme.currentTheme.value === 'light' ? 'one-light' : 'one-dark',
  		};
  	}, { immediate: true });

  	return {
  		file,
  		state,
  		languages,
  		updateFile,
  		formatDate,
  	};
  },
};
</script>

<template>
	<div class="h-full snippet relative flex flex-col" v-if="file">
		<expand-transition>
			<div class="pt-3 px-5 flex items-center justify-between" v-if="!state.isEditorFocused">
				<div>
					<input 
						type="text" 
						:value="file.name" 
						class="bg-transparent text-lg"
						@change="updateFile({ name: $event.target.value })"
					/>
					<p class="text-lighter text-sm">
						Created at: {{ createdDate }}
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
							@click="updateFileLanguage(language)"
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
import { computed, reactive, watch } from 'vue';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';
import { File } from '~/models';
import languages from '~/utils/languages';
import Codemirror from '~/components/pages/view/Codemirror.vue';
import FileButtonsGroup from '~/components/pages/view/FileButtonsGroup.vue';

export default {
  components: { Codemirror, FileButtonsGroup },
  setup() {
  	const route = useRoute();
  	const fileId = computed(() => route.params.fileId);
  	const file = computed(() => File.find(fileId.value) || false);  		
  	const createdDate = computed(() => dayjs(file.createdDate).format('DD MMMM YYYY'));
  	const state = reactive({
  		isEditorFocused: false,
  		cmOptions: {
  			mode: 'text/javascript',
  		},
  		cursorPosition: {
  			line: 1,
  			column: 1,
  		},
  	});
  
  	function updateFile(data) {
      File.update({
        where: file.value.id,
        data,
      });
    }
  	function updateFileLanguage(language) {
  		state.cmOptions.mode = languages[language].mode;
  		updateFile({ language });
  	}

  	watch(file, () => {
  		state.cmOptions.mode = languages[file.value.language].mode;
  	});

  	return {
  		file,
  		state,
  		languages,
  		updateFile,
  		createdDate,
  		updateFileLanguage,
  	};
  },
};
</script>

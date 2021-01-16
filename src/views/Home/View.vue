<template>
	<div class="h-full snippet relative flex flex-col" v-if="file">
		<expand-transition>
  		<button class="bg-light absolute top-0 z-50 rounded-br-lg" v-if="state.isEditorFocused">
  			<icon-ui name="chevronDown" size="18"></icon-ui>
  		</button>
			<div class="pt-3 px-5 flex items-center justify-between" v-else>
				<div class="md:w-7/12 w-6/12">
					<input
						type="text"
						:value="file.name"
						class="bg-transparent text-lg"
						@change="updateFileName"
            maxlength="60"
            required
					/>
					<p class="text-lighter text-sm text-overflow">
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
			<popover-ui content-classes="overflow-hidden">
				<button>{{ file.language }}</button>
				<template #popover>
					<list-ui
            class="space-y-1 text-default text-base scroll overflow-auto p-4"
            style="max-height: 250px"
          >
						<list-item-ui
							v-for="(value, language) in languages"
							:active="language === file.language"
							:key="language"
							small
							class="cursor-pointer"
							@click="updateFile({ language })"
						>
							{{ value.name }}
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
import { File } from '~/models';
import languages from '~/utils/languages';
import FileButtonsGroup from '~/components/pages/view/FileButtonsGroup.vue';

export default {
  components: {
    Codemirror: defineAsyncComponent(() => import('~/components/ui/Codemirror.vue')),
    FileButtonsGroup,
  },
  setup() {
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
  		},
  		cursorPosition: {
  			line: 1,
  			column: 1,
  		},
  	});

    function updateFile(data) {
      File.$update({
        where: file.value.id,
        data: {
          ...data,
          isEdited: true,
        },
      });
    }
    function updateFileName({ target }) {
      const fileName = target.value;
      const isValidName = fileName.replace(/\s/g, '') !== '';

      if (isValidName) {
        updateFile({ name: fileName });
      } else {
        /* eslint-disable-next-line */
        target.value = file.value.name;
      }
    }
  	function formatDate(date) {
  		return dayjs(date).format('DD MMMM YYYY, h:mm A');
  	}

  	watch(() => file.value.language, () => {
  		state.cmOptions = {
  			mode: languages[file.value.language]?.mode,
  		};
  	}, { immediate: true });

  	return {
  		file,
  		state,
  		languages,
  		updateFile,
  		formatDate,
      updateFileName,
  	};
  },
};
</script>

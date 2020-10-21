<template>
  <expand-ui class="w-full">
    <template #header>
      <input
      	:value="file.name"
      	class="bg-transparent" 
      	v-if="state.editFileName"
      	@blur="updateFileName"
        v-autofocus
        @click.stop
      />
      <span 
        v-else 
        @click.stop="state.editFileName = true"
        class="cursor-pointer"
        title="Click to edit file name" 
      >{{ file.name }}.{{ languages[file.language].ext }}</span>
      <div class="flex-grow"></div>
      <file-buttons-group :file="file"></file-buttons-group>
    </template>
    <div class="bg-lighter rounded-lg py-2">
      <codemirror 
        :options="state.cmOptions" 
        :model-value="file.code"
        @change="updateFile('code', $event)"
      ></codemirror>
      <div class="px-4 text-lighter text-sm">
        <popover-ui placement="top">
          <button>{{ file.language }}</button>
          <template #popover>
            <list-ui class="w-32 space-y-1">
              <list-item-ui 
                v-for="(value, language) in languages" 
                :key="language"
                small
                class="cursor-pointer"
                @click="changeLanguage(value, language)"
                :active="file.language === language"
              >
                {{ language }}
              </list-item-ui>
            </list-ui>
          </template>
        </popover-ui>
        <span class="float-right">Line 2, Column 2</span>
      </div>
    </div>
  </expand-ui>
</template>
<script>
import { reactive, defineAsyncComponent } from 'vue';
import languages from '~/utils/languages';
import FileButtonsGroup from './FileButtonsGroup.vue';

export default {
  components: { 
    Codemirror: defineAsyncComponent(() => import('./Codemirror.vue')),
    FileButtonsGroup,
  },
  props: {
    file: {
      type: Object,
      required: true,
      default: () => ({
        language: 'javascript',
      }),
    },
  },
  setup(props, { emit }) {
  	const state = reactive({
  		editFileName: false,
      cmOptions: {
        mode: 'text/javascript',
        theme: 'one-dark',
      },
  	});
    
    function updateFile(key, value) {
      emit('update:file', {
        ...props.file,
        [key]: value,
      });
    }
    function changeLanguage({ mode }, language) {
      state.cmOptions.mode = mode;
      updateFile('language', language);
    }
    function updateFileName({ target }) {
      state.editFileName = false;
      updateFile('name', target.value);
    }

  	return {
  		state,
      languages,
      updateFile,
      changeLanguage,
      updateFileName,
  	};
  },
};
</script>
<style>
button.expand-ui__header {
  cursor: default;
}
</style>

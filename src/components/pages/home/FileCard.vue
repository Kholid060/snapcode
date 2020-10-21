<template>
  <expand-ui class="w-full">
    <template #header>
      <input
      	:value="file.name"
      	class="bg-transparent" 
      	v-if="state.editFileName"
      	@blur="state.editFileName = false"
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
      <button-group-ui class="divide-x" @click.stop>
        <button-ui icon v-tooltip="'Add to favorite'">
          <icon-ui size="20" name="star"></icon-ui>
        </button-ui>
        <button-ui icon class="text-primary" v-tooltip="'Share'">
          <icon-ui size="20" name="link"></icon-ui>
        </button-ui>
        <button-ui icon class="text-danger" v-tooltip="'Delete'">
          <icon-ui size="20" name="trash"></icon-ui>
        </button-ui>
      </button-group-ui>
    </template>
    <div class="bg-lighter rounded-lg py-2">
      <codemirror :options="state.cmOptions" model-value="const"></codemirror>
      <div class="px-4 text-lighter text-sm">
        <button id="file-language">{{ file.language }}</button>
        <span class="float-right">Line 2, Column 2</span>
      </div>
    </div>
    <popover-ui placement="top" target="#file-language">
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
    </popover-ui>
  </expand-ui>
</template>
<script>
import { reactive, defineAsyncComponent } from 'vue';
import languages from '~/utils/languages';

export default {
  components: { 
    Codemirror: defineAsyncComponent(() => import('./Codemirror.vue')),
  },
  props: {
    file: {
      type: Object,
      default: () => ({}),
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
    
    function changeLanguage({ mode }, language) {
      state.cmOptions.mode = mode;
      emit('update:file', {
        ...props.file,
        language,
      });
    }

  	return {
  		state,
      languages,
      changeLanguage,
  	};
  },
};
</script>
<style>
button.expand-ui__header {
  cursor: default;
}
</style>

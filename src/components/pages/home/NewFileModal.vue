<template>
	<modal-ui 
		v-bind="{ modelValue }" 
		@close="closeModal"
		content-class="max-w-md"
	>
		<template #header>
			<p class="font-semibold">Add new snippet</p>
		</template>
		<input-ui error placeholder="Snippet name" block></input-ui>
		<div class="flex space-x-4">
			<select-ui></select-ui>
			<select-ui v-model="state.selectedLanguage" :options="supportedLanguages"></select-ui>
		</div>
	</modal-ui>
</template>
<script>
import { shallowReactive } from 'vue';
import languages from '~/utils/languages';

export default {
  props: {
  	modelValue: Boolean,
  },
  setup(props, { emit }) {
  	const state = shallowReactive({
  		selectedLanguage: 'javascript',
  	});

  	const supportedLanguages = Object.keys(languages);

  	function closeModal() {
  		emit('update:modelValue', false);
  	}

  	return {
  		state,
  		closeModal,
  		supportedLanguages,
  	};
  },
};
</script>

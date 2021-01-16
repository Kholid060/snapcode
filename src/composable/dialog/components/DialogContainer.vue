<template>
	<modal-ui
		:model-value="state.show"
		disabled-teleport
		style="z-index: 9999"
		@close="unmount"
		content-class="md:max-w-sm"
	>
		<template #header>
			<p class="font-semibold text-lg leading-tight">{{ mergeOptions.title }}</p>
		</template>
		<p>{{ mergeOptions.content }}</p>
		<input-ui
			@keyup.enter="onConfirm"
			:class="{ 'mt-2': mergeOptions.content !== '' }"
			block
			v-bind="mergeOptions.input"
			autofocus
			v-model="state.inputValue"
			@change="validateInput"
			v-if="type === 'prompt'"
		></input-ui>
		<template #footer>
			<div class="flex space-x-2 mt-4">
				<button-ui class="flex-1" @click="onCancel" v-if="mergeOptions.buttons.cancel">
					{{ mergeOptions.buttons.cancel.text }}
				</button-ui>
				<button-ui
					@click="onConfirm"
					class="flex-1"
					v-bind="mergeOptions.buttons.confirm"
					:disabled="type === 'prompt' && !state.isValidInput"
				>
					{{ mergeOptions.buttons.confirm.text }}
				</button-ui>
			</div>
		</template>
	</modal-ui>
</template>
<script>
import { getCurrentInstance, reactive } from 'vue';
import deepmerge from 'deepmerge';

const defaultOptions = {
  title: '',
  content: '',
  input: {
    placeholder: '',
    modelValue: '',
    hideMessage: true,
    validate: (value) => !!value,
  },
  buttons: {
    cancel: {
      text: 'cancel',
    },
    confirm: {
      text: 'confirm',
      variant: 'primary',
    },
  },
  onCancel: () => {},
  onConfirm: () => {},
};

export default {
  props: {
  	type: {
  		type: String,
  		default: 'confirm',
  	},
  	options: {
  		type: Object,
  		default: () => ({}),
  	},
  },
  setup(props) {
  	const mergeOptions = deepmerge(defaultOptions, props.options);
  	const state = reactive({
  		show: true,
  		inputValue: mergeOptions.input.modelValue,
  		isValidInput: false,
  	});
  	const insance = getCurrentInstance();

  	function unmount() {
  		state.show = false;

  		setTimeout(() => {
  			insance.appContext.app.unmount();
  		}, 500);
  	}
  	function onCancel() {
  		mergeOptions.onCancel();
  		unmount();
  	}
  	function onConfirm() {
  		if (props.type === 'prompt' && !state.isValidInput) return;

  		const param = props.type === 'prompt' ? state.inputValue : true;

  		mergeOptions.onConfirm(param);
  		unmount();
  	}
  	function validateInput(value) {
  		state.isValidInput = mergeOptions.input.validate(value);
  	}

  	validateInput();

  	return {
  		state,
  		unmount,
  		onCancel,
  		onConfirm,
  		mergeOptions,
  		validateInput,
  	};
  },
};
</script>

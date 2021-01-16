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
			v-bind="mergeOptions.input"
			autofocus
			v-model="state.inputValue"
      class="w-full"
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
import { getCurrentInstance, reactive, watch } from 'vue';
import deepmerge from 'deepmerge';
import ButtonUi from '~/components/ui/ButtonUi.vue';
import ModalUi from '~/components/ui/ModalUi.vue';
import InputUi from '~/components/ui/InputUi.vue';

const defaultOptions = {
  title: '',
  content: '',
  input: {
    placeholder: '',
    modelValue: '',
    hideMessage: true,
  },
  inputValidate: (value) => !!value,
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
  components: { ModalUi, ButtonUi, InputUi },
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

    watch(() => state.inputValue, (value) => {
      state.isValidInput = mergeOptions.inputValidate(value);
    }, { immediate: true });

  	return {
  		state,
  		unmount,
  		onCancel,
  		onConfirm,
  		mergeOptions,
  	};
  },
};
</script>

<template>
  <div class="codemirror">
    <div ref="container"></div>
  </div>
</template>
<script>
/* eslint-disable */
import { 
  onMounted, 
  ref, 
  watch, 
  shallowRef,
} from 'vue';
import Codemirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/keymap/sublime';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/lib/codemirror.css';
import '~/assets/css/themes/one-dark.css';

export default {
  emits: ['change', 'update:modelValue'],
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    options: {
    	type: Object,
    	default: () => ({}),
    },
  },
  setup(props, { emit }) {
  	const editor = shallowRef(null);
  	const container = ref(null);
  	
  	onMounted(() => {
  		editor.value = new Codemirror(container.value, {
  			mode: 'text/javascript',
			  theme: 'one-dark',
			  keymap: 'sublime',
			  value: props.modelValue,
        tabSize: 2,
        closeBrackets: true,
			  matchBrackets: true,
			  autoCloseBrackets: true,
			  lineNumbers: true,
			  line: true,
			  ...props.options,
  		});

      editor.value.on('change', (cm) => {
        const value = cm.getValue();

        emit('update:modelValue', value);
        emit('change', value);
      });
  	});

    watch(() => props.options, (options) => {
      Object.keys(options).forEach((key) => {
        editor.value.setOption(key, options[key]);
      });
    }, { deep: true });
    watch(() => props.modelValue, (newValue) => {
      const currentValue = editor.value.getValue();

      if (newValue !== currentValue) {
        editor.value.setValue(newValue);
      }
    });

  	return {
  		container,
  	};
  },
};
</script>
<style>
.CodeMirror {
	font-family: 'Fira Code', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
}
</style>

<template>
  <div class="codemirror">
    <div ref="container" class="h-full"></div>
  </div>
</template>
<script>
import {
  onMounted,
  ref,
  watch,
  shallowRef,
} from 'vue';
import Codemirror from 'codemirror';
import { useTheme } from '~/composable';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/vue/vue';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/jsx/jsx';
import 'codemirror/keymap/sublime';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/lib/codemirror.css';
import '~/assets/css/themes/one-dark.css';
import '~/assets/css/themes/one-light.css';

export default {
  emits: ['change', 'update:modelValue', 'cursorActivity', 'focus', 'blur'],
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
  	const theme = useTheme();
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

      editor.value.on('cursorActivity', (event) => {
        const { line, ch: column } = event.doc.getCursor();

        emit('cursorActivity', { line, column });
      });

      ['focus', 'blur'].forEach((evtName) => {
        editor.value.on(evtName, (event) => {
          emit(evtName, event);
        });
      });

      ['.CodeMirror-vscrollbar', '.CodeMirror-hscrollbar'].forEach((selector) => {
        document.querySelector(selector).classList.add('scroll');
      });
  	});

    watch(theme.currentTheme, (value) => {
      editor.value.setOption('theme', value === 'light' ? 'one-light' : 'one-dark');
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

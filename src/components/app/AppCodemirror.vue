<template>
  <div class="codemirror">
    <div ref="container" class="h-full"></div>
  </div>
</template>
<script>
import { onMounted, ref, watch, shallowRef, onUnmounted } from 'vue';
import { useTheme } from '~/composable';
import CodeMirror, { initCodemirror } from '~/lib/codemirror';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/keymap/sublime';

export default {
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
  emits: ['change', 'update:modelValue', 'cursorActivity', 'focus', 'blur', 'load'],
  setup(props, { emit }) {
    const theme = useTheme();

    const container = ref(null);
    const editor = shallowRef(null);

    function onInputRead(cm) {
      const value = cm.getValue();

      emit('update:modelValue', value);
      emit('change', value);
    }
    function onCursorActivity(event) {
      const { line, ch: column } = event.doc.getCursor();

      emit('cursorActivity', { line, column });
    }

    watch(theme.currentTheme, (value) => {
      editor.value.setOption('theme', value === 'light' ? 'one-light' : 'one-dark');
    });
    watch(
      () => props.options,
      (options, oldOptions) => {
        Object.keys(options).forEach((key) => {
          editor.value.setOption(key, options[key]);
        });

        if (options.mode && options.mode !== oldOptions.mode) editor.value.loadMode(editor.value);
      },
      { deep: true }
    );
    watch(
      () => props.modelValue,
      (newValue) => {
        const currentValue = editor.value.getValue();

        if (newValue !== currentValue) {
          editor.value.setValue(newValue);
        }
      }
    );

    onMounted(() => {
      window.CodeMirror = CodeMirror;

      editor.value = initCodemirror(container.value, {
        value: props.modelValue,
        ...props.options,
      });

      editor.value.on('inputRead', onInputRead);
      editor.value.on('cursorActivity', onCursorActivity);

      ['focus', 'blur'].forEach((evtName) => {
        editor.value.on(evtName, (event) => {
          emit(evtName, event);
        });
      });

      ['.CodeMirror-vscrollbar', '.CodeMirror-hscrollbar'].forEach((selector) => {
        document.querySelector(selector)?.classList.add('scroll');
      });

      emit('load', {
        ...editor.value,
        showSelectMode: () => (showSelectMode.value = true),
      });
    });

    onUnmounted(() => {
      editor.value.destroy();
    });

    return {
      editor,
      container,
    };
  },
};
</script>

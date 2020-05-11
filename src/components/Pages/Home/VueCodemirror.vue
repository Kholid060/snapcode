
<template>
  <codemirror
   :options="{
    ...cmOptions,
    theme,
    mode: file.mode,
   }"
   @input="updateCode"
   :value="file.content"
   @cursorActivity="updateEditorInfo"></codemirror>
</template>
<script>
/* eslint-disable import/no-extraneous-dependencies */
import debounce from 'lodash.debounce';
import { codemirror } from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';

// Modes
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/vue/vue';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/css/css';

// Addons
import 'codemirror/keymap/sublime';
import 'codemirror/addon/scroll/simplescrollbars';
import 'codemirror/addon/scroll/simplescrollbars.css';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/closetag';
import '~/assets/css/themes/one-light.css';
import '~/assets/css/themes/one-dark.css';

export default {
  components: { codemirror },
  props: {
    file: Object,
  },
  data: () => ({
    cmOptions: {
      tabSize: 2,
      keymap: 'sublime',
      scrollbarStyle: 'overlay',
      closeBrackets: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      autoCloseTags: true,
      lineNumbers: true,
      line: true,
    },
  }),
  computed: {
    theme() {
      return this.$store.state.dark ? 'one-dark' : 'one-light';
    },
  },
  methods: {
    updateCode: debounce(function (content) {
      this.$store.dispatch('files/update', {
        fileId: this.file.id,
        folderId: this.file.folderId,
        data: {
          content,
        },
      });
    }, 500),
    updateEditorInfo(event) {
      const { line, ch: column } = event.doc.getCursor();

      this.$emit('cursorPosition', {
        line,
        column,
      });
    },
  },
};
</script>
<style lang="scss">
.vue-codemirror {
  .CodeMirror {
    height: 100%;
    font-family: 'Fira Code', monospace;
    font-size: 16px !important;
    .CodeMirror-overlayscroll-vertical div,
    .CodeMirror-overlayscroll-horizontal div{
      background-color: rgba(18, 21, 27, 0.45) !important;
    }
    pre {
      word-break: break-word;
    }
  }
  .CodeMirror-gutters{
    background-color: transparent !important;
  }
}
</style>

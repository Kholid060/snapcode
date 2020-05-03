
<template>
  <codemirror
   :options="cmOptions"></codemirror>
</template>
<script>
/* eslint-disable import/no-extraneous-dependencies */
import { codemirror } from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/keymap/sublime';
import 'codemirror/addon/scroll/simplescrollbars';
import 'codemirror/addon/scroll/simplescrollbars.css';
import 'codemirror/addon/edit/closebrackets';
import '~/assets/css/themes/one-light.css';

export default {
  components: { codemirror },
  data: () => ({
    cmOptions: {
      tabSize: 2,
      keymap: 'sublime',
      scrollbarStyle: 'overlay',
      mode: 'text/javascript',
      theme: 'one-light',
      closeBrackets: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      lineNumbers: true,
      line: true,
    },
  }),
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
}
</style>

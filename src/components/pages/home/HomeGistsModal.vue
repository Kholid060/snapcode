<template>
  <modal-ui v-model="show"></modal-ui>
</template>
<script>
import { ref } from 'vue';
import emitter from 'tiny-emitter/instance';

export default {
  setup() {
    const show = ref(false);

    emitter.on('import-gist', (value = true) => {
      console.log('what');
      show.value = value;
    });

    return {
      show,
    };
  },
};
</script>

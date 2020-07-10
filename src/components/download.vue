<template>
  <div @click="greet" class="download">
    DOWNLOAD
  </div>
</template>
<style scoped>
  .download{
    width: 100px;
    height: 100px;
    background-color: red;
    color: white;
    position: absolute;
    bottom: 0;
    right: 0;
  }
</style>
<script>
import dldb from '~/utils/dbSave';

export default {
  methods: {
    greet(event) {
      if (event) {
        dldb();
      }
    },
  },
};
</script>

<template>
  <div @click="greet" class="load">
    Load
  </div>
</template>
<style scoped>
  .load{
    width: 100px;
    height: 100px;
    background-color: purple;
    color: white;
    position: absolute;
    bottom: 0;
    right: 100px;
  }
</style>
<script>
import importdb from '~/utils/dbImport';

export default {
  methods: {
    greet(event) {
      if (event) {
        importdb();
      }
    },
  },
};
</script>

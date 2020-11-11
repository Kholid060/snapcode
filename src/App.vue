<template>
  <div class="app">
    <router-view v-if="isRetrieved"></router-view>
  </div>
</template>
<script>
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useTheme } from 'comps-ui';
import retrieveBackupData from './utils/retrieveBackupData';

export default {
  setup() {
    const store = useStore();
    const isRetrieved = ref(false);

  	const theme = useTheme();
  	theme.setTheme(localStorage.getItem('theme') || 'dark');

    onMounted(async () => {
      await store.dispatch('retrieveData');
      await retrieveBackupData();

      isRetrieved.value = true;
    });

    return {
      isRetrieved,
    };
  },
};
</script>

<template>
  <div class="app">
    <router-view v-if="isRetrieved"></router-view>
    <div class="my-10" v-else>
      <spinner-ui class="mx-auto"></spinner-ui>
    </div>
  </div>
</template>
<script>
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useTheme } from 'comps-ui';
import retrieveBackupData from './utils/retrieveBackupData';
import getOldData from '~/utils/getOldData';

export default {
  setup() {
    const store = useStore();
    const isRetrieved = ref(false);
    const isError = ref(false);

  	const theme = useTheme();
  	theme.setTheme(localStorage.getItem('theme') || 'dark');

    function reload() {
      window.location.reload();
    }

    onMounted(async () => {
      try {
        await store.dispatch('retrieveData');
        await retrieveBackupData();
        await getOldData();

        isRetrieved.value = true;
      } catch (error) {
        isRetrieved.value = true;
        console.error(error);
      }
    });

    return {
      reload,
      isError,
      isRetrieved,
    };
  },
};
</script>

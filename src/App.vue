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
import backup from '~/utils/backup';
import getOldData from '~/utils/getOldData';

export default {
  setup() {
    const store = useStore();
    const isRetrieved = ref(false);

  	const theme = useTheme();
  	theme.setTheme(localStorage.getItem('theme') || 'dark');

    onMounted(async () => {
      await store.dispatch('retrieveData');
      await retrieveBackupData();
      await getOldData();

      backup.timer();

      isRetrieved.value = true;
    });

    return {
      isRetrieved,
    };
  },
};
</script>

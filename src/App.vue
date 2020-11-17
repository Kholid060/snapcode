<template>
  <div class="app">
    <div class="w-56 text-center mx-auto my-10" v-if="isError">
      <p class="text-lg">Something went wrong</p>
      <button-ui block class="mt-5" @click="reload">Reload</button-ui>
    </div>
    <template v-else>
      <router-view v-if="isRetrieved"></router-view>
      <div class="my-10" v-else>
        <spinner-ui class="mx-auto"></spinner-ui>
      </div>
    </template>
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

        backup.timer();

        isRetrieved.value = true;
      } catch (error) {
        console.error(error);
        isError.value = true;
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

<template>
  <div class="app">
    <div v-if="$route.name === 'snippet' && !$store.state.isRetrieved" class="my-10">
      <spinner-ui class="mx-auto"></spinner-ui>
    </div>
    <router-view v-else></router-view>
    <app-reload-prompt></app-reload-prompt>
  </div>
</template>
<script>
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useTheme } from '~/composable';
import AppReloadPrompt from './components/app/AppReloadPrompt.vue';
import retrieveBackupData from './utils/retrieveBackupData';
import getOldData from './utils/getOldData';

export default {
  components: { AppReloadPrompt },
  setup() {
    const store = useStore();
    const isRetrieved = ref(false);

    const theme = useTheme();
    theme.setTheme(localStorage.getItem('theme') || 'dark');

    onMounted(async () => {
      try {
        await store.dispatch('retrieveData');
        await retrieveBackupData();
        await getOldData();

        store.commit('updateState', {
          key: 'isRetrieved',
          value: true,
        });
      } catch (error) {
        store.commit('updateState', {
          key: 'isRetrieved',
          value: true,
        });
        console.error(error);
      }
    });

    return {
      isRetrieved,
    };
  },
};
</script>

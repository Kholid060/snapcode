<template>
  <div v-if="$route.name === 'snippet' && !$store.state.isRetrieved" class="my-10">
    <spinner-ui class="mx-auto"></spinner-ui>
  </div>
  <template v-else>
    <app-sidebar></app-sidebar>
    <div class="lg:pl-64">
      <router-view></router-view>
    </div>
  </template>
  <app-reload-prompt></app-reload-prompt>
</template>
<script>
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useTheme } from '~/composable';
import AppSidebar from './components/pages/home/HomeSidebar.vue';
import AppReloadPrompt from './components/app/AppReloadPrompt.vue';
import retrieveBackupData from './utils/retrieveBackupData';

export default {
  components: { AppReloadPrompt, AppSidebar },
  setup() {
    const store = useStore();
    const isRetrieved = ref(false);

    const theme = useTheme();
    theme.setTheme(localStorage.getItem('theme') || 'dark');

    onMounted(async () => {
      try {
        await store.dispatch('retrieveData');
        await retrieveBackupData();

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

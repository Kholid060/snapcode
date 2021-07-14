<template>
  <app-sidebar></app-sidebar>
  <div class="lg:pl-64">
    <router-view :route="routeWithModal"></router-view>
  </div>
  <app-reload-prompt></app-reload-prompt>
  <app-auth-modal></app-auth-modal>
</template>
<script>
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useTheme } from '~/composable';
import AppSidebar from './components/app/AppSidebar.vue';
import AppReloadPrompt from './components/app/AppReloadPrompt.vue';
import AppAuthModal from './components/app/AppAuthModal.vue';
import retrieveBackupData from './utils/retrieveBackupData';

export default {
  components: { AppReloadPrompt, AppSidebar, AppAuthModal },
  setup() {
    const store = useStore();
    const theme = useTheme();
    const router = useRouter();

    const isRetrieved = ref(false);

    theme.setTheme(localStorage.getItem('theme') || 'dark');

    const routeWithModal = computed(() => {
      const historyState = store.state.historyState.backgroundView;

      return historyState ? router.resolve(historyState) : router.currentRoute.value;
    });

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
      routeWithModal,
    };
  },
};
</script>

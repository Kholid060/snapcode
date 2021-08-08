<template>
  <app-sidebar></app-sidebar>
  <alert-ui
    v-model="showVersionAlert"
    class="fixed w-full max-w-2xl new-version-alert rounded-b-none md:rounded-b-lg md:mb-4 bottom-0"
    style="z-index: 9999"
    dismissible
  >
    Snapcode v{{ latestVersion }} is released!! To see what's new open
    <a
      href="https://github.com/Kholid060/snapcode/blob/master/CHANGELOG.md"
      rel="noopener"
      target="_blank"
      class="border-b-2 border-white"
    >
      changelog.
    </a>
  </alert-ui>
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

    const latestVersion = ref('');
    const isRetrieved = ref(false);
    const showVersionAlert = ref(false);

    theme.setTheme(localStorage.getItem('theme') || 'dark');

    const routeWithModal = computed(() => {
      const historyState = store.state.historyState.backgroundView;

      return historyState ? router.resolve(historyState) : router.currentRoute.value;
    });

    onMounted(async () => {
      try {
        await store.dispatch('retrieveData');
        await retrieveBackupData();

        const releaseCache = localStorage.getItem('snapcode-version') || '';
        const appLatestVersion = import.meta.env.VITE_SNAPCODE_VERSION;
        const isFirstTime = JSON.parse(localStorage.getItem('firstTime') || 'true');

        if (releaseCache !== appLatestVersion && !isFirstTime) {
          showVersionAlert.value = true;
          latestVersion.value = appLatestVersion;

          localStorage.setItem('snapcode-version', appLatestVersion);
        }

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
      latestVersion,
      routeWithModal,
      showVersionAlert,
    };
  },
};
</script>
<style>
.new-version-alert {
  transform: translateX(-50%);
  left: 50%;
}
</style>

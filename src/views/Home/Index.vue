<template>
  <div class="home flex">
    <home-sidebar></home-sidebar>
    <div class="flex-1 overflow-hidden">
      <home-navigation></home-navigation>
      <div class="flex" style="height: calc(100vh - 64px)">
        <div
          class="lg:border-r overflow-auto scroll w-full md:max-w-xs"
          :class="{ 'hidden md:block': $route.name === 'view' }"
        >
          <home-snippets></home-snippets>
        </div>
        <div class="code flex-grow space-y-2 h-full overflow-hidden">
          <router-view></router-view>
        </div>
      </div>
    </div>
    <home-auth-modal></home-auth-modal>
    <home-gists-modal></home-gists-modal>
  </div>
</template>
<script>
import { onMounted } from 'vue';
import HomeSidebar from '~/components/pages/home/HomeSidebar.vue';
import HomeSnippets from '~/components/pages/home/HomeSnippets.vue';
import HomeNavigation from '~/components/pages/home/HomeNavigation.vue';
import HomeAuthModal from '~/components/pages/home/HomeAuthModal.vue';
import HomeGistsModal from '~/components/pages/home/HomeGistsModal.vue';
import backup from '~/utils/backup';

export default {
  components: {
    HomeSidebar,
    HomeSnippets,
    HomeAuthModal,
    HomeNavigation,
    HomeGistsModal,
  },
  setup() {
    onMounted(() => {
      backup.timer(10000);
    });
  },
};
</script>

<template>
  <nav class="h-16 px-5 border-b flex items-center">
    <div class="lg:hidden">
      <router-link v-if="$route.name === 'view'" to="/" class="md:hidden">
        <v-mdi name="mdi-arrow-left" class="mr-4"></v-mdi>
      </router-link>
      <button
        :class="{ 'hidden md:block': $route.name === 'view' }"
        aria-label="menu"
        @click="$store.dispatch('toggleSidebar')"
      >
        <v-mdi name="mdi-menu" class="mr-4 lg:hidden cursor-pointer"></v-mdi>
      </button>
    </div>
    <div class="search-container flex-1">
      <div class="md:block" :class="{ hidden: $route.name === 'view' }">
        <v-mdi name="mdi-magnify" class="text-lighter mr-2"></v-mdi>
        <input
          type="text"
          placeholder="Search..."
          class="h-full bg-transparent w-32 md:w-56"
          @input="updateSearchQuery"
        />
      </div>
    </div>
    <div class="space-x-2 flex items-center">
      <a
        v-tooltip="'Github'"
        href="https://github.com/Kholid060/snapcode"
        class="mr-2 hidden sm:inline-block"
        target="_blank"
        rel="noopener"
      >
        <v-mdi name="mdiGithub" class="text-light" size="28"></v-mdi>
      </a>
      <div v-tooltip="!state.isDataChanged ? `Last backup: ${lastBackup}` : 'Backup data'">
        <button-ui
          v-if="state.user"
          icon
          :loading="isBackingUp"
          :disabled="!state.isDataChanged"
          variant="primary"
          @click="backupData"
        >
          <v-mdi name="mdi-cloud-upload-outline"></v-mdi>
        </button-ui>
      </div>
      <app-user-popover></app-user-popover>
    </div>
  </nav>
</template>
<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import dayjs from '~/lib/dayjs';
import backup from '~/utils/backup';
import AppUserPopover from '../../app/AppUserPopover.vue';

export default {
  components: { AppUserPopover },
  setup() {
    const store = useStore();

    const isBackingUp = ref(false);
    const lastBackup = computed(() => {
      const lastBackupTimestamp = store.state.lastBackup;
      const relativeBackupTime = dayjs(lastBackupTimestamp).fromNow();

      return relativeBackupTime;
    });

    function updateSearchQuery({ target }) {
      store.commit('updateState', {
        key: 'searchQuery',
        value: target.value.toLowerCase(),
      });
    }
    function backupData() {
      isBackingUp.value = true;

      backup.init().then(() => {
        setTimeout(() => {
          isBackingUp.value = false;
        }, 2000);
      });
    }

    backup.on('progress', (value) => {
      setTimeout(() => {
        isBackingUp.value = value;
      }, 2000);
    });

    return {
      state: store.state,
      lastBackup,
      backupData,
      isBackingUp,
      updateSearchQuery,
    };
  },
};
</script>

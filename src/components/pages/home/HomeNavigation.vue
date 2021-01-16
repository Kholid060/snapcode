<template>
	<nav class="h-16 px-5 border-b flex items-center">
    <div class="lg:hidden">
      <router-link to="/" v-if="$route.name === 'view'" class="md:hidden">
        <icon-ui name="arrowLeft" class="mr-4"></icon-ui>
      </router-link>
    	<button :class="{ 'hidden md:block': $route.name === 'view' }">
        <icon-ui
          name="menu"
          class="mr-4 lg:hidden cursor-pointer"
          @click="toggleSidebar"
        ></icon-ui>
      </button>
    </div>
    <div class="search-container flex-1">
      <div class="md:block" :class="{'hidden': $route.name === 'view' }">
  	    <icon-ui name="search" class="text-lighter mr-2"></icon-ui>
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
        href="https://github.com/Kholid060/snapcode"
        class="mr-2 hidden sm:inline-block"
        v-tooltip="'Github'"
        target="_blank"
        rel="noopener"
      >
        <icon-ui name="mdiGithub" class="text-light" size="28"></icon-ui>
		  </a>
      <div
        v-tooltip="!state.isDataChanged ? `Last backup: ${lastBackup}` : 'Backup data'"
      >
        <button-ui
          icon
          @click="backupData"
          :loading="isBackingUp"
          :disabled="!state.isDataChanged"
          variant="primary"
          v-if="state.user"
        >
  		    <icon-ui name="cloudUpload"></icon-ui>
  		  </button-ui>
      </div>
		  <user-popover></user-popover>
		</div>
  </nav>
</template>
<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import backup from '~/utils/backup';
import UserPopover from './UserPopover.vue';

dayjs.extend(relativeTime);

export default {
  components: { UserPopover },
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
    function toggleSidebar() {
      store.commit('updateState', {
        key: 'showSidebar',
        value: !store.state.showSidebar,
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
      toggleSidebar,
  		updateSearchQuery,
  	};
  },
};
</script>

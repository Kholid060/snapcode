<template>
	<nav class="h-16 px-5 border-b flex items-center">
    <div class="lg:hidden">
      <router-link to="/" v-if="route.name === 'view'" class="md:hidden">
        <icon-ui name="arrowLeft" class="mr-4"></icon-ui>
      </router-link>
    	<button :class="{ 'hidden md:block': route.name === 'view' }">
        <icon-ui
          name="menu"
          class="mr-4 lg:hidden cursor-pointer"
          @click="toggleSidebar"
        ></icon-ui>
      </button>
    </div>
    <div class="search-container flex-1">
	    <icon-ui name="search" class="text-lighter mr-2"></icon-ui>
	    <input
	    	type="text"
	    	placeholder="Search..."
	    	class="h-full bg-transparent w-32 md:w-56"
	    	@input="updateSearchQuery"
	    />
	  </div>
	  <div class="space-x-2">
		  <button-ui
        icon
        v-tooltip="'Backup data'"
        @click="backupData"
        :loading="isBackingUp"
        :disabled="!state.isDataChanged"
        class="align-top"
        variant="primary"
        v-if="state.user"
      >
		    <icon-ui name="cloudUpload"></icon-ui>
		  </button-ui>
		  <user-popover></user-popover>
		</div>
  </nav>
</template>
<script>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import backup from '~/utils/backup';
import UserPopover from './UserPopover.vue';

export default {
  components: { UserPopover },
  setup() {
    const route = useRoute();
  	const store = useStore();

    const isBackingUp = ref(false);

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
      route,
      backupData,
      isBackingUp,
      toggleSidebar,
  		updateSearchQuery,
  	};
  },
};
</script>

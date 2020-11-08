<template>
	<nav class="h-16 px-5 border-b flex items-center">
    <div class="lg:hidden">
      <router-link to="/" v-if="route.name === 'view'">
        <icon-ui name="arrowLeft" class="mr-4 lg:hidden"></icon-ui>
      </router-link>
  	  <icon-ui
        v-else
        name="menu" 
        class="mr-4 lg:hidden cursor-pointer" 
        @click="toggleSidebar"
      ></icon-ui>
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
        :loading="state.isBackingUp"
        class="align-top"
        variant="primary" 
        v-if="user"
      >
		    <icon-ui name="cloudUpload"></icon-ui>
		  </button-ui>
		  <user-popover></user-popover>
		</div>
	  <auth-modal v-model="state.authModal"></auth-modal>
  </nav>
</template>
<script>
import { shallowReactive } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import AuthModal from '~/components/ui/AuthModal.vue';
import backup from '~/utils/backup';
import UserPopover from './UserPopover.vue';

export default {
  components: { AuthModal, UserPopover },
  setup() {
    const route = useRoute();
  	const store = useStore();

    const state = shallowReactive({
      authModal: false,
      isBackingUp: false,
    });

  	function updateSearchQuery(event) {
  		const { value } = event.target;
  		
  		store.commit('updateState', {
  			key: 'searchQuery',
  			value,
  		});
  	}
    function toggleSidebar() {
      store.commit('updateState', {
        key: 'showSidebar',
        value: !store.state.showSidebar,
      });
    }
    function backupData() {
      state.isBackingUp = true;

      backup.init().then(() => {
        state.isBackingUp = false;
      });  
    }

  	return {
      user: store.state.user,
      route,
      state,
      backupData,
      toggleSidebar,
  		updateSearchQuery,
  	};
  },
};
</script>

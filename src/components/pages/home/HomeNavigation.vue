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
		  <button-ui icon v-tooltip="'Backup data'" loading variant="primary">
		    <icon-ui name="cloudUpload"></icon-ui>
		  </button-ui>
		  <popover-ui>
			  <avatar-ui 
          style="cursor: pointer;"
          class="inline-block" 
          size="small" 
          badge 
          type="round"
        >
			  	<icon-ui name="user"></icon-ui>
			  </avatar-ui>
			  <template #popover>
			  	<list-ui class="w-56">
            <li class="list-none">
              <p class="leading-tight">Ahmad Kholid</p>
              <p class="leading-tight text-lighter">Kholid060@gmail.com</p>
            </li>
            <div class="h1 border-b mt-4 mb-2"></div>
			  		<list-item-ui small class="mb-1">
              <template #prepend>
                <icon-ui name="moon"></icon-ui>
              </template>
			  			<span>Dark Mode</span>
			  			<template #append>
			  				<switch-ui v-model="isDark" class="align-middle"></switch-ui>
			  			</template>
			  		</list-item-ui>
            <list-item-ui small class="cursor-pointer">
              <template #prepend>
                <icon-ui name="cog"></icon-ui>
              </template>
              <span>Settings</span>
            </list-item-ui>
            <div class="h1 border-b my-2"></div>
            <list-item-ui small class="text-danger cursor-pointer">
              <template #prepend>
                <icon-ui name="logout"></icon-ui>
              </template>
              <span>Logout</span>
            </list-item-ui>
			  	</list-ui>
			  </template>
			</popover-ui>
		</div>
	</nav>
</template>
<script>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { useTheme } from 'comps-ui';

export default {
  setup() {
    const route = useRoute();
  	const store = useStore();
  	const theme = useTheme();
    const isDark = ref(theme.currentTheme.value === 'dark');

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

    watch(isDark, (dark) => {
      theme.setTheme(dark ? 'dark' : 'light');
    });

  	return {
      route,
      isDark,
      toggleSidebar,
  		updateSearchQuery,
  	};
  },
};
</script>

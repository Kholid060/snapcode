<template>
	<nav class="h-16 px-5 border-b flex items-center justify-between col-span-full">
	  <div class="search-container">
	    <icon-ui name="search" class="text-lighter mr-2"></icon-ui>
	    <input 
	    	type="text" 
	    	placeholder="Search..." 
	    	class="h-full bg-transparent"
	    	@input="updateSearchQuery"
	    />
	  </div>
	  <div class="space-x-2">
		  <button-ui icon @click="toggleDarkTheme">
		    <icon-ui name="moon"></icon-ui>
		  </button-ui>
		  <avatar-ui class="inline-block" size="small" badge type="round">
		  	<icon-ui name="moon"></icon-ui>
		  </avatar-ui>
		</div>
	</nav>
</template>
<script>
import { useStore } from 'vuex';
import toggleDarkTheme from '../../../utils/toggleDarkTheme';

export default {
  setup() {
  	const store = useStore();

  	function updateSearchQuery(event) {
  		const { value } = event.target;
  		
  		store.commit('updateState', {
  			key: 'searchQuery',
  			value,
  		});
  	}

  	return {
  		toggleDarkTheme,
  		updateSearchQuery,
  	};
  },
};
</script>

<template>
  <div class="home flex">
  	<home-sidebar></home-sidebar>
    <div class="flex-1 overflow-hidden">
      <home-navigation></home-navigation>
	   	<div class="flex" style="height: calc(100vh - 64px)">
	    	<div
	    		class="lg:border-r overflow-auto scroll w-full md:max-w-xs"
	    		:class="{ 'hidden md:block': route.name === 'view' }"
	    	>
	       <snippets></snippets>
	      </div>
	      <div class="code flex-grow space-y-2 h-full overflow-hidden">
	      	<router-view></router-view>
	      </div>
	    </div>
    </div>
  </div>
</template>
<script>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import HomeSidebar from '~/components/pages/home/HomeSidebar.vue';
import Snippets from '~/components/pages/home/Snippets.vue';
import HomeNavigation from '~/components/pages/home/HomeNavigation.vue';
import backup from '~/utils/backup';

export default {
  components: {
    HomeSidebar, Snippets, HomeNavigation,
  },
  setup() {
  	const route = useRoute();

    onMounted(() => {
      backup.timer(10000);
    });

  	return {
  		route,
  	};
  },
};
</script>

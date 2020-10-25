<template>
  <div class="home flex">
  	<home-sidebar class="w-64 hidden lg:block"></home-sidebar>
    <div class="flex-1 lg:grid grid-cols-10 lg:h-screen" style="grid-template-rows: auto 1fr;">
      <home-navigation></home-navigation>
    	<div class="col-span-3 border-r overflow-auto scroll">
       <snippets></snippets>
      </div>
      <div class="code col-span-7 space-y-2">
      	<router-view></router-view>
      </div>
    </div>
  </div>
</template>
<script>
import HomeSidebar from '../components/pages/home/HomeSidebar.vue';
import Snippets from '../components/pages/home/Snippets.vue';
import HomeNavigation from '../components/pages/home/HomeNavigation.vue';

export default {
  components: {
    HomeSidebar, Snippets, HomeNavigation, 
  },
};
</script>

<template>
  <div class="home flex">
  	<home-sidebar class="w-64"></home-sidebar>
    <div class="flex-1 grid grid-cols-10 h-screen" style="grid-template-rows: auto 1fr;">
      <home-navigation></home-navigation>
    	<div class="p-5 col-span-3 border-r overflow-auto scroll">
       <folders></folders>
      </div>
      <div class="code p-5 col-span-7 overflow-auto space-y-2 scroll">
      	<router-view></router-view>
        <!-- <file-card v-model:file="file"></file-card>
        <file-card v-model:file="file2"></file-card> -->
      </div>
    </div>
  </div>
</template>
<script>
import { ref } from 'vue';
import HomeSidebar from '../components/pages/home/HomeSidebar.vue';
import Folders from '../components/pages/home/Folders.vue';
import HomeNavigation from '../components/pages/home/HomeNavigation.vue';

export default {
  components: {
    HomeSidebar, Folders, HomeNavigation, 
  },
  setup() {
    const file = ref({
      id: 'ahdoahd',
      name: 'some-code',
      language: 'javascript',
      code: 'const ulala',
      shared: false,
    });
    const file2 = ref({
      id: 'ahdo2ahd',
      name: 'vuex',
      language: 'javascript',
      code: 'const ulala',
      shared: false,
    });

    return {
      file,
      file2,
    };
  },
};
</script>

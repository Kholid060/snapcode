<template>
  <div class="home flex">
  	<home-sidebar class="w-64"></home-sidebar>
    <div class="flex-1 grid grid-cols-10 h-screen" style="grid-template-rows: auto 1fr;">
      <nav class="h-16 px-5 border-b flex items-center justify-between col-span-full">
        <div class="search-container">
          <icon-ui name="search" class="text-lighter mr-2"></icon-ui>
          <input type="text" placeholder="Search..." class="h-full bg-transparent">
        </div>
        <button-ui icon>
          <icon-ui name="moon"></icon-ui>
        </button-ui>
      </nav>
    	<div class="p-5 col-span-3 border-r overflow-auto scroll">
       <folders></folders>
      </div>
      <div class="code p-5 col-span-7 overflow-auto space-y-2 scroll">
      	<file-card v-model:file="file"></file-card>
        <file-card v-model:file="file"></file-card>
      </div>
    </div>
  </div>
</template>
<script>
import { ref } from 'vue';
import HomeSidebar from '../components/pages/home/HomeSidebar.vue';
import FileCard from '../components/pages/home/FileCard.vue';
import Folders from '../components/pages/home/Folders.vue';

export default {
  components: { HomeSidebar, FileCard, Folders },
  setup() {
    const file = ref({
      id: 'ahdoahd',
      name: 'some-code',
      language: 'javascript',
      code: 'const ulala',
      shared: false,
    });

    return {
      file,
    };
  },
};
</script>

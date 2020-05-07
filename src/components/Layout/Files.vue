<template>
  <div class="relative" style="width: 300px">
    <div class="pt-6 px-6">
      <input-ui
       placeholder="Search"
       v-model="search"
       icon="mdi-magnify"></input-ui>
     </div>
     <p
      v-if="files.length === 0"
      class="py-8 text-center text-lighter font-semibold">
        Nothing here
      </p>
     <simplebar
      class="mt-3 pt-3 pb-6 files px-6 overflow-y-auto"
      style="height: calc(100vh - 5rem)"
      v-else>
       <file-card
        class="mb-3"
        v-for="file in filteredFiles"
        :key="file.id"
        :active="activeFileId === file.id"
        :file="file"></file-card>
     </simplebar>
     <button-ui
      v-if="showAddFileBtn"
      @click="addFile"
      v-tooltip="'Add snippet'"
      class="shadow-xl absolute"
      round
      style="bottom: 20px; right: 20px"
      type="primary"
      icon>
      <v-mdi name="mdi-plus"></v-mdi>
     </button-ui>
  </div>
</template>
<script>
/* eslint-disable import/no-extraneous-dependencies */
import simplebar from 'simplebar-vue';
import 'simplebar/dist/simplebar.min.css';
import FileCard from './Files/FileCard.vue';
import file from '~/mixins/file';

export default {
  components: {
    FileCard, simplebar,
  },
  mixins: [file],
};
</script>

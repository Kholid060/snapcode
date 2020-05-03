<template>
  <div class="relative" style="width: 300px">
    <div class="pt-6 px-6">
      <input-ui
       placeholder="Search"
       v-model="search"
       icon="mdi-magnify"></input-ui>
     </div>
     <simplebar
      class="mt-3 pt-3 pb-6 files px-6 overflow-y-auto"
      style="height: calc(100vh - 5rem)">
       <file-card
        class="mb-3"
        v-for="file in filteredFiles"
        :key="file.id"
        :file="file"></file-card>
     </simplebar>
     <button-ui
      @click="addFile"
      v-tooltip="'Add file'"
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

function sortFiles(files, key = 'createAt') {
  return files.sort((a, b) => a[key] - b[key]);
}

export default {
  components: {
    FileCard, simplebar,
  },
  data: () => ({
    search: '',
  }),
  methods: {
    addFile() {
      this.$store.dispatch('files/insert', this.$route.params.folderId);
    },
  },
  computed: {
    files() {
      const { folderId } = this.$route.params;

      if (folderId === 'all') {
        return sortFiles(this.$store.getters['files/getAll']);
      }

      const files = sortFiles(this.$store.getters['files/getByFolderId'](folderId));

      if (folderId === 'star') {
        return files.filter((file) => file.star);
      }

      return files;
    },
    filteredFiles() {
      return this.files.filter((file) => file.title.toLowerCase().match(this.search.toLowerCase()));
    },
  },
};
</script>

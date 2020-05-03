<template>
  <nav
   style="width: 240px"
   class="h-screen bg-card py-6">
    <simplebar class="h-full px-4">
      <div class="library">
        <p class="mb-4">Library</p>
        <list-ui
         v-for="list in libraryList"
         :key="list.path"
         tag="router-link"
         :to="`/${list.path}`">
          <v-mdi
           :name="list.icon"
           slot="prefix"></v-mdi>
          {{ list.name }}
        </list-ui>
      </div>
      <div class="mt-4">
        <div class="flex items-center justify-between">
          <span class="align-middle">Folders</span>
          <button-ui icon small
           class="float-right"
           @click="addFolder"
           v-tooltip="'Add folder'">
            <v-mdi name="mdi-plus"></v-mdi>
          </button-ui>
        </div>
        <div class="folder-list mt-4">
          <list-ui
           class="mb-2"
           v-for="folder in folders"
           :key="folder.id"
           tag="router-link"
           :to="`/${folder.id}`">
            <v-mdi name="mdi-folder-outline" slot="prefix"></v-mdi>
            <p class="text-overflow">{{ folder.name }}</p>
          </list-ui>
        </div>
      </div>
    </simplebar>
  </nav>
</template>
<script>
/* eslint-disable import/no-extraneous-dependencies */
import simplebar from 'simplebar-vue';
import 'simplebar/dist/simplebar.min.css';

export default {
  components: { simplebar },
  data: () => ({
    libraryList: [
      { path: 'all', name: 'All snippets', icon: 'mdi-archive-outline' },
      { path: 'star', name: 'starred', icon: 'mdi-star-outline' },
    ],
  }),
  computed: {
    folders() {
      return this.$store.getters['folders/getAll'];
    },
  },
  methods: {
    addFolder() {
      this.$modal.show('prompt', {
        title: 'Add folder',
        placeholder: 'Folder name',
        btn: {
          text: 'Add',
          handler: async (input) => {
            await this.$store.dispatch('folders/insert', input);

            this.$modal.hide('prompt');
          },
        },
      });
    },
  },
};
</script>

<template>
  <nav
   class="h-screen bg-card py-6">
    <simplebar class="h-full px-4">
      <div class="library">
        <p class="mb-4">Library</p>
        <list-ui
         v-for="list in libraryList"
         :key="list.path"
         tag="router-link"
         :active="$route.params.folderId === list.path"
         class="mb-2 capitalize"
         :to="`/${list.path}`">
          <v-mdi
           :name="list.icon"
           slot="prefix"></v-mdi>
          {{ list.name }}
        </list-ui>
      </div>
      <div class="mt-8">
        <div class="flex items-center justify-between">
          <span class="align-middle">Folders</span>
          <button-ui icon small
           class="float-right"
           @click="prompt('Folder', 'folders/insert')"
           v-tooltip="'Add folder'">
            <v-mdi name="mdi-plus"></v-mdi>
          </button-ui>
        </div>
        <div class="folder-list mt-4">
          <list-ui
           class="mb-2"
           v-for="folder in folders"
           :key="folder.id"
           :active="$route.params.folderId === folder.id">
            <router-link
             class="absolute h-full w-full left-0"
             :to="`/${folder.id}`"></router-link>
            <v-mdi name="mdi-folder-outline" slot="prefix"></v-mdi>
            <p class="text-overflow flex-auto">{{ folder.name }}</p>
            <v-popover>
              <button-ui icon small>
                <v-mdi name="mdi-dots-horizontal"></v-mdi>
              </button-ui>
              <card-ui slot="popover" class="shadow-xl border">
                <list-ui @click="renameFolder(folder)">
                  <v-mdi name="mdi-pencil" slot="prefix"></v-mdi>
                  Rename
                </list-ui>
                <list-ui class="mt-1" @click="deleteFolder(folder)">
                  <v-mdi
                   name="mdi-delete-outline"
                   class="text-danger"
                   slot="prefix"></v-mdi>
                  Delete
                </list-ui>
              </card-ui>
            </v-popover>
          </list-ui>
        </div>
      </div>
      <div class="tags mt-8">
        <div class="flex items-center mb-4 justify-between">
          <span class="align-middle">Tags</span>
          <button-ui icon small
           class="float-right"
           @click="prompt('Tag', 'tags/insert')"
           v-tooltip="'Add tag'">
            <v-mdi name="mdi-plus"></v-mdi>
          </button-ui>
        </div>
        <list-ui
         class="mb-2 group"
         v-for="tag in tags"
         :key="tag.id"
         :active="tag.id === $store.state.activeTag"
         @click="updateActiveTag(tag.id)">
          <v-mdi name="mdi-label-outline" slot="prefix"></v-mdi>
          <span class="capitalize flex-auto text-overflow">{{ tag.name }}</span>
          <button-ui
           class="visible lg:invisible group-hover:visible"
           @click.stop="deleteTag(tag.id)"
           icon small
           title="Delete tag">
            <v-mdi
             class="text-danger"
             name="mdi-delete-outline"></v-mdi>
          </button-ui>
        </list-ui>
      </div>
    </simplebar>
  </nav>
</template>
<script>
/* eslint-disable import/no-extraneous-dependencies */
import simplebar from 'simplebar-vue';
import 'simplebar/dist/simplebar.min.css';

import SideMenu from '~/mixins/SideMenu';

export default {
  components: { simplebar },
  mixins: [SideMenu],
};
</script>
<style scoped>
@screen lg {
  nav {
    width: 240px;
  }
}
</style>

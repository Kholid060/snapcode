<template>
  <div class="flex items-center">
    <button-ui icon
     @click="openMobileMenu"
     class="lg:hidden mr-2">
      <v-mdi
       size="20"
       name="mdi-menu"></v-mdi>
    </button-ui>
    <template v-if="!hide">
      <div class="text-xl w-6/12 font-semibold">
        <input
         placeholder="Title"
         v-if="editTitle"
         class="w-full bg-transparent focus:outline-none"
         type="text"
         v-autofocus
         v-model="fileTitle"
         @keyup.enter="editFileTitle"
         @blur="editFileTitle">
        <p
         v-else
         @click="(editTitle = true), (fileTitle = file.title)"
         class="cursor-pointer text-overflow">
          {{ file.title }}
        </p>
      </div>
      <div class="flex-grow"></div>
      <button-ui
       @click="toggleStar"
       v-tooltip="{content: 'Star', placement: 'left'}"
       icon>
        <v-mdi
         :name="file.star ? 'mdi-star' : 'mdi-star-outline'"
         :class="{ 'text-warning': file.star }"
         size="20"></v-mdi>
      </button-ui>
      <button-ui
       v-tooltip="{content: 'Delete snippet', placement: 'left'}"
       icon class="mx-3"
       @click="deleteFile">
        <v-mdi
         class="text-danger"
         name="mdi-delete-outline"
         size="20"></v-mdi>
      </button-ui>
    </template>
    <div class="flex-grow" v-else></div>
    <button-ui
     @click="darkMode"
     icon
     v-tooltip="{ content: 'Dark mode', placement: 'left' }">
      <v-mdi
       :class="{ 'text-primary': $store.state.dark }"
       size="20"
       name="mdi-moon-waning-crescent"></v-mdi>
    </button-ui>
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
    hide: Boolean,
  },
  data: () => ({
    editTitle: false,
    fileTitle: '',
  }),
  methods: {
    updateFile(data) {
      this.$store.dispatch('files/update', {
        fileId: this.file.id,
        folderId: this.file.folderId,
        data,
      });
    },
    toggleStar() {
      this.updateFile({
        star: !this.file.star,
      });
    },
    editFileTitle() {
      if (!this.fileTitle) return;

      this.updateFile({
        title: this.fileTitle,
      });

      this.editTitle = false;
      this.fileTitle = '';
    },
    openMobileMenu() {
      this.$store.commit('changeState', {
        key: 'mobileMenu',
        data: true,
      });
    },
    darkMode() {
      const currentTheme = !this.$store.state.dark;

      this.$store.commit('changeState', {
        key: 'dark',
        data: currentTheme,
      });
      this.$dark(currentTheme);
    },
    deleteFile() {
      this.$store.dispatch('files/delete', {
        fileId: this.file.id,
        folderId: this.file.folderId,
      });
    },
  },
};
</script>
<style scoped>
.file-name{
  cursor: pointer;
  @apply text-lg font-semibold;
}
</style>

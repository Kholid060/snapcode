<template>
  <div class="flex items-center">
    <input
     placeholder="Title"
     class="text-xl w-6/12 font-semibold focus:outline-none"
     type="text"
     v-model="snippetTitle">
    <div class="flex-grow"></div>
    <button-ui
      v-tooltip="{content: 'Star', placement: 'left'}"
     icon>
      <v-mdi name="mdi-star-outline" size="20"></v-mdi>
    </button-ui>
    <button-ui
     v-tooltip="{content: 'Delete snippet', placement: 'left'}"
     icon class="ml-4">
      <v-mdi
       class="text-danger"
       name="mdi-delete-outline"
       size="20"></v-mdi>
    </button-ui>
  </div>
</template>
<script>
export default {
  data: () => ({
    snippetTitle: 'How to do something',
  }),
};
</script>
<style scoped>
.file-name{
  cursor: pointer;
  @apply text-lg font-semibold;
}
</style>

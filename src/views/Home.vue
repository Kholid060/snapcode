<template>
  <div class="home flex h-full flex-col">
    <div class="pt-6 pb-5 px-6">
      <home-header></home-header>
      <file-tags></file-tags>
    </div>
    <vue-codemirror
     ref="test"
     class="flex-auto overflow-y-auto px-4"></vue-codemirror>
    <div class="flex items-center py-1 pb-2 px-6">
      <p class="cursor-pointer">JavaScript</p>
      <div class="flex-grow"></div>
      <span>Col 1, Line 2</span>
    </div>
  </div>
</template>

<script>
import HomeHeader from '~/components/Pages/Home/Header.vue';
import FileTags from '~/components/Pages/Home/FileTags.vue';
import VueCodemirror from '~/components/Pages/Home/VueCodemirror.vue';

export default {
  components: { HomeHeader, FileTags, VueCodemirror },
  name: 'Home',
  mounted() {
    // const { CodeMirror } = document.querySelector('.CodeMirror');
    console.log(this.$store.getters['folders/getAllWithFiles']);
  },
};
</script>

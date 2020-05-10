<template>
  <div
   class="home flex h-full flex-col">
    <div class="pt-3 lg:pt-6 pb-3 px-6">
      <home-header
       :file="file"
       :hide="!isFileActive"></home-header>
      <file-tags
       v-if="isFileActive"
       :folder-id="file.folderId"
       :file-id="file.id"
       :tags="file.tags"></file-tags>
    </div>
    <template v-if="isFileActive">
      <vue-codemirror
       @cursorPosition="cursor = $event"
       :file="file"
       class="flex-auto overflow-y-auto px-4"></vue-codemirror>
      <div class="flex items-center py-1 pb-2 px-6 text-sm">
        <v-popover placement="top-end">
          <p class="cursor-pointer">{{ getMimeName(file.mode) }}</p>
          <card-ui class="shadow-xl border" slot="popover">
            <list-ui
             v-for="mode in modes"
             :key="mode.mime"
             :active="mode.mime === file.mode"
             class="mb-2"
             v-close-popover
             @click="changeMode(mode.mime)">{{ mode.name }}</list-ui>
          </card-ui>
        </v-popover>
        <div class="flex-grow"></div>
        <span>
         Line {{ cursor.line + 1 }}, Column {{ cursor.column + 1 }}
        </span>
      </div>
    </template>
    <template v-else>
      <empty-state-ui
       class="mt-10"
       icon="mdi-file"
       title="Select snippet to view contet">
      </empty-state-ui>
    </template>
  </div>
</template>

<script>
import HomeHeader from '~/components/Pages/Home/Header.vue';
import FileTags from '~/components/Pages/Home/FileTags.vue';
import VueCodemirror from '~/components/Pages/Home/VueCodemirror.vue';

export default {
  components: { HomeHeader, FileTags, VueCodemirror },
  name: 'Home',
  data: () => ({
    modes: [
      { name: 'HTML', mime: 'text/html' },
      { name: 'CSS', mime: 'text/css' },
      { name: 'JavaScript', mime: 'text/javascript' },
      { name: 'Vue.js', mime: 'text/x-vue' },
    ],
    cursor: {
      line: 1,
      column: 1,
    },
  }),
  methods: {
    changeMode(mode) {
      this.$store.dispatch('files/update', {
        fileId: this.file.id,
        folderId: this.file.folderId,
        data: {
          mode,
        },
      });
    },
    getMimeName(mime) {
      return this.modes.find((mode) => mode.mime === mime).name;
    },
  },
  computed: {
    isFileActive() {
      return this.$store.state.activeFile !== '';
    },
    file() {
      return this.$store.getters['files/activeFile'];
    },
  },
  mounted() {
    // const { CodeMirror } = document.querySelector('.CodeMirror');
  },
};
</script>

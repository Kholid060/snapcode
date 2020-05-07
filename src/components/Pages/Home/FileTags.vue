<template>
  <div class="mt-2">
    <tag-ui
     v-for="(tag, index) in fileTags"
     :key="tag.id"
     :type="tag.id === $store.state.activeTag ? 'primary' : 'default'"
     @close="delTag(index)"
     class="mr-2 mb-1">
      {{ tag.name }}
    </tag-ui>
    <v-popover
     trigger="manual"
     :auto-hide="false"
     :delay="300"
     :open="openPopover"
     class="inline-block ml-2">
      <input
       class="h-8 w-32 focus:outline-none bg-transparent"
       placeholder="Enter tag..."
       type="text"
       v-model="search"
       v-if="fileTags.length < 5"
       @focus="openPopover = true"
       @blur="openPopover = false">
      <card-ui slot="popover" class="shadow-xl border">
        <p
         v-if="availableTags.length === 0 && !search"
         class="text-lighter text-center">No tags</p>
        <list-ui
         @click="addNewTag"
         v-else-if="filteredTags.length === 0">
          <p>
            Add <b>{{ search }}</b> as a tag
          </p>
        </list-ui>
        <template v-else>
          <list-ui
           dense
           v-for="tag in filteredTags"
           :key="tag.id"
           @click="addFileTag(tag.id)">
            {{ tag.name }}
          </list-ui>
        </template>
      </card-ui>
    </v-popover>
  </div>
</template>
<script>
import { searchFilter } from '~/utils/filters';

export default {
  props: {
    folderId: String,
    fileId: String,
    tags: Array,
  },
  data: () => ({
    openPopover: false,
    search: '',
  }),
  computed: {
    fileTags() {
      return this.$store.getters['tags/getByIds'](this.tags);
    },
    availableTags() {
      return this.$store.getters['tags/getAll'].filter((tag) => {
        const isIncluded = this.fileTags.some((fileTag) => fileTag.id === tag.id);

        return !isIncluded;
      });
    },
    filteredTags() {
      return searchFilter(this.availableTags, 'name', this.search);
    },
  },
  methods: {
    updateFile(data) {
      this.$store.dispatch('files/update', {
        folderId: this.folderId,
        fileId: this.fileId,
        data,
      });
    },
    delTag(index) {
      const copyTags = [...this.tags];
      copyTags.splice(index, 1);

      this.updateFile({
        tags: copyTags,
      });
    },
    addFileTag(id) {
      const tags = [...this.tags];
      tags.push(id);

      this.updateFile({
        tags,
      });
    },
    addNewTag() {
      this.$store.dispatch('tags/insert', this.search).then((id) => {
        this.search = '';
        this.addFileTag(id);
      });
    },
  },
};
</script>

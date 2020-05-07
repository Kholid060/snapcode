<template>
  <card-ui
   hover
   :class="{ 'shadow-xl border border-primary': active }"
   @click="changeActive"
   class="cursor-pointer">
    <p class="font-semibold line-clamp">{{ file.title }}</p>
    <div class="flex items-center text-sm" slot="footer">
      <p class="w-8/12 text-overflow pr-1 capitalize">{{ tags }}</p>
      <p class="text-right w-4/12">{{ formatDate(file.createDate) }}</p>
    </div>
  </card-ui>
</template>
<script>
import dayjs from 'dayjs';

export default {
  props: {
    active: Boolean,
    file: {
      type: Object,
      default: () => ({
        title: '',
        tags: '',
        content: '',
      }),
    },
  },
  methods: {
    changeActive() {
      const { folderId, id } = this.file;

      this.$store.commit('changeState', {
        key: 'activeFile',
        data: `${folderId}&${id}`,
      });
    },
    formatDate(date) {
      return dayjs(date).format('MMMM D');
    },
  },
  computed: {
    tags() {
      const { tags } = this.file;

      return this.$store.getters['tags/getByIds'](tags).map((tag) => tag.name).join(', ');
    },
  },
};
</script>

<template>
  <card-ui hover class="cursor-pointer">
    <p class="font-semibold line-clamp">{{ file.title }}</p>
    <div class="flex items-center text-sm" slot="footer">
      <p class="w-9/12 text-overflow pr-1">{{ tags }}</p>
      <p class="text-right w-3/12">{{ formatDate(file.createDate) }}</p>
    </div>
  </card-ui>
</template>
<script>
import dayjs from 'dayjs';

export default {
  props: {
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
    formatDate(date) {
      return dayjs(date).format('MMMM D');
    },
  },
  computed: {
    tags() {
      const { folderId } = this.$route.params;

      return this.file.tags.map((id) => {
        const { name } = this.$store.getters['tags/getById'](folderId, id);

        return name;
      }).join(', ');
    },
  },
};
</script>

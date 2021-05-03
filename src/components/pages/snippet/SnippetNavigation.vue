<template>
  <nav class="nav flex mb-12 items-center">
    <div class="author flex items-center">
      <avatar-ui class="mr-4">
        <img v-if="file.user.photoURL" :src="file.user.photoURL" alt="user photo" />
        <icon-ui v-else name="user"></icon-ui>
      </avatar-ui>
      <div class="author__name">
        <p>{{ file.user.displayName }}</p>
        <p class="leading-tight text-lighter">Created at: {{ formatDate(file.createdDate) }}</p>
      </div>
    </div>
    <div class="flex-grow"></div>
    <button-ui
      v-tooltip="'Dark mode'"
      icon
      :class="{ 'text-primary': theme.currentTheme.value === 'dark' }"
      @click="theme.toggle"
    >
      <icon-ui name="moon"></icon-ui>
    </button-ui>
  </nav>
</template>
<script>
import dayjs from 'dayjs';
import { useTheme } from '~/composable';

export default {
  props: {
    file: {
      type: Object,
      default: () => ({}),
    },
  },
  setup() {
    const formatDate = (date) => dayjs(date).format('DD MMMM YYYY');
    const theme = useTheme();

    return {
      theme,
      formatDate,
    };
  },
};
</script>

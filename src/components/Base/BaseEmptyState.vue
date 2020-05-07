<template>
  <div class="empty-state-ui">
    <div class="empty-state-ui--header" v-if="!!icon">
      <div class="icon">
        <v-mdi :name="icon" size="36"></v-mdi>
      </div>
    </div>
    <div class="empty-state-ui--content">
      <p class="title">{{ title }}</p>
      <p class="description">{{ description }}</p>
    </div>
    <div class="empty-state-ui--action" v-if="$slots.action">
      <slot name="action"></slot>
    </div>
  </div>
</template>
<script>
import '~/assets/scss/components/_empty-state.scss';

export default {
  name: 'empty-state-ui',
  props: {
    icon: String,
    title: String,
    description: String,
  },
};
</script>

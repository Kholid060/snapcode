<template>
  <div
    :class="{ 'hover:shadow-xl': hover, flex: horizontal }"
    class="
      card-ui
      rounded-lg
      transition-shadow
      ease
      duration-300
      bg-card
      inline-block
      bg-opacity-100
    "
  >
    <div v-show="$slots.image" class="px-4 pt-4" :class="{ 'pb-4': horizontal }">
      <slot name="image"></slot>
    </div>
    <div class="flex flex-col" :class="{ 'pr-2': horizontal }">
      <div v-show="$slots.header" class="pt-4 px-4">
        <slot name="header"></slot>
      </div>
      <div class="p-4 flex-1">
        <slot></slot>
      </div>
      <div v-show="$slots.footer" class="px-4 pb-4">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    hover: Boolean,
    horizontal: Boolean,
  },
};
</script>
<style>
.card-ui {
  min-width: 150px;
}
</style>

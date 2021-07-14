<template>
  <component
    :is="tag"
    class="
      list-item-ui
      rounded-lg
      flex
      items-center
      py-2
      transition-colors
      duration-200
      ease-in-out
    "
    tabindex="0"
    role="listitem"
    :class="[
      active ? 'bg-primary bg-opacity-10 text-primary' : 'hover:bg-input focus:bg-input',
      small ? 'px-2' : 'px-4',
      { 'pointer-events-none bg-opacity-75': disabled },
    ]"
  >
    <div v-if="$slots.prepend" class="mr-3">
      <slot name="prepend"></slot>
    </div>
    <slot></slot>
    <div v-if="$slots.append" class="ml-3">
      <slot name="append"></slot>
    </div>
  </component>
</template>
<script>
export default {
  props: {
    active: Boolean,
    disabled: Boolean,
    small: Boolean,
    tag: {
      type: String,
      default: 'div',
    },
  },
};
</script>
<style>
.list-item-ui {
  min-height: 40px;
}
</style>

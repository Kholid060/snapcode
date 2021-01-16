<template>
  <component 
    :is="tag"
    class="list-item-ui rounded-lg flex items-center py-2 transition-colors duration-200 ease-in-out"
    tabindex="0"
    role="listitem"
    :class="[
      active ? 'bg-primary bg-opacity-10 text-primary' : 'hover:bg-input focus:bg-input',
      small ? 'px-2' : 'px-4',
      { 'pointer-events-none bg-opacity-75': disabled },
    ]"
  >
    <div class="mr-3" v-if="$slots.prepend">
      <slot name="prepend"></slot>
    </div>
    <div class="flex-1">
      <slot></slot>
    </div>
    <div class="ml-3" v-if="$slots.append">
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

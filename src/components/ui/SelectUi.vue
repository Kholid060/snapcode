<template>
  <div class="select-ui inline-block relative bg-input transition rounded-lg cursor-pointer">
    <select
      class="pr-12 pl-4 py-2 bg-transparent appearance-none cursor-pointer w-full focus:outline-none"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
      <slot></slot>
    </select>
    <icon-ui name="chevronDown" class="absolute select-ui__chevron z-0" size="20"></icon-ui>
  </div>
</template>
<script>
export default {
  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
};
</script>
<style>
.select-ui option {
  @apply bg-card;
}

.select-ui:focus-within {
  @apply ring-4;
}

.select-ui__chevron {
  right: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
}
</style>

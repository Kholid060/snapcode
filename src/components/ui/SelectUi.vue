<template>
  <div class="select-ui inline-block relative bg-input transition rounded-lg">
    <select
      class="pr-12 pl-4 py-2 bg-transparent appearance-none w-full focus:outline-none"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <slot></slot>
    </select>
    <icon-ui
      name="chevronDown"
      class="absolute select-ui__chevron"
      size="20"
    ></icon-ui>
  </div>
</template>
<script>
export default {
  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
  },
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

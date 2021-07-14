<template>
  <label class="checkbox-ui inline-flex items-center">
    <div class="relative h-5 w-5 inline-block">
      <input
        type="checkbox"
        class="opacity-0 checkbox-ui__input"
        :value="modelValue"
        v-bind="{ checked: modelValue }"
        @change="changeHandler"
      />
      <div
        class="
          border border-gray-600
          rounded
          absolute
          top-0
          left-0
          bg-input
          checkbox-ui__mark
          cursor-pointer
        "
      >
        <v-mdi name="mdi-check" size="20" class="text-white"></v-mdi>
      </div>
    </div>
    <span v-if="$slots.default" class="ml-2">
      <slot></slot>
    </span>
  </label>
</template>
<script>
export default {
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    function changeHandler({ target: { checked } }) {
      emit('update:modelValue', checked);
      emit('change', checked);
    }

    return {
      changeHandler,
    };
  },
};
</script>
<style>
.checkbox-ui__mark {
  height: 100%;
  width: 100%;
  transition-property: background-color, border-color;
  transition-timing-function: ease;
  transition-duration: 200ms;
  display: flex;
  align-items: center;
  justify-content: center;
}
.checkbox-ui__mark .mdi-icon {
  transform: scale(0) !important;
  transition: transform 200ms ease;
}
.checkbox-ui__input:checked ~ .checkbox-ui__mark {
  @apply bg-primary border-primary bg-opacity-100;
}
.checkbox-ui__input:checked ~ .checkbox-ui__mark .mdi-icon {
  transform: scale(1) !important;
}
.checkbox-ui__input:focus ~ .checkbox-ui__mark {
  @apply ring ring-blue-500 ring-opacity-50;
}
</style>

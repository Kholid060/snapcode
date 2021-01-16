<template>
  <div
    class="switch-ui relative inline-flex h-6 w-12 justify-center items-center bg-input p-1 rounded-full"
    :class="{ 'pointer-events-none opacity-50': disabled }"
  >
    <input
      :checked="modelValue"
      @input="emitEvent"
      type="checkbox"
      class="absolute h-full w-full opacity-0 cursor-pointer left-0 top-0 z-50"
      v-bind="{ disabled, readonly: disabled || null }"
    />
    <div
      class="switch-ui__ball z-40 rounded-full absolute h-4 w-4 shadow-xl bg-white flex justify-center items-center"
    >
      <slot name="ball" v-if="$slots.ball"></slot>
    </div>
    <div
      class="switch-ui__background absolute h-full rounded-md w-full left-0 top-0 bg-primary"
    ></div>
  </div>
</template>
<script>
export default {
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    disabled: Boolean,
  },
  setup(props, { emit }) {
    return {
      emitEvent: () => {
        const newValue = !props.modelValue;

        emit('change', newValue);
        emit('update:modelValue', newValue);
      },
    };
  },
};
</script>
<style src="~/assets/css/components/switch.css"></style>

<template>
  <div class="inline-block input-ui">
    <div class="flex items-center">
      <icon-ui class="ml-2 absolute left-0" v-if="prependIcon" :name="prependIcon"></icon-ui>
      <input
        class="py-2 px-4 rounded-lg bg-input hover:bg-input-dark focus:bg-input-dark transition"
        :class="{
          'opacity-75 pointer-events-none': disabled,
          'pl-10': prependIcon,
        }"
        v-bind="{ readonly: disabled || null, placeholder, type }"
        :value="modelValue"
        @input="$emit('update:model-value', $event.target.value)"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: String,
      default: '',
    },
    prependIcon: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
};
</script>

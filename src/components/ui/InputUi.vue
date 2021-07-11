<template>
  <div class="inline-block input-ui">
    <label class="relative">
      <span v-if="label" class="text-sm mb-1">{{ label }}</span>
      <div class="flex items-center">
        <v-mdi
          v-if="prependIcon"
          class="ml-2 text-lighter absolute left-0"
          :name="prependIcon"
        ></v-mdi>
        <input
          v-autofocus="autofocus"
          class="
            py-2
            px-4
            rounded-lg
            bg-input
            hover:bg-input-dark
            w-full
            focus:bg-input-dark
            transition
          "
          :class="{
            'opacity-75 pointer-events-none': disabled,
            'pl-10': prependIcon,
          }"
          v-bind="{ readonly: disabled || null, placeholder, type }"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
        />
      </div>
    </label>
  </div>
</template>
<script>
export default {
  directives: {
    autofocus: (el, { value }) => {
      if (value) el.focus();
    },
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    autofocus: {
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
    label: {
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
  emits: ['update:modelValue'],
};
</script>

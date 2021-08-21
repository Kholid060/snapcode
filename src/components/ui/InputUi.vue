<template>
  <div class="inline-block input-ui relative">
    <label v-if="label" class="text-sm mb-1">
      {{ label }}
    </label>
    <div class="flex items-center">
      <v-mdi
        v-if="prependIcon"
        class="ml-2 text-lighter absolute left-0"
        :name="prependIcon"
        @click="$emit('click:prepend')"
      ></v-mdi>
      <input
        v-autofocus="autofocus"
        class="rounded-lg bg-input hover:bg-input-dark w-full focus:bg-input-dark transition"
        :class="[
          small ? 'p-2' : 'py-2 px-4',
          {
            'opacity-75 pointer-events-none': disabled,
            'pl-10': prependIcon,
            'pr-10': appendIcon,
          },
        ]"
        v-bind="{ readonly: readonly || disabled || null, placeholder, type }"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <v-mdi
        v-if="appendIcon"
        class="mr-2 text-lighter absolute z-10 right-0"
        :name="appendIcon"
        @click="$emit('click:append')"
      ></v-mdi>
    </div>
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
    readonly: {
      type: Boolean,
      default: false,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    small: {
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
    appendIcon: {
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
  emits: ['update:modelValue', 'click:append', 'click:prepend'],
};
</script>

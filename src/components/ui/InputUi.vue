<template>
  <div class="inline-block input-ui">
    <label>
      <span class="text-sm mb-1" v-if="label">{{ label }}</span>
      <div class="flex items-center">
        <icon-ui class="ml-2 absolute left-0" v-if="prependIcon" :name="prependIcon"></icon-ui>
        <input
          class="py-2 px-4 rounded-lg bg-input hover:bg-input-dark w-full focus:bg-input-dark transition"
          :class="{
            'opacity-75 pointer-events-none': disabled,
            'pl-10': prependIcon,
          }"
          v-bind="{ readonly: disabled || null, placeholder, type }"
          :value="modelValue"
          v-autofocus="autofocus"
          @input="$emit('update:model-value', $event.target.value)"
        />
      </div>
    </label>
  </div>
</template>
<script>
import IconUi from './IconUi.vue';

export default {
  components: { IconUi },
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
  directives: {
    autofocus: (el, { value }) => {
      if (value) el.focus();
    },
  },
};
</script>

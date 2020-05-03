<template>
  <div class="input-ui" @click="$emit('click', $event)"
   :class="[{ error, large, block }, type]">
    <div class="input-ui--container">
      <v-mdi :name="icon" v-if="!!icon"></v-mdi>
      <input
        :type="nativeType"
        :name="name"
        :placeholder="placeholder"
        :value="value"
        v-autofocus="autofocus"
        :style="{ width, height }"
        @blur="$emit('blur', $event)"
        @input="emitEvent"
      />
    </div>
  </div>
</template>
<script>
import '~/assets/scss/components/_input.scss';

export default {
  name: 'input-ui',
  props: {
    name: String,
    value: String,
    error: Boolean,
    icon: String,
    placeholder: String,
    large: Boolean,
    block: Boolean,
    disabled: Boolean,
    autofocus: Boolean,
    width: [String, Number],
    height: [String, Number],
    type: {
      type: String,
      default: 'default',
      validator(value) {
        return ['default', 'outline', 'background'].indexOf(value) !== -1;
      },
    },
    nativeType: {
      type: String,
      default: 'text',
    },
  },
  methods: {
    emitEvent(event) {
      const { value } = event.target;

      this.$emit('input', value);
      this.$emit('change', value);
    },
  },
};
</script>

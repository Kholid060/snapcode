<template>
  <textarea
    :class="[{ error, block }, type]"
    class="input-ui textarea"
    :style="$attrs"
    :type="nativeType"
    :name="name"
    :placeholder="placeholder"
    :value="value"
    @input="$emit('input', $event.target.value)"
    @change="$emit('change', $event.target.value)"
  ></textarea>
</template>
<script>
import '~/assets/scss/components/_input.scss';

export default {
  name: 'textarea-ui',
  props: {
    name: String,
    value: String,
    error: Boolean,
    placeholder: String,
    block: Boolean,
    type: {
      type: String,
      default: 'default',
      validator(value) {
        return ['default', 'outline'].indexOf(value) !== -1;
      },
    },
    nativeType: {
      type: String,
      default: 'text',
    },
  },
};
</script>

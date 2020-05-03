<template>
  <div class="progress-ui" :class="{ block }">
    <slot name="prefix" class="progress-ui--prefix"></slot>
    <div class="progress-ui--wrapper" :style="{ width, height }">
      <div
       class="progress-ui--inner"
       :style="{ width: value + '%' }"
       :class="[type]"></div>
    </div>
    <slot name="suffix" class="progress-ui--suffix"></slot>
  </div>
</template>
<script>
import '~/assets/scss/components/_progress.scss';

export default {
  name: 'progress-ui',
  props: {
    block: Boolean,
    width: [String, Number],
    height: {
      type: [String, Number],
      default: '10px',
    },
    value: {
      type: Number,
      validator(value) {
        return value > 0 || value < 100;
      },
    },
    type: {
      type: String,
      default: 'primary',
      validator(value) {
        return ['primary', 'secondary', 'danger', 'warning', 'green'].indexOf(value) !== -1;
      },
    },
  },
};
</script>

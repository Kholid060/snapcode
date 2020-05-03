<template>
  <label class="switch">
    <input type="checkbox" class="switch-input" v-model="checked" id="checkbox" />
    <div class="slider round"></div>
  </label>
</template>
<script>
import '~/assets/scss/components/_switch.scss';

export default {
  name: 'switch-ui',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    checked: {
      set(value) {
        this.$emit('input', value);
        this.$emit('change', value);
      },
      get() {
        return this.value;
      },
    },
  },
};
</script>

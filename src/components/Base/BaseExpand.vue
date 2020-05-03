<template>
  <div clsas="expand-ui"
  :class="{ 'shadow-xl': show }">
    <button
     class="expand-ui--header px-4"
     :class="{'rounded-bl-lg rounded-br-lg': !show}"
     @click="expand">
      <p v-if="!!title">{{ title }}</p>
      <slot v-else></slot>
      <div class="flex-grow"></div>
      <v-mdi
       name="mdi-chevron-down"
       :rotate="show ? 180 : 0"></v-mdi>
    </button>
    <hr class="mx-4 border-transparent">
    <transition>
      <div class="expand-ui--content p-4" v-show="show">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>
<script>
import '~/assets/scss/components/_expand.scss';

export default {
  name: 'expand-ui',
  props: {
    title: String,
  },
  data: () => ({
    show: false,
  }),
  methods: {
    expand() {
      this.show = !this.show;
      this.$emit('change', this.show);
    },
  },
};
</script>

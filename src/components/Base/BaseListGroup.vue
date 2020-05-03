<template>
  <div class="list-ui-group">
    <div
     class="list-ui activator cursor-pointer relative"
     :class="{ 'active-group': open }"
     @click="open = !open">
      <div class="prefix">
        <v-mdi :name="prefixIcon" v-if="prefixIcon"></v-mdi>
        <slot name="prefix" v-else-if="$slots.prefix"></slot>
      </div>
      <div class="flex-1 overflow-hidden pr-1">
        <slot name="activator"></slot>
      </div>
      <v-mdi
       name="mdi-chevron-down"
       :rotate="open ? 180 : 0"></v-mdi>
    </div>
    <transition
      name="expand"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
    >
      <div class="list-ui--content mt-2" v-if="open">
        <slot :child-list="true"></slot>
      </div>
    </transition>
  </div>
</template>
<script>
/* eslint-disable no-unused-expressions */
import '~/assets/scss/components/_list.scss';

export default {
  name: 'list-group-ui',
  props: {
    prefixIcon: String,
    value: [String, Number, Boolean],
  },
  data: () => ({
    open: false,
  }),
  methods: {
    /*
      Expand transition by Markus Oberlehner
      https://markus.oberlehner.net/blog/transition-to-height-auto-with-vue/
    */
    /* eslint no-param-reassign: "off" */
    enter(element) {
      const { width } = getComputedStyle(element);

      element.style.width = width;
      element.style.position = 'absolute';
      element.style.visibility = 'hidden';
      element.style.height = 'auto';

      const { height } = getComputedStyle(element);

      element.style.width = null;
      element.style.position = null;
      element.style.visibility = null;
      element.style.height = 0;

      getComputedStyle(element).height;

      requestAnimationFrame(() => {
        element.style.height = height;
      });
    },
    afterEnter(element) {
      element.style.height = 'auto';
    },
    leave(element) {
      const { height } = getComputedStyle(element);

      element.style.height = height;

      // Force repaint to make sure the
      // animation is triggered correctly.
      getComputedStyle(element).height;

      requestAnimationFrame(() => {
        element.style.height = 0;
      });
    },
  },
  mounted() {
    this.open = !!this.value;
  },
};
</script>
<style scoped lang="scss">
.expand-enter-active,
.expand-leave-active {
  transition: height .2s ease-in-out;
  overflow: hidden;
}

.expand-enter,
.expand-leave-to {
  height: 0;
}

.list-ui-group{
  .activator{
    transition-duration: 200ms;
    transition-timing-function: ease;
    transition-property: color, padding;
    overflow: hidden;
  }
}

.list-ui--content {
  will-change: height;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>

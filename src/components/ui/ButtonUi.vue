<template>
  <component
    :is="tag"
    role="button"
    v-bind="{ disabled: disabled || loading }"
    :class="[
      circle ? 'rounded-full' : 'rounded-lg',
      variant,
      bgColors,
      buttonType,
      {
        'opacity-75': disabled,
        'pointer-events-none': disabled || loading,
        'block w-full': block,
        'bg-opacity-25': flat,
      }
    ]"
    class="button-ui focus:ring-4 relative"
  >
    <div class="button-ui__loading rounded-lg flex justify-center items-center z-10" v-if="loading">
      <spinner-ui size="25" stroke-width="7"></spinner-ui>
    </div>
    <span class="flex justify-center items-center" :class="[buttonSize, { 'opacity-50': loading }]">
      <slot></slot>
    </span>
  </component>
</template>
<script>
import { computed } from 'vue';
import SpinnerUi from './SpinnerUi.vue';
import { buttonUi } from '~/utils/componentClasses';

export default {
  components: { SpinnerUi },
  props: {
    loading: Boolean,
    disabled: Boolean,
    circle: Boolean,
    icon: Boolean,
    block: Boolean,
    flat: Boolean,
    tag: {
      type: String,
      default: 'button',
    },
    size: {
      type: String,
      default: 'normal',
      validator(value) {
        return ['small', 'normal', 'large', 'xLarge'].indexOf(value) !== -1;
      },
    },
    variant: {
      type: String,
      default: 'default',
      validator(value) {
        return ['default', 'primary', 'danger', 'dark'].indexOf(value) !== -1;
      },
    },
  },
  setup(props) {
    const bgColors = computed(() => buttonUi.bgColors[props.variant]);
    const buttonType = computed(() => {
      const type = props.flat ? 'flat' : 'default';

      return buttonUi.variants[props.variant][type];
    });
    const buttonSize = computed(() => {
      const isIcon = props.icon ? 'icon' : 'default';

      return buttonUi.size[props.size][isIcon];
    });

    return {
      bgColors,
      buttonType,
      buttonSize,
    };
  },
};
</script>
<style src="~/assets/css/components/button.css"></style>

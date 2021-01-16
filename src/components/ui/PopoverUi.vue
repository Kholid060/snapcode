<template>
  <div class="popover-ui inline-block">
    <div
      class="inline-block popover-ui__activator"
      ref="activator"
      v-bind="{ tabindex: trigger === 'focusin' || !disabled ? 0 : null }"
    >
      <slot></slot>
    </div>
		<div
      class="rounded-lg popover-ui__content bg-card bg-opacity-100 shadow-xl focus:outline-none"
      :class="contentClasses"
      ref="content"
    >
			<slot name="popover"></slot>
		</div>
  </div>
</template>
<script>
import {
  ref, shallowRef, onMounted, watch,
} from 'vue';
import createTippy from '~/utils/createTippy';

export default {
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    trigger: {
      type: String,
      default: 'click',
      validator: (value) => ['mouseenter', 'click', 'focusin', 'manual'].includes(value),
    },
    placement: {
      type: String,
      default: 'bottom',
    },
    contentClasses: {
      type: String,
      default: 'p-4',
    },
  },
  setup(props, { emit }) {
    const content = ref(null);
    const activator = ref(null);
    const popover = shallowRef({});

    watch(() => props.modelValue, (value) => {
      if (props.trigger !== 'manual') return;

      popover.value[value ? 'show' : 'hide']();
    });
    watch(() => props.disabled, () => {
      popover.value[props.disabled ? 'disable' : 'enable']();
    });

    onMounted(() => {
      popover.value = createTippy(activator.value, {
        theme: null,
        content: content.value,
        trigger: props.trigger,
        placement: props.placement,
        role: 'popover',
        interactive: true,
        aria: {
          content: 'auto',
          expanded: 'auto',
        },
        appendTo: () => document.body,
        onHide: () => {
          if (props.trigger === 'manual') emit('update:modelValue', false);
        },
      });
    });

    return {
      content,
      popover,
      activator,
    };
  },
};
</script>
<style>
.tippy-box[role~="popover"] > .tippy-svg-arrow {
  fill: rgba(var(--bg-card), var(--bg-opacity, 1));
}
</style>

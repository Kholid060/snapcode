<script>
import '~/assets/scss/components/_list.scss';

export default {
  name: 'list-ui',
  props: {
    dense: Boolean,
    active: Boolean,
    tag: {
      type: String,
      default: 'div',
    },
    to: [String, Object],
  },
  render(h) {
    const prefixEl = this.$slots.prefix ? h('div', {
      staticClass: 'prefix',
    }, this.$slots.prefix) : '';

    return h(this.tag, {
      staticClass: 'list-ui',
      class: {
        dense: this.dense,
        active: this.active,
      },
      props: {
        to: this.to,
      },
      on: {
        ...this.$listeners,
      },
    }, [
      prefixEl,
      this.$slots.default,
    ]);
  },
};
</script>

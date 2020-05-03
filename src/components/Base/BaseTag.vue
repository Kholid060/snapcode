<script>
import '~/assets/scss/components/_tag.scss';

export default {
  name: 'tag-ui',
  props: {
    showClose: {
      type: Boolean,
      default: true,
    },
  },
  render(h) {
    const closeIcon = this.showClose ? h('v-mdi', {
      props: {
        name: 'mdi-close',
        size: 16,
      },
      on: {
        click: () => this.$emit('close'),
      },
    }) : null;

    return h('div', {
      on: {
        click: (event) => this.$emit('click', event),
      },
      staticClass: 'tag-ui',
    }, [
      h('p', {
        staticClass: 'tag-ui__content',
      }, this.$slots.default),
      closeIcon,
    ]);
  },
};
</script>

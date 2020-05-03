<script>
export default {
  name: 'img-ui',
  props: {
    src: String,
    height: {
      type: [String, Number],
      default: '100px',
    },
    width: {
      type: [String, Number],
      default: '80px',
    },
    position: {
      type: String,
      default: 'center center',
    },
    contain: Boolean,
  },
  render(h) {
    return h('div', {
      class: 'img-ui',
      style: {
        backgroundImage: `url(${this.src})`,
        width: this.width,
        height: this.height,
        backgroundPosition: this.position,
        backgroundRepeat: 'no-repeat',
        backgroundSize: this.contain ? 'contain' : 'cover',
      },
      on: this.$listeners,
    }, this.$slots.default);
  },
};
</script>

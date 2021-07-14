<template>
  <div class="error-stat-ui">
    <img class="w-4/12 mx-auto" style="min-width: 300px" :src="error.img" />
    <div class="mt-6 text-center">
      <p class="text-xl mb-4">{{ error.title }}</p>
      <button-ui variant="primary" @click="action">
        {{ actionText || error.btn }}
      </button-ui>
    </div>
  </div>
</template>
<script>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import notFoundSvg from '~/assets/svg/404.svg';
import sadFaceSvg from '~/assets/svg/sad-face.svg';

export default {
  props: {
    code: {
      type: [Number, String],
      default: 404,
    },
    actionText: {
      type: String,
      default: '',
    },
  },
  emits: ['action'],
  setup(props, { emit }) {
    const router = useRouter();

    const errors = {
      404: {
        img: notFoundSvg,
        title: "Oh no! This page doesn't exist.",
        btn: 'Go to homepage',
      },
      500: {
        img: sadFaceSvg,
        title: 'Oppss... something went wrong.',
        btn: 'Try again',
      },
    };

    const error = computed(() => errors[props.code] || {});

    function action() {
      if (props.code === 404 || props.code === '404') router.push('/');
      else emit('action');
    }

    return {
      error,
      action,
    };
  },
};
</script>

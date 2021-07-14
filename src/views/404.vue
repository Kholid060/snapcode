<template>
  <div class="h-screen flex flex-col justify-center items-center">
    <img class="w-4/12 mx-auto" :src="notFoundSvg" />
    <div class="mt-6 text-center">
      <p class="text-2xl font-semibold mb-4">Oh no! This page doesn't exist.</p>
      <router-link to="/">
        <button-ui variant="primary">Go to main page</button-ui>
      </router-link>
    </div>
  </div>
</template>
<script>
import notFoundSvg from '~/assets/svg/404.svg';

export default {
  setup() {
    return {
      notFoundSvg,
    };
  },
};
</script>

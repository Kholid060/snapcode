<template>
  <modal-ui v-model="show" content-class="max-w-sm">
    <template #header> Login </template>
    <div class="space-y-2 mt-2">
      <button
        v-for="(provider, id) in providers"
        :key="id"
        :style="{ backgroundColor: provider.color }"
        class="flex items-center px-4 w-full rounded-lg"
        style="height: 52px"
        @click="loginWith(id)"
      >
        <div class="p-1 rounded-full bg-white">
          <img :src="provider.logo" class="h-6 w-6" />
        </div>
        <span class="ml-3">Continue with {{ provider.name }}</span>
      </button>
    </div>
  </modal-ui>
</template>
<script>
import { ref } from 'vue';
import emitter from 'tiny-emitter/instance';
import { auth } from '~/utils/firebase';
import googleLogoSvg from '~/assets/svg/google-logo.svg';
import githubLogoSvg from '~/assets/svg/github-logo.svg';

export default {
  props: {
    modelValue: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const providers = {
      'google.com': {
        name: 'Google',
        logo: googleLogoSvg,
        color: '#4285f4',
        scope: 'https://www.googleapis.com/auth/userinfo.profile',
      },
      'github.com': {
        name: 'GitHub',
        logo: githubLogoSvg,
        color: '#24292e',
      },
    };

    const show = ref(false);

    function loginWith(provider) {
      auth.signInWithProvider(provider);
    }

    emitter.on('show-auth', (value = true) => {
      show.value = value;
    });

    return {
      show,
      providers,
      loginWith,
      googleLogoSvg,
    };
  },
};
</script>

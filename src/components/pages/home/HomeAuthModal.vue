<template>
  <modal-ui v-model="show" content-class="max-w-sm">
    <template #header> Login </template>
    <div class="space-y-2 mt-2">
      <button
        class="flex items-center px-4 w-full rounded-lg"
        style="height: 52px; background-color: #4285f4"
        @click="loginWith('google.com')"
      >
        <div class="p-1 rounded-lg bg-white">
          <img :src="googleLogoSvg" class="h-6 w-6" />
        </div>
        <span class="ml-3">Continue with Google</span>
      </button>
    </div>
  </modal-ui>
</template>
<script>
import { ref } from 'vue';
import emitter from 'tiny-emitter/instance';
import { auth } from '~/utils/firebase';
import googleLogoSvg from '~/assets/svg/google-logo.svg';

export default {
  props: {
    modelValue: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const show = ref(false);

    function loginWith(provider) {
      auth.signInWithProvider({
        provider,
        oauthScope: 'https://www.googleapis.com/auth/userinfo.profile',
      });
    }

    emitter.on('show-auth', (value = true) => {
      show.value = value;
    });

    return {
      show,
      loginWith,
      googleLogoSvg,
    };
  },
};
</script>

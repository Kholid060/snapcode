<template>
	<modal-ui v-bind="{ modelValue }" content-class="max-w-sm" @close="updateModal">
		<template #header>
			Login
		</template>
		<div class="space-y-2 mt-2">
			<!-- <button
				@click="loginWith('github.com')" 
				class="flex items-center px-4 w-full rounded-lg" 
				style="height: 52px; background-color: #24292e"
			>
				<img :src="require('~/assets/svg/github-logo.svg')" class="h-8 w-8" />
				<span class="ml-3">Continue with Github</span>
			</button>
 -->			<button 
				@click="loginWith('google.com')" 
				class="flex items-center px-4 w-full rounded-lg" 
				style="height: 52px; background-color: #4285F4"
			>
				<div class="p-1 rounded-lg bg-white">
					<img :src="require('~/assets/svg/google-logo.svg')" class="h-6 w-6" />
				</div>
				<span class="ml-3">Continue with Google</span>
			</button>
		</div>
	</modal-ui>
</template>
<script>
import { auth } from '~/utils/firebase';

export default {
  props: {
  	modelValue: Boolean,
  },
  setup(props, { emit }) {
  	function loginWith(provider) {
  		auth.signInWithProvider({
  			provider,
  			oauthScope: 'https://www.googleapis.com/auth/userinfo.profile',
  		});
  	}
  	function updateModal() {
  		emit('update:modelValue', false);
  	}

  	return {
  		loginWith,
  		updateModal,
  	};
  },
};
</script>

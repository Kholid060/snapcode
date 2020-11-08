<template>
	<p class="my-6 text-center">
		Redirecting...
	</p>
</template>
<script>
import { useRouter } from 'vue-router';
import { auth } from '~/utils/firebase';

export default {
  setup() {
  	const router = useRouter();

  	auth.handleSignInRedirect().then(() => {
  		router.replace('/');
  	});
  },
};
</script>

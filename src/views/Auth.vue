<template>
	<p class="my-6 text-center">
		Redirecting...
	</p>
</template>
<script>
import { useRouter } from 'vue-router';
import Auth from '~/utils/firebaseAuth';

export default {
  setup() {
  	const router = useRouter();

  	Auth.handleSignInRedirect().then(() => {
  		router.replace('/');
  	});
  },
};
</script>

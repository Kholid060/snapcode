<template>
	<p class="my-6 text-center">
		Redirecting...
	</p>
</template>
<script>
import { auth } from '~/utils/firebase';

export default {
  setup() {
  	auth.handleSignInRedirect().then(() => {
  		window.location.href = '/';
  	});
  },
};
</script>

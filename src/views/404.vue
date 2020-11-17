<template>
	<div class="h-screen flex items-center justify-center">
		<img class="w-56" :src="require('~/assets/svg/404.svg')" />
		<div class="ml-6">
			<p class="text-2xl mb-4">Oh, no! This page doesn't exist.</p>
			<router-link to="/">
				<button-ui variant="primary">Go to main page</button-ui>
			</router-link>
		</div>
	</div>
</template>

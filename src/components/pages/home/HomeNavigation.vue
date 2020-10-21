<template>
	<nav class="h-16 px-5 border-b flex items-center justify-between col-span-full">
	  <div class="search-container">
	    <icon-ui name="search" class="text-lighter mr-2"></icon-ui>
	    <input type="text" placeholder="Search..." class="h-full bg-transparent">
	  </div>
	  <button-ui icon @click="toggleDarkTheme">
	    <icon-ui name="moon"></icon-ui>
	  </button-ui>
	</nav>
</template>
<script>
import toggleDarkTheme from '../../../utils/toggleDarkTheme';

export default {
  setup() {
  	return {
  		toggleDarkTheme,
  	};
  },
};
</script>

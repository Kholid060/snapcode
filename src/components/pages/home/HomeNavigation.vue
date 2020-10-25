<template>
	<nav class="h-16 px-5 border-b flex items-center justify-between col-span-full">
	  <div class="search-container">
	    <icon-ui name="search" class="text-lighter mr-2"></icon-ui>
	    <input type="text" placeholder="Search snippet, code, tag" class="h-full bg-transparent">
	  </div>
	  <div>
  		<button-ui variant="primary" icon>
  			<icon-ui name="mdiPlus"></icon-ui>
  		</button-ui>
		  <button-ui icon @click="toggleDarkTheme">
		    <icon-ui name="moon"></icon-ui>
		  </button-ui>
		  <avatar-ui class="inline-block" size="small" badge type="round">
		  	<icon-ui name="moon"></icon-ui>
		  </avatar-ui>
		</div>
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

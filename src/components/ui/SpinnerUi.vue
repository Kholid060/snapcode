<template>
	<svg
		class="spinner animate-spin"
		viewBox="0 0 50 50"
		:height="size"
		:width="size"
	>
		<circle class="path" cx="25" cy="25" r="20" fill="none" :stroke-width="strokeWidth"></circle>
	</svg>
</template>
<script>
export default {
  props: {
    size: {
      type: [String, Number],
      default: 50,
    },
    strokeWidth: {
    	type: [String, Number],
    	default: 5,
    },
  },
};
</script>
<style>
.spinner .path {
  stroke: #93bfec;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0
  }

  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35
  }

  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124
  }
}
</style>

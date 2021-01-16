<template>
	<div role="listbox" class="list-ui" :class="{ 'pointer-events-none': disabled }">
		<slot></slot>
	</div>
</template>
<script>
export default {
  props: {
    disabled: Boolean,
  },
};
</script>

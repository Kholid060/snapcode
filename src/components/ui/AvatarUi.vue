<template>
	<div
		class="avatar-ui bg-input hover:bg-input-dark transition relative"
		:class="[
			circle ? 'rounded-full' : 'rounded-lg',
      size,
		]"
	>
		<div
			class="flex items-center justify-center h-full overflow-hidden avatar-ui__content"
			style="border-radius: inherit;"
		>
			<slot></slot>
		</div>
		<div
			v-if="badge"
			class="absolute top-0 right-0 -mt-1 -mr-1 shadow-xl"
			:class="[
				badgeClass,
				$slots.badge ? 'p-1 text-xs leading-none text-white rounded-md' : 'h-3 w-3 rounded-full',
			]"
		>
			<slot name="badge"></slot>
		</div>
	</div>
</template>
<script>
export default {
  props: {
  	circle: Boolean,
  	badge: Boolean,
  	size: {
  		type: String,
  		default: 'h-10 w-10',
  	},
  	badgeClass: {
  		type: String,
  		default: 'bg-primary',
  	},
  },
};
</script>

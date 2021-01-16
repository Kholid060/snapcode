<template>
	<svg v-bind="{
		viewBox: icon.viewBox || viewBox,
		height: size,
		width: size
	}"
	class="icon-ui">
    <path
    	fill="currentColor"
    	v-for="(path, index) in icon.paths"
    	:key="index"
    	:d="path"
      v-bind="icon.pathAttrs || {}"
    />
	</svg>
</template>
<script>
import { computed } from 'vue';
import icons from '~/lib/icons';

export default {
  props: {
    viewBox: {
      type: String,
      default: '0 0 24 24',
    },
    size: {
      type: [String, Number],
      default: 24,
    },
    name: String,
  },
  setup(props) {
  	return {
  		icon: computed(() => {
	  		try {
	  			const icon = icons[props.name];

	  			if (icon) {
	  				return {
	  					...icon,
	  					paths: Array.isArray(icon.paths) ? icon.paths : [icon.paths],
	  				};
	  			}

	  			throw new Error(`[${props.name}] icon not found`);
	  		} catch (err) {
	  			console.error(err);

	  			return [];
	  		}
  		}),
  	};
  },
};
</script>
<style>
.icon-ui {
  display: inline-block;
  transition: transform 250ms ease;
}
</style>

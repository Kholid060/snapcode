<template>
	<nav class="nav flex mb-12 items-center">
		<div class="author flex items-center">
			<avatar-ui class="mr-4">
				<img
					:src="file.user.photoURL"
					alt="user photo"
					v-if="file.user.photoURL"
				/>
				<icon-ui name="user" v-else></icon-ui>
			</avatar-ui>
			<div class="author__name">
				<p>{{ file.user.displayName }}</p>
				<p class="leading-tight text-lighter">
					Created at: {{ formatDate(file.createdDate) }}
				</p>
			</div>
		</div>
		<div class="flex-grow"></div>
		<button-ui
			@click="theme.toggle"
			icon
			v-tooltip="'Dark mode'"
			:class="{ 'text-primary': theme.currentTheme.value === 'dark' }"
		>
			<icon-ui name="moon"></icon-ui>
		</button-ui>
	</nav>
</template>
<script>
import dayjs from 'dayjs';
import { useTheme } from '~/composable';

export default {
  props: {
    file: {
      type: Object,
      default: () => ({}),
    },
  },
  setup() {
  	const formatDate = (date) => dayjs(date).format('DD MMMM YYYY');
  	const theme = useTheme();

  	return {
  		theme,
  		formatDate,
  	};
  },
};
</script>

<template>
  <div class="app">
    <router-view></router-view>
  </div>
</template>
<script>
import { useTheme } from 'comps-ui';
import { Folder, File } from './models';

export default {
  setup() {
  	const theme = useTheme();
  	theme.setTheme(localStorage.getItem('theme') || 'dark');

  	const isFirstTime = JSON.parse(localStorage.getItem('firstTime'));

  	if (isFirstTime === null) {
  		Folder.$create({
  			data: {
  				name: 'My Folder',
  				files: [
  					{ name: 'First snippet' },
  				],
  			},
  		});

  		localStorage.setItem('firstTime', false);
  	} else {
  		Folder.$fetch();
  		File.$fetch();
  	}
  },
};
</script>

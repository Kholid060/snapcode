<template>
  <div class="app">
    <router-view></router-view>
  </div>
</template>
<script>
import { useTheme } from 'comps-ui';
import { Folder } from './models';

export default {
  setup() {
  	const theme = useTheme();
  	theme.setTheme(localStorage.getItem('theme') || 'dark');

  	Folder.insert({
  		data: {
  			name: 'Abb',
  		},
  	});
  	Folder.insert({
  		data: {
	  		name: 'My folder',
	  		files: [
	  			{
  					id: 'bla123',
	  				name: 'some code',
	  				code: 'const code = false',
	  				isShared: true,
	  			},
	  			{
	  				name: 'vuex',
	  				code: 'function test',
	  				starred: true,
	  			},
	  			{
	  				name: 'my html',
	  				language: 'html',
	  				code: '<p>wowow</p>',
	  				starred: true,
	  			},
	  		],
	  	},
  	});
  },
};
</script>

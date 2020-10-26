<template>
  <div class="app">
    <router-view></router-view>
  </div>
</template>
<script>
import { Folder } from './models';

export default {
  setup() {
  	Folder.insert({
  		data: {
	  		name: 'My folder',
	  		description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod',
	  		files: [
	  			{
  					id: 'bla123',
	  				name: 'some code',
	  				code: 'const code = false',
	  				createdAt: 1603678803621,
	  				isShared: true,
	  			},
	  			{
	  				name: 'vuex',
	  				code: 'function test',
	  				createdAt: 1603678481495,
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

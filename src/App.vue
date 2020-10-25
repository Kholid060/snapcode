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
	  				createdAt: Date.now() - 18000,
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

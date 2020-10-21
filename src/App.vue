<template>
  <div class="app">
    <router-view></router-view>
  </div>
</template>
<script>
import { useRouter } from 'vue-router';
import { Folder } from './models';

export default {
  setup() {
  	Folder.insert({
  		data: {
  			id: 'bla123',
	  		name: 'My folder',
	  		description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod',
	  		files: [
	  			{
	  				name: 'some code',
	  				code: 'const code = false',
	  			},
	  			{
	  				name: 'some code',
	  				code: 'const code = false',
	  				starred: true,
	  			},
	  		],
	  	},
  	});
  	const router = useRouter();

  	router.push('/folder/bla123');
  	console.log(Folder.query().withAll().get());
  },
};
</script>

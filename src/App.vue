<template>
  <div class="app">
    <router-view v-if="isRetrieved"></router-view>
  </div>
</template>
<script>
import { onMounted, ref } from 'vue';
import { useTheme } from 'comps-ui';
import { Folder, File } from './models';

export default {
  suspensible: true,
  setup() {
    const isRetrieved = ref(false);

  	const theme = useTheme();
  	theme.setTheme(localStorage.getItem('theme') || 'dark');

    onMounted(async () => {
    	const isFirstTime = JSON.parse(localStorage.getItem('firstTime'));

    	if (isFirstTime === null) {
    		await Folder.$create({
    			data: {
    				name: 'My Folder',
    				files: [
    					{ name: 'First snippet' },
    				],
    			},
    		});

    		localStorage.setItem('firstTime', false);
    	} else {
    		await Folder.$fetch();
    		await File.$fetch();
    	}

      isRetrieved.value = true;
    });

    return {
      isRetrieved,
    };
  },
};
</script>

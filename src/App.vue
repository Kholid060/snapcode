<template>
  <div class="app">
    <router-view v-if="isRetrieved"></router-view>
  </div>
</template>
<script>
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useTheme } from 'comps-ui';

export default {
  suspensible: true,
  setup() {
    const store = useStore();
    const isRetrieved = ref(false);

  	const theme = useTheme();
  	theme.setTheme(localStorage.getItem('theme') || 'dark');

    onMounted(async () => {
      await store.dispatch('retrieveData');
      isRetrieved.value = true;
    });

    return {
      isRetrieved,
    };
  },
};
</script>

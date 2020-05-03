<template>
  <div id="app" class="h-screen flex">
    <div class="flex">
      <side-menu class="inline-block"></side-menu>
      <files class="inline-block"></files>
    </div>
    <main class="bg-card flex-auto overflow-auto">
      <router-view/>
    </main>
    <modal-ui></modal-ui>
  </div>
</template>
<script>
import SideMenu from '~/components/Layout/SideMenu.vue';
import Files from '~/components/Layout/Files.vue';

export default {
  components: { SideMenu, Files },
  created() {
    this.$store.dispatch('retrieve').then(() => {
      const firstFolder = this.$store.getters['folders/getAll'][0].id;

      this.$router.push(`/${firstFolder}`);
    });
  },
};
</script>

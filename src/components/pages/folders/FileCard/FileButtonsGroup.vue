<template>
	<button-group-ui class="divide-x" @click.stop>
    <button-ui icon v-tooltip="'Star'">
      <icon-ui 
        size="20" 
        :name="file.starred ? 'starSolid' : 'star'"
        :class="{ 'text-warning': file.starred }"
      ></icon-ui>
    </button-ui>
    <div class="inline-block">
	    <button-ui icon class="text-primary" v-tooltip="'Share'">
	      <icon-ui size="20" name="link"></icon-ui>
	    </button-ui>
    </div>
    <button-ui icon class="text-primary" v-tooltip="'Copy code'">
	      <icon-ui size="20" name="clipboard"></icon-ui>
	    </button-ui>
    <button-ui icon class="text-danger" v-tooltip="'Delete'">
      <icon-ui size="20" name="trash"></icon-ui>
    </button-ui>
  </button-group-ui>
</template>
<script>
export default {
  props: {
    file: {
      type: Object,
      default: () => ({
        starred: false,
      }),
    },
  },
};
</script>

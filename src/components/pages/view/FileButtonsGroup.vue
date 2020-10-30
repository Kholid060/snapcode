<template>
	<button-group-ui class="divide-x" @click.stop>
    <button-ui icon v-tooltip:top.group="'Star'" @click="updateFile('starred', !file.starred)">
      <icon-ui 
        size="20" 
        :name="file.starred ? 'starSolid' : 'star'"
        :class="{ 'text-warning': file.starred }"
      ></icon-ui>
    </button-ui>
    <popover-ui>
      <button-ui icon :class="{ 'text-primary': file.isShared }" v-tooltip:top.group="'Share'">
        <icon-ui size="20" name="link"></icon-ui>
      </button-ui>
      <template #popover>
        <div class="flex justify-between w-48">
          <span>Share snippet</span>
          <switch-ui 
            :model-value="file.isShared"
            @update:model-value="updateFile('isShared', !file.isShared)"
          ></switch-ui>
        </div>
        <slide-transition direction="top">
          <input 
            type="text"
            aria-label="share url"
            placeholder="url"
            @click="copyUrl"
            v-if="file.isShared"
            class="p-2 w-48 rounded-lg bg-input hover:bg-input-dark transition-colors duration-200 ease-in mt-4"
            readonly 
            :value="`${location}/snippet/${file.id}`"
          >
        </slide-transition>
      </template>
    </popover-ui>
    <button-ui 
      icon
      v-tooltip:top.group="'Copy code'"
      @click="copyCode"
    >
      <icon-ui size="20" name="clipboardCopy"></icon-ui>
    </button-ui>
    <button-ui 
      icon 
      class="text-danger" 
      v-tooltip:top.group="'Delete'"
      @click="deleteFile"
    >
      <icon-ui size="20" name="trash"></icon-ui>
    </button-ui>
  </button-group-ui>
</template>
<script>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGroupTooltip } from 'comps-ui';
import { File } from '~/models';
import copyToClipboard from '~/utils/copyToClipboard';

export default {
  props: {
    file: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {    
    const router = useRouter();

    function copyUrl(event) {
      event.target.select();
      document.execCommand('copy');
    }
    function copyCode() {
      const cmContainer = document.querySelector('.CodeMirror');
      const code = cmContainer.CodeMirror.getValue();

      copyToClipboard(code);
    }
    function deleteFile() {
      File.delete(props.file.id).then(() => {
        router.replace('/');
      });
    }

    onMounted(() => {
      useGroupTooltip();
    });

    return {
      copyUrl,
      copyCode,
      location: window.location.origin,
      deleteFile,
      updateFile: (key, value) => {
        emit('change', { [key]: value });
      },
    };
  },
};
</script>

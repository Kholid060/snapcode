<template>
	<button-group-ui class="divide-x" @click.stop>
    <button-ui
      icon
      v-tooltip:top.group="file.starred ? 'Starred' : 'Not starred'"
      @click="updateFile('starred', !file.starred)"
    >
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
            v-if="store.state.user"
          ></switch-ui>
        </div>
        <slide-transition direction="top">
          <input
            type="text"
            aria-label="share url"
            placeholder="url"
            @click="copyUrl"
            v-if="store.state.user && file.isShared"
            class="p-2 w-48 rounded-lg bg-input hover:bg-input-dark transition-colors duration-200 ease-in mt-4"
            readonly
            :value="`${location}/snippet/${file.id}`"
          >
        </slide-transition>
        <p
          class="text-center my-2 text-light"
          v-if="!store.state.user"
        >You need to login first</p>
      </template>
    </popover-ui>
    <button-ui
      class="hidden md:inline-block"
      icon
      v-tooltip:top.group="'Copy code'"
      @click="copyCode"
    >
      <icon-ui size="20" name="clipboardCopy"></icon-ui>
    </button-ui>
    <button-ui
      icon
      class="text-danger hidden md:inline-block rounded-r-lg"
      v-tooltip:top.group="'Delete'"
      @click="deleteFile"
    >
      <icon-ui size="20" name="trash"></icon-ui>
    </button-ui>
    <popover-ui class="md:hidden">
      <button-ui icon>
        <icon-ui size="20" name="dotsHorizontal"></icon-ui>
      </button-ui>
      <template #popover>
        <list-ui class="space-y-1 w-48">
          <list-item-ui
            class="cursor-pointer"
            small
            @click="copyCode"
            v-close-popover
          >
            <template #prepend>
              <icon-ui name="clipboardCopy"></icon-ui>
            </template>
            Copy code
          </list-item-ui>
          <list-item-ui
            class="cursor-pointer text-danger"
            small
            v-close-popover
            @click="deleteFile"
          >
            <template #prepend>
              <icon-ui name="trash"></icon-ui>
            </template>
            Delete snippet
          </list-item-ui>
        </list-ui>
      </template>
    </popover-ui>
  </button-group-ui>
</template>
<script>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';
import { useGroupTooltip } from '~/composable';
import { File } from '~/models';
import { copyToClipboard } from '~/utils/helper';

export default {
  props: {
    file: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const store = useStore();
    const router = useRouter();
    const toast = useToast();

    function copyUrl(event) {
      event.target.select();
      document.execCommand('copy');

      toast('Link copied', {
        timeout: 2000,
      });
    }
    function copyCode() {
      const cmContainer = document.querySelector('.CodeMirror');
      const code = cmContainer.CodeMirror.getValue();

      copyToClipboard(code);
      toast('Code copied', {
        timeout: 2000,
      });
    }
    function deleteFile() {
      File.$delete(props.file.id).then(() => {
        router.replace('/');
      });
    }

    onMounted(() => {
      useGroupTooltip();
    });

    return {
      store,
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

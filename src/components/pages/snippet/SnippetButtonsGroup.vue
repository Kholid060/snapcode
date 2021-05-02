<template>
  <button-group-ui class="divide-x">
    <popover-ui v-if="!isLocalFile">
      <button-ui v-tooltip.group="'Fork snippet'" icon>
        <icon-ui name="mdiSourceFork"></icon-ui>
      </button-ui>
      <template #popover>
        <select-ui v-model="selectedFolder" class="w-full">
          <option v-for="folder in folders" :key="folder.id" :value="folder.id">
            {{ folder.name }}
          </option>
        </select-ui>
        <button-ui
          v-close-popover
          block
          variant="primary"
          class="mt-4"
          :disabled="selectedFolder === ''"
          @click="forkSnippet"
        >
          Fork Snippet
        </button-ui>
      </template>
    </popover-ui>
    <button-ui v-tooltip.group="'Copy code'" icon @click="copyCode">
      <icon-ui name="clipboardCopy"></icon-ui>
    </button-ui>
  </button-group-ui>
</template>
<script>
import { onMounted, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useGroupTooltip } from '~/composable';
import { Folder, File } from '~/models';
import { copyToClipboard } from '~/utils/helper';

export default {
  props: {
    file: {
      type: Object,
      default: () => ({}),
    },
    isLocalFile: Boolean,
  },
  emits: ['fork'],
  setup(props, { emit }) {
    const toast = useToast();

    const folders = Folder.all();
    const selectedFolder = ref(folders[0]?.id || '');

    function copyCode() {
      copyToClipboard(props.file.code);

      toast('Code copied', {
        timeout: 2000,
      });
    }
    function forkSnippet() {
      const copyFile = { ...props.file };

      delete copyFile.id;

      File.$create({
        data: {
          ...copyFile,
          createdAt: Date.now(),
          isEdited: true,
          isNew: true,
        },
      }).then((file) => {
        emit('fork', file);
      });
    }

    onMounted(() => {
      useGroupTooltip();
    });

    return {
      folders,
      copyCode,
      forkSnippet,
      selectedFolder,
    };
  },
};
</script>

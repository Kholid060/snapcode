<template>
  <button-group-ui class="divide-x">
    <popover-ui v-if="!isFromFork" class="button-ui">
      <button-ui v-tooltip.group="'Fork snippet'" icon>
        <v-mdi name="mdiSourceFork"></v-mdi>
      </button-ui>
      <template #popover>
        <select-ui v-model="selectedFolder" class="w-full">
          <option value="">Select folder</option>
          <option v-for="folder in folders" :key="folder.id" :value="folder.id">
            {{ folder.name }}
          </option>
        </select-ui>
        <button-ui v-close-popover block variant="primary" class="mt-4" @click="forkSnippet">
          Fork Snippet
        </button-ui>
      </template>
    </popover-ui>
    <button-ui v-tooltip.group="'Copy code'" icon @click="copyCode">
      <v-mdi name="mdi-clipboard-outline"></v-mdi>
    </button-ui>
  </button-group-ui>
</template>
<script>
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';
import { nanoid } from 'nanoid';
import { useGroupTooltip, useStorage } from '~/composable';
import { Folder, File } from '~/models';
import { copyToClipboard } from '~/utils/helper';

export default {
  props: {
    file: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    useGroupTooltip();
    const toast = useToast();
    const storage = useStorage();

    const selectedFolder = ref('');

    const folders = computed(() => Folder.all());
    const isFromFork = computed(() =>
      File.query()
        .where((file) => file.id.includes(props.file.id))
        .exists()
    );

    function copyCode() {
      copyToClipboard(props.file.code);

      toast('Code copied', {
        timeout: 2000,
      });
    }
    function forkSnippet() {
      const copyFile = { ...props.file };

      storage.model('files').update({
        data: {
          ...copyFile,
          id: `${nanoid()}___${copyFile.id.split('___')[0]}`,
          createdAt: Date.now(),
          folderId: selectedFolder.value,
          isEdited: true,
          isNew: true,
        },
      });
    }

    return {
      folders,
      copyCode,
      isFromFork,
      forkSnippet,
      selectedFolder,
    };
  },
};
</script>

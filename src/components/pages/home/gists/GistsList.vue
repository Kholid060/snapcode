<template>
  <div class="gists-list mt-3">
    <div class="flex items-center">
      <button-ui
        v-if="files.length !== 0"
        v-tooltip="files.length === state.selectedFiles.length ? 'Deselect all' : 'Select all'"
        class="mr-4"
        icon
        @click="toggleSelectFiles(state.selectedFiles.length >= files.length)"
      >
        <v-mdi :name="files.length === state.selectedFiles ? 'mdi-close' : 'mdi-check'"></v-mdi>
      </button-ui>
      <input-ui
        v-model="state.query"
        placeholder="Search file"
        prepend-icon="mdi-magnify"
        class="w-full"
      ></input-ui>
    </div>
    <p v-if="files.length === 0" class="mt-6 text-center text-lighter">No gists found</p>
    <template v-else>
      <list-ui class="max-h-64 overflow-auto scroll mb-8 mt-6 space-y-1">
        <list-item-ui
          v-for="file in filteredFiles"
          :key="file.id"
          :active="isSelected(file.id)"
          class="cursor-pointer list-item-transition"
          @click="selectFile(file.id)"
        >
          <checkbox-ui
            :model-value="isSelected(file.id)"
            @change="selectFile(file.id)"
          ></checkbox-ui>
          <p class="flex-1 pl-3 text-overflow">{{ file.filename }}</p>
        </list-item-ui>
      </list-ui>
      <div class="flex items-center">
        <select-ui v-model="state.selectedFolder" class="w-44">
          <option value="">Select folder</option>
          <option v-for="folder in state.folders" :key="folder.id" :value="folder.id">
            {{ folder.name }}
          </option>
        </select-ui>
        <div class="flex-grow"></div>
        <button-ui variant="primary" :loading="state.loadingImport" @click="importGists">
          Import ({{ state.selectedFiles.length }})
        </button-ui>
      </div>
    </template>
  </div>
</template>
<script>
import { reactive, onMounted, computed } from 'vue';
import { findModeByExtension } from '~/utils/codemirrorLanguages';
import { useStorage } from '~/composable';
import { Folder } from '~/models';

export default {
  props: {
    files: {
      type: Array,
      default: () => [],
    },
    selectAll: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const storage = useStorage();

    const state = reactive({
      query: '',
      folders: [],
      selectedFiles: [],
      selectedFolder: '',
      loadingImport: false,
    });

    const filteredFiles = computed(() =>
      props.files.filter(({ filename }) =>
        filename.toLowerCase().includes(state.query.toLowerCase())
      )
    );

    function isSelected(id) {
      return state.selectedFiles.includes(id);
    }
    function selectAll() {
      props.files.forEach(({ id }) => {
        if (state.selectedFiles.includes(id)) return;

        state.selectedFiles.push(id);
      });
    }
    function toggleSelectFiles(deselect) {
      if (deselect) state.selectedFiles = [];
      else selectAll();
    }
    function selectFile(id) {
      const index = state.selectedFiles.indexOf(id);

      index === -1 ? state.selectedFiles.push(id) : state.selectedFiles.splice(index, 1);
    }
    async function importGists() {
      state.loadingImport = true;

      const promises = state.selectedFiles.map(async (id) => {
        try {
          const { content, language, raw_url, filename } =
            props.files.find((file) => file.id === id) || {};
          const fileExtension = filename.split('.').pop();
          const mode = findModeByExtension(fileExtension)?.mime || language;
          const file = {
            name: filename,
            isEdited: true,
            isNew: true,
            folderId: state.selectedFolder,
            language: mode,
            code: content,
            createdAt: Date.now(),
          };

          if (typeof content === 'undefined') {
            const response = await fetch(raw_url);
            const code = await response.text();

            file.code = code;
          }

          return file;
        } catch (error) {
          return error;
        }
      });
      const snippets = await Promise.allSettled(promises);

      snippets.forEach(({ status, value }) => {
        if (status === 'fulfilled') {
          storage.model('files').update({
            data: value,
          });
        }
      });

      state.loadingImport = false;
      state.selectedFiles = [];

      emit('close');
    }

    onMounted(() => {
      if (props.selectAll) selectAll();

      const folders = Folder.all();

      state.folders = folders;
    });

    return {
      state,
      isSelected,
      selectFile,
      importGists,
      filteredFiles,
      toggleSelectFiles,
    };
  },
};
</script>

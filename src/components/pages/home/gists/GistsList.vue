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
        <icon-ui :name="files.length === state.selectedFiles ? 'close' : 'check'"></icon-ui>
      </button-ui>
      <input-ui
        v-model="state.query"
        placeholder="Search file"
        prepend-icon="search"
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
        <select-ui v-model="state.selectedFolder" placeholder="Select folder" class="w-44">
          <option v-for="folder in state.folders" :key="folder.id" :value="folder.id">
            {{ folder.name }}
          </option>
        </select-ui>
        <div class="flex-grow"></div>
        <button-ui
          variant="primary"
          :disabled="state.selectedFolder === ''"
          :loading="state.loadingImport"
          @click="importGists"
        >
          Import ({{ state.selectedFiles.length }})
        </button-ui>
      </div>
    </template>
  </div>
</template>
<script>
import { reactive, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { Folder, File } from '~/models';

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
    const store = useStore();

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

      for (const id of state.selectedFiles) {
        const { content, language, raw_url, filename } =
          props.files.find((file) => file.id === id) || {};
        const file = {
          name: filename,
          isEdited: true,
          isNew: true,
          folderId: state.selectedFolder,
          language: language.toLowerCase(),
          code: content,
        };

        if (typeof content === 'undefined') {
          const response = await fetch(raw_url);
          const code = await response.text();

          file.code = code;
        }

        File.$update({
          data: file,
        });
        store.commit('updateState', {
          key: 'isDataChanged',
          value: true,
        });
      }

      state.loadingImport = false;
      state.selectedFiles = [];

      emit('close');
    }

    onMounted(() => {
      if (props.selectAll) selectAll();

      const folders = Folder.all();

      state.folders = folders;
      state.selectedFolder = folders[0]?.id || '';
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

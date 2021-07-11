<template>
  <modal-ui v-model="state.showModal" content-class="max-w-md">
    <template #header>
      <button v-if="state.showList" class="mr-4" @click="state.showList = false">
        <v-mdi name="mdi-arrow-left"></v-mdi>
      </button>
      <p class="font-semibold inline-block">Import Gists</p>
    </template>
    <slide-transition direction="right" mode="out-in">
      <form v-if="!state.showList" class="mt-3" @submit.prevent="importGists">
        <input-ui
          v-model="state.inputValue"
          autofocus
          placeholder="Github username/Gist URL"
          class="w-full"
        ></input-ui>
        <button-ui
          :loading="state.loading"
          :disabled="!state.inputValue"
          block
          variant="primary"
          class="mt-4"
        >
          Import
        </button-ui>
      </form>
      <gists-list
        v-else
        v-bind="{ files: state.files, selectAll: state.selectAll }"
        @close="state.showModal = false"
      ></gists-list>
    </slide-transition>
  </modal-ui>
</template>
<script>
import { reactive, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { nanoid } from 'nanoid';
import emitter from 'tiny-emitter/instance';
import { File } from '~/models';
import GistsList from './gists/GistsList.vue';

export default {
  components: { GistsList },
  setup() {
    const toast = useToast();

    const state = reactive({
      files: [],
      loading: false,
      showList: false,
      showModal: false,
      selectAll: false,
      inputValue: '',
    });

    function clear() {
      state.files = [];
      state.showList = state.selectAll = false;
    }
    async function importGists() {
      if (state.loading) return;

      const gistUrlRegex = /gist\.github\.com/gi;
      const baseURL = 'https://api.github.com';

      clear();
      state.loading = true;

      try {
        if (gistUrlRegex.test(state.inputValue)) {
          const [gistId] = /[^/]*$/.exec(state.inputValue);

          const data = await (await fetch(`${baseURL}/gists/${gistId}`)).json();

          state.files = Object.values(data.files).map((file) => ({ ...file, id: nanoid() }));
          state.showList = true;
          state.selectAll = true;
        } else {
          const data = await (await fetch(`${baseURL}/users/${state.inputValue}/gists`)).json();

          if (data.message === 'Not Found') {
            state.loading = false;
            return toast.error('User not found');
          }

          const files = data.reduce((arr, gist) => {
            const gistFiles = Object.values(gist.files).map((file) => ({ ...file, id: nanoid() }));
            arr.push(...gistFiles);

            return arr;
          }, []);

          state.files = files;
          state.showList = true;
        }
      } catch (error) {
        console.error(error);
        toast.error('Something went wrong');
      }

      state.loading = false;
    }

    watch(
      () => state.showModal,
      (value) => {
        if (!value) {
          clear();
          state.inputValue = '';
        }
      }
    );

    emitter.on('import-gist', (value = true) => {
      state.showModal = value;
    });

    return {
      state,
      importGists,
    };
  },
};
</script>

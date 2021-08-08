<template>
  <div class="snippet-view container my-10 px-4">
    <div v-if="state.isProtected">
      <p class="mb-4">This snippet is protected, you need to input the password to get access</p>
      <form @submit.prevent="fetchSnippet(`?password=${state.password}`)">
        <input-ui v-model="state.password" autofocus label="Password:" type="password" />
        <button-ui class="ml-4" :loading="state.status === 'loading'" variant="primary">
          Submit
        </button-ui>
      </form>
    </div>
    <template v-else>
      <error-state-ui v-if="state.status === 'error'" code="404"></error-state-ui>
      <template v-else>
        <snippet-navigation v-if="state.status === 'idle'" v-bind="{ file }"></snippet-navigation>
        <div v-else class="w-64 bg-input-dark animate-pulse rounded-lg mb-12 h-12"></div>
        <div class="editor bg-light rounded-lg">
          <div class="rounded-t-lg p-4 mb-4 flex items-center border-b">
            <div v-if="state.status === 'idle'" class="file-info">
              <p>{{ file.name }}</p>
              <p class="text-sm leading-tight text-lighter">
                {{ getLangInfo(file.language, 'name') }}
              </p>
            </div>
            <div v-else class="h-10 rounded-lg w-48 bg-input-dark animate-pulse"></div>
            <div class="flex-grow"></div>
            <snippet-buttons-group :file="file"></snippet-buttons-group>
          </div>
          <pre
            ref="snippetEl"
            :class="theme.currentTheme.value === 'dark' ? 'cm-s-one-dark' : 'cm-s-one-light'"
            class="CodeMirror overflow-x-auto scroll pb-4 px-4"
          ></pre>
        </div>
      </template>
    </template>
  </div>
</template>
<script>
import { onMounted, ref, shallowReactive, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useTheme } from '~/composable';
import CodeMirror, { injectCodemirrorScript } from '~/lib/codemirror';
import { getLangInfo } from '~/utils/languages';
import { apiFetch } from '~/utils/firebase';
import SnippetNavigation from '~/components/pages/snippet/SnippetNavigation.vue';
import SnippetButtonsGroup from '~/components/pages/snippet/SnippetButtonsGroup.vue';

export default {
  components: {
    SnippetButtonsGroup,
    SnippetNavigation,
  },
  setup() {
    const theme = useTheme();
    const store = useStore();
    const route = useRoute();
    const toast = useToast();

    const snippetEl = ref(null);
    const file = ref({ user: {} });
    const state = shallowReactive({
      status: 'idle',
      password: '',
      isRetrieved: false,
      isProtected: false,
    });

    function highlightCode(file) {
      let line = 0;
      let colCodeEl = document.createElement('span');

      function outputHandler(text, style) {
        const codeEl = document.createElement('span');
        if (style) codeEl.classList = `cm-${style}`.replace(/\s/, 'cm-');
        codeEl.innerText = text;

        if (text === '\n') {
          line += 1;

          const containerEl = document.createElement('div');

          const lineEl = document.createElement('span');
          lineEl.classList = 'CodeMirror-linenumber mr-2';
          lineEl.innerText = line;

          containerEl.appendChild(lineEl);
          containerEl.appendChild(colCodeEl);

          snippetEl.value?.appendChild(containerEl);

          colCodeEl = document.createElement('span');
        } else {
          colCodeEl.appendChild(codeEl);
        }
      }

      const mode = getLangInfo(file.language);

      file.code += '\n';

      injectCodemirrorScript(`/mode/${mode}/${mode}.js`)
        .then(() => {
          CodeMirror.runMode(file.code, mode, outputHandler);
        })
        .catch(() => {
          CodeMirror.runMode(file.code, mode, outputHandler);
        });
    }

    async function fetchSnippet(query = '') {
      if (!route.params.fileId) return;

      try {
        state.status = 'loading';
        const cache = store.getters.getSnippetCache(route.params.fileId);

        if (cache) {
          file.value = cache;
        } else {
          const data = await apiFetch(`/files/${route.params.fileId}${query}`);

          if (data.errorMessage) {
            toast.error(data.errorMessage);
          } else {
            state.isProtected = data.isProtected || false;
            file.value = data;
            state.password = '';
          }
        }

        highlightCode(file.value);

        state.status = 'idle';
        state.isRetrieved = true;
      } catch (error) {
        console.error(error);
        state.status = 'error';
      }
    }

    watch(
      () => route.params,
      () => {
        if (!state.isRetrieved) fetchSnippet();
      }
    );

    onMounted(() => {
      window.CodeMirror = CodeMirror;

      fetchSnippet();
    });

    return {
      file,
      state,
      theme,
      snippetEl,
      getLangInfo,
      fetchSnippet,
    };
  },
};
</script>
<style>
.snippet-view .CodeMirror-linenumber,
.snippet-view .CodeMirror-linenumbers {
  @apply bg-light !important;
}
</style>

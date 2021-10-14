<template>
  <div
    v-if="file"
    :class="[state.isFullscreen ? 'bg-lighter top-0 left-0 fixed z-50 w-full' : 'relative']"
    class="h-full snippet flex flex-col"
  >
    <expand-transition>
      <button v-if="state.isEditorFocused" class="bg-light absolute top-0 z-50 rounded-br-lg">
        <v-mdi name="mdi-chevron-down" size="18"></v-mdi>
      </button>
      <div v-else class="pt-3 px-5 flex items-center justify-between">
        <div class="md:w-7/12 w-6/12">
          <input
            type="text"
            :value="file.name"
            class="bg-transparent text-lg w-full"
            maxlength="60"
            required
            @change="updateFileName"
          />
          <p class="text-lighter text-sm text-overflow">
            Created at: {{ formatDate(file.createdAt) }}
          </p>
        </div>
        <view-buttons-group
          v-bind="{ file }"
          @change="updateFile"
          @fullscreen="state.isFullscreen = !state.isFullscreen"
        ></view-buttons-group>
      </div>
    </expand-transition>
    <app-codemirror
      class="flex-1 overflow-auto scroll mt-2"
      :model-value="file.code"
      :options="state.cmOptions"
      :style="{ fontSize: `${state.cmOptions.fontSize || 16}px` }"
      @change="updateFile({ code: $event })"
      @cursor-activity="state.cursorPosition = $event"
      @focus="state.isEditorFocused = true"
      @blur="state.isEditorFocused = false"
      @load="state.codemirror = $event"
    ></app-codemirror>
    <div class="px-5 text-sm text-lighter py-2">
      <button @click="state.showSelectLanguages = true">
        {{ getLangInfo(file.language, 'name') || file.language }}
      </button>
      <span class="float-right">
        Line {{ state.cursorPosition.line + 1 }}, Column {{ state.cursorPosition.column + 1 }}
      </span>
    </div>
  </div>
  <view-select-languages
    v-model="state.showSelectLanguages"
    :snippet="file"
    @select="updateFile({ language: $event.mime })"
  />
</template>
<script>
import { computed, reactive, watch, defineAsyncComponent } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import dayjs from '~/lib/dayjs';
import { File } from '~/models';
import { useStorage } from '~/composable';
import { debounce } from '~/utils/helper';
import { getLangInfo } from '~/utils/languages';
import { injectCodemirrorScript } from '~/lib/codemirror';
import ViewButtonsGroup from '~/components/pages/view/ViewButtonsGroup.vue';
import ViewSelectLanguages from '~/components/pages/view/ViewSelectLanguages.vue';

export default {
  components: {
    AppCodemirror: defineAsyncComponent(() => import('~/components/app/AppCodemirror.vue')),
    ViewButtonsGroup,
    ViewSelectLanguages,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const storage = useStorage();

    const fileId = computed(() => route.params.fileId);
    const file = computed(() => {
      const findFile = File.find(fileId.value);

      if (findFile === null) {
        router.replace('/');
        return {};
      }

      return findFile;
    });

    const state = reactive({
      codemirror: null,
      isFullscreen: false,
      isEditorFocused: false,
      showSelectLanguages: false,
      cmOptions: {
        mode: 'text/javascript',
      },
      cursorPosition: {
        line: 1,
        column: 1,
      },
    });

    function updateFile(data) {
      storage.model('files').update({
        where: file.value.id,
        data: {
          ...data,
          isEdited: true,
        },
      });
    }
    function updateFileName({ target }) {
      const fileName = target.value;
      const isValidName = fileName.replace(/\s/g, '') !== '';

      if (isValidName) {
        updateFile({ name: fileName });
      } else {
        /* eslint-disable-next-line */
        target.value = file.value.name;
      }
    }
    function formatDate(date) {
      return dayjs(date).format('DD MMMM YYYY, h:mm A');
    }

    watch(
      () => file.value.language,
      () => {
        state.cmOptions = {
          mode: file.value.language,
        };
      },
      { immediate: true }
    );
    watch(
      () => store.state.editorSettings,
      debounce(async (settings, prevSettings) => {
        try {
          if (
            (!prevSettings || settings.keyMap !== prevSettings.keyMap) &&
            settings.keyMap !== 'default'
          ) {
            await injectCodemirrorScript(`/keymap/${settings.keyMap}.js`);
          }
        } catch (error) {
          // Do nothing
        }

        state.cmOptions = settings;
      }, 250),
      { immediate: true }
    );

    return {
      file,
      state,
      updateFile,
      formatDate,
      getLangInfo,
      updateFileName,
    };
  },
};
</script>
<style>
.CodeMirror {
  font-size: inherit !important;
}
</style>

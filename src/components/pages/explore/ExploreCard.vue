<template>
  <div class="rounded-lg border-2 hover:bg-light transition explore-card relative p-4 text-sm">
    <div class="flex items-center mb-4">
      <img-ui
        lazy
        :src="snippet.user.photoURL"
        class="h-10 w-10 overflow-hidden rounded-full mr-2"
      />
      <div class="flex-1 w-4/12 text-overflow">
        <p class="leading-tight text-overflow">{{ snippet.user.displayName || '-' }}</p>
        <span class="text-lighter leading-tight">
          Created at
          {{ snippet.createdAt }}
        </span>
      </div>
      <p
        class="w-6/12 text-right text-overflow cursor-pointer pl-2"
        :title="`${snippet.name} [${snippet.language}]`"
        @click="$emit('modal')"
      >
        {{ snippet.name }} [{{ getLangInfo(snippet.language, 'name') }}]
      </p>
    </div>
    <pre
      ref="snippetEl"
      :class="theme.currentTheme.value === 'dark' ? 'cm-s-one-dark' : 'cm-s-one-light'"
      class="CodeMirror cm-s-default overflow-x-auto scroll"
      @click="$emit('modal')"
    ></pre>
    <div class="code-gradient absolute bottom-0 w-full left-0"></div>
  </div>
</template>
<script>
import { onMounted, ref } from 'vue';
import CodeMirror, { injectCodemirrorScript } from '~/lib/codemirror';
import { useIntersect, useTheme } from '~/composable';
import { getLangInfo } from '~/utils/languages';

export default {
  props: {
    snippet: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['modal'],
  setup(props) {
    const intersect = useIntersect();
    const theme = useTheme();

    const snippetEl = ref(null);

    function runMode(mode) {
      CodeMirror.runMode(props.snippet.code, mode, snippetEl.value);
    }

    onMounted(() => {
      const mode = getLangInfo(props.snippet.language);

      intersect.observe(snippetEl.value, () => {
        injectCodemirrorScript(`/mode/${mode}/${mode}.js`)
          .then(() => runMode(mode))
          .catch((scriptId) => {
            if (scriptId.includes(mode)) runMode(mode);
          });
      });
    });

    return {
      theme,
      snippetEl,
      getLangInfo,
    };
  },
};
</script>
<style>
.explore-card .CodeMirror {
  max-height: 160px;
  @apply text-sm;
}
</style>

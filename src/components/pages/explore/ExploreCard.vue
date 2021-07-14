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
        {{ snippet.name }} [{{ snippet.language }}]
      </p>
    </div>
    <app-codemirror
      class="cursor-pointer"
      :options="{
        readOnly: 'nocursor',
        lineWrapping: true,
        mode: snippet.mode,
        value: snippet.code,
      }"
      @click="$emit('modal')"
    ></app-codemirror>
    <div class="code-gradient absolute bottom-0 w-full left-0"></div>
  </div>
</template>
<script>
import AppCodemirror from '~/components/app/AppCodemirror.vue';

export default {
  components: { AppCodemirror },
  props: {
    snippet: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['modal'],
};
</script>
<style>
.explore-card .CodeMirror {
  max-height: 160px;
  @apply text-sm;
}
.explore-card .CodeMirror-linenumber,
.explore-card .CodeMirror-linenumbers,
.explore-card .CodeMirror-gutters {
  background-color: transparent !important;
}
.explore-card .CodeMirror-scroll {
  overflow: hidden;
}
.explore-card .CodeMirror-vscrollbar,
.explore-card .CodeMirror-hscrollbar,
.explore-card .CodeMirror-scrollbar-filler {
  display: none !important;
  overflow: hidden;
}
</style>

<template>
  <modal-ui :model-value="modelValue" @close="(query = ''), $emit('update:modelValue', false)">
    <template #header>
      <p>Select language mode</p>
    </template>
    <input-ui v-model="query" autofocus placeholder="Search..." block class="w-full" />
    <list-ui style="height: calc(100vh - 12rem)" class="overflow-auto space-y-1 scroll mt-6">
      <list-item-ui
        v-for="mode in modes"
        :key="mode.name"
        :active="mode.mime === languageMime"
        class="cursor-pointer"
        @click="$emit('select', mode), $emit('update:modelValue', false)"
      >
        {{ mode.name }}
      </list-item-ui>
    </list-ui>
  </modal-ui>
</template>
<script>
import { computed, ref } from 'vue';
import { modeInfo } from '~/utils/codemirrorLanguages';
import { getLangInfo } from '~/utils/languages';

export default {
  props: {
    snippet: {
      type: Object,
      default: () => ({}),
    },
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['select', 'update:modelValue'],
  setup(props) {
    const query = ref('');

    const modes = computed(() =>
      modeInfo.filter(({ name }) =>
        name.toLocaleLowerCase().includes(query.value.toLocaleLowerCase())
      )
    );
    const languageMime = computed(() => {
      const lang = props.snippet.language;
      const isMIME = /\//.test(lang);

      return isMIME ? lang : getLangInfo(lang, 'mime');
    });

    return {
      query,
      modes,
      languageMime,
    };
  },
};
</script>

import { EditorSettings } from '@/interface/editor.interface';
import { watchDebounced } from '@vueuse/core';
import { defineStore } from 'pinia';
import documentService from '@/services/document.service';
import { useEditorState } from './editor/editor-state.store';
import { useEditorDocument } from './editor/editor-document.store';

const useEditorSettings = defineStore('editor:settings', () => {
  let initiated = false;
  const EDITOR_DEFAULT_SETTINGS: EditorSettings = {
    fontSize: 14,
    indentSize: 4,
    customFont: '',
    fontLigatures: true,
    showLineNumbers: true,
    fontFamily: 'jetbrains-mono',
  };

  const data = shallowReactive<EditorSettings>({ ...EDITOR_DEFAULT_SETTINGS });

  async function init() {
    if (initiated) return;

    const settings = await documentService.stores.settings.xGet('editor');
    if (settings) {
      Object.assign(data, { ...EDITOR_DEFAULT_SETTINGS, ...settings });
    }

    initiated = true;
  }
  function updateSetting<T extends keyof EditorSettings>(
    key: T,
    value: EditorSettings[T],
  ) {
    data[key] = value;
  }

  watchDebounced(
    data,
    (settings) => {
      if (!initiated) return;

      documentService.stores.settings.xSet('editor', settings);
    },
    { debounce: 500, deep: true },
  );

  return { init, data, updateSetting };
});

export const useEditorStore = defineStore('editor', () => {
  let initiated = false;

  const state = useEditorState();
  const document = useEditorDocument();
  const settings = useEditorSettings();

  const activePath = computed(() => state.state.activeFileId);
  const activeSnippet = computed(() => {
    if (!activePath.value) return null;

    return document.getItemMetadata(activePath.value);
  });

  async function init() {
    if (initiated) return;

    await Promise.all([state.init(), settings.init(), document.init()]);

    initiated = true;
  }

  return { state, settings, document, activeSnippet, activePath, init };
});

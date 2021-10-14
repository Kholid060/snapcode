<template>
  <div>
    <button-group-ui class="divide-x" @click.stop>
      <button-ui
        v-tooltip:top.group="file.starred ? 'Starred' : 'Not starred'"
        icon
        @click="$emit('change', { starred: !file.starred })"
      >
        <v-mdi
          size="20"
          :name="file.starred ? 'mdi-star' : 'mdi-star-outline'"
          :class="{ 'text-warning': file.starred }"
        ></v-mdi>
      </button-ui>
      <popover-ui>
        <button-ui v-tooltip:top.group="'Share'" icon :class="{ 'text-primary': file.isShared }">
          <v-mdi size="20" name="mdi-link-variant"></v-mdi>
        </button-ui>
        <template #popover>
          <div class="w-48">
            <div class="flex justify-between mb-2">
              <span>Share snippet</span>
              <switch-ui v-if="$store.state.user" v-model="shareState.isShared"></switch-ui>
            </div>
            <slide-transition direction="top">
              <input-ui
                v-if="shareState.isShared"
                type="text"
                placeholder="Share URL"
                :readonly="true"
                :model-value="`${location}/snippet/${file.id}`"
                @click="copyUrl"
              />
            </slide-transition>
            <template v-if="shareState.isShared">
              <div class="flex items-center justify-between mt-4">
                <span>Password</span>
                <switch-ui v-model="shareState.isProtected" @change="generatePassword" />
              </div>
              <slide-transition direction="top">
                <input-ui
                  v-if="shareState.isProtected"
                  v-model="shareState.password"
                  placeholder="Password"
                  class="mt-2"
                />
              </slide-transition>
            </template>
            <button-ui
              v-if="$store.state.user"
              variant="primary"
              class="mt-6 w-full"
              :loading="shareState.loading"
              @click="shareSnippet"
            >
              Save
            </button-ui>
            <p v-if="!$store.state.user" class="text-center my-2 text-light">
              You need to login first
            </p>
          </div>
        </template>
      </popover-ui>
      <popover-ui>
        <button-ui icon class="rounded-r-lg">
          <v-mdi size="20" name="mdi-dots-horizontal"></v-mdi>
        </button-ui>
        <template #popover>
          <list-ui class="space-y-1 w-48">
            <list-item-ui v-close-popover class="cursor-pointer" small @click="$emit('fullscreen')">
              <template #prepend>
                <v-mdi name="mdi-fullscreen"></v-mdi>
              </template>
              Toggle fullscreen
            </list-item-ui>
            <list-item-ui v-close-popover class="cursor-pointer" small @click="copyCode">
              <template #prepend>
                <v-mdi name="mdi-clipboard-outline"></v-mdi>
              </template>
              Copy code
            </list-item-ui>
            <list-item-ui
              v-close-popover
              class="cursor-pointer"
              small
              @click="state.showEditorSettings = true"
            >
              <template #prepend>
                <v-mdi name="mdi-cog-outline"></v-mdi>
              </template>
              Editor settings
            </list-item-ui>
            <list-item-ui
              v-close-popover
              class="cursor-pointer text-danger"
              small
              @click="deleteFile"
            >
              <template #prepend>
                <v-mdi name="mdi-delete-outline"></v-mdi>
              </template>
              Delete snippet
            </list-item-ui>
          </list-ui>
        </template>
      </popover-ui>
    </button-group-ui>
    <modal-ui v-model="state.showEditorSettings" content-class="max-w-xl">
      <template #header> Editor settings </template>
      <view-editor-Settings />
    </modal-ui>
  </div>
</template>
<script>
import { shallowReactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { nanoid } from 'nanoid';
import { useGroupTooltip, useStorage } from '~/composable';
import { copyToClipboard, transformFile } from '~/utils/helper';
import { apiFetch } from '../../../utils/firebase';
import ViewEditorSettings from './ViewEditorSettings.vue';

export default {
  components: { ViewEditorSettings },
  props: {
    file: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['change', 'fullscreen'],
  setup(props) {
    useGroupTooltip();
    const router = useRouter();
    const toast = useToast();
    const storage = useStorage();

    const shareState = shallowReactive({
      password: '',
      loading: false,
      isShared: props.file.isShared,
      isProtected: props.file.isProtected,
    });
    const state = shallowReactive({
      showEditorSettings: false,
    });

    function copyUrl(event) {
      event.target.select();
      document.execCommand('copy');

      toast('Link copied', {
        timeout: 2000,
      });
    }
    function copyCode() {
      const cmContainer = document.querySelector('.CodeMirror');
      const code = cmContainer.CodeMirror.getValue();

      copyToClipboard(code);
      toast('Code copied', {
        timeout: 2000,
      });
    }
    function deleteFile() {
      storage
        .model('files')
        .delete(props.file.id)
        .then(() => {
          router.replace('/');
        });
    }
    async function shareSnippet() {
      const body = transformFile({ ...props.file, ...shareState }, ['loading']);
      shareState.loading = true;

      try {
        if (body.isProtected && body.password === '') {
          delete body.password;
        }

        await apiFetch(`/files/share/${props.file.id}`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        await storage.model('files', { triggerBackup: false }).update({
          where: props.file.id,
          data: { ...shareState, isNew: false, isEdited: false },
        });

        shareState.loading = false;
        shareState.password = '';
      } catch (error) {
        console.error(error);
        toast.error('Something went wrong');
        shareState.loading = false;
      }
    }
    function generatePassword(value) {
      shareState.password = !props.file.isProtected && value ? nanoid(8) : '';
    }

    watch(
      () => [props.file.isShared, props.file.isProtected],
      () => {
        shareState.isShared = props.file.isShared;
        shareState.isProtected = props.file.isProtected;
      }
    );

    return {
      state,
      copyUrl,
      copyCode,
      shareState,
      deleteFile,
      shareSnippet,
      generatePassword,
      location: window.location.origin,
    };
  },
};
</script>

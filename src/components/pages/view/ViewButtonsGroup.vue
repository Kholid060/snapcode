<template>
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
    <button-ui
      v-tooltip:top.group="'Copy code'"
      class="hidden md:inline-block"
      icon
      @click="copyCode"
    >
      <v-mdi size="20" name="mdi-clipboard-outline"></v-mdi>
    </button-ui>
    <button-ui
      v-tooltip:top.group="'Delete'"
      icon
      class="text-danger hidden md:inline-block rounded-r-lg"
      @click="deleteFile"
    >
      <v-mdi size="20" name="mdi-delete-outline"></v-mdi>
    </button-ui>
    <popover-ui class="md:hidden">
      <button-ui icon>
        <v-mdi size="20" name="mdi-dots-horizontal"></v-mdi>
      </button-ui>
      <template #popover>
        <list-ui class="space-y-1 w-48">
          <list-item-ui v-close-popover class="cursor-pointer" small @click="copyCode">
            <template #prepend>
              <v-mdi name="mdi-clipboard-outline"></v-mdi>
            </template>
            Copy code
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
</template>
<script>
import { onMounted, shallowReactive } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { nanoid } from 'nanoid';
import { useStore } from 'vuex';
import { useGroupTooltip } from '~/composable';
import { File } from '~/models';
import { copyToClipboard, transformFile } from '~/utils/helper';
import { apiFetch } from '../../../utils/firebase';

export default {
  props: {
    file: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['change'],
  setup(props) {
    const router = useRouter();
    const toast = useToast();
    const store = useStore();

    const shareState = shallowReactive({
      isShared: props.file.isShared,
      isProtected: props.file.isProtected,
      password: '',
      loading: false,
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
      File.$delete(props.file.id).then(() => {
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
        await File.$update({
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

    onMounted(useGroupTooltip);

    return {
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

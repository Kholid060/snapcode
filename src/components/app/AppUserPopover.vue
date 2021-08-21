<template>
  <div class="user-popover inline-block">
    <popover-ui class="align-middle">
      <avatar-ui class="inline-block mt-1 cursor-pointer" type="round">
        <img v-if="user" :src="user.photoUrl" alt="user photo" />
        <v-mdi v-else name="mdi-account-outline"></v-mdi>
      </avatar-ui>
      <template #popover>
        <list-ui class="w-56">
          <li class="list-none">
            <template v-if="user">
              <p class="leading-tight">
                {{ user.displayName }}
              </p>
              <p class="leading-tight text-lighter">
                {{ user.email }}
              </p>
            </template>
            <p v-else>Guest</p>
          </li>
          <div class="h1 border-b mt-4 mb-2"></div>
          <list-item-ui small class="mb-1">
            <template #prepend>
              <v-mdi name="mdi-weather-night"></v-mdi>
            </template>
            <span class="flex-1">Dark Mode</span>
            <template #append>
              <switch-ui v-model="isDark" class="align-middle"></switch-ui>
            </template>
          </list-item-ui>
          <div class="h1 border-b my-2"></div>
          <list-item-ui v-if="user" small class="text-danger cursor-pointer" @click="logout">
            <template #prepend>
              <v-mdi name="mdi-logout"></v-mdi>
            </template>
            <span>Logout</span>
          </list-item-ui>
          <list-item-ui
            v-else
            v-close-popover
            small
            class="cursor-pointer"
            @click="emitEvent('show-auth')"
          >
            <template #prepend>
              <v-mdi name="mdi-login"></v-mdi>
            </template>
            <span>Login</span>
          </list-item-ui>
        </list-ui>
      </template>
    </popover-ui>
  </div>
</template>
<script>
import { ref, watch, computed } from 'vue';
import { useStore } from 'vuex';
import emitter from 'tiny-emitter/instance';
import { useTheme, useDialog, useStorage } from '~/composable';
import { File, Folder } from '~/models';
import { auth } from '~/utils/firebase';

export default {
  setup() {
    const store = useStore();
    const theme = useTheme();
    const dialog = useDialog();
    const storage = useStorage();

    const isDark = ref(theme.currentTheme.value === 'dark');

    const user = computed(() => store.state.user);

    function emitEvent(name) {
      emitter.emit(name);
    }
    function logout() {
      dialog.confirm({
        title: 'Are you sure?',
        content: 'All files and folders will be deleted at this device!',
        buttons: {
          confirm: {
            variant: 'danger',
            text: 'Logout',
          },
        },
        onConfirm: () => {
          auth.signOut().then(async () => {
            await storage.model('folders').deleteAll();
            await storage.model('files').deleteAll();

            ['deletedFiles', 'deletedFolders', 'lastBackup', 'isDataChanged'].forEach((key) => {
              localStorage.removeItem(key);
            });

            setTimeout(() => {
              window.location.reload();
            }, 1000);
          });
        },
      });
    }

    watch(isDark, (dark) => {
      theme.setTheme(dark ? 'dark' : 'light');
    });

    return {
      user,
      isDark,
      logout,
      emitEvent,
    };
  },
};
</script>

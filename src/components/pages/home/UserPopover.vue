<template>
  <div class="user-popover inline-block">
  	<popover-ui class="align-middle">
  	  <avatar-ui
        class="inline-block mt-1 cursor-pointer"
        type="round"
      >
        <img
          :src="user.photoUrl"
          alt="user photo"
          v-if="user"
        />
  	  	<icon-ui name="user" v-else></icon-ui>
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
              <icon-ui name="moon"></icon-ui>
            </template>
  	  			<span>Dark Mode</span>
  	  			<template #append>
  	  				<switch-ui v-model="isDark" class="align-middle"></switch-ui>
  	  			</template>
  	  		</list-item-ui>
          <!-- <list-item-ui small class="cursor-pointer">
            <template #prepend>
              <icon-ui name="cog"></icon-ui>
            </template>
            <span>Settings</span>
          </list-item-ui> -->
          <div class="h1 border-b my-2"></div>
          <list-item-ui
            small
            class="text-danger cursor-pointer"
            v-if="user"
            @click="logout"
          >
            <template #prepend>
              <icon-ui name="logout"></icon-ui>
            </template>
            <span>Logout</span>
          </list-item-ui>
          <list-item-ui
            v-close-popover
            @click="showAuthModal = true"
            small
            class="cursor-pointer"
            v-else
          >
            <template #prepend>
              <icon-ui name="login"></icon-ui>
            </template>
            <span>Login</span>
          </list-item-ui>
  	  	</list-ui>
  	  </template>
  	</popover-ui>
    <auth-modal v-model="showAuthModal"></auth-modal>
  </div>
</template>
<script>
import { ref, watch, computed } from 'vue';
import { useStore } from 'vuex';
import { useTheme, useDialog } from '~/composable';
import { File, Folder } from '~/models';
import { auth } from '~/utils/firebase';
import AuthModal from '~/components/layout/AuthModal.vue';

export default {
  components: { AuthModal },
  setup() {
  	const store = useStore();
  	const theme = useTheme();
  	const dialog = useDialog();

  	const isDark = ref(theme.currentTheme.value === 'dark');
    const showAuthModal = ref(false);
    const user = computed(() => store.state.user);

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
            await Folder.$deleteAll();
            await File.$deleteAll();

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
    	showAuthModal,
    };
  },
};
</script>

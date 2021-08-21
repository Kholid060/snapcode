<template>
  <div class="folder-list">
    <p v-if="isRetrieved && folders.length === 0" class="text-lighter text-center mt-8">
      You have no folder
    </p>
    <div v-if="!isRetrieved" class="space-y-2">
      <div v-for="i in 3" :key="i" class="bg-input animate-pulse rounded-lg h-10"></div>
    </div>
    <list-ui v-else class="space-y-1">
      <list-item-ui
        v-for="folder in folders"
        :key="folder.id"
        small
        class="cursor-pointer group"
        :active="folder.id === activeFilter"
        @click="$emit('update-filter', folder.id)"
      >
        <template #prepend>
          <v-mdi name="mdi-folder-outline"></v-mdi>
        </template>
        <p class="text-overflow flex-1">{{ folder.name }}</p>
        <template #append>
          <popover-ui class="text-default">
            <v-mdi
              name="mdi-dots-horizontal"
              :class="[folder.id === activeFilter ? 'visibile' : 'md:invisible']"
              class="group-hover:visible"
            ></v-mdi>
            <template #popover>
              <list-ui class="w-40 space-y-1">
                <list-item-ui
                  v-close-popover
                  small
                  class="cursor-pointer"
                  @click="renameFolder(folder)"
                >
                  <template #prepend>
                    <v-mdi name="mdi-pencil-outline"></v-mdi>
                  </template>
                  Rename
                </list-item-ui>
                <list-item-ui
                  v-close-popover
                  small
                  class="cursor-pointer text-red-400"
                  @click="deleteFolder(folder)"
                >
                  <template #prepend>
                    <v-mdi name="mdi-delete-outline" class="text-danger"></v-mdi>
                  </template>
                  Delete
                </list-item-ui>
              </list-ui>
            </template>
          </popover-ui>
        </template>
      </list-item-ui>
    </list-ui>
  </div>
</template>
<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { Folder } from '~/models';
import { useDialog, useStorage } from '~/composable';

export default {
  props: {
    activeFilter: {
      type: String,
      default: '',
    },
  },
  emits: ['update-filter'],
  setup() {
    const store = useStore();
    const dialog = useDialog();
    const storage = useStorage();

    const isRetrieved = computed(() => store.state.isRetrieved);
    const folders = computed(() => Folder.query().orderBy('name', 'asc').get());

    function renameFolder({ name, id }) {
      dialog.prompt({
        title: 'Rename folder',
        input: {
          label: 'Folder name',
          modelValue: name,
          maxlength: 60,
        },
        onConfirm: (newName) => {
          storage.model('folders').update({
            where: id,
            data: {
              name: newName.slice(0, 60),
              isEdited: true,
            },
          });
        },
      });
    }
    function deleteFolder({ id, name }) {
      dialog.confirm({
        title: 'Delete folder',
        content: `Are you sure want to delete "${name}" folder?`,
        buttons: {
          confirm: {
            text: 'Delete',
            variant: 'danger',
          },
        },
        onConfirm: () => {
          storage
            .model('folders')
            .delete(id)
            .then(async () => {
              await storage.model('files').delete((file) => file.folderId === id);

              store.commit('updateState', { key: 'filterBy', value: 'all' });
            });
        },
      });
    }

    return {
      folders,
      isRetrieved,
      deleteFolder,
      renameFolder,
    };
  },
};
</script>

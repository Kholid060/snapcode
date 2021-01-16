<template>
  <div class="folder-list">
    <p class="text-lighter text-center mt-8" v-if="isRetrieved && folders.length === 0">
      You have no folder
    </p>
    <div class="space-y-2" v-if="!isRetrieved">
      <div
        class="bg-input animate-pulse rounded-lg h-10"
        v-for="i in 3"
        :key="i"
      ></div>
    </div>
    <list-ui class="space-y-1" v-else>
      <list-item-ui
        small
        v-for="folder in folders"
        :key="folder.id"
        class="cursor-pointer group"
        @click="$emit('update-filter', folder.id)"
        :active="folder.id === activeFilter"
      >
        <template #prepend>
          <icon-ui name="folder"></icon-ui>
        </template>
        <p class="text-overflow w-32">{{ folder.name }}</p>
        <template #append>
          <popover-ui class="text-default">
            <icon-ui
              name="dotsHorizontal"
              :class="[folder.id === activeFilter ? 'visibile' : 'md:invisible']"
              class="group-hover:visible"
            ></icon-ui>
            <template #popover>
              <list-ui class="w-40 space-y-1">
                <list-item-ui
                  v-close-popover
                  small
                  @click="renameFolder(folder)"
                  class="cursor-pointer"
                >
                  <template #prepend>
                    <icon-ui name="pencil"></icon-ui>
                  </template>
                  Rename
                </list-item-ui>
                <list-item-ui
                  @click="deleteFolder(folder)"
                  small
                  v-close-popover
                  class="cursor-pointer"
                >
                  <template #prepend>
                    <icon-ui name="trash" class="text-danger"></icon-ui>
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
import { useDialog } from '~/composable';
import { Folder, File } from '~/models';

export default {
  props: {
    activeFilter: String,
  },
  setup() {
    const store = useStore();
    const dialog = useDialog();

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
          Folder.$update({
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
          Folder.$delete(id).then(async () => {
            await File.$delete((file) => file.folderId === id);

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

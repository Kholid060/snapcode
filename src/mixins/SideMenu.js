export default {
  data: () => ({
    libraryList: [
      { path: 'all', name: 'All snippets', icon: 'mdi-archive-outline' },
      { path: 'star', name: 'starred', icon: 'mdi-star-outline' },
    ],
  }),
  computed: {
    folders() {
      return this.$store.getters['folders/getAll'];
    },
    tags() {
      return this.$store.getters['tags/getAll'];
    },
  },
  methods: {
    updateActiveTag(id) {
      this.$store.commit('changeState', {
        key: 'activeTag',
        data: this.$store.state.activeTag === id ? '' : id,
      });
    },
    renameFolder({ id, name }) {
      this.$modal.show('prompt', {
        title: 'Rename folder',
        placeholder: 'Folder name',
        input: name,
        btn: {
          text: 'Rename',
          handler: async (input) => {
            await this.$store.dispatch('folders/update', {
              folderId: id,
              data: {
                name: input,
              },
            });

            this.$modal.hide('prompt');
          },
        },
      });
    },
    deleteFolder({ name, id }) {
      this.$modal.show('confirm', {
        title: 'Delete folder',
        text: `Are you sure want to delete ${name}?`,
        btn: {
          type: 'danger',
          text: 'Delete',
          handler: async () => {
            await this.$store.dispatch('folders/delete', id);

            this.$modal.hide('confirm');
          },
        },
      });
    },
    prompt(name, actionName) {
      this.$modal.show('prompt', {
        title: `Add ${name}`,
        placeholder: `${name} name`,
        btn: {
          text: 'Add',
          handler: async (input) => {
            await this.$store.dispatch(actionName, input);

            this.$modal.hide('prompt');
          },
        },
      });
    },
    deleteTag(tagId) {
      this.$store.dispatch('tags/delete', tagId);
    },
  },
};

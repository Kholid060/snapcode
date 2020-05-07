import { searchFilter, tagFilter } from '~/utils/filters';

export default {
  data: () => ({
    search: '',
  }),
  methods: {
    addFile() {
      this.$store.dispatch('files/insert', this.$route.params.folderId);
    },
  },
  computed: {
    showAddFileBtn() {
      const { folderId } = this.$route.params;

      return !(folderId === 'all' || folderId === 'star');
    },
    activeFileId() {
      return this.$store.state.activeFile.split('&')[1];
    },
    files() {
      const { folderId } = this.$route.params;
      const files = folderId === 'all' || folderId === 'star'
        ? this.$store.getters['files/getAll']
        : this.$store.getters['files/getByFolderId'](folderId);

      if (folderId === 'star') {
        return files.filter((file) => file.star);
      }

      return files;
    },
    filteredFiles() {
      const { activeTag } = this.$store.state;
      const files = activeTag ? tagFilter(this.files, activeTag) : this.files;

      return searchFilter(files, 'title', this.search);
    },
  },
};
